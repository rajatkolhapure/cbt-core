import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, AlertCircle } from 'lucide-react';

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

interface TestScoreGraphProps {
  scoreHistory: ScoreDataPoint[];
  isLoading?: boolean;
}

export const TestScoreGraph: React.FC<TestScoreGraphProps> = ({
  scoreHistory = [],
  isLoading = false,
}) => {
  const [timeRange, setTimeRange] = useState('ALL');

  if (isLoading) {
    return (
      <section className="mt-6 rounded-2xl border border-[#263044] bg-[#151C2C] p-5 sm:p-6 shadow-xl">
        <div className="flex h-[320px] items-center justify-center">
          <div className="flex items-center gap-3 font-mono text-xs text-[#D4A373]">
            <div className="size-5 border-2 border-[#D4A373] border-t-transparent rounded-full animate-spin" />
            <span>&gt; FETCHING TELEMETRY STREAM FROM NEON DB...</span>
          </div>
        </div>
      </section>
    );
  }

  // Edge case: Student with no attempted tests -> Render Space Cadet empty state message
  if (!scoreHistory || scoreHistory.length === 0) {
    return (
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
    );
  }

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
              <linearGradient id="rustScoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C85A32" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#C85A32" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#263044" strokeDasharray="2 5" vertical={false} />
            <XAxis
              dataKey="displayLabel"
              tick={{ fill: '#8791A5', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={{ stroke: '#526078', strokeDasharray: '4 4' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: '#8791A5', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={{ stroke: '#526078', strokeDasharray: '4 4' }}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
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
              strokeWidth={3}
              fill="url(#rustScoreGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default TestScoreGraph;
