/**
 * Seed Parth Jagdale and assign a small, ultra-easy test
 * 
 * Run: npx tsx prisma/seed-parth.ts
 */

import { PrismaClient, QuestionType, Difficulty, Role, ExamEnvironment } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creating user Parth Jagdale and easy diagnostic exam...\n');

  // 1. Ensure subjects exist
  const physics = await prisma.subject.upsert({
    where: { code: 'PHY' },
    update: {},
    create: { name: 'Physics', code: 'PHY', order: 1 },
  });

  const chemistry = await prisma.subject.upsert({
    where: { code: 'CHEM' },
    update: {},
    create: { name: 'Chemistry', code: 'CHEM', order: 2 },
  });

  const mathematics = await prisma.subject.upsert({
    where: { code: 'MATH' },
    update: {},
    create: { name: 'Mathematics', code: 'MATH', order: 3 },
  });

  // 2. Create / Upsert user Parth Jagdale
  const studentHash = await bcrypt.hash('student123', 10);

  const parth = await prisma.user.upsert({
    where: { email: 'parth@cbt.com' },
    update: {
      name: 'Parth Jagdale',
      candidateId: 'CET-2026-0004',
      role: Role.STUDENT,
    },
    create: {
      email: 'parth@cbt.com',
      password: studentHash,
      name: 'Parth Jagdale',
      role: Role.STUDENT,
      candidateId: 'CET-2026-0004',
    },
  });

  console.log(`👤 Candidate ready: ${parth.name} (${parth.email}) • Roll: ${parth.candidateId}`);

  // 3. Create 10 Ultra-Easy Questions
  console.log('📝 Creating 10 foundational easy questions...');

  const easyQuestions = [
    // Physics 1
    await prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'What is the standard SI unit of electric current?',
        options: ['Ampere (A)', 'Volt (V)', 'Ohm (\\Omega)', 'Watt (W)'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: 'The standard SI base unit of electric current is the Ampere (symbol: A).',
        subjectId: physics.id,
        tags: ['easy', 'physics', 'units'],
      },
    }),
    // Physics 2
    await prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The speed of light in vacuum is approximately equal to:',
        options: [
          '$3 \\times 10^8\\,\\text{m/s}$',
          '$3 \\times 10^5\\,\\text{m/s}$',
          '$3 \\times 10^6\\,\\text{m/s}$',
          '$3 \\times 10^{10}\\,\\text{m/s}$'
        ],
        correctAnswer: 0,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: 'The speed of light in vacuum is $c \\approx 3 \\times 10^8\\,\\text{m/s}$ (or $300,000\\,\\text{km/s}$).',
        subjectId: physics.id,
        tags: ['easy', 'physics', 'optics'],
      },
    }),
    // Physics 3
    await prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'What is the acceleration due to gravity on the surface of the Earth ($g$)?',
        options: [
          '$9.8\\,\\text{m/s}^2$',
          '$19.6\\,\\text{m/s}^2$',
          '$4.9\\,\\text{m/s}^2$',
          '$0\\,\\text{m/s}^2$'
        ],
        correctAnswer: 0,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: 'The standard acceleration due to gravity on Earth is approximately $9.8\\,\\text{m/s}^2$.',
        subjectId: physics.id,
        tags: ['easy', 'physics', 'gravitation'],
      },
    }),
    // Chemistry 1
    await prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'What is the chemical formula of Water?',
        options: ['$\\text{H}_2\\text{O}$', '$\\text{H}_2\\text{O}_2$', '$\\text{CO}_2$', '$\\text{NaCl}$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: 'Water consists of two Hydrogen atoms bonded to one Oxygen atom: $\\text{H}_2\\text{O}$.',
        subjectId: chemistry.id,
        tags: ['easy', 'chemistry', 'basics'],
      },
    }),
    // Chemistry 2
    await prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'Which gas is essential for human respiration and aerobic life?',
        options: ['Oxygen ($\\text{O}_2$)', 'Carbon Dioxide ($\\text{CO}_2$)', 'Nitrogen ($\\text{N}_2$)', 'Argon ($\\text{Ar}$)'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: 'Oxygen ($\\text{O}_2$) is inhaled by humans and used in cellular respiration.',
        subjectId: chemistry.id,
        tags: ['easy', 'chemistry', 'gases'],
      },
    }),
    // Chemistry 3
    await prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'What is the atomic number of Carbon in the periodic table?',
        options: ['$6$', '$12$', '$14$', '$8$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: 'Carbon has 6 protons, so its atomic number is $Z = 6$.',
        subjectId: chemistry.id,
        tags: ['easy', 'chemistry', 'atomic'],
      },
    }),
    // Chemistry 4
    await prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'What is the pH value of pure neutral water at $25^\\circ\\text{C}$?',
        options: ['$7$', '$0$', '$14$', '$1$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: 'Pure neutral water has a pH of exactly $7.0$ at $25^\\circ\\text{C}$.',
        subjectId: chemistry.id,
        tags: ['easy', 'chemistry', 'acids'],
      },
    }),
    // Mathematics 1
    await prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'If a rectangle has length $5\\,\\text{cm}$ and width $4\\,\\text{cm}$, what is its area?',
        options: ['$20\\,\\text{cm}^2$', '$18\\,\\text{cm}^2$', '$9\\,\\text{cm}^2$', '$25\\,\\text{cm}^2$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: '$\\text{Area} = \\text{length} \\times \\text{width} = 5 \\times 4 = 20\\,\\text{cm}^2$.',
        subjectId: mathematics.id,
        tags: ['easy', 'math', 'geometry'],
      },
    }),
    // Mathematics 2
    await prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'What is the trigonometric value of $\\sin(90^\\circ)$?',
        options: ['$1$', '$0$', '$\\frac{1}{2}$', '$\\frac{\\sqrt{3}}{2}$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: '$\\sin(90^\\circ) = 1$.',
        subjectId: mathematics.id,
        tags: ['easy', 'math', 'trig'],
      },
    }),
    // Mathematics 3
    await prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'Solve for $x$: $2x + 6 = 16$.',
        options: ['$x = 5$', '$x = 10$', '$x = 6$', '$x = 8$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: '$2x = 16 - 6 = 10 \\implies x = 5$.',
        subjectId: mathematics.id,
        tags: ['easy', 'math', 'algebra'],
      },
    }),
  ];

  // 4. Create the Small Easy Exam
  console.log('📋 Creating Fundamental Science & Math Easy Test (10 Questions)...');

  const easyExam = await prisma.exam.create({
    data: {
      title: 'Fundamental Science & Math Diagnostic Test (10 Questions)',
      description: 'Foundational 10-question evaluation covering basic scientific and mathematical principles. Designed for rapid familiarization with the CBT platform.',
      duration: 15,
      totalMarks: 40,
      isPublished: true,
      allowReview: true,
      showResultImmediately: true,
      examEnvironment: ExamEnvironment.STANDARD_BROWSER,
    },
  });

  const section = await prisma.examSection.create({
    data: {
      examId: easyExam.id,
      subjectId: physics.id,
      name: 'General Foundations',
      order: 0,
      questionCount: easyQuestions.length,
      marksPerQuestion: 4,
      negativeMarksPerQuestion: 0,
      allowSectionJump: true,
    },
  });

  for (let i = 0; i < easyQuestions.length; i++) {
    await prisma.examQuestion.create({
      data: {
        examId: easyExam.id,
        sectionId: section.id,
        questionId: easyQuestions[i].id,
        order: i,
      },
    });
  }

  // 5. Assign to Parth and all other students
  const allExams = await prisma.exam.findMany({ where: { isPublished: true } });

  for (const exam of allExams) {
    await prisma.examAssignment.upsert({
      where: {
        examId_userId: {
          examId: exam.id,
          userId: parth.id,
        },
      },
      update: {},
      create: {
        examId: exam.id,
        userId: parth.id,
      },
    });
  }

  console.log(`  ✓ Assigned ${allExams.length} examinations to Parth Jagdale (parth@cbt.com)`);

  console.log('\n═════════════════════════════════════════════════════════════════');
  console.log('  🎉 PARTH JAGDALE CREATED & EASY TEST ASSIGNED!');
  console.log('═════════════════════════════════════════════════════════════════');
  console.log('  👤 Login Email:    parth@cbt.com');
  console.log('  🔑 Password:       student123');
  console.log('  🆔 Candidate Roll: CET-2026-0004');
  console.log('  📝 Assigned Test:  "Fundamental Science & Math Diagnostic Test"');
  console.log('     • 10 Easy Questions (Physics, Chemistry, Mathematics)');
  console.log('     • 15 Minutes Duration, 40 Total Marks');
  console.log('═════════════════════════════════════════════════════════════════\n');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('\n❌ Failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
