import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/client';
import {
  recordCheatingFlag,
  handleVisibilityChange as trackVisibilityChange,
  handleFullscreenChange as trackFullscreenChange,
} from '../client/integrityTracker';
import { dispatchWebhook } from '../server/webhooks';

export interface IntegrityViolation {
  type: string;
  message: string;
  timestamp: string;
  strikeNumber: number;
}

interface UseExamIntegrityProps {
  attemptId?: string;
  isEnabled?: boolean;
  maxStrikes?: number;
  absentTimeoutSeconds?: number; // Default 300 (5 minutes)
  onAutoSubmit?: (reason: string) => void;
}

export function useExamIntegrity({
  attemptId,
  isEnabled = true,
  maxStrikes = 3,
  absentTimeoutSeconds = 300, // 5 minutes
  onAutoSubmit,
}: UseExamIntegrityProps) {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(
    typeof document !== 'undefined' ? !!document.fullscreenElement : false
  );
  const [isLocked, setIsLocked] = useState<boolean>(true);
  const [hasStartedFullscreen, setHasStartedFullscreen] = useState<boolean>(false);
  const [violations, setViolations] = useState<IntegrityViolation[]>([]);
  const [activeViolation, setActiveViolation] = useState<IntegrityViolation | null>(null);

  // ── 5-Minute Absence Auto-Submit ──────────────────────────────────────────
  const [isAbsent, setIsAbsent] = useState(false);
  const [exitSecondsRemaining, setExitSecondsRemaining] = useState<number | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const exitCountdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasSubmittedDueToAbsenceRef = useRef(false);

  const clearAbsenceTimer = useCallback(() => {
    if (exitTimerRef.current) {
      clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
    if (exitCountdownRef.current) {
      clearInterval(exitCountdownRef.current);
      exitCountdownRef.current = null;
    }
    setIsAbsent(false);
    setExitSecondsRemaining(null);
  }, []);

  const startAbsenceTimer = useCallback(() => {
    // Don't restart if already counting
    if (exitTimerRef.current || !hasStartedFullscreen || hasSubmittedDueToAbsenceRef.current) return;

    setIsAbsent(true);
    setExitSecondsRemaining(absentTimeoutSeconds);

    // Countdown display ticker
    exitCountdownRef.current = setInterval(() => {
      setExitSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    // The actual auto-submit trigger after full timeout
    exitTimerRef.current = setTimeout(() => {
      if (hasSubmittedDueToAbsenceRef.current) return;
      hasSubmittedDueToAbsenceRef.current = true;
      clearAbsenceTimer();
      onAutoSubmitRef.current?.('ABSENCE_TIMEOUT_5MIN');
    }, absentTimeoutSeconds * 1000);
  }, [hasStartedFullscreen, absentTimeoutSeconds, clearAbsenceTimer]);

  // ────────────────────────────────────────────────────────────────────────────

  const lastLoggedEvent = useRef<{ type: string; time: number }>({ type: '', time: 0 });
  const violationsCountRef = useRef<number>(0);
  const onAutoSubmitRef = useRef(onAutoSubmit);
  onAutoSubmitRef.current = onAutoSubmit;

  const logEvent = useCallback(
    async (eventType: string, details?: any) => {
      if (!attemptId || !isEnabled) return;
      try {
        await api.post(`/attempts/${attemptId}/integrity-event`, {
          eventType,
          details,
        });
      } catch (err) {
        console.warn('Failed to report integrity event:', err);
      }

      try {
        await dispatchWebhook('/api/webhooks', {
          event: eventType,
          attemptId,
          data: details,
          timestamp: new Date().toISOString(),
        });
      } catch (webhookErr) {
        console.warn('Webhook dispatch failed / queued:', webhookErr);
      }
    },
    [attemptId, isEnabled]
  );

  const recordViolation = useCallback(
    (type: string, message: string) => {
      if (!isEnabled || !hasStartedFullscreen) return;

      const now = Date.now();
      if (lastLoggedEvent.current.type === type && now - lastLoggedEvent.current.time < 1500) {
        return;
      }
      lastLoggedEvent.current = { type, time: now };

      violationsCountRef.current += 1;
      const strikeNumber = violationsCountRef.current;

      const violation: IntegrityViolation = {
        type,
        message,
        timestamp: new Date().toLocaleTimeString(),
        strikeNumber,
      };

      setViolations((prev) => [...prev, violation]);
      setActiveViolation(violation);
      setIsLocked(true);

      logEvent(type, { message, strikeNumber, maxStrikes });

      if (strikeNumber >= maxStrikes) {
        logEvent('EXAM_AUTO_SUBMITTED', {
          reason: 'MAX_INTEGRITY_VIOLATIONS_REACHED',
          totalStrikes: strikeNumber,
        });
        onAutoSubmitRef.current?.(
          `Examination terminated: Maximum security violations (${maxStrikes}/${maxStrikes}) exceeded.`
        );
      }
    },
    [isEnabled, hasStartedFullscreen, logEvent, maxStrikes]
  );

  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      setIsFullscreen(true);
      setIsLocked(false);
      setHasStartedFullscreen(true);
      setActiveViolation(null);
      clearAbsenceTimer(); // Clear any pending absence timer on return
      logEvent('FULLSCREEN_ENTER');
    } catch (err) {
      console.warn('Fullscreen entry failed:', err);
      setIsLocked(false);
      setHasStartedFullscreen(true);
      setActiveViolation(null);
      clearAbsenceTimer();
    }
  }, [logEvent, clearAbsenceTimer]);

  useEffect(() => {
    if (!isEnabled) {
      setIsLocked(false);
      return;
    }

    const handleFullscreenChange = () => {
      trackFullscreenChange();
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);

      if (!active && hasStartedFullscreen) {
        recordCheatingFlag('fullscreenExit');
        recordViolation(
          'FULLSCREEN_EXIT',
          'You exited fullscreen mode. CBT examinations require strict fullscreen focus.'
        );
        startAbsenceTimer();
      }
    };

    const handleVisibilityChange = () => {
      trackVisibilityChange();
      if (document.hidden) {
        recordViolation(
          'VISIBILITY_HIDDEN',
          'Tab switch or window minimization detected. You navigated away from the exam.'
        );
        startAbsenceTimer();
        logEvent('VISIBILITY_HIDDEN', { timestamp: new Date().toISOString() });
      } else {
        // Candidate returned — cancel absence timer
        clearAbsenceTimer();
        logEvent('VISIBILITY_VISIBLE', { timestamp: new Date().toISOString() });
      }
    };

    const handleWindowBlur = () => {
      recordViolation(
        'WINDOW_BLUR',
        'Browser lost focus. Leaving or clicking outside the test console is prohibited.'
      );
      startAbsenceTimer();
    };

    const handleWindowFocus = () => {
      // Candidate returned to exam window — cancel the 5-minute timer
      clearAbsenceTimer();
      logEvent('WINDOW_FOCUS', { timestamp: new Date().toISOString() });
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logEvent('CONTEXT_MENU_ATTEMPT');
      recordViolation(
        'CONTEXT_MENU_ATTEMPT',
        'Right-click context menu is disabled during the examination.'
      );
      return false;
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      recordCheatingFlag('copyPaste');
      recordViolation('COPY_ATTEMPT', 'Copying text from the question paper is strictly prohibited.');
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordCheatingFlag('copyPaste');
      recordViolation('PASTE_ATTEMPT', 'Pasting external content into the test console is prohibited.');
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      recordCheatingFlag('copyPaste');
      recordViolation('CUT_ATTEMPT', 'Clipboard cut actions are disabled.');
    };

    // 5. Prevent Drag and Select
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return true;
      }
      e.preventDefault();
      return false;
    };

    // 6. Mouse Teleportation Detection (VM Host-Guest Cursor Switch Heuristic)
    let lastMousePos: { x: number; y: number; time: number } | null = null;
    let lastTeleportLogTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (lastMousePos && hasStartedFullscreen) {
        const dt = now - lastMousePos.time;
        const dx = e.clientX - lastMousePos.x;
        const dy = e.clientY - lastMousePos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Teleportation: cursor jumped > 450px in under 20ms without intermediate events
        if (dt < 25 && dist > 450 && now - lastTeleportLogTime > 4000) {
          lastTeleportLogTime = now;
          logEvent('CURSOR_TELEPORTATION_DETECTED', {
            distance: Math.round(dist),
            deltaTimeMs: dt,
            from: { x: lastMousePos.x, y: lastMousePos.y },
            to: { x: e.clientX, y: e.clientY },
          });
        }
      }
      lastMousePos = { x: e.clientX, y: e.clientY, time: now };
    };

    // 7. Prevent Shortcuts (Ctrl+P, F12, Ctrl+Shift+I, Ctrl+U, Alt+Tab traps, F5)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        recordViolation('PRINT_ATTEMPT', 'Printing examination content is disabled.');
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        recordCheatingFlag('devToolsOpen');
        recordViolation('DEVTOOLS_OPEN', 'Viewing page source is disabled.');
      }
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key))
      ) {
        e.preventDefault();
        recordCheatingFlag('devToolsOpen');
        recordViolation('DEVTOOLS_OPEN', 'Opening developer tools is prohibited.');
      }
      if (e.key === 'F5' || ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R'))) {
        e.preventDefault();
        recordCheatingFlag('devToolsOpen');
        recordViolation('DEVTOOLS_OPEN', 'Page reload shortcut intercepted. Use CBT navigation buttons.');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
      clearAbsenceTimer();
    };
  }, [isEnabled, hasStartedFullscreen, recordViolation, logEvent, startAbsenceTimer, clearAbsenceTimer]);

  return {
    isFullscreen,
    isLocked,
    hasStartedFullscreen,
    strikesCount: violations.length,
    maxStrikes,
    activeViolation,
    violations,
    enterFullscreen,
    // 5-minute absence state
    isAbsent,
    exitSecondsRemaining,
  };
}
