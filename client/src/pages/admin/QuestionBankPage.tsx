import React, { useState, useEffect } from 'react';
import api from '../../api/client';
import type { Question, Subject } from '../../types';
import MathRenderer from '../../components/common/MathRenderer';
import {
  Plus,
  Upload,
  Download,
  Search,
  HelpCircle,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  X,
  BookOpen,
} from 'lucide-react';

export const QuestionBankPage: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
  const [search, setSearch] = useState<string>('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form states
  const [formType, setFormType] = useState<'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'NUMERICAL'>('SINGLE_CHOICE');
  const [formText, setFormText] = useState('');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectAnswer, setFormCorrectAnswer] = useState<any>(0);
  const [formMarks, setFormMarks] = useState(4);
  const [formNegativeMarks, setFormNegativeMarks] = useState(1);
  const [formDifficulty, setFormDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [formExplanation, setFormExplanation] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formChapterId, setFormChapterId] = useState('');
  const [formTags, setFormTags] = useState('');

  // Subject Modal state
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');

  // Import states
  const [importJsonText, setImportJsonText] = useState('');
  const [importResult, setImportResult] = useState<any>(null);
  const [isImporting, setIsImporting] = useState(false);

  const fetchSubjects = async () => {
    try {
      const res = await api.get('/questions/subjects');
      setSubjects(res.data.subjects || []);
      if (res.data.subjects?.length > 0 && !formSubjectId) {
        setFormSubjectId(res.data.subjects[0].id);
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
    }
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      if (selectedSubject) params.subjectId = selectedSubject;
      if (selectedChapter) params.chapterId = selectedChapter;
      if (selectedType) params.type = selectedType;
      if (selectedDifficulty) params.difficulty = selectedDifficulty;
      if (search) params.search = search;

      const res = await api.get('/questions', { params });
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [selectedSubject, selectedChapter, selectedType, selectedDifficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchQuestions();
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setFormType('SINGLE_CHOICE');
    setFormText('');
    setFormOptions(['', '', '', '']);
    setFormCorrectAnswer(0);
    setFormMarks(4);
    setFormNegativeMarks(1);
    setFormDifficulty('MEDIUM');
    setFormExplanation('');
    setFormTags('');
    if (subjects.length > 0) setFormSubjectId(subjects[0].id);
    setFormChapterId('');
  };

  const handleOpenEdit = (q: Question) => {
    setEditingQuestion(q);
    setFormType(q.type);
    setFormText(q.text);
    setFormOptions(Array.isArray(q.options) ? q.options : ['', '', '', '']);
    setFormCorrectAnswer(q.correctAnswer);
    setFormMarks(q.marks);
    setFormNegativeMarks(q.negativeMarks);
    setFormDifficulty(q.difficulty);
    setFormExplanation(q.explanation || '');
    setFormSubjectId(q.subjectId);
    setFormChapterId(q.chapterId || '');
    setFormTags(q.tags?.join(', ') || '');
    setIsCreateOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        type: formType,
        text: formText,
        marks: Number(formMarks),
        negativeMarks: Number(formNegativeMarks),
        difficulty: formDifficulty,
        explanation: formExplanation || null,
        subjectId: formSubjectId,
        chapterId: formChapterId || null,
        tags: formTags.split(',').map((t) => t.trim()).filter(Boolean),
      };

      if (formType === 'SINGLE_CHOICE') {
        payload.options = formOptions;
        payload.correctAnswer = Number(formCorrectAnswer);
      } else if (formType === 'MULTIPLE_CHOICE') {
        payload.options = formOptions;
        payload.correctAnswer = Array.isArray(formCorrectAnswer)
          ? formCorrectAnswer
          : [Number(formCorrectAnswer)];
      } else if (formType === 'NUMERICAL') {
        payload.options = null;
        payload.correctAnswer = Number(formCorrectAnswer);
      }

      if (editingQuestion) {
        await api.put(`/questions/${editingQuestion.id}`, payload);
      } else {
        await api.post('/questions', payload);
      }

      setIsCreateOpen(false);
      resetForm();
      fetchQuestions();
      fetchSubjects();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to save question');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      fetchQuestions();
      fetchSubjects();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete question');
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/questions/subjects', {
        name: newSubjectName,
        code: newSubjectCode.toUpperCase(),
      });
      setIsSubjectModalOpen(false);
      setNewSubjectName('');
      setNewSubjectCode('');
      fetchSubjects();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create subject');
    }
  };

  const handleImportQuestions = async () => {
    setIsImporting(true);
    setImportResult(null);
    try {
      const parsed = JSON.parse(importJsonText);
      const res = await api.post('/questions/import', {
        questions: Array.isArray(parsed) ? parsed : parsed.questions,
      });
      setImportResult(res.data);
      fetchQuestions();
      fetchSubjects();
    } catch (err: any) {
      setImportResult({
        error: err.response?.data?.error || err.message || 'Invalid JSON syntax',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportQuestions = async () => {
    try {
      const res = await api.get('/questions/export', {
        params: { subjectId: selectedSubject || undefined },
      });
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data.questions, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `question_bank_export_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      alert('Failed to export questions');
    }
  };

  const currentSubjectObj = subjects.find((s) => s.id === (formSubjectId || selectedSubject));

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Question Repository</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, verify, and import questions with KaTeX mathematical markup
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsSubjectModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-2 rounded border border-slate-300 transition"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Manage Subjects</span>
          </button>
          <button
            onClick={() => {
              setImportJsonText('');
              setImportResult(null);
              setIsImportOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded transition"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk JSON Import</span>
          </button>
          <button
            onClick={handleExportQuestions}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded border border-slate-300 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded transition shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Question</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-lg border border-gray-200 shadow-xs flex flex-wrap items-center gap-3">
        <div className="w-48">
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              setSelectedChapter('');
            }}
            className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s._count?.questions || 0})
              </option>
            ))}
          </select>
        </div>

        {selectedSubject && (
          <div className="w-48">
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              <option value="">All Chapters</option>
              {subjects
                .find((s) => s.id === selectedSubject)
                ?.chapters?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        <div className="w-36">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="">All Types</option>
            <option value="SINGLE_CHOICE">Single Choice</option>
            <option value="MULTIPLE_CHOICE">Multiple Choice</option>
            <option value="NUMERICAL">Numerical</option>
          </select>
        </div>

        <div className="w-32">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
          >
            <option value="">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] flex items-center gap-1">
          <input
            type="text"
            placeholder="Search keywords or tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
          <button
            type="submit"
            className="bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded border border-slate-300 text-xs"
          >
            <Search className="w-3.5 h-3.5 text-slate-600" />
          </button>
        </form>
      </div>

      {/* Questions Listing */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
            <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-gray-500">Loading questions from bank...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
            <HelpCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-gray-800">No questions found</h3>
            <p className="text-xs text-gray-500 mt-1">
              Try modifying your filters or create a new question.
            </p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-white rounded-lg border border-gray-200 shadow-xs p-5 hover:border-slate-300 transition"
            >
              {/* Question Header meta */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Q{idx + 1}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {q.subject?.name || 'General'}
                  </span>
                  {q.chapter && (
                    <span className="text-xs text-slate-600 font-medium">
                      • {q.chapter.name}
                    </span>
                  )}
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium font-mono">
                    {q.type}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      q.difficulty === 'EASY'
                        ? 'bg-emerald-100 text-emerald-800'
                        : q.difficulty === 'HARD'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-600 font-semibold">
                    +{q.marks} / -{q.negativeMarks} pts
                  </span>
                  <button
                    onClick={() => handleOpenEdit(q)}
                    className="p-1 text-slate-400 hover:text-blue-600 transition"
                    title="Edit Question"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1 text-slate-400 hover:text-red-600 transition"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Question Text with KaTeX */}
              <div className="text-sm font-medium text-slate-900 leading-relaxed">
                <MathRenderer content={q.text} />
              </div>

              {/* Options display */}
              {q.options && Array.isArray(q.options) && q.options.length > 0 && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {q.options.map((opt: string, optIdx: number) => {
                    const isCorrect =
                      q.type === 'SINGLE_CHOICE'
                        ? Number(q.correctAnswer) === optIdx
                        : Array.isArray(q.correctAnswer) && q.correctAnswer.includes(optIdx);

                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded text-xs flex items-start gap-2 border ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-medium'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="font-mono font-bold shrink-0">
                          ({String.fromCharCode(65 + optIdx)})
                        </span>
                        <div className="flex-1">
                          <MathRenderer content={opt} />
                        </div>
                        {isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Numerical answer */}
              {q.type === 'NUMERICAL' && (
                <div className="mt-3 bg-emerald-50 border border-emerald-200 p-2.5 rounded text-xs text-emerald-900">
                  <span className="font-semibold">Correct Numerical Value:</span>{' '}
                  <span className="font-mono font-bold text-emerald-700 text-sm">
                    {q.correctAnswer}
                  </span>
                </div>
              )}

              {/* Explanation & Tags */}
              {q.explanation && (
                <div className="mt-3 bg-slate-50 border-l-2 border-slate-400 p-2.5 text-xs text-slate-700">
                  <span className="font-semibold text-slate-800">Explanation: </span>
                  <MathRenderer content={q.explanation} />
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT QUESTION MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {editingQuestion ? 'Edit Question' : 'Create New Examination Question'}
              </h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
                  <select
                    required
                    value={formSubjectId}
                    onChange={(e) => {
                      setFormSubjectId(e.target.value);
                      setFormChapterId('');
                    }}
                    className="w-full border border-gray-300 rounded px-2.5 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chapter</label>
                  <select
                    value={formChapterId}
                    onChange={(e) => setFormChapterId(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2.5 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="">None / General</option>
                    {currentSubjectObj?.chapters?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Question Type *</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full border border-gray-300 rounded px-2.5 py-2 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="SINGLE_CHOICE">Single Choice MCQ</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice MCQ</option>
                    <option value="NUMERICAL">Numerical Answer</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Question Text (Supports LaTeX: $..$ inline, $$..$$ display) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  placeholder="e.g. Find the value of $\int_0^1 x^2 dx$."
                  className="w-full border border-gray-300 rounded p-2.5 text-xs font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
                {formText && (
                  <div className="mt-1.5 p-2 bg-slate-50 border border-slate-200 rounded text-xs">
                    <span className="font-semibold text-slate-500 text-[10px] uppercase">KaTeX Preview: </span>
                    <MathRenderer content={formText} />
                  </div>
                )}
              </div>

              {/* MCQ Options */}
              {formType !== 'NUMERICAL' && (
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-700">Options (LaTeX supported)</label>
                  {formOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 font-mono font-bold text-slate-500">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={(e) => {
                          const copy = [...formOptions];
                          copy[idx] = e.target.value;
                          setFormOptions(copy);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + idx)} text or formula`}
                        className="flex-1 border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-600 focus:outline-none"
                      />
                      <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 shrink-0 cursor-pointer">
                        <input
                          type={formType === 'SINGLE_CHOICE' ? 'radio' : 'checkbox'}
                          name="correctOption"
                          checked={
                            formType === 'SINGLE_CHOICE'
                              ? Number(formCorrectAnswer) === idx
                              : Array.isArray(formCorrectAnswer) && formCorrectAnswer.includes(idx)
                          }
                          onChange={(e) => {
                            if (formType === 'SINGLE_CHOICE') {
                              setFormCorrectAnswer(idx);
                            } else {
                              const arr = Array.isArray(formCorrectAnswer) ? [...formCorrectAnswer] : [];
                              if (e.target.checked) arr.push(idx);
                              else {
                                const pos = arr.indexOf(idx);
                                if (pos > -1) arr.splice(pos, 1);
                              }
                              setFormCorrectAnswer(arr);
                            }
                          }}
                        />
                        <span>Correct</span>
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* Numerical Correct Answer */}
              {formType === 'NUMERICAL' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Correct Numerical Value *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formCorrectAnswer}
                    onChange={(e) => setFormCorrectAnswer(e.target.value)}
                    placeholder="e.g. 42.5"
                    className="w-48 border border-gray-300 rounded px-2.5 py-1.5 text-xs font-mono focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              )}

              {/* Marks, Difficulty, Tags */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Marks (+)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={formMarks}
                    onChange={(e) => setFormMarks(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Negative (-)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    required
                    value={formNegativeMarks}
                    onChange={(e) => setFormNegativeMarks(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as any)}
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tags</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="e.g. Calculus, JEE2026"
                    className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Detailed Solution / Explanation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Solution steps..."
                  className="w-full border border-gray-300 rounded p-2 text-xs font-mono"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs"
                >
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK IMPORT MODAL */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <span>Bulk Import Questions (JSON Format)</span>
              </h2>
              <button
                onClick={() => setIsImportOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-600">
                Paste JSON array conforming to the CBT question schema. Subjects and chapters are auto-matched or generated.
              </p>

              <textarea
                rows={10}
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder={`[\n  {\n    "subject": "Physics",\n    "chapter": "Kinematics",\n    "type": "single_choice",\n    "question": "What is the speed of light?",\n    "options": ["3e8 m/s", "3e6 m/s", "3e5 km/s", "Infinite"],\n    "correctAnswer": 0,\n    "marks": 4,\n    "negativeMarks": 1,\n    "difficulty": "easy"\n  }\n]`}
                className="w-full border border-gray-300 rounded p-3 font-mono text-[11px] focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />

              {importResult && (
                <div
                  className={`p-3 rounded border ${
                    importResult.error || importResult.errors?.length > 0
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  {importResult.error ? (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span>{importResult.error}</span>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold">
                        Successfully imported {importResult.imported} of {importResult.total} questions.
                      </p>
                      {importResult.errors?.length > 0 && (
                        <div className="mt-2 text-[11px] text-red-700">
                          <p className="font-bold">Errors encountered:</p>
                          <ul className="list-disc pl-4 mt-1">
                            {importResult.errors.map((err: any, i: number) => (
                              <li key={i}>
                                Item #{err.index}: {err.error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  onClick={() => setIsImportOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={handleImportQuestions}
                  disabled={isImporting || !importJsonText.trim()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isImporting ? 'Processing Import...' : 'Import into Repository'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SUBJECT MODAL */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-6 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-3">Add New Subject</h3>
            <form onSubmit={handleCreateSubject} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="e.g. Mathematics"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Subject Code *</label>
                <input
                  type="text"
                  required
                  value={newSubjectCode}
                  onChange={(e) => setNewSubjectCode(e.target.value)}
                  placeholder="e.g. MATH"
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 font-mono uppercase"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-blue-600 text-white font-semibold rounded"
                >
                  Create Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankPage;
