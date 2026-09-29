import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  LogOut,
  Menu,
  ShieldCheck,
  Target,
  X,
  AlertTriangle,
  RotateCcw,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  BookOpen,
  Crosshair,
  BarChart3,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import MathRenderer from '../../components/common/MathRenderer';

type Tab = 'overview' | 'assigned' | 'bookmarked' | 'upcoming' | 'history';

interface LiveTestItem {
  id: string;
  name: string;
  track: string;
  duration: string;
  questionsCount: number;
  format: string;
  formula: string;
  bookmarked?: boolean;
}

export interface StudentStats {
  assignedTestsCount: number;
  attemptedTestsCount: number;
  accuracy: number;
  questionsPracticedCount: number;
}

export interface ScoreDataPoint {
  id?: string;
  testName: string;
  day: string;
  date?: string;
  score: number;
  marksObtained?: number;
  totalMarks?: number;
  percentage?: number;
  accuracy?: number;
}

interface SingleCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend: string;
  tone?: 'muted' | 'good' | 'bad';
  emptyMessage?: string;
  topBorderClass: string;
  iconPillClass: string;
}

function StatItem({
  icon: Icon,
  label,
  value,
  trend,
  tone = 'muted',
  emptyMessage,
  topBorderClass,
  iconPillClass,
}: SingleCardProps) {
  const trendColor =
    tone === 'good'
      ? 'text-[#10B981]'
      : tone === 'bad'
      ? 'text-[#EF4444]'
      : 'text-[#8791A5]';

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border border-[#263044] ${topBorderClass} bg-[#151C2C] p-5 shadow-lg transition-transform duration-200 hover:-translate-y-0.5`}
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div className={`grid size-9 place-items-center rounded-lg ${iconPillClass}`}>
          <Icon size={17} />
        </div>
        <span className={`font-mono text-[10px] uppercase tracking-wider ${trendColor}`}>
          {trend}
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-[#F3F4F6] font-sans">
        {value}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[.15em] text-[#8791A5]">
        {label}
      </p>
      {emptyMessage && (
        <span className="mt-1 block font-mono text-[9px] text-[#D4A373]">
          {emptyMessage}
        </span>
      )}
    </article>
  );
}

export const StudentDashboard: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Active navigation tab
  const [tab, setTab] = useState<Tab>('overview');

  // Real database telemetry states
  const [stats, setStats] = useState<StudentStats>({
    assignedTestsCount: 0,
    attemptedTestsCount: 0,
    accuracy: 0,
    questionsPracticedCount: 0,
  });
  const [scoreHistory, setScoreHistory] = useState<ScoreDataPoint[]>([]);
  const [assignedTests, setAssignedTests] = useState<LiveTestItem[]>([]);

  // Telemetry loading & error state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modal & mobile drawer state
  const [selectedTest, setSelectedTest] = useState<LiveTestItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('ALL');

  /**
   * Fetch real student metrics from PostgreSQL Neon via Prisma
   */
  const fetchStudentTelemetry = useCallback(async () => {
    const token = localStorage.getItem('cbt_token');
    if (!token && !user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);

    setStats({
      assignedTestsCount: 0,
      attemptedTestsCount: 0,
      accuracy: 0,
      questionsPracticedCount: 0,
    });
    setScoreHistory([]);
    setAssignedTests([]);

    try {
      const res = await api.get('/tests/student-stats');
      const data = res.data;

      if (data && data.stats) {
        setStats({
          assignedTestsCount: Number(data.stats.assignedTestsCount) || 0,
          attemptedTestsCount: Number(data.stats.attemptedTestsCount) || 0,
          accuracy: Number(data.stats.accuracy) || 0,
          questionsPracticedCount: Number(data.stats.questionsPracticedCount) || 0,
        });
      }

      if (Array.isArray(data.scoreHistory)) {
        setScoreHistory(data.scoreHistory);
      }

      if (Array.isArray(data.assignedTests) && data.assignedTests.length > 0) {
        setAssignedTests(data.assignedTests);
      } else {
        const examsRes = await api.get('/exams').catch(() => ({ data: { exams: [] } }));
        const incomingExams = examsRes.data.exams || [];
        if (incomingExams.length > 0) {
          setAssignedTests(
            incomingExams.map((ex: any) => ({
              id: ex.id,
              name: ex.title,
              track: ex.sections?.[0]?.name ? `${ex.sections[0].name} Track` : 'Academic Track',
              duration: `${ex.duration}M`,
              questionsCount: ex.sections?.reduce((sum: number, s: any) => sum + (s.questionCount || 0), 0) || 25,
              format: ex.examEnvironment === 'FULLSCREEN_BROWSER' ? 'CBT-STRICT' : 'STANDARD',
              formula: 'Physics & Kinetics: $\\int_0^T \\vec{F}(t)\\,dt = \\Delta\\vec{p}$',
              bookmarked: false,
            }))
          );
        }
      }
    } catch (err: any) {
      console.error('[StudentDashboard] Database query error fetching student telemetry:', err);
      if (err.response?.status === 401) {
        setLoadError('Session expired or unauthorized. Please log in again.');
      } else {
        setLoadError('Failed to load candidate telemetry stream from Neon DB.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchStudentTelemetry();
    }
  }, [user?.id, authLoading, fetchStudentTelemetry]);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'assigned', label: 'Assigned Tests', count: stats.assignedTestsCount },
    { id: 'bookmarked', label: 'Bookmarked', count: assignedTests.filter((t) => t.bookmarked).length },
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'history', label: 'History / Given Tests', count: stats.attemptedTestsCount },
  ];

  const handleLaunchTest = (test: LiveTestItem) => {
    setSelectedTest(test);
    setIsModalOpen(true);
  };

  const handleEnterArena = () => {
    if (selectedTest) {
      navigate(`/exam/${selectedTest.id}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const candidateName = user?.name || 'Rajat';
  const candidateEmail = user?.email || 'student@cbt.com';
  const candidateInitials = candidateName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'PS';

  const assignedDisplay =
    stats.assignedTestsCount === 0 ? '0 assigned' : `${stats.assignedTestsCount}`;

  const accuracyDisplay =
    stats.attemptedTestsCount === 0
      ? '0%'
      : `${Number(stats.accuracy).toFixed(stats.accuracy % 1 === 0 ? 0 : 2)}%`;

  const isAccuracyGood = stats.accuracy >= 60;

  // Format data for chart
  const chartData = scoreHistory.map((item, idx) => ({
    displayLabel: item.day || `Test ${idx + 1}`,
    testName: item.testName,
    score: Math.min(100, Math.max(0, Math.round(item.score))),
    marksObtained: item.marksObtained,
    totalMarks: item.totalMarks,
    accuracy: item.accuracy,
  }));

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0B0F17] text-[#F3F4F6] selection:bg-[#C85A32]/40 font-sans">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-12 pb-14">
        {/* Top Masthead */}
        <header className="flex min-h-[86px] items-center justify-between border-b border-[#263044]/70">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl border border-[#D4A373]/35 bg-[#D4A373]/10 text-[#D4A373] shadow-sm">
              <FileText size={19} />
            </div>
            <div>
              <p className="font-bold tracking-tight text-base sm:text-lg text-[#F3F4F6]">
                Testing portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#F3F4F6]">{candidateName}</p>
              <p className="font-mono text-[10px] text-[#8791A5]">{candidateEmail}</p>
            </div>
            <div
              className="grid size-10 place-items-center rounded-full border border-[#D4A373]/40 bg-[#302B28] font-mono text-xs font-bold text-[#D4A373] shadow-inner select-none"
              title="Profile initials"
            >
              {candidateInitials}
            </div>
            <button
              onClick={handleLogout}
              aria-label="Logout from testing portal"
              className="hidden items-center gap-2 rounded-lg border border-[#2B3548] px-3.5 py-2 font-mono text-[10px] uppercase tracking-[.16em] text-[#9DA6B8] hover:border-[#C85A32] hover:text-[#F3F4F6] active:translate-y-[1px] transition sm:flex focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
            >
              <LogOut size={14} />
              <span>LOGOUT</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#9DA6B8] sm:hidden hover:text-white"
              aria-label="Toggle navigation menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-[#263044] bg-[#151C2C] p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#263044]">
              <div>
                <p className="text-sm font-semibold text-white">{candidateName}</p>
                <p className="font-mono text-[10px] text-[#8791A5]">{candidateEmail}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2B3548] text-xs font-mono uppercase text-[#9DA6B8]"
              >
                <LogOut size={13} />
                Logout
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
              {tabs.map(({ id, label, count }) => (
                <button
                  key={id}
                  onClick={() => {
                    setTab(id);
                    setMobileMenuOpen(false);
                  }}
                  className={`inline-flex items-center justify-between p-2 text-left rounded-lg transition ${
                    tab === id ? 'bg-[#C85A32] text-white font-bold' : 'text-[#8791A5] hover:bg-[#1B2438]'
                  }`}
                >
                  <span>{label}</span>
                  {count !== undefined && count > 0 && (
                    <span className="rounded-full px-1.5 py-0.5 text-[9px] font-mono font-semibold text-[#D4A373] bg-[#D4A373]/10">
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hero Welcome Banner */}
        <section className="relative py-8 sm:py-10 lg:py-12">
          {/* Ambient Lighting Glow behind hero block */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#C85A32]/10 via-[#38BDF8]/5 to-transparent blur-[120px] pointer-events-none -z-10" />

          <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C85A32]/30 bg-[#C85A32]/10 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[.16em] text-[#E59876]">
                <span className="size-1.5 rounded-full bg-[#C85A32] inline-block animate-pulse" />
                OFFICIAL COMPUTER BASED TESTING PLATFORM
              </div>
              <h1 className="text-3xl font-bold tracking-[-.04em] sm:text-4xl md:text-5xl text-[#F3F4F6]">
                Welcome back, <span className="text-[#D4A373]">{candidateName.split(' ')[0]}</span>
              </h1>
              <p className="mt-3 text-sm text-[#8B96AA] max-w-xl leading-relaxed">
                Here's what's happening with your learning journey today.
              </p>
            </div>
          </div>

          {/* Sticky Tab Navigation Bar */}
          <nav
            aria-label="Dashboard sections"
            className="sticky top-0 z-20 -mx-4 mb-6 flex overflow-x-auto border-y border-[#263044] bg-[#0B0F17]/95 px-4 pb-px backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-12 lg:px-12 scrollbar-none"
          >
            <div className="flex min-w-max gap-1">
              {tabs.map(({ id, label, count }) => {
                const isActive = tab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    aria-selected={isActive}
                    role="tab"
                    className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 font-mono text-[10px] sm:text-xs uppercase tracking-[.13em] transition-all focus:outline-none ${
                      isActive
                        ? 'bg-[#C85A32]/10 text-white border-b-2 border-[#C85A32] font-bold'
                        : 'border-transparent text-[#8791A5] hover:text-white'
                    }`}
                  >
                    <span>{label}</span>
                    {count !== undefined && count > 0 && (
                      <span className="rounded-full px-1.5 py-0.5 text-[9px] font-mono font-semibold text-[#D4A373] bg-[#D4A373]/10">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Error Banner with Retry Option */}
          {loadError && (
            <div className="mb-6 rounded-2xl border border-[#EF4444]/40 bg-[#151C2C] p-4 text-[#EF4444] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} />
                <span className="font-mono text-xs">{loadError}</span>
              </div>
              <button
                onClick={fetchStudentTelemetry}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#EF4444]/50 font-mono text-[10px] uppercase text-white hover:bg-[#EF4444]/20"
              >
                <RotateCcw size={12} />
                Retry
              </button>
            </div>
          )}

          {/* TAB: OVERVIEW */}
          {tab === 'overview' && (
            <>
              {/* Cockpit Top-Border Colors on 4 Stat Cards */}
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-2xl border border-[#263044] bg-[#151C2C] p-5 h-32 flex flex-col justify-between"
                    >
                      <div className="h-8 w-8 rounded-lg bg-[#263044]" />
                      <div className="space-y-2">
                        <div className="h-6 w-20 rounded bg-[#263044]" />
                        <div className="h-3 w-32 rounded bg-[#263044]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {/* Card 1 (Assigned Tests) */}
                  <StatItem
                    icon={FileText}
                    label="ASSIGNED TESTS"
                    value={assignedDisplay}
                    trend="LIVE DB SYNC"
                    topBorderClass="border-t-2 border-[#D4A373]"
                    iconPillClass="bg-[#D4A373]/10 text-[#D4A373]"
                    emptyMessage={stats.assignedTestsCount === 0 ? 'No papers currently assigned' : undefined}
                  />

                  {/* Card 2 (Tests Attempted) */}
                  <StatItem
                    icon={BookOpen}
                    label="TESTS ATTEMPTED"
                    value={stats.attemptedTestsCount}
                    trend={stats.attemptedTestsCount > 0 ? `↑ ${stats.attemptedTestsCount} COMPLETED` : 'PENDING START'}
                    tone={stats.attemptedTestsCount > 0 ? 'good' : 'muted'}
                    topBorderClass="border-t-2 border-[#38BDF8]"
                    iconPillClass="bg-[#38BDF8]/10 text-[#38BDF8]"
                    emptyMessage={stats.attemptedTestsCount === 0 ? 'Start your first test below' : undefined}
                  />

                  {/* Card 3 (Avg. Accuracy) */}
                  <StatItem
                    icon={Target}
                    label="AVG. ACCURACY"
                    value={accuracyDisplay}
                    trend={stats.accuracy >= 75 ? '↑ HIGH MASTERY' : stats.accuracy >= 40 ? '• NOMINAL' : 'CALIBRATING'}
                    tone={isAccuracyGood ? 'good' : stats.accuracy > 0 ? 'bad' : 'muted'}
                    topBorderClass={isAccuracyGood ? 'border-t-2 border-[#10B981]' : 'border-t-2 border-amber-500/80'}
                    iconPillClass={isAccuracyGood ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}
                  />

                  {/* Card 4 (Questions Practiced) */}
                  <StatItem
                    icon={Crosshair}
                    label="QUESTIONS PRACTICED"
                    value={stats.questionsPracticedCount}
                    trend="AUTHENTICATED CBT"
                    topBorderClass="border-t-2 border-[#C85A32]"
                    iconPillClass="bg-[#C85A32]/10 text-[#C85A32]"
                  />
                </div>
              )}

              {/* Recharts Performance Chart Upgrades */}
              {scoreHistory.length === 0 ? (
                <section className="mt-6 rounded-2xl border border-[#263044] bg-[#151C2C] p-8 sm:p-10 shadow-xl text-center">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#0B0F17] border border-[#263044] text-[#D4A373] mb-4">
                    <BarChart3 size={28} />
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#C85A32]">
                    // TELEMETRY &amp; PERFORMANCE OVERVIEW
                  </p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-[#F3F4F6]">
                    No Attempted Test Results Yet
                  </h3>
                  <p className="mt-2 text-sm text-[#8791A5] max-w-md mx-auto leading-relaxed">
                    Scores and normalized performance trajectories will automatically plot here as you complete assigned testing dockets.
                  </p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0B0F17] border border-[#263044] px-4 py-2 font-mono text-[11px] text-[#D4A373]">
                    <AlertCircle size={14} className="text-[#C85A32]" />
                    <span>Launch an assigned test from the docket below to generate real-time metrics.</span>
                  </div>
                </section>
              ) : (
                <section className="mt-6 rounded-2xl border border-[#263044] bg-[#151C2C] p-5 sm:p-6 shadow-xl">
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#C85A32]">
                        // TELEMETRY &amp; PERFORMANCE OVERVIEW
                      </p>
                      <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-[#F3F4F6]">
                        Normalized performance score
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        aria-label="Filter performance timeframe"
                        className="rounded-lg border border-[#334056] bg-[#111724] px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-[#AEB6C5] focus:outline-none focus:border-[#C85A32]"
                      >
                        <option value="ALL">ALL ATTEMPTS ({scoreHistory.length})</option>
                        <option value="30">LAST 30 DAYS</option>
                        <option value="7">LAST 7 DAYS</option>
                      </select>
                    </div>
                  </div>

                  <div className="h-[280px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#C85A32" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#0B0F17" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke="#1E293B" strokeDasharray="2 5" vertical={false} />
                        <XAxis
                          dataKey="displayLabel"
                          tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'monospace' }}
                          axisLine={{ stroke: '#1E293B' }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fill: '#64748B', fontSize: 10, fontFamily: 'monospace' }}
                          axisLine={{ stroke: '#1E293B' }}
                          tickLine={false}
                          tickFormatter={(v) => `${v}%`}
                        />
                        <ReferenceLine
                          y={75}
                          stroke="#38BDF8"
                          strokeOpacity={0.4}
                          strokeDasharray="4 4"
                          label={{
                            value: 'BENCHMARK 75%',
                            fill: '#38BDF8',
                            fontSize: 9,
                            fontFamily: 'monospace',
                            position: 'insideTopRight',
                          }}
                        />
                        <Tooltip
                          content={({ active, payload }: { active?: boolean; payload?: any[] }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="rounded-xl border border-[#40506A] bg-[#111724] p-3 font-mono text-xs shadow-2xl">
                                  <p className="font-bold text-[#D4A373] text-[11px] mb-1">{data.testName}</p>
                                  <div className="space-y-0.5 text-[10px] text-[#F3F4F6]">
                                    <p>Score: <span className="font-bold text-[#10B981]">{data.score}%</span></p>
                                    {data.marksObtained !== undefined && data.totalMarks && (
                                      <p className="text-[#8791A5]">Marks: {data.marksObtained} / {data.totalMarks}</p>
                                    )}
                                    {data.accuracy !== undefined && (
                                      <p className="text-[#D4A373]">Question Accuracy: {data.accuracy}%</p>
                                    )}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="score"
                          stroke="#C85A32"
                          strokeWidth={2.5}
                          fill="url(#accuracyGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              )}
            </>
          )}

          {/* TAB: ASSIGNED TESTS */}
          {tab === 'assigned' && (
            <div className="mt-6 space-y-4">
              {assignedTests.length === 0 ? (
                <div className="rounded-2xl border border-[#263044] bg-[#151C2C] p-12 text-center">
                  <FileText size={36} className="mx-auto text-[#8791A5] mb-3" />
                  <h3 className="text-lg font-bold text-white">0 Assigned Tests</h3>
                  <p className="text-xs text-[#8791A5] mt-1">
                    No examination dockets are currently assigned to your candidate profile.
                  </p>
                </div>
              ) : (
                assignedTests.map((test, index) => (
                  <article
                    key={test.id}
                    className={`flex flex-col gap-5 rounded-2xl border border-[#263044] bg-[#151C2C] p-5 sm:flex-row sm:items-center sm:justify-between shadow-lg ${
                      index === 0 ? 'border-l-4 border-l-[#C85A32]' : ''
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.18em] text-[#C85A32]">
                        <span>Paper 0{index + 1}</span>
                        <span className="text-[#526078]">/</span>
                        <span>{test.track}</span>
                        {test.bookmarked && (
                          <>
                            <span className="text-[#526078]">/</span>
                            <span className="text-[#D4A373]">Bookmarked</span>
                          </>
                        )}
                      </div>
                      <h2 className="text-lg font-bold text-[#F3F4F6]">{test.name}</h2>
                      <div className="text-xs text-[#D4A373] font-mono py-1">
                        <MathRenderer content={test.formula} />
                      </div>
                      <div className="flex flex-wrap gap-2.5 font-mono text-[9px] uppercase tracking-wider text-[#8791A5]">
                        <span className="bg-[#111724] border border-[#263044] px-2 py-0.5 rounded">
                          [FORMAT: {test.format}]
                        </span>
                        <span className="bg-[#111724] border border-[#263044] px-2 py-0.5 rounded">
                          [ENCRYPTION: SECURE]
                        </span>
                        <span className="bg-[#111724] border border-[#263044] px-2 py-0.5 rounded">
                          [DURATION: {test.duration}]
                        </span>
                        <span className="bg-[#111724] border border-[#263044] px-2 py-0.5 rounded">
                          [QUESTIONS: {test.questionsCount}]
                        </span>
                      </div>
                    </div>
                    {/* Primary Action Button */}
                    <button
                      onClick={() => handleLaunchTest(test)}
                      className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C85A32] hover:bg-[#B54E29] text-white px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[.16em] transition active:translate-y-[1px] shadow-md focus:outline-none focus:ring-2 focus:ring-[#C85A32]/60"
                    >
                      <span>Launch test</span>
                      <ArrowRight size={15} />
                    </button>
                  </article>
                ))
              )}
            </div>
          )}

          {/* TAB: BOOKMARKED */}
          {tab === 'bookmarked' && (
            <div className="mt-6 space-y-4">
              {assignedTests.filter((t) => t.bookmarked).length === 0 ? (
                <div className="rounded-2xl border border-[#263044] bg-[#151C2C] p-12 text-center">
                  <p className="text-xs font-mono text-[#8791A5]">No tests currently bookmarked.</p>
                </div>
              ) : (
                assignedTests
                  .filter((t) => t.bookmarked)
                  .map((test) => (
                    <article
                      key={test.id}
                      className="flex flex-col gap-5 rounded-2xl border border-[#263044] bg-[#151C2C] p-5 sm:flex-row sm:items-center sm:justify-between border-l-4 border-l-[#C85A32] shadow-lg"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.18em] text-[#C85A32]">
                          <span>{test.track}</span>
                          <span className="text-[#526078]">/</span>
                          <span className="text-[#D4A373]">Bookmarked Priority</span>
                        </div>
                        <h2 className="text-lg font-bold text-[#F3F4F6]">{test.name}</h2>
                        <div className="text-xs text-[#D4A373] font-mono py-1">
                          <MathRenderer content={test.formula} />
                        </div>
                      </div>
                      {/* Primary Action Button */}
                      <button
                        onClick={() => handleLaunchTest(test)}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#C85A32] hover:bg-[#B54E29] text-white px-5 py-3 font-mono text-[10px] font-bold uppercase tracking-[.16em] transition active:translate-y-[1px] shadow-md"
                      >
                        <span>Launch test</span>
                        <ArrowRight size={15} />
                      </button>
                    </article>
                  ))
              )}
            </div>
          )}

          {/* TAB: UPCOMING */}
          {tab === 'upcoming' && (
            <div className="mt-6 grid min-h-[260px] place-items-center rounded-2xl border border-[#263044] bg-[#151C2C] p-8 text-center shadow-xl">
              <div>
                <CalendarDays size={38} className="mx-auto mb-4 animate-pulse text-[#D4A373]" />
                <p className="font-mono text-[10px] uppercase tracking-[.2em] text-[#C85A32]">
                  // COMING SOON
                </p>
                <h3 className="mt-2 text-xl font-bold text-white">
                  Upcoming Test Calendar &amp; Scheduling
                </h3>
                <p className="mt-2 text-sm text-[#AEB6C5] max-w-md mx-auto">
                  Automated calendar synchronization, mock test reservation windows, and proctor verification are currently undergoing final calibration.
                </p>
              </div>
            </div>
          )}

          {/* TAB: HISTORY / GIVEN TESTS */}
          {tab === 'history' && (
            <div className="mt-6 space-y-4">
              {scoreHistory.length === 0 ? (
                <div className="rounded-2xl border border-[#263044] bg-[#151C2C] p-12 text-center">
                  <p className="text-xs font-mono text-[#8791A5]">No evaluated test records found.</p>
                </div>
              ) : (
                scoreHistory.map((item) => (
                  <article
                    key={item.id || item.testName}
                    className="flex flex-col gap-4 rounded-2xl border border-[#263044] bg-[#151C2C] p-5 sm:flex-row sm:items-center sm:justify-between shadow-lg"
                  >
                    <div>
                      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[#8791A5]">
                        <CheckCircle2 size={14} className="text-[#10B981]" />
                        <span>[ VERIFIED SCORE ] · {item.day}</span>
                      </p>
                      <h2 className="mt-2 font-bold text-[#F3F4F6] text-base">{item.testName}</h2>
                      <span className="mt-2 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-[#D4A373]">
                        Telemetry Synced
                      </span>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-mono text-lg font-bold text-[#D4A373]">
                        {item.marksObtained !== undefined ? `${item.marksObtained} / ${item.totalMarks}` : `${item.score}%`}
                      </p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#10B981]">
                        {item.accuracy}% question accuracy
                      </p>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </section>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && selectedTest && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 grid place-items-center bg-[#070A10]/80 p-5 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="w-full max-w-md rounded-2xl border border-[#36445C] bg-[#151C2C] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="grid size-11 place-items-center rounded-xl bg-[#C85A32]/15 text-[#E59876]">
                <Target size={21} />
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                aria-label="Close dialog"
                className="text-[#8791A5] hover:text-white transition"
              >
                <X size={19} />
              </button>
            </div>

            <p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-[#C85A32]">
              Secure terminal / checkpoint
            </p>
            <h2 id="modal-title" className="mt-2 text-2xl font-bold tracking-tight text-white">
              Preparing Secure Terminal
            </h2>

            <div className="mt-4 p-3 rounded-xl bg-[#111724] border border-[#263044]">
              <p className="font-mono text-[10px] uppercase text-[#D4A373]">
                TARGET EXAM: {selectedTest.name}
              </p>
              <div className="mt-1 text-xs text-[#AEB6C5]">
                <MathRenderer content={selectedTest.formula} />
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs text-[#AEB6C5] leading-relaxed">
              <div className="flex items-start gap-2">
                <ShieldCheck size={16} className="text-[#D4A373] shrink-0 mt-0.5" />
                <p>
                  Fullscreen lock will activate immediately. Leaving the window triggers a 5-minute auto-submit countdown.
                </p>
              </div>
              <p className="text-[11px] text-[#8791A5]">
                Ensure your connection is stable before entering. Answer states sync continuously with offline resilience.
              </p>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-[#334056] px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-[#AEB6C5] hover:border-[#8791A5] transition"
              >
                Cancel
              </button>
              {/* Primary Action Button */}
              <button
                onClick={handleEnterArena}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#C85A32] hover:bg-[#B54E29] text-white px-6 py-3 font-mono text-[10px] font-bold uppercase tracking-widest transition active:translate-y-[1px] shadow-lg shadow-[#C85A32]/25"
              >
                <span>Enter Secure Arena</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default StudentDashboard;
