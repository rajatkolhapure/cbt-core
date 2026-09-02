/**
 * Multiple Test Exams Generator & Assigner for CBT Testing
 * 
 * Creates 8 distinct test exams of varying durations, question types,
 * section counts, and proctoring environments for thorough UI & engine testing.
 * 
 * Run: npx tsx prisma/seed-multi-tests.ts
 */

import { PrismaClient, QuestionType, Difficulty, Role, ExamEnvironment } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creating and assigning multiple test exams...\n');

  // 1. Fetch or create subjects
  let physics = await prisma.subject.findUnique({ where: { code: 'PHY' } });
  if (!physics) {
    physics = await prisma.subject.create({
      data: { name: 'Physics', code: 'PHY', order: 1 },
    });
  }

  let chemistry = await prisma.subject.findUnique({ where: { code: 'CHEM' } });
  if (!chemistry) {
    chemistry = await prisma.subject.create({
      data: { name: 'Chemistry', code: 'CHEM', order: 2 },
    });
  }

  let mathematics = await prisma.subject.findUnique({ where: { code: 'MATH' } });
  if (!mathematics) {
    mathematics = await prisma.subject.create({
      data: { name: 'Mathematics', code: 'MATH', order: 3 },
    });
  }

  // 2. Fetch or create students
  const passwordHash = await bcrypt.hash('admin123', 10);
  const studentHash = await bcrypt.hash('student123', 10);

  const student1 = await prisma.user.upsert({
    where: { email: 'student@cbt.com' },
    update: {},
    create: {
      email: 'student@cbt.com',
      password: studentHash,
      name: 'Priya Sharma',
      role: Role.STUDENT,
      candidateId: 'CET-2026-0001',
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'rahul@cbt.com' },
    update: {},
    create: {
      email: 'rahul@cbt.com',
      password: studentHash,
      name: 'Rahul Patel',
      role: Role.STUDENT,
      candidateId: 'CET-2026-0002',
    },
  });

  const student3 = await prisma.user.upsert({
    where: { email: 'ananya@cbt.com' },
    update: {},
    create: {
      email: 'ananya@cbt.com',
      password: studentHash,
      name: 'Ananya Iyer',
      role: Role.STUDENT,
      candidateId: 'CET-2026-0003',
    },
  });

  // 3. Ensure we have special multi-choice and numerical questions for testing
  console.log('📝 Creating dedicated test questions (Numerical & Multi-Choice)...');
  
  const testQuestions = await Promise.all([
    // Numerical 1
    prisma.question.create({
      data: {
        type: QuestionType.NUMERICAL,
        text: 'A block of mass $m = 4\\,\\text{kg}$ is pushed with a force $F = 20\\,\\text{N}$ on a frictionless horizontal floor. Calculate the acceleration of the block in $\\text{m/s}^2$.',
        correctAnswer: 5,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: '$a = F/m = 20 / 4 = 5\\,\\text{m/s}^2$.',
        subjectId: physics.id,
        tags: ['testing', 'numerical'],
      },
    }),
    // Numerical 2
    prisma.question.create({
      data: {
        type: QuestionType.NUMERICAL,
        text: 'The focal length of a convex lens is $+20\\,\\text{cm}$. What is the optical power of the lens in Dioptres $(\\text{D})$?',
        correctAnswer: 5,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: '$P = 100/f(\\text{cm}) = 100/20 = +5\\,\\text{D}$.',
        subjectId: physics.id,
        tags: ['testing', 'numerical'],
      },
    }),
    // Numerical 3
    prisma.question.create({
      data: {
        type: QuestionType.NUMERICAL,
        text: 'What is the pH of a $0.001\\,\\text{M}\\;\\text{HCl}$ aqueous solution?',
        correctAnswer: 3,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: '$\\text{pH} = -\\log_{10}(10^{-3}) = 3$.',
        subjectId: chemistry.id,
        tags: ['testing', 'numerical'],
      },
    }),
    // Numerical 4
    prisma.question.create({
      data: {
        type: QuestionType.NUMERICAL,
        text: 'Evaluate $\\displaystyle\\int_0^3 2x\\, dx$.',
        correctAnswer: 9,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: '$[x^2]_0^3 = 9 - 0 = 9$.',
        subjectId: mathematics.id,
        tags: ['testing', 'numerical'],
      },
    }),
    // Numerical 5
    prisma.question.create({
      data: {
        type: QuestionType.NUMERICAL,
        text: 'If $A = \\begin{pmatrix} 3 & 1 \\\\ 2 & 4 \\end{pmatrix}$, find the determinant $\\det(A)$.',
        correctAnswer: 10,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: '$\\det(A) = (3)(4) - (1)(2) = 12 - 2 = 10$.',
        subjectId: mathematics.id,
        tags: ['testing', 'numerical'],
      },
    }),
    // Multi-Choice 1
    prisma.question.create({
      data: {
        type: QuestionType.MULTIPLE_CHOICE,
        text: 'Which of the following are vector quantities? (Select all that apply)',
        options: ['Velocity', 'Electric Field', 'Speed', 'Magnetic Flux Density'],
        correctAnswer: [0, 1, 3],
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.MEDIUM,
        explanation: 'Velocity, Electric Field, and Magnetic Flux Density are vector quantities. Speed is a scalar quantity.',
        subjectId: physics.id,
        tags: ['testing', 'multi-choice'],
      },
    }),
    // Multi-Choice 2
    prisma.question.create({
      data: {
        type: QuestionType.MULTIPLE_CHOICE,
        text: 'Which of the following gases are noble gases? (Select all that apply)',
        options: ['Helium', 'Argon', 'Nitrogen', 'Neon'],
        correctAnswer: [0, 1, 3],
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Helium (He), Argon (Ar), and Neon (Ne) are noble gases. Nitrogen is a diatomic reactive gas.',
        subjectId: chemistry.id,
        tags: ['testing', 'multi-choice'],
      },
    }),
    // Multi-Choice 3
    prisma.question.create({
      data: {
        type: QuestionType.MULTIPLE_CHOICE,
        text: 'Which of the following functions are strictly increasing for all $x > 0$? (Select all that apply)',
        options: ['$f(x) = e^x$', '$f(x) = \\ln x$', '$f(x) = x^2$', '$f(x) = \\frac{1}{x}$'],
        correctAnswer: [0, 1, 2],
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.MEDIUM,
        explanation: '$e^x$, $\\ln x$, and $x^2$ have positive first derivatives for $x > 0$. $\\frac{1}{x}$ has derivative $-1/x^2 < 0$ (decreasing).',
        subjectId: mathematics.id,
        tags: ['testing', 'multi-choice'],
      },
    }),
    // Multi-Choice 4
    prisma.question.create({
      data: {
        type: QuestionType.MULTIPLE_CHOICE,
        text: 'Which of the following are colligative properties of solutions? (Select all that apply)',
        options: ['Osmotic Pressure', 'Elevation of Boiling Point', 'Depression of Freezing Point', 'Refractive Index'],
        correctAnswer: [0, 1, 2],
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Osmotic pressure, boiling point elevation, and freezing point depression depend only on solute particle count.',
        subjectId: chemistry.id,
        tags: ['testing', 'multi-choice'],
      },
    }),
    // Multi-Choice 5
    prisma.question.create({
      data: {
        type: QuestionType.MULTIPLE_CHOICE,
        text: 'Which of the following are units of energy? (Select all that apply)',
        options: ['Joule (J)', 'Electron-volt (eV)', 'Kilowatt-hour (kWh)', 'Watt (W)'],
        correctAnswer: [0, 1, 2],
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Joule, eV, and kWh measure energy. Watt (W) is a unit of power.',
        subjectId: physics.id,
        tags: ['testing', 'multi-choice'],
      },
    }),
  ]);

  // 4. Fetch all available questions across subjects
  const allPhy = await prisma.question.findMany({ where: { subjectId: physics.id, isActive: true } });
  const allChem = await prisma.question.findMany({ where: { subjectId: chemistry.id, isActive: true } });
  const allMath = await prisma.question.findMany({ where: { subjectId: mathematics.id, isActive: true } });

  console.log(`  ✓ Available pool: ${allPhy.length} Physics, ${allChem.length} Chemistry, ${allMath.length} Math questions\n`);

  // Helper to create exam with sections
  async function createExamWithSections(params: {
    title: string;
    description: string;
    duration: number;
    totalMarks: number;
    environment?: ExamEnvironment;
    sections: {
      name: string;
      subjectId: string;
      questions: any[];
      marksPerQuestion: number;
      negativeMarksPerQuestion: number;
    }[];
  }) {
    const exam = await prisma.exam.create({
      data: {
        title: params.title,
        description: params.description,
        duration: params.duration,
        totalMarks: params.totalMarks,
        isPublished: true,
        allowReview: true,
        showResultImmediately: true,
        examEnvironment: params.environment || ExamEnvironment.STANDARD_BROWSER,
      },
    });

    for (let sIdx = 0; sIdx < params.sections.length; sIdx++) {
      const s = params.sections[sIdx];
      const section = await prisma.examSection.create({
        data: {
          examId: exam.id,
          subjectId: s.subjectId,
          name: s.name,
          order: sIdx,
          questionCount: s.questions.length,
          marksPerQuestion: s.marksPerQuestion,
          negativeMarksPerQuestion: s.negativeMarksPerQuestion,
          allowSectionJump: true,
        },
      });

      for (let qIdx = 0; qIdx < s.questions.length; qIdx++) {
        await prisma.examQuestion.create({
          data: {
            examId: exam.id,
            sectionId: section.id,
            questionId: s.questions[qIdx].id,
            order: qIdx,
          },
        });
      }
    }

    return exam;
  }

  // ─── 5. CREATE 8 DIVERSE TEST EXAMS ──────────────────────────────────
  console.log('📋 Creating 8 varied test examinations...');

  // Exam 1: Quick 5-Min Smoke Test (5 Qs)
  const exam1 = await createExamWithSections({
    title: '⚡ Quick 5-Min Smoke Test (5 Questions)',
    description: 'Ultra-fast 5-minute evaluation test. Ideal for rapidly testing countdown timer behavior, Save & Next, Mark for Review, and instant scorecard generation.',
    duration: 5,
    totalMarks: 20,
    environment: ExamEnvironment.STANDARD_BROWSER,
    sections: [
      {
        name: 'General Assessment',
        subjectId: physics.id,
        questions: allPhy.slice(0, 5),
        marksPerQuestion: 4,
        negativeMarksPerQuestion: 1,
      },
    ],
  });
  console.log(`  ✓ Created: "${exam1.title}"`);

  // Exam 2: Multi-Choice & Numerical Testing Exam (10 Qs)
  const exam2 = await createExamWithSections({
    title: '🔢 Numerical & Multi-Select Testing Exam (10 Questions)',
    description: 'Special exam containing 5 Numerical Answer questions (testing virtual on-screen keypad & clear buttons) and 5 Multiple-Choice questions (testing checkboxes & partial scoring).',
    duration: 15,
    totalMarks: 40,
    environment: ExamEnvironment.STANDARD_BROWSER,
    sections: [
      {
        name: 'Numerical & Multi-Choice Section',
        subjectId: mathematics.id,
        questions: testQuestions,
        marksPerQuestion: 4,
        negativeMarksPerQuestion: 1,
      },
    ],
  });
  console.log(`  ✓ Created: "${exam2.title}"`);

  // Exam 3: Anti-Cheat & Strict Lockdown Test (5 Qs)
  const exam3 = await createExamWithSections({
    title: '🛡️ Anti-Cheat & Fullscreen Security Test (5 Questions)',
    description: 'Strict proctoring test with mandatory fullscreen gate. Use this to test tab-switch violation triggers, window blur locking, and the 3-strike auto-disqualification engine.',
    duration: 10,
    totalMarks: 20,
    environment: ExamEnvironment.FULLSCREEN_BROWSER,
    sections: [
      {
        name: 'Proctored Section',
        subjectId: physics.id,
        questions: allPhy.slice(5, 10),
        marksPerQuestion: 4,
        negativeMarksPerQuestion: 1,
      },
    ],
  });
  console.log(`  ✓ Created: "${exam3.title}"`);

  // Exam 4: Standard Browser Practice Test (10 Qs)
  const exam4 = await createExamWithSections({
    title: '🌐 Standard Practice Test — No Lockdown (10 Questions)',
    description: 'Casual test in standard browser mode without forced fullscreen lockdown. Great for testing palette navigation and question bookmarking.',
    duration: 15,
    totalMarks: 40,
    environment: ExamEnvironment.STANDARD_BROWSER,
    sections: [
      {
        name: 'Practice Section',
        subjectId: chemistry.id,
        questions: allChem.slice(0, 10),
        marksPerQuestion: 4,
        negativeMarksPerQuestion: 1,
      },
    ],
  });
  console.log(`  ✓ Created: "${exam4.title}"`);

  // Exam 5: Physics Speed Challenge (15 Qs)
  const exam5 = await createExamWithSections({
    title: '⚡ Physics Sectional Speed Challenge (15 Questions)',
    description: 'Targeted Physics mock covering Mechanics, Rotational Dynamics, Thermodynamics, and Electrostatics. 20 minutes timed challenge.',
    duration: 20,
    totalMarks: 60,
    environment: ExamEnvironment.FULLSCREEN_BROWSER,
    sections: [
      {
        name: 'Physics Core',
        subjectId: physics.id,
        questions: allPhy.slice(0, 15),
        marksPerQuestion: 4,
        negativeMarksPerQuestion: 1,
      },
    ],
  });
  console.log(`  ✓ Created: "${exam5.title}"`);

  // Exam 6: Chemistry Chapterwise Test: Organic & Physical (20 Qs)
  const exam6 = await createExamWithSections({
    title: '🧪 Chemistry 2-Section Chapterwise Test (20 Questions)',
    description: 'Multi-section Chemistry test containing Section A (Organic Chemistry, 10 Qs) and Section B (Physical & Inorganic, 10 Qs). Tests section switcher tabs.',
    duration: 30,
    totalMarks: 80,
    environment: ExamEnvironment.FULLSCREEN_BROWSER,
    sections: [
      {
        name: 'Section A — Organic Chemistry',
        subjectId: chemistry.id,
        questions: allChem.slice(0, 10),
        marksPerQuestion: 4,
        negativeMarksPerQuestion: 1,
      },
      {
        name: 'Section B — Physical & Inorganic',
        subjectId: chemistry.id,
        questions: allChem.slice(10, 20),
        marksPerQuestion: 4,
        negativeMarksPerQuestion: 1,
      },
    ],
  });
  console.log(`  ✓ Created: "${exam6.title}"`);

  // Exam 7: Mathematics Core Assessment (25 Qs)
  const exam7 = await createExamWithSections({
    title: '📐 Mathematics Comprehensive Assessment (25 Questions)',
    description: 'Higher marks assessment: 25 Calculus, Algebra, Matrices, Trigonometry, and Vectors questions with +2 marks per question (CET pattern).',
    duration: 45,
    totalMarks: 50,
    environment: ExamEnvironment.FULLSCREEN_BROWSER,
    sections: [
      {
        name: 'Mathematics Section',
        subjectId: mathematics.id,
        questions: allMath.slice(0, 25),
        marksPerQuestion: 2,
        negativeMarksPerQuestion: 0,
      },
    ],
  });
  console.log(`  ✓ Created: "${exam7.title}"`);

  // Exam 8: Full-Length MHT-CET 2026 Grand Mock Test (150 Qs)
  // Ensure the grand test is also available
  const existingGrand = await prisma.exam.findFirst({
    where: { title: { contains: 'Full-Length Grand Mock Test' } },
  });

  const allExamsToAssign = [exam1, exam2, exam3, exam4, exam5, exam6, exam7];
  if (existingGrand) {
    allExamsToAssign.push(existingGrand);
  }

  // ─── 6. ASSIGN ALL EXAMS TO ALL STUDENTS ────────────────────────────
  console.log('\n🎓 Assigning all exams to student accounts...');

  const students = [student1, student2, student3];

  for (const student of students) {
    for (const exam of allExamsToAssign) {
      await prisma.examAssignment.upsert({
        where: {
          examId_userId: {
            examId: exam.id,
            userId: student.id,
          },
        },
        update: {},
        create: {
          examId: exam.id,
          userId: student.id,
        },
      });
    }
  }

  console.log(`  ✓ Assigned ${allExamsToAssign.length} exams to Priya Sharma (student@cbt.com)`);
  console.log(`  ✓ Assigned ${allExamsToAssign.length} exams to Rahul Patel (rahul@cbt.com)`);
  console.log(`  ✓ Assigned ${allExamsToAssign.length} exams to Ananya Iyer (ananya@cbt.com)\n`);

  console.log('═════════════════════════════════════════════════════════════════');
  console.log(`  🎉 ${allExamsToAssign.length} VARIED TEST EXAMS READY IN STUDENT PORTAL!`);
  console.log('═════════════════════════════════════════════════════════════════');
  console.log('  1. ⚡ Quick 5-Min Smoke Test (5 Qs, 5 mins)');
  console.log('  2. 🔢 Numerical & Multi-Select Testing Exam (10 Qs, 15 mins)');
  console.log('  3. 🛡️ Anti-Cheat & Fullscreen Security Test (5 Qs, 10 mins)');
  console.log('  4. 🌐 Standard Practice Test — No Lockdown (10 Qs, 15 mins)');
  console.log('  5. ⚡ Physics Sectional Speed Challenge (15 Qs, 20 mins)');
  console.log('  6. 🧪 Chemistry 2-Section Chapterwise Test (20 Qs, 30 mins)');
  console.log('  7. 📐 Mathematics Comprehensive Assessment (25 Qs, 45 mins)');
  console.log('  8. 🏆 MHT-CET 2026 Full-Length Grand Mock Test (150 Qs, 180 mins)');
  console.log('═════════════════════════════════════════════════════════════════\n');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('\n❌ Failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
