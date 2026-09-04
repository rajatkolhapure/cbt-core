import { PrismaClient, QuestionType, Difficulty, ExamEnvironment } from '@prisma/client';

const prisma = new PrismaClient();

async function createUnitsTest() {
  console.log('🚀 Creating CET-level Units and Measurement 10-Question Test...');

  // 1. Find or create Physics subject
  let physics = await prisma.subject.findUnique({
    where: { code: 'PHY' },
  });

  if (!physics) {
    physics = await prisma.subject.create({
      data: {
        name: 'Physics',
        code: 'PHY',
        order: 1,
      },
    });
  }

  // 2. Find or create "Units and Measurements" chapter
  let chapter = await prisma.chapter.findFirst({
    where: {
      subjectId: physics.id,
      name: { in: ['Units and Measurements', 'Units & Measurements', 'Measurements'] },
    },
  });

  if (!chapter) {
    chapter = await prisma.chapter.create({
      data: {
        name: 'Units and Measurements',
        subjectId: physics.id,
      },
    });
  }
  console.log(`✓ Subject: ${physics.name}, Chapter: ${chapter.name}`);

  // 3. Define the 10 CET-level questions
  const questionsData = [
    {
      text: 'The dimensional formula of Planck\'s constant ($h$) is identical to that of:',
      options: [
        'Linear momentum',
        'Angular momentum',
        'Energy',
        'Power',
      ],
      correctAnswer: 1, // Angular momentum
      explanation: 'From de Broglie relation $\\lambda = \\frac{h}{p}$ or Bohr\'s quantization $L = \\frac{nh}{2\\pi}$, the dimensions of Planck\'s constant are $[h] = [M^1 L^2 T^{-1}]$, which is identical to angular momentum ($L = mvr \\implies [M^1 L^2 T^{-1}]$).',
      difficulty: Difficulty.MEDIUM,
      tags: ['Units & Dimensions', 'Planck Constant', 'CET Physics'],
    },
    {
      text: 'The dimensional formula for Universal Gravitational Constant ($G$) is:',
      options: [
        '$[M^{-1} L^3 T^{-2}]$',
        '$[M^1 L^3 T^{-2}]$',
        '$[M^{-1} L^2 T^{-2}]$',
        '$[M^{-2} L^3 T^{-1}]$',
      ],
      correctAnswer: 0, // [M^-1 L^3 T^-2]
      explanation: 'From Newton\'s law of gravitation $F = \\frac{G m_1 m_2}{r^2} \\implies G = \\frac{F r^2}{m_1 m_2}$. Substituting dimensions: $[G] = \\frac{[M L T^{-2}][L^2]}{[M^2]} = [M^{-1} L^3 T^{-2}]$.',
      difficulty: Difficulty.EASY,
      tags: ['Gravitational Constant', 'Dimensions', 'CET Physics'],
    },
    {
      text: 'The percentage error in the measurement of mass and velocity of a particle are $2\\%$ and $3\\%$ respectively. The maximum percentage error in the measurement of its kinetic energy is:',
      options: [
        '$5\\%$',
        '$8\\%$',
        '$11\\%$',
        '$12\\%$',
      ],
      correctAnswer: 1, // 8%
      explanation: 'Kinetic Energy $K = \\frac{1}{2} m v^2$. The fractional error is $\\frac{\\Delta K}{K} = \\frac{\\Delta m}{m} + 2 \\left(\\frac{\\Delta v}{v}\\right)$. Therefore, percentage error $= 2\\% + 2(3\\%) = 2\\% + 6\\% = 8\\%$.',
      difficulty: Difficulty.EASY,
      tags: ['Error Analysis', 'Kinetic Energy', 'CET Physics'],
    },
    {
      text: 'Which of the following pairs of physical quantities have the same dimensional formula?',
      options: [
        'Work and Torque',
        'Force and Pressure',
        'Momentum and Energy',
        'Impulse and Surface Tension',
      ],
      correctAnswer: 0, // Work and Torque
      explanation: 'Work = $\\text{Force} \\times \\text{Displacement} \\implies [M^1 L^2 T^{-2}]$. Torque = $\\text{Force} \\times \\text{Perpendicular distance} \\implies [M^1 L^2 T^{-2}]$. Both have the same dimensional formula $[M^1 L^2 T^{-2}]$.',
      difficulty: Difficulty.EASY,
      tags: ['Dimensional Homogeneity', 'CET Physics'],
    },
    {
      text: 'A physical quantity $P$ is related to four observables $A, B, C$ and $D$ as $P = \\frac{A^3 B^{1/2}}{C^4 D^{3/2}}$. The percentage errors in the measurement of $A, B, C$ and $D$ are $1\\%, 2\\%, 3\\%$ and $4\\%$ respectively. What is the percentage error in $P$?',
      options: [
        '$16\\%$',
        '$22\\%$',
        '$14\\%$',
        '$28\\%$',
      ],
      correctAnswer: 1, // 22%
      explanation: 'Maximum relative error: $\\frac{\\Delta P}{P} = 3\\frac{\\Delta A}{A} + \\frac{1}{2}\\frac{\\Delta B}{B} + 4\\frac{\\Delta C}{C} + \\frac{3}{2}\\frac{\\Delta D}{D}$. Total percentage error $= 3(1\\%) + \\frac{1}{2}(2\\%) + 4(3\\%) + \\frac{3}{2}(4\\%) = 3 + 1 + 12 + 6 = 22\\%$.',
      difficulty: Difficulty.MEDIUM,
      tags: ['Error Propagation', 'CET Physics'],
    },
    {
      text: 'The dimensional formula of the coefficient of viscosity ($\\eta$) is:',
      options: [
        '$[M^1 L^1 T^{-1}]$',
        '$[M^1 L^{-1} T^{-1}]$',
        '$[M^1 L^{-2} T^{-2}]$',
        '$[M^1 L^{-1} T^{-2}]$',
      ],
      correctAnswer: 1, // [M^1 L^-1 T^-1]
      explanation: 'From Stokes\' Law $F = 6\\pi \\eta r v \\implies [\\eta] = \\frac{[F]}{[r][v]} = \\frac{[M L T^{-2}]}{[L][L T^{-1}]} = [M^1 L^{-1} T^{-1}]$.',
      difficulty: Difficulty.MEDIUM,
      tags: ['Viscosity', 'Stokes Law', 'CET Physics'],
    },
    {
      text: 'The pitch of a screw gauge is $0.5\\text{ mm}$ and its circular scale contains $50$ equal divisions. What is the least count of the instrument?',
      options: [
        '$0.01\\text{ cm}$',
        '$0.001\\text{ cm}$',
        '$0.1\\text{ mm}$',
        '$0.001\\text{ mm}$',
      ],
      correctAnswer: 1, // 0.001 cm
      explanation: 'Least Count = $\\frac{\\text{Pitch}}{\\text{Number of circular scale divisions}} = \\frac{0.5\\text{ mm}}{50} = 0.01\\text{ mm} = 0.001\\text{ cm}$.',
      difficulty: Difficulty.EASY,
      tags: ['Vernier & Screw Gauge', 'Least Count', 'CET Physics'],
    },
    {
      text: 'The dimension of $\\frac{1}{\\sqrt{\\mu_0 \\varepsilon_0}}$, where $\\mu_0$ is magnetic permeability and $\\varepsilon_0$ is electric permittivity of free space, is:',
      options: [
        '$[M^0 L^1 T^{-1}]$',
        '$[M^0 L^{-1} T^1]$',
        '$[M^0 L^2 T^{-2}]$',
        '$[M^1 L^1 T^{-2}]$',
      ],
      correctAnswer: 0, // [M^0 L^1 T^-1] (velocity of light c)
      explanation: 'By Maxwell\'s equations, the speed of electromagnetic waves in vacuum is $c = \\frac{1}{\\sqrt{\\mu_0 \\varepsilon_0}}$. Therefore, its dimensions are identical to speed, which is $[M^0 L^1 T^{-1}]$.',
      difficulty: Difficulty.MEDIUM,
      tags: ['Permeability', 'Permittivity', 'Speed of Light', 'CET Physics'],
    },
    {
      text: 'The surface tension of a liquid is $70\\text{ dyne/cm}$. In SI units, its value is:',
      options: [
        '$70\\text{ N/m}$',
        '$7\\times 10^{-2}\\text{ N/m}$',
        '$7\\times 10^{-1}\\text{ N/m}$',
        '$7\\times 10^3\\text{ N/m}$',
      ],
      correctAnswer: 1, // 7 * 10^-2 N/m
      explanation: '$1\\text{ dyne} = 10^{-5}\\text{ N}$ and $1\\text{ cm} = 10^{-2}\\text{ m}$. Hence, $70\\text{ dyne/cm} = \\frac{70 \\times 10^{-5}\\text{ N}}{10^{-2}\\text{ m}} = 70 \\times 10^{-3}\\text{ N/m} = 0.07\\text{ N/m} = 7 \\times 10^{-2}\\text{ N/m}$.',
      difficulty: Difficulty.EASY,
      tags: ['Unit Conversion', 'Surface Tension', 'CET Physics'],
    },
    {
      text: 'If force ($F$), length ($L$), and time ($T$) are chosen as fundamental units, the dimensional formula for mass is:',
      options: [
        '$[F^1 L^{-1} T^2]$',
        '$[F^1 L^1 T^{-2}]$',
        '$[F^1 L^{-2} T^1]$',
        '$[F^1 L^2 T^{-1}]$',
      ],
      correctAnswer: 0, // [F^1 L^-1 T^2]
      explanation: 'Since $\\text{Force} = \\text{Mass} \\times \\text{Acceleration} = m \\times \\frac{L}{T^2} \\implies m = F L^{-1} T^2$. Thus, $[m] = [F^1 L^{-1} T^2]$.',
      difficulty: Difficulty.MEDIUM,
      tags: ['Fundamental Units', 'Dimensions', 'CET Physics'],
    },
  ];

  // 4. Create Questions in Database
  const createdQuestions = [];
  for (const q of questionsData) {
    const question = await prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: 1, // Standard MHT-CET physics weight
        negativeMarks: 0, // No negative marking in CET
        difficulty: q.difficulty,
        explanation: q.explanation,
        tags: q.tags,
        subjectId: physics.id,
        chapterId: chapter.id,
      },
    });
    createdQuestions.push(question);
  }
  console.log(`✓ Created ${createdQuestions.length} questions.`);

  // 5. Create the Exam
  const exam = await prisma.exam.create({
    data: {
      title: 'MHT-CET Physics: Units and Measurements',
      description: 'Standard 10-question CET-level practice test on Units, Dimensions, and Error Analysis. (10 Marks, 15 Minutes).',
      duration: 15,
      totalMarks: 10,
      isPublished: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      allowReview: true,
      showResultImmediately: true,
      examEnvironment: ExamEnvironment.FULLSCREEN_BROWSER,
    },
  });

  // 6. Create the Exam Section
  const section = await prisma.examSection.create({
    data: {
      examId: exam.id,
      subjectId: physics.id,
      name: 'Units and Measurements',
      order: 0,
      questionCount: 10,
      marksPerQuestion: 1,
      negativeMarksPerQuestion: 0,
      allowSectionJump: true,
    },
  });

  // 7. Link the 10 questions to the exam section
  for (let i = 0; i < createdQuestions.length; i++) {
    await prisma.examQuestion.create({
      data: {
        examId: exam.id,
        sectionId: section.id,
        questionId: createdQuestions[i].id,
        order: i,
      },
    });
  }

  console.log(`✓ Created Exam "${exam.title}" (ID: ${exam.id}) with 10 questions.`);
  console.log('✓ Exam NOT assigned to any student as requested (ready for manual assignment).');
}

createUnitsTest()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error('Error creating exam:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
