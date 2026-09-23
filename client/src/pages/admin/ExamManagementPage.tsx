import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import type { Exam, Subject, Question, User } from '../../types';
import {
  Plus,
  FileSpreadsheet,
  Users,
  Clock,
  Trash2,
  Edit2,
  Send,
  X,
  Layers,
} from 'lucide-react';

export const ExamManagementPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedExamForAssign, setSelectedExamForAssign] = useState<Exam | null>(null);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);

  // Exam Builder State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(180);
  const [examEnv, setExamEnv] = useState<'STANDARD_BROWSER' | 'FULLSCREEN_BROWSER' | 'KIOSK_CLIENT'>('FULLSCREEN_BROWSER');
  const [allowReview, setAllowReview] = useState(true);
  const [showResultImmediately, setShowResultImmediately] = useState(true);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  // Sections State in builder
  const [sections, setSections] = useState<
    Array<{
      subjectId: string;
      name: string;
      questionCount: number;
      marksPerQuestion: number;
      negativeMarksPerQuestion: number;
      allowSectionJump: boolean;
      selectedQuestionIds: string[];
    }>
  >([]);

  // Assign Student Selection State
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const fetchExams = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/exams');
      setExams(res.data.exams || []);
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuxData = async () => {
    try {
      const [subjRes, qRes, stuRes] = await Promise.all([
        api.get('/questions/subjects'),
        api.get('/questions?limit=100'),
        api.get('/admin/students?limit=100'),
      ]);
      setSubjects(subjRes.data.subjects || []);
      setAllQuestions(qRes.data.questions || []);
      setStudents(stuRes.data.students || []);
    } catch (err) {
      console.error('Failed to load auxiliary data:', err);
    }
  };

  useEffect(() => {
    fetchExams();
    fetchAuxData();
  }, []);

  const resetBuilder = () => {
    setEditingExam(null);
    setTitle('');
    setDescription('');
    setDuration(180);
    setExamEnv('FULLSCREEN_BROWSER');
    setAllowReview(true);
    setShowResultImmediately(true);
    setShuffleQuestions(false);
    setSections([]);
  };

  const handleAddSection = () => {
    if (subjects.length === 0) return;
    const defaultSubj = subjects[0];
    setSections([
      ...sections,
      {
        subjectId: defaultSubj.id,
        name: `${defaultSubj.name} Section`,
        questionCount: 15,
        marksPerQuestion: 4,
        negativeMarksPerQuestion: 1,
        allowSectionJump: true,
        selectedQuestionIds: [],
      },
    ]);
  };

  const handleRemoveSection = (idx: number) => {
    const copy = [...sections];
    copy.splice(idx, 1);
    setSections(copy);
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setDescription(exam.description || '');
    setDuration(exam.duration);
    setExamEnv(exam.examEnvironment);
    setAllowReview(exam.allowReview);
    setShowResultImmediately(exam.showResultImmediately);
    setShuffleQuestions(exam.shuffleQuestions);

    if (exam.sections) {
      setSections(
        exam.sections.map((sec) => ({
          subjectId: sec.subjectId,
          name: sec.name,
          questionCount: sec.questionCount,
          marksPerQuestion: sec.marksPerQuestion,
          negativeMarksPerQuestion: sec.negativeMarksPerQuestion,
          allowSectionJump: sec.allowSectionJump,
          selectedQuestionIds: sec.questions?.map((q: any) => q.question?.id || q.questionId) || [],
        }))
      );
    }
    setIsBuilderOpen(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sections.length === 0) {
      alert('Please add at least one subject section.');
      return;
    }

    // Calculate total marks
    const totalMarks = sections.reduce(
      (sum, sec) => sum + (sec.selectedQuestionIds.length || sec.questionCount) * sec.marksPerQuestion,
      0
    );

    const payload = {
      title,
      description: description || null,
      duration: Number(duration),
      totalMarks,
      examEnvironment: examEnv,
      allowReview,
      showResultImmediately,
      shuffleQuestions,
      sections: sections.map((sec, idx) => ({
        subjectId: sec.subjectId,
        name: sec.name,
        order: idx,
        questionCount: sec.selectedQuestionIds.length || sec.questionCount,
        marksPerQuestion: Number(sec.marksPerQuestion),
        negativeMarksPerQuestion: Number(sec.negativeMarksPerQuestion),
        allowSectionJump: sec.allowSectionJump,
        questionIds: sec.selectedQuestionIds,
      })),
    };

    try {
      if (editingExam) {
        await api.put(`/exams/${editingExam.id}`, payload);
      } else {
        await api.post('/exams', payload);
      }
      setIsBuilderOpen(false);
      resetBuilder();
      fetchExams();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save examination schedule');
    }
  };

  const handleTogglePublish = async (id: string) => {
    try {
      await api.patch(`/exams/${id}/publish`);
      fetchExams();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to toggle publication state');
    }
  };

  const handleDeleteExam = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam configuration?')) return;
    try {
      await api.delete(`/exams/${id}`);
      fetchExams();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete examination');
    }
  };

  const handleOpenAssign = (exam: Exam) => {
    setSelectedExamForAssign(exam);
    setSelectedStudentIds([]);
    setIsAssignOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamForAssign || selectedStudentIds.length === 0) return;

    try {
      await api.post(`/exams/${selectedExamForAssign.id}/assign`, {
        studentIds: selectedStudentIds,
      });
      setIsAssignOpen(false);
      setSelectedExamForAssign(null);
      fetchExams();
      alert(`Exam successfully assigned to ${selectedStudentIds.length} candidate(s).`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to assign candidates');
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Exam Schedules & Configuration</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure CET/JEE examination structures, sections, marking parameters, and candidate assignments
          </p>
        </div>

        <button
          onClick={() => {
            resetBuilder();
            handleAddSection();
            setIsBuilderOpen(true);
          }}
          className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded transition shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Examination</span>
        </button>
      </div>

      {/* Exam List */}
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Loading exams...</p>
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
            <FileSpreadsheet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-gray-800">No exams configured</h3>
            <p className="text-xs text-gray-500 mt-1">Create your first examination test paper.</p>
          </div>
        ) : (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-lg border border-gray-200 shadow-xs p-5 hover:border-slate-300 transition flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-sm text-slate-900">{exam.title}</h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      exam.isPublished
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {exam.isPublished ? 'Published & Active' : 'Draft'}
                  </span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-mono">
                    {exam.examEnvironment}
                  </span>
                </div>

                {exam.description && (
                  <p className="text-xs text-slate-500 leading-normal">{exam.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.duration} Minutes</span>
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <span>{exam.totalMarks} Total Marks</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam.sections?.length || 0} Subject Sections</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exam._count?.assignments || 0} Candidates Assigned</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0">
                <button
                  onClick={() => handleTogglePublish(exam.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded transition border ${
                    exam.isPublished
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                  }`}
                >
                  {exam.isPublished ? 'Unpublish' : 'Publish Test'}
                </button>
                <button
                  onClick={() => handleOpenAssign(exam)}
                  className="text-xs font-semibold px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded transition shadow-xs flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Assign</span>
                </button>
                <button
                  onClick={() => handleOpenEdit(exam)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 transition"
                  title="Edit Exam"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteExam(exam.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 transition"
                  title="Delete Exam"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* EXAM BUILDER MODAL */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {editingExam ? 'Edit Examination Schedule' : 'Create Examination Schedule'}
              </h2>
              <button
                onClick={() => setIsBuilderOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExam} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Exam Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. MHT-CET Full Length Mock Test 01"
                    className="w-full border border-gray-300 rounded px-2.5 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2.5 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Instructions</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Candidate examination instructions..."
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>

              {/* Policy Settings */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3 rounded border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Environment Mode</label>
                  <select
                    value={examEnv}
                    onChange={(e) => setExamEnv(e.target.value as any)}
                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                  >
                    <option value="FULLSCREEN_BROWSER">Fullscreen Browser (Exam Mode)</option>
                    <option value="STANDARD_BROWSER">Standard Browser</option>
                    <option value="KIOSK_CLIENT">Kiosk / Dedicated Client</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="showResult"
                    checked={showResultImmediately}
                    onChange={(e) => setShowResultImmediately(e.target.checked)}
                  />
                  <label htmlFor="showResult" className="font-semibold text-slate-700 cursor-pointer">
                    Immediate Results
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="allowRev"
                    checked={allowReview}
                    onChange={(e) => setAllowReview(e.target.checked)}
                  />
                  <label htmlFor="allowRev" className="font-semibold text-slate-700 cursor-pointer">
                    Allow Answer Review
                  </label>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="shuffleQ"
                    checked={shuffleQuestions}
                    onChange={(e) => setShuffleQuestions(e.target.checked)}
                  />
                  <label htmlFor="shuffleQ" className="font-semibold text-slate-700 cursor-pointer">
                    Shuffle Questions
                  </label>
                </div>
              </div>

              {/* Section Management */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Subject Sections & Question Palette ({sections.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Section</span>
                  </button>
                </div>

                {sections.map((sec, secIdx) => {
                  const subjectQuestions = allQuestions.filter((q) => q.subjectId === sec.subjectId);

                  return (
                    <div
                      key={secIdx}
                      className="p-4 bg-white border border-gray-300 rounded-md space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Subject
                            </label>
                            <select
                              value={sec.subjectId}
                              onChange={(e) => {
                                const copy = [...sections];
                                const sub = subjects.find((s) => s.id === e.target.value);
                                copy[secIdx].subjectId = e.target.value;
                                if (sub) copy[secIdx].name = `${sub.name} Section`;
                                copy[secIdx].selectedQuestionIds = [];
                                setSections(copy);
                              }}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                            >
                              {subjects.map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Section Name
                            </label>
                            <input
                              type="text"
                              value={sec.name}
                              onChange={(e) => {
                                const copy = [...sections];
                                copy[secIdx].name = e.target.value;
                                setSections(copy);
                              }}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-600">
                              Marks (+) / Negative (-)
                            </label>
                            <div className="flex gap-1">
                              <input
                                type="number"
                                min="0"
                                value={sec.marksPerQuestion}
                                onChange={(e) => {
                                  const copy = [...sections];
                                  copy[secIdx].marksPerQuestion = Number(e.target.value);
                                  setSections(copy);
                                }}
                                className="w-1/2 border border-gray-300 rounded px-2 py-1 text-xs"
                              />
                              <input
                                type="number"
                                min="0"
                                value={sec.negativeMarksPerQuestion}
                                onChange={(e) => {
                                  const copy = [...sections];
                                  copy[secIdx].negativeMarksPerQuestion = Number(e.target.value);
                                  setSections(copy);
                                }}
                                className="w-1/2 border border-gray-300 rounded px-2 py-1 text-xs"
                              />
                            </div>
                          </div>

                          <div className="flex items-center pt-3">
                            <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={sec.allowSectionJump}
                                onChange={(e) => {
                                  const copy = [...sections];
                                  copy[secIdx].allowSectionJump = e.target.checked;
                                  setSections(copy);
                                }}
                              />
                              <span>Allow Section Jump</span>
                            </label>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSection(secIdx)}
                          className="text-slate-400 hover:text-red-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Question selector checkboxes */}
                      <div className="pt-2 border-t border-gray-100">
                        <span className="block font-semibold text-[11px] text-slate-600 mb-1">
                          Select Questions from Subject Bank ({sec.selectedQuestionIds.length} of{' '}
                          {subjectQuestions.length} selected):
                        </span>
                        <div className="max-h-32 overflow-y-auto space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
                          {subjectQuestions.length === 0 ? (
                            <p className="text-[11px] text-slate-400">
                              No questions in repository for this subject.
                            </p>
                          ) : (
                            subjectQuestions.map((q) => {
                              const isChecked = sec.selectedQuestionIds.includes(q.id);
                              return (
                                <label
                                  key={q.id}
                                  className="flex items-center gap-2 text-[11px] cursor-pointer hover:bg-slate-100 p-1 rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      const copy = [...sections];
                                      const ids = [...copy[secIdx].selectedQuestionIds];
                                      if (e.target.checked) ids.push(q.id);
                                      else {
                                        const pos = ids.indexOf(q.id);
                                        if (pos > -1) ids.splice(pos, 1);
                                      }
                                      copy[secIdx].selectedQuestionIds = ids;
                                      setSections(copy);
                                    }}
                                  />
                                  <span className="truncate flex-1 font-medium text-slate-800">
                                    {q.text}
                                  </span>
                                  <span className="font-mono text-slate-500 shrink-0">
                                    [{q.type}]
                                  </span>
                                </label>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs"
                >
                  {editingExam ? 'Update Examination' : 'Create Examination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN CANDIDATES MODAL */}
      {isAssignOpen && selectedExamForAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-lg w-full p-6 text-xs flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-base font-bold text-slate-900">
                Assign Candidates to Exam
              </h3>
              <button
                onClick={() => setIsAssignOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="py-4 space-y-3 flex-1 overflow-y-auto">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="font-bold text-slate-800">{selectedExamForAssign.title}</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Select candidates below to grant access to this test paper.
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-semibold text-slate-700">Enrolled Students ({students.length})</span>
                <button
                  type="button"
                  onClick={() => setSelectedStudentIds(students.map((s) => s.id))}
                  className="text-blue-600 hover:text-blue-800 font-semibold text-[11px]"
                >
                  Select All
                </button>
              </div>

              <div className="space-y-1 max-h-56 overflow-y-auto border border-gray-200 rounded p-2">
                {students.map((stu) => {
                  const isSelected = selectedStudentIds.includes(stu.id);
                  return (
                    <label
                      key={stu.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedStudentIds([...selectedStudentIds, stu.id]);
                            else setSelectedStudentIds(selectedStudentIds.filter((id) => id !== stu.id));
                          }}
                        />
                        <div>
                          <div className="font-semibold text-slate-800">{stu.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{stu.email}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                        {stu.email || 'No Email'}
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignOpen(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedStudentIds.length === 0}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded disabled:opacity-50"
                >
                  Assign ({selectedStudentIds.length}) Candidates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamManagementPage;
