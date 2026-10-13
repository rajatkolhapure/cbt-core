import type { IntegrityFlags } from '../types/webhookPayload';

let screenExited = false;
let fullscreenExited = false;
let cheatingFlags: Record<string, boolean> = {};
let cachedDeviceType: string = 'unknown';

let visibilityDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastVisibilityTime = 0;
const VISIBILITY_DEBOUNCE_MS = 50;

/**
 * Detect device type from user agent string.
 * Returns non-empty string; falls back to 'unknown'.
 */
export function detectDeviceType(userAgent?: string): string {
  try {
    const ua =
      userAgent !== undefined
        ? userAgent
        : typeof navigator !== 'undefined' && navigator.userAgent
          ? navigator.userAgent
          : '';

    if (!ua || typeof ua !== 'string' || ua.trim() === '') {
      return 'unknown';
    }

    const lower = ua.toLowerCase();
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(lower)) {
      return 'tablet';
    }
    if (/mobile|ip(hone|od)|android|blackberry|opera mini|iemobile/i.test(lower)) {
      return 'mobile';
    }
    if (/windows|macintosh|mac os|linux|cros|x11/i.test(lower)) {
      return 'desktop';
    }
    return ua.trim().length > 0 ? 'desktop' : 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Initialize device type detection once on load.
 */
export function initDeviceType(ua?: string): string {
  cachedDeviceType = detectDeviceType(ua);
  if (!cachedDeviceType || cachedDeviceType.trim() === '') {
    cachedDeviceType = 'unknown';
  }
  return cachedDeviceType;
}

// Run device detection once on module load if in browser
if (typeof navigator !== 'undefined') {
  initDeviceType();
}

/**
 * Retrieve cached or freshly detected device type.
 */
export function getDeviceType(): string {
  if (cachedDeviceType === 'unknown' && typeof navigator !== 'undefined' && navigator.userAgent) {
    cachedDeviceType = detectDeviceType(navigator.userAgent);
  }
  return cachedDeviceType && cachedDeviceType.trim() !== '' ? cachedDeviceType : 'unknown';
}

/**
 * Handler for visibilitychange event with debounce for rapid events.
 */
export function handleVisibilityChange(): void {
  try {
    if (typeof document === 'undefined') return;

    if (document.hidden) {
      screenExited = true;
    }

    const now = Date.now();
    // Debounce rapid oscillations without blocking main thread
    if (now - lastVisibilityTime < VISIBILITY_DEBOUNCE_MS && lastVisibilityTime !== 0) {
      if (visibilityDebounceTimer) clearTimeout(visibilityDebounceTimer);
      visibilityDebounceTimer = setTimeout(() => {
        if (typeof document !== 'undefined' && document.hidden) {
          screenExited = true;
        }
      }, VISIBILITY_DEBOUNCE_MS);
      return;
    }

    lastVisibilityTime = now;
  } catch {
    // Non-blocking safeguard
  }
}

/**
 * Handler for fullscreenchange event.
 */
export function handleFullscreenChange(): void {
  try {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      fullscreenExited = true;
    }
  } catch {
    // Non-blocking safeguard
  }
}

/**
 * Hook to record arbitrary cheating flags (e.g., 'copyPaste', 'devToolsOpen').
 */
export function recordCheatingFlag(flagName: string): void {
  if (!flagName || typeof flagName !== 'string') return;
  const key = flagName.trim();
  if (key) {
    cheatingFlags[key] = true;
  }
}

/**
 * Return current integrity flags object.
 * Omits empty cheatingFlags field if no flags are set.
 */
export function getIntegrityFlags(): IntegrityFlags {
  const flags: IntegrityFlags = {
    screenExited,
    fullscreenExited,
    deviceType: getDeviceType(),
  };

  if (Object.keys(cheatingFlags).length > 0) {
    flags.cheatingFlags = { ...cheatingFlags };
  }

  return flags;
}

/**
 * Reset integrity flags after successful transmission.
 */
export function resetIntegrityFlags(): void {
  screenExited = false;
  fullscreenExited = false;
  cheatingFlags = {};
  lastVisibilityTime = 0;
  if (visibilityDebounceTimer) {
    clearTimeout(visibilityDebounceTimer);
    visibilityDebounceTimer = null;
  }
}

/**
 * Merge accumulated flags (e.g. from offline queue).
 */
export function mergeIntegrityFlags(incoming: Partial<IntegrityFlags>): void {
  if (incoming.screenExited) screenExited = true;
  if (incoming.fullscreenExited) fullscreenExited = true;
  if (incoming.cheatingFlags) {
    cheatingFlags = {
      ...cheatingFlags,
      ...incoming.cheatingFlags,
    };
  }
}

/**
 * Attach DOM event listeners.
 */
export function setupIntegrityListeners(): void {
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
  }
}

/**
 * Remove DOM event listeners (useful for testing and cleanup).
 */
export function removeIntegrityListeners(): void {
  if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }
  if (visibilityDebounceTimer) {
    clearTimeout(visibilityDebounceTimer);
    visibilityDebounceTimer = null;
  }
}

// Automatically register listeners if running in a browser environment
if (typeof document !== 'undefined') {
  setupIntegrityListeners();
}
