import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import {
  Users,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  X,
  ArrowLeft,
  Clock,
  Award,
  BookOpen,
  Filter,
  Check,
  UserPlus,
  RefreshCw,
} from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  description?: string;
  duration: number;
  totalMarks: number;
  isPublished: boolean;
  sections?: any[];
  _count?: {
    assignments: number;
    attempts: number;
    examQuestions: number;
  };
}

interface Student {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
}

export const AssignTestPage: React.FC = () => {

  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterPublished, setFilterPublished] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');

  // Assign Modal State
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [initiallyAssignedIds, setInitiallyAssignedIds] = useState<Set<string>>(new Set());
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [examsRes, studentsRes] = await Promise.all([
        api.get('/exams'),
        api.get('/admin/students?limit=200'),
      ]);
      setExams(examsRes.data.exams || []);
      setStudents(studentsRes.data.students || []);
    } catch (err: any) {
      console.error('Failed to load exams or students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAssignModal = async (exam: Exam) => {
    setSelectedExam(exam);
    setStudentSearch('');
    setFeedbackMessage(null);

    // Fetch existing assignments for this exam
    try {
      const res = await api.get(`/exams/${exam.id}`);
      const assignedUsers = res.data.exam?.assignments || [];
      const assignedIds = new Set<string>(assignedUsers.map((a: any) => a.user?.id || a.userId));
      setInitiallyAssignedIds(assignedIds);
      setSelectedStudentIds(Array.from(assignedIds));
    } catch {
      setInitiallyAssignedIds(new Set());
      setSelectedStudentIds([]);
    }
  };

  const handleCloseModal = () => {
    setSelectedExam(null);
    setSelectedStudentIds([]);
    setInitiallyAssignedIds(new Set());
    setStudentSearch('');
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSelectAllVisible = (visibleStudents: Student[]) => {
    const visibleIds = visibleStudents.map((s) => s.id);
    const allSelected = visibleIds.every((id) => selectedStudentIds.includes(id));

    if (allSelected) {
      setSelectedStudentIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedStudentIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await api.patch(`/exams/${id}/publish`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to toggle publication state');
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;

    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      await api.post(`/exams/${selectedExam.id}/assign`, {
        studentIds: selectedStudentIds,
      });

      setFeedbackMessage({
        type: 'success',
        text: selectedStudentIds.length === 0
          ? `All candidate assignments removed from "${selectedExam.title}".`
          : `Exam "${selectedExam.title}" successfully assigned to ${selectedStudentIds.length} candidate(s).`,
      });

      // Refresh list in background
      await fetchData();

      setTimeout(() => {
        handleCloseModal();
      }, 1200);
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.response?.data?.error || 'Failed to update candidate assignments.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      (exam.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (filterPublished === 'PUBLISHED') return matchesSearch && exam.isPublished;
    if (filterPublished === 'DRAFT') return matchesSearch && !exam.isPublished;
    return matchesSearch;
  });

  const filteredStudents = students.filter((stu) => {
    if (!studentSearch.trim()) return true;
    const term = studentSearch.toLowerCase();
    return (stu.name || '').toLowerCase().includes(term) || (stu.email || '').toLowerCase().includes(term);
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/admin"
              className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-slate-800 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-xs font-mono text-slate-700 font-semibold">Assign Test</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Assign Examination Tests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Allocate and dispatch examinations to enrolled student candidates
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/admin/exams"
            className="inline-flex items-center gap-1.5 bg-[#1A2B4C] hover:bg-[#121F38] text-white text-xs font-semibold px-3 py-1.5 rounded transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Exam Builder</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Exams</span>
            <FileSpreadsheet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{exams.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Available in database</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Published Tests</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">
            {exams.filter((e) => e.isPublished).length}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1">Active for student access</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Enrolled Students</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{students.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Eligible candidates</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Allocations</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">
            {exams.reduce((acc, e) => acc + (e._count?.assignments || 0), 0)}
          </div>
          <div className="text-[11px] text-amber-600 mt-1">Candidate-exam linkages</div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search exams by title or topic..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <div className="inline-flex rounded border border-slate-300 bg-slate-100 p-0.5 text-xs font-medium">
            <button
              onClick={() => setFilterPublished('ALL')}
              className={`px-3 py-1 rounded transition ${
                filterPublished === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({exams.length})
            </button>
            <button
              onClick={() => setFilterPublished('PUBLISHED')}
              className={`px-3 py-1 rounded transition ${
                filterPublished === 'PUBLISHED' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Published ({exams.filter((e) => e.isPublished).length})
            </button>
            <button
              onClick={() => setFilterPublished('DRAFT')}
              className={`px-3 py-1 rounded transition ${
                filterPublished === 'DRAFT' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Drafts ({exams.filter((e) => !e.isPublished).length})
            </button>
          </div>
        </div>
      </div>

      {/* Examination List */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-xs">
          <div className="w-8 h-8 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs text-slate-500 font-mono">Loading examination dockets...</p>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-xs">
          <FileSpreadsheet className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Examinations Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {searchTerm ? 'No exams match your search criteria.' : 'No examinations have been created yet.'}
          </p>
          <Link
            to="/admin/exams"
            className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-blue-600 hover:underline"
          >
            Go to Exam Builder to create one →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredExams.map((exam) => {
            const assignedCount = exam._count?.assignments || 0;
            const questionCount = exam._count?.examQuestions || 0;

            return (
              <div
                key={exam.id}
                className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                            exam.isPublished
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {exam.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {assignedCount} Assigned
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900">{exam.title}</h3>
                    </div>
                  </div>

                  {exam.description && (
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.duration} mins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.totalMarks} marks</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>{questionCount} questions</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500">
                    {assignedCount > 0 ? (
                      <span className="text-emerald-600 font-medium">
                        ✓ Assigned to {assignedCount} candidate(s)
                      </span>
                    ) : (
                      <span className="text-slate-400">Not assigned to any candidates yet</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTogglePublish(exam.id)}
                      className={`text-xs font-semibold px-2.5 py-1.5 rounded transition border cursor-pointer ${
                        exam.isPublished
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                      title={exam.isPublished ? 'Unpublish to hide from all students' : 'Publish to make available to assigned students'}
                    >
                      {exam.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleOpenAssignModal(exam)}
                      className="inline-flex items-center gap-1.5 bg-[#1A2B4C] hover:bg-[#121F38] text-white text-xs font-semibold px-3 py-1.5 rounded transition shadow-xs cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Assign</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assignment Modal Dialog */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full p-6 text-xs flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Assign Candidates to Examination
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select students to grant access to <span className="font-semibold text-slate-800">{selectedExam.title}</span>
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackMessage && (
              <div
                className={`mt-3 p-3 rounded text-xs flex items-center gap-2 ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {feedbackMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <X className="w-4 h-4 shrink-0 text-red-600" />
                )}
                <span>{feedbackMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="py-4 space-y-3 flex-1 flex flex-col min-h-0">
              {/* Search & Bulk Selection Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search candidate by name or email..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end text-xs">
                  <span className="text-slate-500 font-mono text-[11px]">
                    <strong>{selectedStudentIds.length}</strong> of {students.length} selected
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSelectAllVisible(filteredStudents)}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] cursor-pointer"
                  >
                    {filteredStudents.every((s) => selectedStudentIds.includes(s.id))
                      ? 'Deselect Filtered'
                      : 'Select All Filtered'}
                  </button>
                </div>
              </div>

              {/* Student Candidate List */}
              <div className="space-y-1.5 flex-1 overflow-y-auto border border-gray-200 rounded-lg p-2 min-h-[220px]">
                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No candidates match your search.</p>
                  </div>
                ) : (
                  filteredStudents.map((stu) => {
                    const isSelected = selectedStudentIds.includes(stu.id);
                    const wasAlreadyAssigned = initiallyAssignedIds.has(stu.id);

                    return (
                      <label
                        key={stu.id}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition cursor-pointer select-none ${
                          isSelected
                            ? 'bg-blue-50/70 border-blue-200 text-slate-900'
                            : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleStudent(stu.id)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{stu.name}</span>
                              {wasAlreadyAssigned && (
                                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-normal">
                                  Currently Assigned
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">{stu.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`size-2 rounded-full ${stu.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            title={stu.isActive ? 'Active student account' : 'Inactive'}
                          />
                        </div>
                      </label>
                    );
                  })
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {selectedStudentIds.length === 0
                    ? 'Will unassign all candidates from this test'
                    : `${selectedStudentIds.length} candidate(s) will have access to this test.`}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                    className="px-3.5 py-1.5 border border-gray-300 rounded text-slate-700 hover:bg-slate-50 font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-[#1A2B4C] hover:bg-[#121F38] text-white font-semibold rounded shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                  >
                    {isSubmitting ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    <span>Save Assignment</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignTestPage;
