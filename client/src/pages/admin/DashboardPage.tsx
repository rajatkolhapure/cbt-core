import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Users,
  FileSpreadsheet,
  HelpCircle,
  TrendingUp,
  ShieldAlert,
  PlusCircle,
  ArrowRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentAttempts = data?.recentAttempts || [];
  const recentIntegrityEvents = data?.recentIntegrityEvents || [];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Examination Administration</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time status overview of test schedules, question repository, and candidate sessions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/questions?action=new"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded transition shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Question</span>
          </Link>
          <Link
            to="/admin/exams?action=new"
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 py-2 rounded transition shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>New Exam</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Candidates</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalStudents ?? 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Enrolled students</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Exam Schedules</span>
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.publishedExams ?? 0}{' '}
            <span className="text-sm font-normal text-slate-400">/ {stats.totalExams ?? 0}</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Published / Total configured</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Question Bank</span>
            <HelpCircle className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalQuestions ?? 0}</div>
          <p className="text-[11px] text-slate-500 mt-1">Active verified questions</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Average Score</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {stats.averagePercentage ?? 0}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{stats.completedAttempts ?? 0} completed submissions</p>
        </div>
      </div>

      {/* Two Column Layout for Recent Activity & Integrity Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attempts */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Recent Test Sessions
            </h2>
            <Link
              to="/admin/results"
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {recentAttempts.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">
                No examination attempts recorded yet.
              </div>
            ) : (
              recentAttempts.map((att: any) => (
                <div
                  key={att.id}
                  className="p-3.5 hover:bg-blue-50/40 transition-colors duration-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{att.user?.name}</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">
                      {att.exam?.title} • <span className="font-mono">{att.user?.candidateId || 'No ID'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        att.state === 'SUBMITTED' || att.state === 'EVALUATED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {att.state}
                    </span>
                    {att.marksObtained !== null && (
                      <div className="text-[11px] font-mono font-medium text-slate-700 mt-1">
                        {att.marksObtained} / {att.exam?.totalMarks} pts
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Integrity Log Events */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Integrity Audit Events</span>
            </h2>
            <Link
              to="/admin/integrity"
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
            >
              <span>View full log</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {recentIntegrityEvents.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-500">
                No integrity events recorded.
              </div>
            ) : (
              recentIntegrityEvents.map((evt: any) => (
                <div
                  key={evt.id}
                  className="p-3.5 hover:bg-amber-50/40 transition-colors duration-100 text-xs flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <span className="font-mono text-[11px] px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700">
                        {evt.eventType}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-1">
                      Candidate: <span className="font-medium text-slate-700">{evt.user?.name}</span> •{' '}
                      {evt.attempt?.exam?.title}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 shrink-0 font-mono">
                    {new Date(evt.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
