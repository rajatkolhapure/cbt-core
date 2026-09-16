import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Clock,
  Infinity as InfinityIcon,
  Flame,
  Award,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Atom,
  FlaskConical,
  Compass,
  Search,
  CheckSquare,
  Square,
  ListChecks,
} from 'lucide-react';
import { aiPracticeApi } from '../../api/ai-practice';

export const PracticeWizardPage: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Steps: 1 = Mode, 2 = Duration/Goal, 3 = Taxonomy, 4 = Launching
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [mode, setMode] = useState<'ARCADE' | 'TEST'>('ARCADE');
  const [durationType, setDurationType] = useState<'ENDLESS' | 'QUESTION_COUNT' | 'TIMED'>('ENDLESS');
  const [targetCount, setTargetCount] = useState<number>(20);
  const [targetDuration, setTargetDuration] = useState<number>(15);

  // Taxonomy & Multi-topic State
  const [taxonomy, setTaxonomy] = useState<Record<string, string[]>>({});
  const [selectedChapters, setSelectedChapters] = useState<Record<string, string[]>>({
    Physics: [],
    Chemistry: [],
    Mathematics: [],
  });
  const [activeSubjectTab, setActiveSubjectTab] = useState<string>('Physics');
  const [chapterSearch, setChapterSearch] = useState<string>('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');

  const [isLoadingTaxonomy, setIsLoadingTaxonomy] = useState<boolean>(true);
  const [isLaunching, setIsLaunching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTaxonomy = async () => {
      try {
        const data = await aiPracticeApi.getTaxonomy();
        setTaxonomy(data);

        // By default, select all 48 chapters for a comprehensive 12th standard run
        setSelectedChapters({
          Physics: data['Physics'] || [],
          Chemistry: data['Chemistry'] || [],
          Mathematics: data['Mathematics'] || [],
        });
      } catch (err) {
        console.error('Failed to load taxonomy:', err);
      } finally {
        setIsLoadingTaxonomy(false);
      }
    };

    loadTaxonomy();
  }, []);

  // Quick Preset Actions
  const handleApplyPreset = (preset: 'FULL_12TH' | 'PHYSICS' | 'CHEMISTRY' | 'MATH') => {
    if (preset === 'FULL_12TH') {
      setSelectedChapters({
        Physics: taxonomy['Physics'] || [],
        Chemistry: taxonomy['Chemistry'] || [],
        Mathematics: taxonomy['Mathematics'] || [],
      });
    } else if (preset === 'PHYSICS') {
      setSelectedChapters({
        Physics: taxonomy['Physics'] || [],
        Chemistry: [],
        Mathematics: [],
      });
      setActiveSubjectTab('Physics');
    } else if (preset === 'CHEMISTRY') {
      setSelectedChapters({
        Physics: [],
        Chemistry: taxonomy['Chemistry'] || [],
        Mathematics: [],
      });
      setActiveSubjectTab('Chemistry');
    } else if (preset === 'MATH') {
      setSelectedChapters({
        Physics: [],
        Chemistry: [],
        Mathematics: taxonomy['Mathematics'] || [],
      });
      setActiveSubjectTab('Mathematics');
    }
  };

  // Toggle individual chapter
  const handleToggleChapter = (subject: string, chapter: string) => {
    setSelectedChapters((prev) => {
      const list = prev[subject] || [];
      const exists = list.includes(chapter);
      return {
        ...prev,
        [subject]: exists ? list.filter((c) => c !== chapter) : [...list, chapter],
      };
    });
  };

  // Select all chapters for active subject
  const handleSelectAllForSubject = (subject: string) => {
    const all = taxonomy[subject] || [];
    setSelectedChapters((prev) => ({
      ...prev,
      [subject]: all,
    }));
  };

  // Clear all chapters for active subject
  const handleClearAllForSubject = (subject: string) => {
    setSelectedChapters((prev) => ({
      ...prev,
      [subject]: [],
    }));
  };

  // Total count of selected chapters across all subjects
  const totalSelectedChapters = Object.values(selectedChapters).reduce(
    (sum, chaps) => sum + chaps.length,
    0
  );
  const totalAvailableChapters = Object.values(taxonomy).reduce(
    (sum, chaps) => sum + chaps.length,
    0
  );

  // Launch Practice Session
  const handleLaunch = async () => {
    const activeSubjects = Object.keys(selectedChapters).filter(
      (subj) => selectedChapters[subj]?.length > 0
    );

    if (activeSubjects.length === 0) {
      setError('Please select at least one chapter or preset to launch practice.');
      return;
    }

    setIsLaunching(true);
    setError(null);

    try {
      const result = await aiPracticeApi.createSession({
        mode,
        durationType,
        targetDuration: durationType === 'TIMED' ? targetDuration : undefined,
        targetCount: durationType === 'QUESTION_COUNT' ? targetCount : undefined,
        selectedTopics: {
          subjects: activeSubjects,
          chapters: selectedChapters,
          isFullSyllabus: totalSelectedChapters === totalAvailableChapters,
          difficulty,
        },
      });

      // Pass initial batch and sections into navigation state for zero-latency instant display
      navigate(`/student/practice/${result.session.id}`, {
        state: {
          initialSession: result.session,
          initialQuestions: result.initialQuestions,
          initialSections: result.sections,
        },
      });
    } catch (err: any) {
      setError(
        err.response?.data?.error || 'Failed to initialize session. Please try again.'
      );
      setIsLaunching(false);
    }
  };

  const subjectIcons: Record<string, React.ReactNode> = {
    Physics: <Atom className="w-4 h-4 text-[#C88A2D]" />,
    Chemistry: <FlaskConical className="w-4 h-4 text-[#236B47]" />,
    Mathematics: <Compass className="w-4 h-4 text-[#1A2B4C]" />,
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-2 sm:px-4 font-sans select-none">
      {/* Wizard Masthead Header */}
      <div className="bg-[#1A2B4C] text-[#FBF9F5] p-6 border border-[#1C1D21] shadow-tactile mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5 font-mono text-[11px] text-[#C88A2D] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#C88A2D]" />
            <span>AI Practice Arena Setup</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Infinite Practice Generator
          </h1>
          <p className="font-mono text-xs text-[#8E929E] mt-1">
            Gemini Flash-Lite On-Demand Engine · Zero-Lag Sliding Buffer
          </p>
        </div>

        {/* Step Indicator */}
        <div className="hidden sm:flex items-center gap-2 font-mono text-xs">
          <div
            className={`w-7 h-7 flex items-center justify-center font-bold border ${
              step >= 1 ? 'bg-[#C88A2D] text-[#1C1D21] border-[#1C1D21]' : 'bg-[#121F38] text-stone-400'
            }`}
          >
            1
          </div>
          <div className="w-4 h-px bg-stone-600" />
          <div
            className={`w-7 h-7 flex items-center justify-center font-bold border ${
              step >= 2 ? 'bg-[#C88A2D] text-[#1C1D21] border-[#1C1D21]' : 'bg-[#121F38] text-stone-400'
            }`}
          >
            2
          </div>
          <div className="w-4 h-px bg-stone-600" />
          <div
            className={`w-7 h-7 flex items-center justify-center font-bold border ${
              step >= 3 ? 'bg-[#C88A2D] text-[#1C1D21] border-[#1C1D21]' : 'bg-[#121F38] text-stone-400'
            }`}
          >
            3
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#FDF0F0] border border-[#A83232] text-[#A83232] text-xs font-mono">
          {error}
        </div>
      )}

      {/* STEP 1: MODE SELECTION */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="border-b border-[#DCD6CD] pb-2">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1C1D21]">
              Select Practice Arena Mode
            </h2>
            <p className="text-xs text-[#575A65] font-mono mt-0.5">
              Choose your practice format and feedback velocity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* ARCADE MODE */}
            <div
              onClick={() => setMode('ARCADE')}
              className={`p-6 border-2 transition-all cursor-pointer relative ${
                mode === 'ARCADE'
                  ? 'bg-white border-[#C88A2D] shadow-tactile-gold ring-2 ring-[#C88A2D]/40'
                  : 'bg-[#FBF9F5] border-[#DCD6CD] hover:border-[#1C1D21] hover:bg-white'
              }`}
            >
              {mode === 'ARCADE' && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="w-5 h-5 text-[#C88A2D]" />
                </div>
              )}
              <div className="w-12 h-12 rounded-lg bg-[#FFF7ED] border border-[#C88A2D]/40 flex items-center justify-center mb-4">
                <Flame className="w-6 h-6 text-[#C88A2D]" />
              </div>
              <div className="inline-block px-2 py-0.5 bg-[#C88A2D]/10 text-[#C88A2D] font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
                Instant Feedback
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C1D21]">Arcade Mode</h3>
              <p className="text-xs text-[#575A65] mt-2 leading-relaxed">
                Fast-paced interactive training. Every choice provides immediate KaTeX derivation breakdown,
                increasing combo streaks and animated XP multipliers up to 3.0x.
              </p>
              <ul className="mt-4 space-y-1.5 text-[11px] font-mono text-[#1C1D21]">
                <li className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-[#C88A2D]" />
                  <span>Instant KaTeX solution explanation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-[#C88A2D]" />
                  <span>Hot streak multipliers and dynamic XP</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-[#C88A2D]" />
                  <span>Gamified, low-stress mastery loop</span>
                </li>
              </ul>
            </div>

            {/* TEST MODE */}
            <div
              onClick={() => setMode('TEST')}
              className={`p-6 border-2 transition-all cursor-pointer relative ${
                mode === 'TEST'
                  ? 'bg-white border-[#1A2B4C] shadow-tactile ring-2 ring-[#1A2B4C]/40'
                  : 'bg-[#FBF9F5] border-[#DCD6CD] hover:border-[#1C1D21] hover:bg-white'
              }`}
            >
              {mode === 'TEST' && (
                <div className="absolute top-3 right-3">
                  <CheckCircle2 className="w-5 h-5 text-[#1A2B4C]" />
                </div>
              )}
              <div className="w-12 h-12 rounded-lg bg-[#EFF6FF] border border-[#1A2B4C]/40 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-[#1A2B4C]" />
              </div>
              <div className="inline-block px-2 py-0.5 bg-[#1A2B4C]/10 text-[#1A2B4C] font-mono text-[10px] font-bold uppercase tracking-wider mb-2">
                Exam Conditions
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C1D21]">Test Simulation</h3>
              <p className="text-xs text-[#575A65] mt-2 leading-relaxed">
                Strict CET/JEE test simulator. Answers remain concealed until you submit, applying
                standard +4 / -1 negative marking with an exhaustive final scorecard.
              </p>
              <ul className="mt-4 space-y-1.5 text-[11px] font-mono text-[#1C1D21]">
                <li className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#1A2B4C]" />
                  <span>Strict countdown clock &amp; review flag</span>
                </li>
                <li className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-[#1A2B4C]" />
                  <span>Official +4 / -1 negative marking scoring</span>
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-[#1A2B4C]" />
                  <span>Comprehensive post-test scorecard &amp; analytics</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-[#1A2B4C] hover:bg-[#121F38] text-white font-mono text-xs uppercase font-bold tracking-wider btn-tactile flex items-center gap-2 cursor-pointer"
            >
              <span>Next: Set Session Goal</span>
              <ArrowRight className="w-4 h-4 text-[#C88A2D]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DURATION & GOAL SELECTION */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="border-b border-[#DCD6CD] pb-2 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1C1D21]">
                Set Your Session Goal
              </h2>
              <p className="text-xs text-[#575A65] font-mono mt-0.5">
                Configure how long or how many questions you wish to solve.
              </p>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-xs font-mono text-[#575A65] hover:text-[#1C1D21] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ENDLESS */}
            <div
              onClick={() => setDurationType('ENDLESS')}
              className={`p-5 border-2 transition-all cursor-pointer ${
                durationType === 'ENDLESS'
                  ? 'bg-white border-[#C88A2D] shadow-tactile-gold'
                  : 'bg-[#FBF9F5] border-[#DCD6CD] hover:border-[#1C1D21]'
              }`}
            >
              <InfinityIcon className="w-6 h-6 text-[#C88A2D] mb-3" />
              <h3 className="font-serif text-base font-bold text-[#1C1D21]">Endless Zen</h3>
              <p className="text-xs text-[#575A65] mt-1.5 leading-relaxed">
                Solve continuously without limits. Stop whenever you choose.
              </p>
            </div>

            {/* QUESTION COUNT */}
            <div
              onClick={() => setDurationType('QUESTION_COUNT')}
              className={`p-5 border-2 transition-all cursor-pointer ${
                durationType === 'QUESTION_COUNT'
                  ? 'bg-white border-[#C88A2D] shadow-tactile-gold'
                  : 'bg-[#FBF9F5] border-[#DCD6CD] hover:border-[#1C1D21]'
              }`}
            >
              <BookOpen className="w-6 h-6 text-[#1A2B4C] mb-3" />
              <h3 className="font-serif text-base font-bold text-[#1C1D21]">Target Questions</h3>
              <p className="text-xs text-[#575A65] mt-1.5 leading-relaxed">
                Fixed number of challenges with automatic completion.
              </p>
              {durationType === 'QUESTION_COUNT' && (
                <div className="mt-3 flex gap-2">
                  {[10, 20, 30].map((cnt) => (
                    <button
                      key={cnt}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetCount(cnt);
                      }}
                      className={`px-3 py-1 font-mono text-xs border ${
                        targetCount === cnt
                          ? 'bg-[#1A2B4C] text-white border-[#1C1D21]'
                          : 'bg-white text-[#1C1D21] border-[#DCD6CD]'
                      }`}
                    >
                      {cnt} Qs
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* TIMED SPRINT */}
            <div
              onClick={() => setDurationType('TIMED')}
              className={`p-5 border-2 transition-all cursor-pointer ${
                durationType === 'TIMED'
                  ? 'bg-white border-[#C88A2D] shadow-tactile-gold'
                  : 'bg-[#FBF9F5] border-[#DCD6CD] hover:border-[#1C1D21]'
              }`}
            >
              <Clock className="w-6 h-6 text-[#236B47] mb-3" />
              <h3 className="font-serif text-base font-bold text-[#1C1D21]">Timed Sprint</h3>
              <p className="text-xs text-[#575A65] mt-1.5 leading-relaxed">
                Race against the clock to answer as many as possible.
              </p>
              {durationType === 'TIMED' && (
                <div className="mt-3 flex gap-2">
                  {[10, 15, 30].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTargetDuration(mins);
                      }}
                      className={`px-2.5 py-1 font-mono text-xs border ${
                        targetDuration === mins
                          ? 'bg-[#236B47] text-white border-[#1C1D21]'
                          : 'bg-white text-[#1C1D21] border-[#DCD6CD]'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 border border-[#1C1D21] text-[#1C1D21] font-mono text-xs uppercase font-bold btn-tactile cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-[#1A2B4C] hover:bg-[#121F38] text-white font-mono text-xs uppercase font-bold tracking-wider btn-tactile flex items-center gap-2 cursor-pointer"
            >
              <span>Next: Select Syllabus Topics</span>
              <ArrowRight className="w-4 h-4 text-[#C88A2D]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: TAXONOMY & DIFFICULTY PICKER */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="border-b border-[#DCD6CD] pb-3 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#1C1D21]">
                Choose Syllabus Topics &amp; Challenge Tier
              </h2>
              <p className="text-xs text-[#575A65] font-mono mt-0.5">
                Select chapters across Class 12 standard (48 total chapters across Physics, Chemistry, and Math).
              </p>
            </div>
            <button
              onClick={() => setStep(2)}
              className="text-xs font-mono text-[#575A65] hover:text-[#1C1D21] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          {isLoadingTaxonomy ? (
            <div className="p-12 text-center font-mono text-xs text-[#575A65] space-y-2">
              <div className="w-6 h-6 border-2 border-[#1A2B4C] border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Loading Complete Class 12 Standard Syllabus (48 Chapters)...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 1. Quick Presets Bar */}
              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#1C1D21] mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C88A2D]" />
                  <span>1. Quick Syllabus Presets</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('FULL_12TH')}
                    className={`p-3 border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                      totalSelectedChapters === totalAvailableChapters && totalAvailableChapters > 0
                        ? 'bg-[#FEF8ED] border-[#C88A2D] shadow-tactile-gold'
                        : 'bg-white border-[#DCD6CD] hover:border-[#1C1D21]'
                    }`}
                  >
                    <span className="font-mono text-[10px] font-bold uppercase text-[#C88A2D]">
                      ⚡ All 48 Chapters
                    </span>
                    <span className="font-serif text-xs font-bold text-[#1C1D21] mt-1">
                      Full 12th Standard Mock
                    </span>
                    <span className="font-mono text-[10px] text-[#575A65] mt-0.5">
                      16 Ph + 16 Ch + 16 Ma
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset('PHYSICS')}
                    className={`p-3 border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                      selectedChapters['Physics']?.length === (taxonomy['Physics']?.length || 16) &&
                      selectedChapters['Chemistry']?.length === 0 &&
                      selectedChapters['Mathematics']?.length === 0
                        ? 'bg-[#FEF8ED] border-[#C88A2D] shadow-tactile-gold'
                        : 'bg-white border-[#DCD6CD] hover:border-[#1C1D21]'
                    }`}
                  >
                    <span className="font-mono text-[10px] font-bold uppercase text-[#C88A2D]">
                      ⚛️ 16 Chapters
                    </span>
                    <span className="font-serif text-xs font-bold text-[#1C1D21] mt-1">
                      Physics Complete
                    </span>
                    <span className="font-mono text-[10px] text-[#575A65] mt-0.5">
                      Mechanics, Waves, Modern
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset('CHEMISTRY')}
                    className={`p-3 border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                      selectedChapters['Chemistry']?.length === (taxonomy['Chemistry']?.length || 16) &&
                      selectedChapters['Physics']?.length === 0 &&
                      selectedChapters['Mathematics']?.length === 0
                        ? 'bg-[#FEF8ED] border-[#236B47] shadow-tactile-emerald'
                        : 'bg-white border-[#DCD6CD] hover:border-[#1C1D21]'
                    }`}
                  >
                    <span className="font-mono text-[10px] font-bold uppercase text-[#236B47]">
                      🧪 16 Chapters
                    </span>
                    <span className="font-serif text-xs font-bold text-[#1C1D21] mt-1">
                      Chemistry Complete
                    </span>
                    <span className="font-mono text-[10px] text-[#575A65] mt-0.5">
                      Physical, Inorganic, Organic
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleApplyPreset('MATH')}
                    className={`p-3 border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                      selectedChapters['Mathematics']?.length === (taxonomy['Mathematics']?.length || 16) &&
                      selectedChapters['Physics']?.length === 0 &&
                      selectedChapters['Chemistry']?.length === 0
                        ? 'bg-[#FEF8ED] border-[#1A2B4C] shadow-tactile'
                        : 'bg-white border-[#DCD6CD] hover:border-[#1C1D21]'
                    }`}
                  >
                    <span className="font-mono text-[10px] font-bold uppercase text-[#1A2B4C]">
                      📐 16 Chapters
                    </span>
                    <span className="font-serif text-xs font-bold text-[#1C1D21] mt-1">
                      Mathematics Complete
                    </span>
                    <span className="font-mono text-[10px] text-[#575A65] mt-0.5">
                      Calculus, Vectors, Probability
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. Subject Tabs & Chapter Checklist */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                  <label className="font-mono text-xs font-bold uppercase tracking-wider text-[#1C1D21] flex items-center gap-1.5">
                    <ListChecks className="w-3.5 h-3.5 text-[#1A2B4C]" />
                    <span>2. Select Subject &amp; Chapters</span>
                  </label>

                  {/* Summary counter badge */}
                  <div className="inline-flex items-center gap-2 bg-[#F4EFEA] px-3 py-1 border border-[#DCD6CD] font-mono text-xs">
                    <span className="text-[#575A65]">Total Active:</span>
                    <span className="font-bold text-[#1C1D21]">
                      {totalSelectedChapters} / {totalAvailableChapters} Chapters
                    </span>
                    {totalSelectedChapters === totalAvailableChapters && totalAvailableChapters > 0 && (
                      <span className="px-1.5 py-0.2 bg-[#236B47] text-white text-[10px] font-bold">
                        FULL 12TH SYLLABUS
                      </span>
                    )}
                  </div>
                </div>

                {/* Subject Switcher Tabs */}
                <div className="flex border-b border-[#1C1D21] bg-[#F4EFEA]">
                  {Object.keys(taxonomy).map((subj) => {
                    const count = selectedChapters[subj]?.length || 0;
                    const totalForSubj = taxonomy[subj]?.length || 0;
                    const isActive = activeSubjectTab === subj;

                    return (
                      <button
                        key={subj}
                        type="button"
                        onClick={() => {
                          setActiveSubjectTab(subj);
                          setChapterSearch('');
                        }}
                        className={`flex-1 py-3 px-4 text-xs font-mono font-bold flex items-center justify-center gap-2 border-r border-[#1C1D21] last:border-r-0 transition cursor-pointer ${
                          isActive
                            ? 'bg-white text-[#1C1D21] border-b-2 border-b-white -mb-px shadow-xs'
                            : 'bg-[#EAE3D9] text-[#575A65] hover:bg-[#F4EFEA]'
                        }`}
                      >
                        {subjectIcons[subj]}
                        <span>{subj}</span>
                        <span
                          className={`text-[11px] px-1.5 py-0.2 border ${
                            count === totalForSubj && totalForSubj > 0
                              ? 'bg-[#236B47] text-white border-[#236B47]'
                              : count > 0
                              ? 'bg-[#C88A2D] text-[#1C1D21] border-[#C88A2D]'
                              : 'bg-white text-[#8E929E] border-[#DCD6CD]'
                          }`}
                        >
                          {count}/{totalForSubj}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Active Subject Toolbar: Search + Select All + Clear */}
                <div className="bg-white border-l border-r border-[#1C1D21] p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-[#8E929E] absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={`Search ${activeSubjectTab} chapters...`}
                      value={chapterSearch}
                      onChange={(e) => setChapterSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#FBF9F5] border border-[#DCD6CD] font-mono text-xs text-[#1C1D21] placeholder-[#8E929E] focus:outline-none focus:border-[#1C1D21]"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => handleSelectAllForSubject(activeSubjectTab)}
                      className="px-2.5 py-1 text-xs font-mono font-bold text-[#1A2B4C] hover:bg-[#F4EFEA] border border-[#1A2B4C] transition cursor-pointer"
                    >
                      Select All 16
                    </button>
                    <button
                      type="button"
                      onClick={() => handleClearAllForSubject(activeSubjectTab)}
                      className="px-2.5 py-1 text-xs font-mono font-bold text-[#575A65] hover:text-[#A83232] hover:bg-[#FDF0F0] border border-[#DCD6CD] transition cursor-pointer"
                    >
                      Clear {activeSubjectTab}
                    </button>
                  </div>
                </div>

                {/* Chapter Checklist Grid */}
                <div className="bg-white border-l border-r border-b border-[#1C1D21] p-3 max-h-72 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(taxonomy[activeSubjectTab] || [])
                      .filter((chap) =>
                        chap.toLowerCase().includes(chapterSearch.toLowerCase())
                      )
                      .map((chap, idx) => {
                        const isChecked = (selectedChapters[activeSubjectTab] || []).includes(chap);

                        return (
                          <div
                            key={chap}
                            onClick={() => handleToggleChapter(activeSubjectTab, chap)}
                            className={`p-2.5 border transition cursor-pointer flex items-center justify-between ${
                              isChecked
                                ? 'bg-[#FBF9F5] border-[#1C1D21] shadow-xs'
                                : 'bg-white border-[#E8E2D8] hover:border-[#1C1D21] opacity-75'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <span
                                className={`w-5 h-5 rounded flex items-center justify-center font-mono text-[10px] shrink-0 border ${
                                  isChecked
                                    ? 'bg-[#1A2B4C] text-white border-[#1C1D21] font-bold'
                                    : 'bg-[#F4EFEA] text-[#8E929E] border-[#DCD6CD]'
                                }`}
                              >
                                {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                              </span>
                              <span
                                className={`text-xs font-medium truncate ${
                                  isChecked ? 'text-[#1C1D21] font-bold' : 'text-[#575A65]'
                                }`}
                                title={chap}
                              >
                                {chap}
                              </span>
                            </div>

                            <div className="shrink-0 ml-2">
                              {isChecked ? (
                                <CheckSquare className="w-4 h-4 text-[#236B47]" />
                              ) : (
                                <Square className="w-4 h-4 text-[#DCD6CD]" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* 3. Difficulty Selector */}
              <div>
                <label className="block font-mono text-xs font-bold uppercase tracking-wider text-[#1C1D21] mb-2">
                  3. Challenge Tier
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 text-center font-mono text-xs font-bold border transition cursor-pointer ${
                        difficulty === diff
                          ? diff === 'EASY'
                            ? 'bg-[#EBF5F0] text-[#236B47] border-[#236B47] shadow-tactile-emerald'
                            : diff === 'MEDIUM'
                            ? 'bg-[#FEF8ED] text-[#D97706] border-[#D97706] shadow-tactile-gold'
                            : 'bg-[#FDF0F0] text-[#A83232] border-[#A83232] shadow-tactile-crimson'
                          : 'bg-white text-[#575A65] border-[#DCD6CD] hover:border-[#1C1D21]'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-[#FDF0F0] border border-[#A83232] text-[#A83232] font-mono text-xs">
              {error}
            </div>
          )}

          {/* Launch Action */}
          <div className="flex justify-between items-center pt-6 border-t border-[#DCD6CD]">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 border border-[#1C1D21] text-[#1C1D21] font-mono text-xs uppercase font-bold btn-tactile cursor-pointer"
            >
              Back
            </button>
            <button
              onClick={handleLaunch}
              disabled={isLaunching || isLoadingTaxonomy || totalSelectedChapters === 0}
              className="px-8 py-3.5 bg-[#236B47] hover:bg-[#1C5538] text-white font-mono text-xs uppercase tracking-wider font-bold btn-tactile flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLaunching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Exam &amp; Generating Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FBF9F5]" />
                  <span>
                    Launch Practice Arena ({totalSelectedChapters} Ch) ➔
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PracticeWizardPage;
