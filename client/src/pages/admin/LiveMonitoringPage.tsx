import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../api/client';
import {
  ShieldAlert,
  Clock,
  RefreshCw,
  Search,
  LayoutGrid,
  UserSearch,
  ChevronRight,
  Timer,
  Plus,
  Shield,
  Wifi,
  Monitor,
  Globe,
  Ban,
  ArrowLeft,
  MessageSquareWarning,
  TriangleAlert,
  Send,
  Eye,
  Radio,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface HardwareProfile {
  id: string;
  isVM: boolean;
  gpuRenderer: string;
  gpuVendor: string;
  logicalCores: number;
  deviceMemoryGB?: number;
  screenResolution: string;
  isMultiMonitor: boolean;
  monitorCount: number;
  userAgent: string;
  detectedFlags: string[];
  createdAt: string;
}

interface ActiveCandidate {
  attemptId: string;
  student: {
    id: string;
    name: string;
    email: string;
    candidateId?: string;
  };
  exam: {
    id: string;
    title: string;
    duration: number;
    totalMarks: number;
  };
  startedAt: string;
  serverEndTime?: string;
  secondsRemaining: number;
  progress: {
    totalQuestions: number;
    answeredCount: number;
    markedCount: number;
    visitedCount: number;
    unansweredCount: number;
    percentage: number;
  };
  violations: {
    totalViolations: number;
    recentEvents: Array<{
      id: string;
      eventType: string;
      timestamp: string;
      details?: any;
    }>;
  };
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'IDLE';
  session?: {
    ipAddress?: string;
    userAgent?: string;
    examEnvironment?: string;
    isActive?: boolean;
    connectedAt?: string;
  };
  hardwareProfile?: HardwareProfile | null;
  lastActivity: string;
}

interface CandidateDetails {
  attemptId: string;
  state: string;
  student: {
    id: string;
    name: string;
    email: string;
    candidateId?: string;
  };
  exam: {
    id: string;
    title: string;
    duration: number;
    totalMarks: number;
  };
  startedAt: string;
  serverEndTime?: string;
  secondsRemaining: number;
  progress: {
    totalQuestions: number;
    answeredCount: number;
    markedCount: number;
    visitedCount: number;
    unansweredCount: number;
    percentage: number;
  };
  questions: Array<{
    questionId: string;
    questionText: string;
    type: string;
    section: string;
    status: 'ANSWERED' | 'VISITED' | 'NOT_VISITED';
    isMarkedForReview: boolean;
    lastUpdated: string | null;
  }>;
  integrityEvents: Array<{
    id: string;
    eventType: string;
    timestamp: string;
    details?: any;
    ipAddress?: string;
  }>;
  totalViolations: number;
  session?: {
    ipAddress?: string;
    userAgent?: string;
    examEnvironment?: string;
    isActive?: boolean;
    connectedAt?: string;
  };
  hardwareProfile?: HardwareProfile | null;
}

type ViewMode = 'overview' | 'personal';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'HEALTHY':
      return {
        bg: 'bg-[#EBF5F0]',
        border: 'border-[#236B47]',
        text: 'text-[#236B47]',
        dot: 'bg-[#236B47]',
      };
    case 'WARNING':
      return {
        bg: 'bg-[#FEF8ED]',
        border: 'border-[#C88A2D]',
        text: 'text-[#C88A2D]',
        dot: 'bg-[#C88A2D]',
      };
    case 'CRITICAL':
      return {
        bg: 'bg-[#FDF0F0]',
        border: 'border-[#A83232]',
        text: 'text-[#A83232]',
        dot: 'bg-[#A83232]',
      };
    default:
      return {
        bg: 'bg-[#F4EFEA]',
        border: 'border-[#8E929E]',
        text: 'text-[#575A65]',
        dot: 'bg-[#8E929E]',
      };
  }
}

function getEventIcon(eventType: string) {
  const map: Record<string, { icon: string; color: string }> = {
    WINDOW_BLUR: { icon: '🔴', color: 'text-[#A83232]' },
    WINDOW_FOCUS: { icon: '🟢', color: 'text-[#236B47]' },
    FULLSCREEN_EXIT: { icon: '⚠️', color: 'text-[#C88A2D]' },
    FULLSCREEN_ENTER: { icon: '✅', color: 'text-[#236B47]' },
    VISIBILITY_HIDDEN: { icon: '👁️‍🗨️', color: 'text-[#A83232]' },
    VISIBILITY_VISIBLE: { icon: '👁️', color: 'text-[#236B47]' },
    COPY_ATTEMPT: { icon: '📋', color: 'text-[#A83232]' },
    PASTE_ATTEMPT: { icon: '📌', color: 'text-[#A83232]' },
    DEVTOOLS_OPEN: { icon: '🛠️', color: 'text-[#A83232]' },
    CURSOR_TELEPORTATION_DETECTED: { icon: '⚡', color: 'text-[#A83232]' },
    SUSPICIOUS_HARDWARE: { icon: '🖥️', color: 'text-[#A83232]' },
    MULTI_MONITOR_ON_LOGIN: { icon: '📺', color: 'text-[#C88A2D]' },
    EXAM_STARTED: { icon: '🚀', color: 'text-[#1A2B4C]' },
    EXAM_SUBMITTED: { icon: '📤', color: 'text-[#1A2B4C]' },
    EXAM_AUTO_SUBMITTED: { icon: '⏰', color: 'text-[#A83232]' },
    TIME_WARNING: { icon: '⏱️', color: 'text-[#C88A2D]' },
    TIME_EXPIRED: { icon: '❌', color: 'text-[#A83232]' },
  };
  return map[eventType] || { icon: '📝', color: 'text-[#575A65]' };
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function parseBrowser(ua?: string): string {
  if (!ua) return 'Unknown';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'Browser';
}

const PRESET_WARNINGS = [
  'You have been detected switching tabs. This is a formal warning.',
  'Suspicious activity detected on your session. This is being recorded.',
  'Your session is being actively monitored. Please stay focused on the exam.',
  'Multiple integrity violations detected. Further violations will result in termination.',
  'Return to fullscreen mode immediately or your exam will be terminated.',
];

export const LiveMonitoringPage: React.FC = () => {
  const [mode, setMode] = useState<ViewMode>('overview');
  const [liveData, setLiveData] = useState<ActiveCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoPolling, setIsAutoPolling] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'HEALTHY' | 'WARNING' | 'CRITICAL'>('ALL');

  // Personal proctoring state
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);
  const [candidateDetails, setCandidateDetails] = useState<CandidateDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [proctorNotes, setProctorNotes] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [addTimeMinutes, setAddTimeMinutes] = useState(5);

  const pollingRef = useRef<any>(null);
  const detailsPollingRef = useRef<any>(null);
  const eventFeedRef = useRef<HTMLDivElement>(null);

  const fetchLiveSessions = useCallback(async () => {
    try {
      const res = await api.get('/admin/live-monitoring');
      setLiveData(res.data.activeCandidates || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch live monitoring data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCandidateDetails = useCallback(async (attemptId: string) => {
    try {
      const res = await api.get(`/admin/proctor/candidate/${attemptId}`);
      setCandidateDetails(res.data);
    } catch (err) {
      console.error('Failed to fetch candidate details:', err);
    } finally {
      setIsDetailsLoading(false);
    }
  }, []);

  // Overview polling
  useEffect(() => {
    fetchLiveSessions();
    if (isAutoPolling) {
      pollingRef.current = setInterval(fetchLiveSessions, 3000);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isAutoPolling, fetchLiveSessions]);

  // Personal proctoring polling
  useEffect(() => {
    if (mode === 'personal' && selectedAttemptId) {
      setIsDetailsLoading(true);
      fetchCandidateDetails(selectedAttemptId);
      detailsPollingRef.current = setInterval(() => fetchCandidateDetails(selectedAttemptId), 3000);
    }
    return () => {
      if (detailsPollingRef.current) clearInterval(detailsPollingRef.current);
    };
  }, [mode, selectedAttemptId, fetchCandidateDetails]);

  // Clear feedback after 3 seconds
  useEffect(() => {
    if (actionFeedback) {
      const t = setTimeout(() => setActionFeedback(null), 3000);
      return () => clearTimeout(t);
    }
  }, [actionFeedback]);

  const handleInspect = (attemptId: string) => {
    setSelectedAttemptId(attemptId);
    setCandidateDetails(null);
    setMode('personal');
    setWarningMessage('');
    setShowTerminateConfirm(false);
  };

  const handleBackToOverview = () => {
    setMode('overview');
    setSelectedAttemptId(null);
    setCandidateDetails(null);
  };

  const handleSendWarning = async () => {
    if (!selectedAttemptId || !warningMessage.trim()) return;
    setIsActionLoading(true);
    try {
      await api.post(`/admin/proctor/warning/${selectedAttemptId}`, { message: warningMessage });
      setActionFeedback({ type: 'success', message: 'Warning sent to candidate' });
      setWarningMessage('');
      fetchCandidateDetails(selectedAttemptId);
    } catch {
      setActionFeedback({ type: 'error', message: 'Failed to send warning' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTerminate = async () => {
    if (!selectedAttemptId) return;
    setIsActionLoading(true);
    try {
      await api.post(`/admin/proctor/terminate/${selectedAttemptId}`);
      setActionFeedback({ type: 'success', message: 'Candidate session terminated' });
      setShowTerminateConfirm(false);
      setTimeout(handleBackToOverview, 1500);
    } catch {
      setActionFeedback({ type: 'error', message: 'Failed to terminate session' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddTime = async () => {
    if (!selectedAttemptId || addTimeMinutes <= 0) return;
    setIsActionLoading(true);
    try {
      await api.post(`/admin/proctor/add-time/${selectedAttemptId}`, { minutes: addTimeMinutes });
      setActionFeedback({ type: 'success', message: `Added ${addTimeMinutes} minutes` });
      fetchCandidateDetails(selectedAttemptId);
    } catch {
      setActionFeedback({ type: 'error', message: 'Failed to add time' });
    } finally {
      setIsActionLoading(false);
    }
  };

  const filtered = liveData.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.student.candidateId || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: liveData.length,
    healthy: liveData.filter((c) => c.status === 'HEALTHY').length,
    warning: liveData.filter((c) => c.status === 'WARNING').length,
    critical: liveData.filter((c) => c.status === 'CRITICAL').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 font-mono text-xs text-[#1C1D21]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#1C1D21] border-t-transparent animate-spin" />
          <span>&gt; CONNECTING TO LIVE PROCTORING TELEMETRY BUS...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans select-none">
      {/* ── Top Command Bar ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-[#1C1D21] pb-3">
        <div className="flex items-center gap-3">
          {mode === 'personal' && (
            <button
              onClick={handleBackToOverview}
              className="p-1.5 bg-[#F4EFEA] hover:bg-[#EAE3D9] text-[#1C1D21] border border-[#1C1D21] btn-tactile transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1A2B4C] text-[#C88A2D] border border-[#1C1D21] flex items-center justify-center shadow-xs">
              <Radio className="w-4 h-4 text-[#C88A2D] animate-pulse" />
            </div>
            <div>
              <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#1C1D21]">
                {mode === 'overview' ? 'Live Telemetry Command Center' : 'Candidate Proctoring Terminal'}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Toggle */}
          <div className="flex border border-[#1C1D21] bg-[#F4EFEA] p-0.5 shadow-xs">
            <button
              onClick={() => {
                setMode('overview');
                setSelectedAttemptId(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono uppercase font-bold transition-all ${
                mode === 'overview'
                  ? 'bg-[#1A2B4C] text-white border border-[#1C1D21]'
                  : 'text-[#575A65] hover:text-[#1C1D21]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Overview
            </button>
            <button
              onClick={() => setMode('personal')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono uppercase font-bold transition-all ${
                mode === 'personal'
                  ? 'bg-[#1A2B4C] text-white border border-[#1C1D21]'
                  : 'text-[#575A65] hover:text-[#1C1D21]'
              }`}
            >
              <UserSearch className="w-3.5 h-3.5" /> Single Focus
            </button>
          </div>

          {/* Polling Toggle */}
          <button
            onClick={() => setIsAutoPolling(!isAutoPolling)}
            className={`p-2 border border-[#1C1D21] btn-tactile text-xs ${
              isAutoPolling ? 'bg-[#EBF5F0] text-[#236B47]' : 'bg-[#F4EFEA] text-[#575A65]'
            }`}
            title={isAutoPolling ? 'Auto-refresh active (3s)' : 'Auto-refresh paused'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAutoPolling ? 'animate-spin' : ''}`} style={isAutoPolling ? { animationDuration: '3s' } : {}} />
          </button>

          <span className="font-mono text-[10px] text-[#575A65] hidden sm:inline bg-white px-2 py-1 border border-[#1C1D21]/30">
            {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* ── Action Feedback Toast ────────────────────────────────────────────── */}
      {actionFeedback && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 border border-[#1C1D21] font-mono text-xs uppercase font-bold shadow-tactile animate-in slide-in-from-top duration-150 ${
            actionFeedback.type === 'success' ? 'bg-[#236B47] text-white' : 'bg-[#A83232] text-white'
          }`}
        >
          {actionFeedback.message}
        </div>
      )}

      {mode === 'overview' ? (
        <>
          {/* Status KPI Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'ACTIVE EXAMS', value: stats.total, color: 'text-[#1A2B4C]', bg: 'bg-white' },
              { label: 'CLEAN / HEALTHY', value: stats.healthy, color: 'text-[#236B47]', bg: 'bg-[#EBF5F0]' },
              { label: 'MINOR WARNINGS', value: stats.warning, color: 'text-[#C88A2D]', bg: 'bg-[#FEF8ED]' },
              { label: 'CRITICAL RISK', value: stats.critical, color: 'text-[#A83232]', bg: 'bg-[#FDF0F0]' },
            ].map((s) => (
              <div key={s.label} className={`${s.bg} border border-[#1C1D21] shadow-tactile p-3 text-center`}>
                <div className={`font-mono text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="font-mono text-[10px] uppercase font-bold text-[#575A65] tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E929E]" />
              <input
                type="text"
                placeholder="Filter by candidate, roll no, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#1C1D21] text-xs font-sans focus:outline-none focus:shadow-tactile transition-all"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono">
              {(['ALL', 'HEALTHY', 'WARNING', 'CRITICAL'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={`px-3 py-1 text-[11px] uppercase font-bold border transition-all btn-tactile ${
                    filterStatus === f
                      ? 'bg-[#1A2B4C] text-white border-[#1C1D21]'
                      : 'bg-white text-[#575A65] border-[#1C1D21]/40 hover:bg-[#F4EFEA]'
                  }`}
                >
                  {f === 'ALL' ? 'ALL CANDIDATES' : f}
                </button>
              ))}
            </div>
          </div>

          {/* Candidate Cards Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white border border-[#1C1D21] shadow-tactile">
              <Shield className="w-12 h-12 text-[#8E929E] mx-auto mb-3" />
              <p className="font-serif text-base font-bold text-[#1C1D21]">No active exam sessions</p>
              <p className="font-mono text-xs text-[#575A65] mt-1">Sessions will stream here automatically when candidates launch their tests.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {filtered.map((c) => {
                const sc = getStatusColor(c.status);
                const timeColor =
                  c.secondsRemaining <= 300
                    ? 'text-[#A83232]'
                    : c.secondsRemaining <= 600
                    ? 'text-[#C88A2D]'
                    : 'text-[#1C1D21]';
                return (
                  <div
                    key={c.attemptId}
                    className={`bg-white border border-[#1C1D21] shadow-tactile p-3.5 hover:shadow-tactile-lg transition-all cursor-pointer flex flex-col justify-between`}
                    onClick={() => handleInspect(c.attemptId)}
                  >
                    <div>
                      {/* Top row: avatar + name + status dot */}
                      <div className="flex items-start gap-2.5 mb-2">
                        <div
                          className={`w-8 h-8 border border-[#1C1D21] flex items-center justify-center font-mono text-xs font-bold text-white shrink-0 ${
                            c.status === 'CRITICAL'
                              ? 'bg-[#A83232]'
                              : c.status === 'WARNING'
                              ? 'bg-[#C88A2D] text-[#1C1D21]'
                              : 'bg-[#236B47]'
                          }`}
                        >
                          {getInitials(c.student.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-serif font-bold text-sm text-[#1C1D21] truncate">{c.student.name}</div>
                          <div className="font-mono text-[10px] text-[#575A65] truncate">{c.student.candidateId || c.student.email}</div>
                        </div>
                        <div className={`w-2.5 h-2.5 border border-[#1C1D21] shrink-0 mt-1 ${sc.dot}`} />
                      </div>

                      {/* Exam title & Hardware Badges */}
                      <div className="font-mono text-[11px] text-[#575A65] truncate mb-1.5">{c.exam.title}</div>
                      
                      <div className="flex items-center gap-1.5 mb-2.5 flex-wrap font-mono">
                        {c.hardwareProfile?.isVM ? (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#FDF0F0] text-[#A83232] border border-[#A83232] truncate max-w-[130px]" title={`VM GPU: ${c.hardwareProfile.gpuRenderer}`}>
                            VM: {c.hardwareProfile.gpuRenderer}
                          </span>
                        ) : c.hardwareProfile ? (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#EBF5F0] text-[#236B47] border border-[#236B47]">
                            CLEAN HARDWARE
                          </span>
                        ) : null}

                        {c.hardwareProfile?.isMultiMonitor && (
                          <span className="px-1.5 py-0.2 text-[9px] font-bold bg-[#FEF8ED] text-[#C88A2D] border border-[#C88A2D]">
                            MULTI-MON ({c.hardwareProfile.monitorCount})
                          </span>
                        )}
                      </div>

                      {/* Progress bar */}
                      <div className="flex items-center gap-2 mb-2.5">
                        <div className="flex-1 h-1.5 bg-[#F4EFEA] border border-[#1C1D21]/30 overflow-hidden">
                          <div
                            className="h-full bg-[#1A2B4C] transition-all"
                            style={{ width: `${c.progress.percentage}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] font-bold text-[#1C1D21]">
                          {c.progress.answeredCount}/{c.progress.totalQuestions}
                        </span>
                      </div>
                    </div>

                    {/* Bottom row: time + violations + inspect */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#1C1D21]/20 mt-1">
                      <div className={`flex items-center gap-1 font-mono text-xs font-bold ${timeColor}`}>
                        <Clock className="w-3.5 h-3.5" />
                        {formatTime(c.secondsRemaining)}
                      </div>
                      {c.violations.totalViolations > 0 && (
                        <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-[#A83232] bg-[#FDF0F0] border border-[#A83232] px-1.5 py-0.2">
                          <ShieldAlert className="w-3 h-3" />
                          {c.violations.totalViolations} VIOLATIONS
                        </div>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInspect(c.attemptId);
                        }}
                        className="font-mono text-[11px] uppercase font-bold text-[#1A2B4C] hover:text-[#C88A2D] transition flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-3.5 h-3.5" /> PROCTOR
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      ) : (
        /* ═════════════════════════════════════════════════════════════════════
           MODE 2: PERSONAL PROCTORING TERMINAL
           ═════════════════════════════════════════════════════════════════════ */
        <>
          {!selectedAttemptId ? (
            <div className="space-y-4">
              <p className="font-mono text-xs text-[#575A65] uppercase tracking-wider font-bold">Select candidate from active registry:</p>
              {liveData.length === 0 ? (
                <div className="text-center py-16 bg-white border border-[#1C1D21] shadow-tactile">
                  <UserSearch className="w-12 h-12 mx-auto mb-3 text-[#8E929E]" />
                  <p className="font-serif text-sm font-bold text-[#1C1D21]">No active candidate streams to inspect</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {liveData.map((c) => {
                    return (
                      <button
                        key={c.attemptId}
                        onClick={() => handleInspect(c.attemptId)}
                        className={`w-full flex items-center gap-3.5 p-3.5 bg-white border border-[#1C1D21] shadow-tactile hover:shadow-tactile-lg transition text-left cursor-pointer btn-tactile`}
                      >
                        <div
                          className={`w-10 h-10 border border-[#1C1D21] flex items-center justify-center font-mono text-sm font-bold text-white shrink-0 ${
                            c.status === 'CRITICAL'
                              ? 'bg-[#A83232]'
                              : c.status === 'WARNING'
                              ? 'bg-[#C88A2D] text-[#1C1D21]'
                              : 'bg-[#236B47]'
                          }`}
                        >
                          {getInitials(c.student.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-serif font-bold text-sm text-[#1C1D21]">{c.student.name}</div>
                          <div className="font-mono text-xs text-[#575A65]">
                            {c.student.candidateId ? `ROLL: ${c.student.candidateId} · ` : ''}
                            {c.exam.title}
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono">
                          <div className={`text-sm font-bold ${c.secondsRemaining <= 300 ? 'text-[#A83232]' : 'text-[#1C1D21]'}`}>
                            {formatTime(c.secondsRemaining)}
                          </div>
                          <div className="text-[10px] text-[#575A65]">
                            {c.progress.answeredCount}/{c.progress.totalQuestions} ({c.progress.percentage}%)
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[#1C1D21] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : isDetailsLoading && !candidateDetails ? (
            <div className="flex items-center justify-center h-64 bg-white border border-[#1C1D21] shadow-tactile font-mono text-xs text-[#1C1D21]">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-[#1C1D21] border-t-transparent animate-spin" />
                <span>&gt; STREAMING CANDIDATE TELEMETRY &amp; EVENT LOGS...</span>
              </div>
            </div>
          ) : candidateDetails ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              {/* ── LEFT PANEL (2 cols): Identity + Session + Hardware ──────── */}
              <div className="lg:col-span-2 space-y-4">
                {/* Candidate Dossier Card */}
                <div className="bg-white border border-[#1C1D21] shadow-tactile p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-12 h-12 border border-[#1C1D21] flex items-center justify-center font-mono text-base font-bold text-white ${
                        candidateDetails.totalViolations >= 3
                          ? 'bg-[#A83232]'
                          : candidateDetails.totalViolations >= 1
                          ? 'bg-[#C88A2D] text-[#1C1D21]'
                          : 'bg-[#236B47]'
                      }`}
                    >
                      {getInitials(candidateDetails.student.name)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="font-serif font-bold text-base text-[#1C1D21] truncate">{candidateDetails.student.name}</h2>
                      <p className="font-mono text-xs text-[#575A65] truncate">{candidateDetails.student.candidateId || candidateDetails.student.email}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-[#575A65]">
                      <span>EXAM</span>
                      <span className="font-bold text-[#1C1D21] text-right max-w-[60%] truncate">{candidateDetails.exam.title}</span>
                    </div>
                    <div className="flex justify-between text-[#575A65]">
                      <span>TOTAL MARKS</span>
                      <span className="font-bold text-[#1C1D21]">{candidateDetails.exam.totalMarks}</span>
                    </div>
                    <div className="flex justify-between text-[#575A65]">
                      <span>START TIME</span>
                      <span className="font-bold text-[#1C1D21]">{new Date(candidateDetails.startedAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between text-[#575A65]">
                      <span>STATE</span>
                      <span className={`font-bold ${candidateDetails.state === 'IN_PROGRESS' ? 'text-[#236B47]' : 'text-[#575A65]'}`}>
                        {candidateDetails.state}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Laboratory Clock + Categorized Breakdown */}
                <div className="bg-white border border-[#1C1D21] shadow-tactile p-4">
                  <div className="text-center mb-3">
                    <div
                      className={`text-3xl font-mono font-bold tracking-widest ${
                        candidateDetails.secondsRemaining <= 300
                          ? 'text-[#A83232]'
                          : candidateDetails.secondsRemaining <= 600
                          ? 'text-[#C88A2D]'
                          : 'text-[#1C1D21]'
                      }`}
                    >
                      {formatTime(candidateDetails.secondsRemaining)}
                    </div>
                    <div className="font-mono text-[10px] text-[#575A65] uppercase tracking-wider mt-0.5">TIME REMAINING</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center font-mono">
                    <div className="bg-[#EBF5F0] border border-[#236B47] p-2">
                      <div className="text-base font-bold text-[#236B47]">{candidateDetails.progress.answeredCount}</div>
                      <div className="text-[9px] uppercase font-bold text-[#236B47]">Ans</div>
                    </div>
                    <div className="bg-[#FEF8ED] border border-[#C88A2D] p-2">
                      <div className="text-base font-bold text-[#C88A2D]">{candidateDetails.progress.markedCount}</div>
                      <div className="text-[9px] uppercase font-bold text-[#C88A2D]">Rev</div>
                    </div>
                    <div className="bg-[#F4EFEA] border border-[#1C1D21]/30 p-2">
                      <div className="text-base font-bold text-[#575A65]">{candidateDetails.progress.visitedCount}</div>
                      <div className="text-[9px] uppercase font-bold text-[#575A65]">Vis</div>
                    </div>
                    <div className="bg-[#FDF0F0] border border-[#A83232] p-2">
                      <div className="text-base font-bold text-[#A83232]">{candidateDetails.progress.unansweredCount}</div>
                      <div className="text-[9px] uppercase font-bold text-[#A83232]">Skip</div>
                    </div>
                  </div>
                  <div className="mt-3 h-1.5 bg-[#F4EFEA] border border-[#1C1D21]/30 overflow-hidden">
                    <div
                      className="h-full bg-[#1A2B4C]"
                      style={{ width: `${candidateDetails.progress.percentage}%` }}
                    />
                  </div>
                  <div className="font-mono text-[10px] text-[#575A65] text-right mt-1">{candidateDetails.progress.percentage}% COMPLETE</div>
                </div>

                {/* Candidate Hardware & VM Fingerprint */}
                <div className="bg-white border border-[#1C1D21] shadow-tactile p-4">
                  <div className="flex items-center justify-between mb-2.5 pb-1 border-b border-[#1C1D21]/20">
                    <h3 className="font-mono text-xs font-bold text-[#1C1D21] uppercase tracking-wider">HARDWARE SPECIFICATIONS</h3>
                    {candidateDetails.hardwareProfile?.isVM ? (
                      <span className="px-2 py-0.2 font-mono text-[10px] font-bold bg-[#FDF0F0] text-[#A83232] border border-[#A83232]">
                        VM DETECTED
                      </span>
                    ) : candidateDetails.hardwareProfile ? (
                      <span className="px-2 py-0.2 font-mono text-[10px] font-bold bg-[#EBF5F0] text-[#236B47] border border-[#236B47]">
                        CLEAN SYSTEM
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] text-[#8E929E]">PENDING</span>
                    )}
                  </div>

                  {candidateDetails.hardwareProfile ? (
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-[#575A65]">
                        <span>DISPLAYS</span>
                        <span className={`font-bold ${candidateDetails.hardwareProfile.isMultiMonitor ? 'text-[#C88A2D]' : 'text-[#1C1D21]'}`}>
                          {candidateDetails.hardwareProfile.isMultiMonitor
                            ? `MULTI-MONITOR (${candidateDetails.hardwareProfile.monitorCount} SCREENS)`
                            : 'SINGLE MONITOR'}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#575A65]">
                        <span>RESOLUTION</span>
                        <span className="font-bold text-[#1C1D21]">{candidateDetails.hardwareProfile.screenResolution}</span>
                      </div>
                      <div className="flex justify-between text-[#575A65]">
                        <span>CORES / MEMORY</span>
                        <span className="font-bold text-[#1C1D21]">
                          {candidateDetails.hardwareProfile.logicalCores} CORES
                          {candidateDetails.hardwareProfile.deviceMemoryGB ? ` · ~${candidateDetails.hardwareProfile.deviceMemoryGB}GB RAM` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between text-[#575A65]">
                        <span>GPU RENDERER</span>
                        <span className="font-bold text-[#1C1D21] text-right max-w-[60%] truncate" title={candidateDetails.hardwareProfile.gpuRenderer}>
                          {candidateDetails.hardwareProfile.gpuRenderer}
                        </span>
                      </div>
                      {candidateDetails.hardwareProfile.detectedFlags && Array.isArray(candidateDetails.hardwareProfile.detectedFlags) && candidateDetails.hardwareProfile.detectedFlags.length > 0 && (
                        <div className="pt-2 border-t border-[#1C1D21]/20">
                          <p className="text-[9px] font-bold text-[#575A65] uppercase tracking-wider mb-1">SIGNALS:</p>
                          <div className="flex flex-wrap gap-1">
                            {candidateDetails.hardwareProfile.detectedFlags.map((flag: string, idx: number) => (
                              <span key={idx} className="text-[9px] px-1.5 py-0.2 bg-[#F4EFEA] text-[#1C1D21] border border-[#1C1D21]/30">
                                {flag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="font-mono text-xs text-[#8E929E]">Pre-exam telemetry not yet recorded.</p>
                  )}
                </div>

                {/* Session Environment */}
                <div className="bg-white border border-[#1C1D21] shadow-tactile p-4">
                  <h3 className="font-mono text-xs font-bold text-[#1C1D21] uppercase tracking-wider mb-2.5 pb-1 border-b border-[#1C1D21]/20">SESSION ENVIRONMENT</h3>
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2 text-[#575A65]">
                      <Globe className="w-3.5 h-3.5 text-[#1C1D21]" />
                      <span className="font-bold text-[#1C1D21]">IP: {candidateDetails.session?.ipAddress || '127.0.0.1'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#575A65]">
                      <Monitor className="w-3.5 h-3.5 text-[#1C1D21]" />
                      <span className="font-bold text-[#1C1D21]">BROWSER: {parseBrowser(candidateDetails.session?.userAgent)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#575A65]">
                      <Shield className="w-3.5 h-3.5 text-[#1C1D21]" />
                      <span className="font-bold text-[#1C1D21]">LOCKDOWN: {candidateDetails.session?.examEnvironment || 'FULLSCREEN_BROWSER'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#575A65]">
                      <Wifi className="w-3.5 h-3.5 text-[#1C1D21]" />
                      <span className={`font-bold ${candidateDetails.session?.isActive ? 'text-[#236B47]' : 'text-[#A83232]'}`}>
                        {candidateDetails.session?.isActive ? 'ACTIVE STREAM' : 'DISCONNECTED'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Invigilator Notes */}
                <div className="bg-white border border-[#1C1D21] shadow-tactile p-4">
                  <h3 className="font-mono text-xs font-bold text-[#1C1D21] uppercase tracking-wider mb-2">INVIGILATOR NOTES</h3>
                  <textarea
                    value={proctorNotes}
                    onChange={(e) => setProctorNotes(e.target.value)}
                    placeholder="Record notes on student behavior (stored in local terminal)..."
                    className="w-full h-20 text-xs font-sans bg-[#FBF9F5] border border-[#1C1D21] p-2.5 resize-none focus:outline-none focus:bg-white focus:shadow-tactile text-[#1C1D21]"
                  />
                </div>
              </div>

              {/* ── RIGHT PANEL (3 cols): Events + Matrix + Intervention ── */}
              <div className="lg:col-span-3 space-y-4">
                {/* Intervention Controls */}
                <div className="bg-white border border-[#1C1D21] shadow-tactile p-4">
                  <h3 className="font-mono text-xs font-bold text-[#1C1D21] uppercase tracking-wider mb-3 pb-1 border-b border-[#1C1D21]/20">
                    LIVE INTERVENTION CONTROLS
                  </h3>

                  {/* Warning Dispatch */}
                  <div className="space-y-2 mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={warningMessage}
                        onChange={(e) => setWarningMessage(e.target.value)}
                        placeholder="Type custom warning message..."
                        className="flex-1 text-xs font-sans bg-[#FBF9F5] border border-[#1C1D21] px-3 py-2 focus:outline-none focus:bg-white focus:shadow-tactile"
                        onKeyDown={(e) => e.key === 'Enter' && handleSendWarning()}
                      />
                      <button
                        onClick={handleSendWarning}
                        disabled={!warningMessage.trim() || isActionLoading}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#C88A2D] text-[#1C1D21] font-mono text-xs font-bold uppercase border border-[#1C1D21] btn-tactile cursor-pointer disabled:opacity-40"
                      >
                        <Send className="w-3.5 h-3.5" /> Dispatch
                      </button>
                    </div>
                    {/* Presets */}
                    <div className="flex flex-wrap gap-1.5 font-mono">
                      {PRESET_WARNINGS.map((preset, i) => (
                        <button
                          key={i}
                          onClick={() => setWarningMessage(preset)}
                          className="text-[10px] px-2 py-1 bg-[#FEF8ED] text-[#C88A2D] border border-[#C88A2D] btn-tactile truncate max-w-[220px]"
                          title={preset}
                        >
                          <MessageSquareWarning className="w-3 h-3 inline mr-1" />
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#1C1D21]/20 font-mono">
                    {/* Add Time */}
                    <div className="flex items-center gap-1 bg-[#F4EFEA] border border-[#1C1D21] px-2 py-1">
                      <Timer className="w-3.5 h-3.5 text-[#1A2B4C]" />
                      <select
                        value={addTimeMinutes}
                        onChange={(e) => setAddTimeMinutes(Number(e.target.value))}
                        className="text-xs bg-transparent text-[#1C1D21] font-bold focus:outline-none cursor-pointer"
                      >
                        <option value={5}>+5 MIN</option>
                        <option value={10}>+10 MIN</option>
                        <option value={15}>+15 MIN</option>
                        <option value={30}>+30 MIN</option>
                      </select>
                      <button
                        onClick={handleAddTime}
                        disabled={isActionLoading}
                        className="px-2 py-0.5 bg-[#1A2B4C] text-white text-[10px] font-bold border border-[#1C1D21] btn-tactile cursor-pointer"
                      >
                        <Plus className="w-3 h-3 inline" /> Extend
                      </button>
                    </div>

                    <div className="flex-1" />

                    {/* Terminate */}
                    {!showTerminateConfirm ? (
                      <button
                        onClick={() => setShowTerminateConfirm(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FDF0F0] text-[#A83232] border border-[#A83232] text-xs font-mono font-bold uppercase btn-tactile cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" /> Terminate Session
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 bg-[#FDF0F0] border border-[#A83232] p-1.5">
                        <TriangleAlert className="w-4 h-4 text-[#A83232]" />
                        <span className="text-xs text-[#A83232] font-mono font-bold">FORCE SUBMIT?</span>
                        <button
                          onClick={handleTerminate}
                          disabled={isActionLoading}
                          className="px-2.5 py-1 bg-[#A83232] text-white text-[10px] font-bold border border-[#1C1D21] btn-tactile cursor-pointer"
                        >
                          CONFIRM
                        </button>
                        <button
                          onClick={() => setShowTerminateConfirm(false)}
                          className="px-2.5 py-1 bg-[#F4EFEA] text-[#1C1D21] text-[10px] font-bold border border-[#1C1D21] btn-tactile cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Telemetry Chronological Event Stream */}
                <div className="bg-white border border-[#1C1D21] shadow-tactile p-4">
                  <div className="flex items-center justify-between mb-3 pb-1 border-b border-[#1C1D21]/20 font-mono">
                    <h3 className="text-xs font-bold text-[#1C1D21] uppercase tracking-wider">CHRONOLOGICAL INTEGRITY STREAM</h3>
                    <span className="text-[10px] text-[#575A65]">{candidateDetails.integrityEvents.length} EVENTS LOGGED</span>
                  </div>
                  <div ref={eventFeedRef} className="max-h-64 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
                    {candidateDetails.integrityEvents.length === 0 ? (
                      <p className="text-xs text-[#8E929E] text-center py-6">No security anomalies logged.</p>
                    ) : (
                      candidateDetails.integrityEvents.map((event) => {
                        const { icon, color } = getEventIcon(event.eventType);
                        const isViolation = [
                          'FULLSCREEN_EXIT',
                          'WINDOW_BLUR',
                          'VISIBILITY_HIDDEN',
                          'COPY_ATTEMPT',
                          'PASTE_ATTEMPT',
                          'DEVTOOLS_OPEN',
                          'CURSOR_TELEPORTATION_DETECTED',
                          'SUSPICIOUS_HARDWARE',
                          'MULTI_MONITOR_ON_LOGIN',
                        ].includes(event.eventType);
                        return (
                          <div
                            key={event.id}
                            className={`flex items-start gap-2 py-1.5 px-2.5 border ${
                              isViolation ? 'bg-[#FDF0F0] border-[#A83232]' : 'bg-[#FBF9F5] border-[#1C1D21]/30'
                            }`}
                          >
                            <span className="text-xs shrink-0 mt-0.5">{icon}</span>
                            <div className="flex-1 min-w-0">
                              <span className={`font-bold ${color}`}>{event.eventType}</span>
                              {event.details?.message && (
                                <p className="text-[#575A65] text-[10px] mt-0.5 truncate">{event.details.message}</p>
                              )}
                            </div>
                            <span className="text-[10px] text-[#8E929E] shrink-0">
                              {new Date(event.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Candidate Question Progress Matrix */}
                <div className="bg-white border border-[#1C1D21] shadow-tactile p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-1 border-b border-[#1C1D21]/20 font-mono">
                    <h3 className="text-xs font-bold text-[#1C1D21] uppercase tracking-wider">QUESTION STATUS MATRIX</h3>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 bg-[#236B47] border border-[#1C1D21]" /> Ans
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 bg-[#C88A2D] border border-[#1C1D21]" /> Rev
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 bg-[#EAE3D9] border border-[#1C1D21]" /> Vis
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 bg-white border border-[#1C1D21]" /> Unvis
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 font-mono">
                    {candidateDetails.questions.map((q, i) => {
                      let bgColor = 'bg-white text-[#575A65] border-[#1C1D21]/40';
                      if (q.status === 'ANSWERED') bgColor = 'bg-[#236B47] text-white font-bold border-[#1C1D21]';
                      else if (q.status === 'VISITED') bgColor = 'bg-[#EAE3D9] text-[#1C1D21] font-bold border-[#1C1D21]';
                      const reviewRing = q.isMarkedForReview ? 'ring-2 ring-[#C88A2D]' : '';
                      return (
                        <div
                          key={q.questionId}
                          className={`w-7 h-7 border flex items-center justify-center text-[10px] ${bgColor} ${reviewRing} cursor-default`}
                          title={`Q${i + 1} (${q.section}): ${q.status}${q.isMarkedForReview ? ' (Marked for Review)' : ''}`}
                        >
                          {i + 1}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-[#1C1D21] shadow-tactile">
              <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-[#8E929E]" />
              <p className="font-serif text-sm font-bold text-[#1C1D21]">Candidate session data unavailable</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default LiveMonitoringPage;
