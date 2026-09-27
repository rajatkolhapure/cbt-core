import React from 'react';
import { FileText, BookOpen, Target, Crosshair, type LucideIcon } from 'lucide-react';

export interface StudentStats {
  assignedTestsCount: number;
  attemptedTestsCount: number;
  accuracy: number;
  questionsPracticedCount: number;
}

interface SingleCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend: string;
  tone?: 'muted' | 'good' | 'bad';
  emptyMessage?: string;
}

function StatItem({ icon: Icon, label, value, trend, tone = 'muted', emptyMessage }: SingleCardProps) {
  const trendColor =
    tone === 'good'
      ? 'text-[#10B981]'
      : tone === 'bad'
      ? 'text-[#EF4444]'
      : 'text-[#8791A5]';

  return (
    <article
      className="relative overflow-hidden rounded-2xl border border-[#263044] border-t-[#D4A373]/70 bg-[#151C2C] p-5 shadow-lg transition-transform duration-200 hover:-translate-y-0.5 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-[#D4A373] before:to-transparent"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex items-start justify-between">
        <div className="grid size-9 place-items-center rounded-lg bg-[#C85A32]/10 text-[#D4A373]">
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

interface StudentStatsCardsGridProps {
  stats: StudentStats;
  isLoading?: boolean;
}

export const StudentStatsCard: React.FC<StudentStatsCardsGridProps> = ({ stats, isLoading = false }) => {
  if (isLoading) {
    return (
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
    );
  }

  const assignedDisplay =
    stats.assignedTestsCount === 0
      ? '0 assigned'
      : `${stats.assignedTestsCount}`;

  const accuracyDisplay =
    stats.attemptedTestsCount === 0
      ? '0%'
      : `${Number(stats.accuracy).toFixed(stats.accuracy % 1 === 0 ? 0 : 2)}%`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Assigned Tests */}
      <StatItem
        icon={FileText}
        label="ASSIGNED TESTS"
        value={assignedDisplay}
        trend="LIVE DB SYNC"
        emptyMessage={stats.assignedTestsCount === 0 ? 'No papers currently assigned' : undefined}
      />

      {/* 2. Tests Attempted */}
      <StatItem
        icon={BookOpen}
        label="TESTS ATTEMPTED"
        value={stats.attemptedTestsCount}
        trend={stats.attemptedTestsCount > 0 ? `↑ ${stats.attemptedTestsCount} COMPLETED` : 'PENDING START'}
        tone={stats.attemptedTestsCount > 0 ? 'good' : 'muted'}
        emptyMessage={stats.attemptedTestsCount === 0 ? 'Start your first test below' : undefined}
      />

      {/* 3. Average Question Accuracy */}
      <StatItem
        icon={Target}
        label="AVG. ACCURACY"
        value={accuracyDisplay}
        trend={stats.accuracy >= 75 ? '↑ HIGH MASTERY' : stats.accuracy >= 40 ? '• NOMINAL' : 'CALIBRATING'}
        tone={stats.accuracy >= 60 ? 'good' : stats.accuracy > 0 ? 'bad' : 'muted'}
      />

      {/* 4. Questions Practiced */}
      <StatItem
        icon={Crosshair}
        label="QUESTIONS PRACTICED"
        value={stats.questionsPracticedCount}
        trend="AUTHENTICATED CBT"
      />
    </div>
  );
};

export default StudentStatsCard;
