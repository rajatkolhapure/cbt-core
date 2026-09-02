import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import type { IntegrityEvent } from '../../types';


export const IntegrityLogsPage: React.FC = () => {
  const [events, setEvents] = useState<IntegrityEvent[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/integrity/events', {
        params: {
          eventType: eventTypeFilter || undefined,
          limit: 50,
        },
      });
      setEvents(res.data.events || []);
    } catch (err) {
      console.error('Failed to load integrity logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [eventTypeFilter]);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Integrity & Security Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable log of examination-session security telemetry (tab blur, fullscreen exits, clipboard attempts)
          </p>
        </div>

        <div className="w-56">
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="w-full text-xs font-semibold border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="">All Event Types</option>
            <option value="FULLSCREEN_EXIT">Fullscreen Exit</option>
            <option value="WINDOW_BLUR">Window / Tab Lost Focus</option>
            <option value="COPY_ATTEMPT">Clipboard Copy Attempt</option>
            <option value="PASTE_ATTEMPT">Clipboard Paste Attempt</option>
            <option value="DEVTOOLS_OPEN">DevTools Inspection</option>
            <option value="CONTEXT_MENU_ATTEMPT">Right Click Context Menu</option>
            <option value="EXAM_STARTED">Exam Started</option>
            <option value="EXAM_SUBMITTED">Exam Submitted</option>
            <option value="EXAM_AUTO_SUBMITTED">Exam Auto Submitted</option>
          </select>
        </div>
      </div>

      {/* Events Log Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Examination Paper</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4">Details / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    Loading audit trail...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No integrity events recorded.
                  </td>
                </tr>
              ) : (
                events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-amber-50/30 transition-colors duration-100">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {new Date(evt.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                          evt.eventType.includes('EXIT') || evt.eventType.includes('BLUR') || evt.eventType.includes('COPY')
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : evt.eventType.includes('SUBMITTED')
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {evt.eventType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{evt.user?.name || 'Unknown'}</div>
                      <div className="font-mono text-[10px] text-slate-400">
                        {evt.user?.candidateId || evt.user?.email}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {evt.attempt?.exam?.title || 'Examination Test'}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      {evt.ipAddress || '127.0.0.1'}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500 max-w-xs truncate font-mono">
                      {evt.details ? JSON.stringify(evt.details) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IntegrityLogsPage;
