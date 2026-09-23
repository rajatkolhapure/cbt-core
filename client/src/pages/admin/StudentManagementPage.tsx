import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import {
  UserPlus,
  Upload,
  Search,
  X,
} from 'lucide-react';

export const StudentManagementPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('student123');

  // Bulk import state
  const [bulkText, setBulkText] = useState('');
  const [bulkResult, setBulkResult] = useState<any>(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/students', {
        params: { search: search || undefined },
      });
      setStudents(res.data.students || []);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/students', {
        name,
        email,
        password,
      });
      setIsCreateOpen(false);
      setName('');
      setEmail('');
      setPassword('student123');
      fetchStudents();
      alert('Student account created successfully.');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create student');
    }
  };

  const handleBulkImport = async () => {
    setBulkResult(null);
    try {
      let parsedStudents: any[] = [];
      const trimmed = bulkText.trim();

      if (trimmed.startsWith('[')) {
        parsedStudents = JSON.parse(trimmed);
      } else {
        // Parse CSV format: name,email,password
        const lines = trimmed.split('\n');
        for (const line of lines) {
          const parts = line.split(',').map((p) => p.trim());
          if (parts.length >= 2) {
            parsedStudents.push({
              name: parts[0],
              email: parts[1],
              password: parts[2] || 'student123',
            });
          }
        }
      }

      const res = await api.post('/admin/students/import', {
        students: parsedStudents,
      });
      setBulkResult(res.data);
      fetchStudents();
    } catch (err: any) {
      setBulkResult({
        error: err.response?.data?.error || err.message || 'Invalid format',
      });
    }
  };

  const handleViewProfile = async (id: string) => {
    try {
      const res = await api.get(`/admin/students/${id}`);
      setSelectedStudent(res.data.student);
    } catch (err) {
      alert('Failed to load student profile');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Enrolled Candidates</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage candidates, exam assignments, and test history
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setBulkText('');
              setBulkResult(null);
              setIsBulkOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded transition shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Import</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded transition shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-xs flex items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by candidate name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          <button
            type="submit"
            className="bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded border border-slate-300 text-xs font-medium text-slate-700"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-200 text-slate-600 uppercase tracking-wider font-semibold text-[11px]">
                <th className="py-3 px-4">Candidate Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Assigned Exams</th>
                <th className="py-3 px-4 text-center">Attempts</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    Loading candidates...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No candidates found.
                  </td>
                </tr>
              ) : (
                students.map((stu) => (
                  <tr key={stu.id} className="hover:bg-blue-50/30 transition-colors duration-100">
                    <td className="py-3 px-4 font-semibold text-slate-900">{stu.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{stu.email}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-semibold">
                        {stu._count?.examAssignments || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                        {stu._count?.attempts || 0}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleViewProfile(stu.id)}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE STUDENT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">Add Candidate Account</h3>
            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@example.com"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Temporary Password *</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {isBulkOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h3 className="text-base font-bold text-slate-900">Bulk Import Candidates</h3>
              <button onClick={() => setIsBulkOpen(false)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-600 text-[11px]">
              Paste CSV format (one student per line): <br />
              <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">Name, Email, Password</code>
            </p>

            <textarea
              rows={8}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="Aarav Sharma, aarav@cbt.com, student123&#10;Diya Patel, diya@cbt.com, student123"
              className="w-full border border-gray-300 rounded p-2.5 font-mono text-[11px]"
            />

            {bulkResult && (
              <div
                className={`p-2.5 rounded text-xs ${
                  bulkResult.error ? 'bg-red-50 text-red-800' : 'bg-emerald-50 text-emerald-800'
                }`}
              >
                {bulkResult.error
                  ? bulkResult.error
                  : `Successfully imported ${bulkResult.imported} of ${bulkResult.total} candidates.`}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
              <button
                onClick={() => setIsBulkOpen(false)}
                className="px-3 py-1.5 border border-gray-300 rounded text-slate-700"
              >
                Close
              </button>
              <button
                onClick={handleBulkImport}
                disabled={!bulkText.trim()}
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded disabled:opacity-50"
              >
                Execute Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STUDENT PROFILE VIEW MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full p-6 text-xs max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedStudent.name}</h3>
                <div className="text-slate-500 font-mono text-[11px]">
                  {selectedStudent.email}
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-2 uppercase tracking-wider text-[11px]">
                Assigned Examination Test Papers ({selectedStudent.examAssignments?.length || 0})
              </h4>
              <div className="space-y-1">
                {selectedStudent.examAssignments?.map((a: any) => (
                  <div
                    key={a.id}
                    className="p-2 bg-slate-50 border border-slate-200 rounded flex justify-between items-center"
                  >
                    <span className="font-semibold text-slate-800">{a.exam?.title}</span>
                    <span className="text-slate-500 font-mono text-[11px]">{a.exam?.duration} mins</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 mb-2 uppercase tracking-wider text-[11px]">
                Attempt History ({selectedStudent.attempts?.length || 0})
              </h4>
              <div className="space-y-1">
                {selectedStudent.attempts?.map((att: any) => (
                  <div
                    key={att.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{att.exam?.title}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(att.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {att.marksObtained ?? 0} / {att.exam?.totalMarks}
                      </span>
                      <div className="text-[10px] font-semibold text-slate-500">{att.percentage ?? 0}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagementPage;
