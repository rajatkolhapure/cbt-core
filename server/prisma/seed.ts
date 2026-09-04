/**
 * Phase 8: Comprehensive Seed Data for CBT Platform
 * 
 * Seeds:
 * - 1 Admin user, 3 Student users
 * - 3 Subjects (Physics, Chemistry, Mathematics) with chapters
 * - 50+ realistic questions with KaTeX math formulas
 * - 2 Exams (MHT-CET Mock & JEE Main Practice) with sections
 * - Student assignments
 * 
 * Run: npx tsx prisma/seed.ts
 */

import { PrismaClient, QuestionType, Difficulty, Role, ExamEnvironment } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CBT Platform Seed...\n');

  // ─── 1. CLEAN EXISTING DATA ─────────────────────────────────────────
  console.log('🧹 Cleaning existing data...');
  await prisma.otpToken.deleteMany();
  await prisma.hardwareProfile.deleteMany();
  await prisma.integrityEvent.deleteMany();
  await prisma.examSession.deleteMany();
  await prisma.answer.deleteMany();
  await prisma.attempt.deleteMany();
  await prisma.examAssignment.deleteMany();
  await prisma.examQuestion.deleteMany();
  await prisma.examSection.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.question.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();
  console.log('  ✓ Database cleaned\n');

  // ─── 2. CREATE USERS ────────────────────────────────────────────────
  console.log('👤 Creating users...');
  const passwordHash = await bcrypt.hash('admin123', 10);
  const studentHash = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@cbt.com',
      password: passwordHash,
      name: 'Rajat Kolhapure',
      role: Role.ADMIN,
      candidateId: 'ADM-001',
    },
  });
  console.log(`  ✓ Admin: ${admin.name} (${admin.email})`);

  const student1 = await prisma.user.create({
    data: {
      email: 'student@cbt.com',
      password: studentHash,
      name: 'Priya Sharma',
      role: Role.STUDENT,
      candidateId: 'CET-2026-0001',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'parth@cbt.com',
      password: studentHash,
      name: 'Parth Jagdale',
      role: Role.STUDENT,
      candidateId: 'CET-2026-0002',
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: 'rahul@cbt.com',
      password: studentHash,
      name: 'Rahul Mehta',
      role: Role.STUDENT,
      candidateId: 'CET-2026-0003',
    },
  });
  console.log(`  ✓ Students: ${student1.name} (${student1.email}), ${student2.name} (${student2.email}), ${student3.name} (${student3.email})\n`);

  // ─── 3. CREATE SUBJECTS & CHAPTERS ──────────────────────────────────
  console.log('📚 Creating subjects and chapters...');

  const physics = await prisma.subject.create({
    data: { name: 'Physics', code: 'PHY', order: 1 },
  });
  const chemistry = await prisma.subject.create({
    data: { name: 'Chemistry', code: 'CHEM', order: 2 },
  });
  const mathematics = await prisma.subject.create({
    data: { name: 'Mathematics', code: 'MATH', order: 3 },
  });

  // Physics chapters
  const phyMechanics = await prisma.chapter.create({
    data: { name: 'Mechanics', subjectId: physics.id },
  });
  const phyThermo = await prisma.chapter.create({
    data: { name: 'Thermodynamics', subjectId: physics.id },
  });
  const phyElectro = await prisma.chapter.create({
    data: { name: 'Electrostatics', subjectId: physics.id },
  });
  const phyOptics = await prisma.chapter.create({
    data: { name: 'Optics', subjectId: physics.id },
  });
  const phyModern = await prisma.chapter.create({
    data: { name: 'Modern Physics', subjectId: physics.id },
  });

  // Chemistry chapters
  const chemOrganic = await prisma.chapter.create({
    data: { name: 'Organic Chemistry', subjectId: chemistry.id },
  });
  const chemInorganic = await prisma.chapter.create({
    data: { name: 'Inorganic Chemistry', subjectId: chemistry.id },
  });
  const chemPhysical = await prisma.chapter.create({
    data: { name: 'Physical Chemistry', subjectId: chemistry.id },
  });
  const chemEquilibrium = await prisma.chapter.create({
    data: { name: 'Chemical Equilibrium', subjectId: chemistry.id },
  });

  // Mathematics chapters
  const mathCalculus = await prisma.chapter.create({
    data: { name: 'Calculus', subjectId: mathematics.id },
  });
  const mathAlgebra = await prisma.chapter.create({
    data: { name: 'Algebra', subjectId: mathematics.id },
  });
  const mathCoordinate = await prisma.chapter.create({
    data: { name: 'Coordinate Geometry', subjectId: mathematics.id },
  });
  const mathTrigonometry = await prisma.chapter.create({
    data: { name: 'Trigonometry', subjectId: mathematics.id },
  });
  const mathProbability = await prisma.chapter.create({
    data: { name: 'Probability & Statistics', subjectId: mathematics.id },
  });

  console.log('  ✓ 3 subjects, 14 chapters created\n');

  // ─── 4. CREATE QUESTIONS ────────────────────────────────────────────
  console.log('📝 Creating questions...');

  // ────── PHYSICS QUESTIONS (20) ──────────────────────────────────────

  const physicsQuestions = await Promise.all([
    // Mechanics (5)
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'A ball is thrown vertically upward with velocity $u$. The maximum height reached by the ball is:',
        options: ['$\\frac{u^2}{2g}$', '$\\frac{u^2}{g}$', '$\\frac{2u^2}{g}$', '$\\frac{u}{2g}$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'At maximum height, $v = 0$. Using $v^2 = u^2 - 2gh$, we get $h = \\frac{u^2}{2g}$.',
        subjectId: physics.id, chapterId: phyMechanics.id,
        tags: ['kinematics', 'vertical-motion'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'A block of mass $m$ is placed on a smooth inclined plane of angle $\\theta$. The acceleration of the block along the incline is:',
        options: ['$g \\sin\\theta$', '$g \\cos\\theta$', '$g \\tan\\theta$', '$g$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Component of gravitational acceleration along the incline: $a = g\\sin\\theta$.',
        subjectId: physics.id, chapterId: phyMechanics.id,
        tags: ['inclined-plane', 'newton-laws'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'Two blocks of masses $m_1 = 3\\,\\text{kg}$ and $m_2 = 5\\,\\text{kg}$ are connected by a light string over a frictionless pulley. The acceleration of the system is $(g = 10\\,\\text{m/s}^2)$:',
        options: ['$2.5\\,\\text{m/s}^2$', '$3.75\\,\\text{m/s}^2$', '$5\\,\\text{m/s}^2$', '$1.25\\,\\text{m/s}^2$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.MEDIUM,
        explanation: '$a = \\frac{(m_2 - m_1)g}{m_1 + m_2} = \\frac{(5-3) \\times 10}{8} = 2.5\\,\\text{m/s}^2$.',
        subjectId: physics.id, chapterId: phyMechanics.id,
        tags: ['atwood-machine', 'pulley'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The moment of inertia of a solid sphere of mass $M$ and radius $R$ about its diameter is:',
        options: ['$\\frac{2}{5}MR^2$', '$\\frac{2}{3}MR^2$', '$\\frac{1}{2}MR^2$', '$MR^2$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Standard result: moment of inertia of solid sphere about diameter $= \\frac{2}{5}MR^2$.',
        subjectId: physics.id, chapterId: phyMechanics.id,
        tags: ['rotational-motion', 'moment-of-inertia'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.NUMERICAL,
        text: 'A projectile is launched at $60°$ to the horizontal with initial speed $20\\,\\text{m/s}$. Find the range of the projectile in metres. $(g = 10\\,\\text{m/s}^2)$',
        options: null,
        correctAnswer: 34.64,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.MEDIUM,
        explanation: '$R = \\frac{u^2 \\sin 2\\theta}{g} = \\frac{400 \\times \\sin 120°}{10} = \\frac{400 \\times 0.866}{10} = 34.64\\,\\text{m}$.',
        subjectId: physics.id, chapterId: phyMechanics.id,
        tags: ['projectile-motion', 'numerical'],
      },
    }),
    // Thermodynamics (4)
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'For an ideal gas undergoing an isothermal process, which of the following is true?',
        options: ['$\\Delta U = 0$ and $Q = W$', '$\\Delta U = Q$ and $W = 0$', '$Q = 0$ and $\\Delta U = -W$', '$Q = W = \\Delta U$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'In an isothermal process for an ideal gas, temperature is constant, hence $\\Delta U = 0$ and by first law $Q = W$.',
        subjectId: physics.id, chapterId: phyThermo.id,
        tags: ['first-law', 'isothermal'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The efficiency of a Carnot engine operating between temperatures $T_H = 500\\,\\text{K}$ and $T_C = 300\\,\\text{K}$ is:',
        options: ['$40\\%$', '$60\\%$', '$80\\%$', '$20\\%$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: '$\\eta = 1 - \\frac{T_C}{T_H} = 1 - \\frac{300}{500} = 0.4 = 40\\%$.',
        subjectId: physics.id, chapterId: phyThermo.id,
        tags: ['carnot-engine', 'efficiency'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The ratio $C_p / C_v$ for a monoatomic ideal gas is:',
        options: ['$5/3$', '$7/5$', '$4/3$', '$3/2$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'For monoatomic gas: $f = 3$, so $\\gamma = 1 + \\frac{2}{f} = \\frac{5}{3}$.',
        subjectId: physics.id, chapterId: phyThermo.id,
        tags: ['specific-heat', 'monoatomic'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.NUMERICAL,
        text: 'An ideal gas at $27°\\text{C}$ is heated at constant pressure until its volume doubles. Find the final temperature in $°\\text{C}$.',
        options: null,
        correctAnswer: 327,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.MEDIUM,
        explanation: '$T_1 = 300\\,\\text{K}$. At constant pressure $\\frac{V_1}{T_1} = \\frac{V_2}{T_2}$, so $T_2 = 600\\,\\text{K} = 327°\\text{C}$.',
        subjectId: physics.id, chapterId: phyThermo.id,
        tags: ['charles-law', 'numerical'],
      },
    }),
    // Electrostatics (4)
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The electric field at a distance $r$ from a point charge $q$ in vacuum is:',
        options: [
          '$\\frac{1}{4\\pi\\varepsilon_0} \\cdot \\frac{q}{r^2}$',
          '$\\frac{1}{4\\pi\\varepsilon_0} \\cdot \\frac{q}{r}$',
          '$\\frac{1}{4\\pi\\varepsilon_0} \\cdot \\frac{q^2}{r^2}$',
          '$\\frac{1}{4\\pi\\varepsilon_0} \\cdot \\frac{q}{r^3}$',
        ],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Coulomb\'s law gives $E = \\frac{1}{4\\pi\\varepsilon_0} \\cdot \\frac{q}{r^2}$.',
        subjectId: physics.id, chapterId: phyElectro.id,
        tags: ['coulomb-law', 'electric-field'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'Two capacitors $C_1 = 4\\,\\mu\\text{F}$ and $C_2 = 6\\,\\mu\\text{F}$ are connected in series. The equivalent capacitance is:',
        options: ['$2.4\\,\\mu\\text{F}$', '$10\\,\\mu\\text{F}$', '$5\\,\\mu\\text{F}$', '$1.2\\,\\mu\\text{F}$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: '$\\frac{1}{C_{eq}} = \\frac{1}{4} + \\frac{1}{6} = \\frac{5}{12}$, so $C_{eq} = 2.4\\,\\mu\\text{F}$.',
        subjectId: physics.id, chapterId: phyElectro.id,
        tags: ['capacitance', 'series'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The electric potential at the centre of a uniformly charged spherical shell of radius $R$ and total charge $Q$ is:',
        options: [
          '$\\frac{Q}{4\\pi\\varepsilon_0 R}$',
          '$0$',
          '$\\frac{Q}{4\\pi\\varepsilon_0 R^2}$',
          '$\\frac{Q}{2\\pi\\varepsilon_0 R}$',
        ],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.MEDIUM,
        explanation: 'Inside a shell the field is zero, so the potential is constant and equals the surface potential $V = \\frac{Q}{4\\pi\\varepsilon_0 R}$.',
        subjectId: physics.id, chapterId: phyElectro.id,
        tags: ['shell', 'potential'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.NUMERICAL,
        text: 'A parallel plate capacitor with plate area $A = 0.01\\,\\text{m}^2$ and separation $d = 2\\,\\text{mm}$ is connected to a $100\\,\\text{V}$ battery. Find the charge on each plate in $\\text{nC}$. $(\\varepsilon_0 = 8.85 \\times 10^{-12}\\,\\text{F/m})$',
        options: null,
        correctAnswer: 4.43,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.HARD,
        explanation: '$C = \\varepsilon_0 A/d = 8.85 \\times 10^{-12} \\times 0.01 / 0.002 = 44.25\\,\\text{pF}$. $Q = CV = 44.25 \\times 10^{-12} \\times 100 = 4.425\\,\\text{nC} \\approx 4.43\\,\\text{nC}$.',
        subjectId: physics.id, chapterId: phyElectro.id,
        tags: ['parallel-plate', 'numerical'],
      },
    }),
    // Optics (4)
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'In Young\'s double slit experiment, the fringe width $\\beta$ is given by:',
        options: [
          '$\\frac{\\lambda D}{d}$',
          '$\\frac{\\lambda d}{D}$',
          '$\\frac{d D}{\\lambda}$',
          '$\\frac{d}{\\lambda D}$',
        ],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Fringe width $\\beta = \\frac{\\lambda D}{d}$ where $\\lambda$ = wavelength, $D$ = screen distance, $d$ = slit separation.',
        subjectId: physics.id, chapterId: phyOptics.id,
        tags: ['young-double-slit', 'interference'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'A convex lens of focal length $f$ forms a real image at distance $2f$ from the lens. The object distance is:',
        options: ['$2f$', '$f$', '$3f$', '$4f$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Using $\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f}$: $\\frac{1}{2f} - \\frac{1}{u} = \\frac{1}{f}$, gives $u = -2f$.',
        subjectId: physics.id, chapterId: phyOptics.id,
        tags: ['lens', 'image-formation'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The phenomenon of splitting of white light into its constituent colours on passing through a prism is called:',
        options: ['Dispersion', 'Diffraction', 'Polarisation', 'Scattering'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Dispersion is the separation of white light into spectral colours by a prism due to wavelength-dependent refractive index.',
        subjectId: physics.id, chapterId: phyOptics.id,
        tags: ['dispersion', 'prism'],
      },
    }),
    // Modern Physics (3)
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The de Broglie wavelength of a particle with momentum $p$ is:',
        options: ['$\\frac{h}{p}$', '$\\frac{p}{h}$', '$hp$', '$\\frac{h}{p^2}$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'de Broglie relation: $\\lambda = \\frac{h}{p}$ where $h$ is Planck\'s constant.',
        subjectId: physics.id, chapterId: phyModern.id,
        tags: ['de-broglie', 'wave-particle'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'In the photoelectric effect, the maximum kinetic energy of emitted electrons is:',
        options: [
          '$h\\nu - \\phi$',
          '$h\\nu + \\phi$',
          '$\\phi - h\\nu$',
          '$\\frac{h\\nu}{\\phi}$',
        ],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Einstein\'s photoelectric equation: $KE_{\\max} = h\\nu - \\phi$ where $\\phi$ is the work function.',
        subjectId: physics.id, chapterId: phyModern.id,
        tags: ['photoelectric', 'einstein'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.NUMERICAL,
        text: 'The binding energy per nucleon of ${}^{56}_{26}\\text{Fe}$ is $8.8\\,\\text{MeV}$. What is the total binding energy of ${}^{56}_{26}\\text{Fe}$ in MeV?',
        options: null,
        correctAnswer: 492.8,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: 'Total BE $= 56 \\times 8.8 = 492.8\\,\\text{MeV}$.',
        subjectId: physics.id, chapterId: phyModern.id,
        tags: ['nuclear-physics', 'binding-energy'],
      },
    }),
  ]);
  console.log(`  ✓ ${physicsQuestions.length} Physics questions created`);

  // ────── CHEMISTRY QUESTIONS (18) ────────────────────────────────────

  const chemistryQuestions = await Promise.all([
    // Organic (5)
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The IUPAC name of $\\text{CH}_3\\text{CH}(\\text{OH})\\text{CH}_2\\text{CH}_3$ is:',
        options: ['Butan-2-ol', 'Butan-1-ol', '2-Methylpropan-1-ol', 'Propan-2-ol'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'The longest carbon chain is 4C. The $\\text{OH}$ group is on C-2, so the name is butan-2-ol.',
        subjectId: chemistry.id, chapterId: chemOrganic.id,
        tags: ['nomenclature', 'alcohols'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'Which reagent is used for the conversion of an aldehyde to a carboxylic acid?',
        options: ['$\\text{KMnO}_4$ (alkaline)', '$\\text{NaBH}_4$', '$\\text{LiAlH}_4$', '$\\text{Zn-Hg/HCl}$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.MEDIUM,
        explanation: 'Alkaline $\\text{KMnO}_4$ is a strong oxidizing agent that converts $\\text{–CHO}$ to $\\text{–COOH}$.',
        subjectId: chemistry.id, chapterId: chemOrganic.id,
        tags: ['oxidation', 'aldehydes'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'Markovnikov\'s rule applies to the addition of $\\text{HBr}$ to:',
        options: ['Propene', 'Ethene', 'Ethyne', 'Benzene'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.MEDIUM,
        explanation: 'Markovnikov rule applies to unsymmetrical alkenes like propene. With ethene the rule is trivially satisfied.',
        subjectId: chemistry.id, chapterId: chemOrganic.id,
        tags: ['markovnikov', 'addition-reaction'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The hybridisation of carbon atoms in benzene is:',
        options: ['$sp^2$', '$sp^3$', '$sp$', '$sp^3d$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'In benzene, each carbon forms 3 sigma bonds (2 C–C + 1 C–H), giving $sp^2$ hybridisation.',
        subjectId: chemistry.id, chapterId: chemOrganic.id,
        tags: ['hybridisation', 'benzene'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.MULTIPLE_CHOICE,
        text: 'Which of the following are characteristics of $\\text{SN2}$ reactions?',
        options: ['Backside attack', 'Inversion of configuration', 'First-order kinetics', 'Concerted mechanism'],
        correctAnswer: [0, 1, 3],
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.HARD,
        explanation: '$\\text{SN2}$: bimolecular, backside attack causing Walden inversion, concerted (one step). Kinetics are second-order, not first-order.',
        subjectId: chemistry.id, chapterId: chemOrganic.id,
        tags: ['sn2', 'mechanism'],
      },
    }),
    // Inorganic (5)
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The geometry of $\\text{SF}_6$ molecule is:',
        options: ['Octahedral', 'Tetrahedral', 'Trigonal bipyramidal', 'Square planar'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: '$\\text{SF}_6$ has 6 bond pairs around sulfur with $sp^3d^2$ hybridisation → octahedral.',
        subjectId: chemistry.id, chapterId: chemInorganic.id,
        tags: ['molecular-geometry', 'vsepr'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'Which of the following elements has the highest electronegativity?',
        options: ['Fluorine', 'Oxygen', 'Nitrogen', 'Chlorine'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Fluorine has the highest electronegativity (3.98 on the Pauling scale) among all elements.',
        subjectId: chemistry.id, chapterId: chemInorganic.id,
        tags: ['electronegativity', 'periodic-table'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The coordination number of $\\text{Fe}$ in $[\\text{Fe}(\\text{CN})_6]^{3-}$ is:',
        options: ['6', '4', '3', '8'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Six $\\text{CN}^-$ ligands coordinate with $\\text{Fe}^{3+}$, so coordination number is 6.',
        subjectId: chemistry.id, chapterId: chemInorganic.id,
        tags: ['coordination-compounds', 'coordination-number'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The ore of aluminium is:',
        options: ['Bauxite', 'Haematite', 'Galena', 'Calamine'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Bauxite ($\\text{Al}_2\\text{O}_3 \\cdot 2\\text{H}_2\\text{O}$) is the principal ore of aluminium.',
        subjectId: chemistry.id, chapterId: chemInorganic.id,
        tags: ['metallurgy', 'ores'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.NUMERICAL,
        text: 'The spin-only magnetic moment (in BM) of $\\text{Fe}^{3+}$ ion (atomic no. 26) in the high spin state is (round to 1 decimal):',
        options: null,
        correctAnswer: 5.9,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.HARD,
        explanation: '$\\text{Fe}^{3+}$: $[\\text{Ar}] 3d^5$. Five unpaired electrons. $\\mu = \\sqrt{n(n+2)} = \\sqrt{35} \\approx 5.9\\,\\text{BM}$.',
        subjectId: chemistry.id, chapterId: chemInorganic.id,
        tags: ['magnetic-moment', 'd-block'],
      },
    }),
    // Physical Chemistry (5)
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'For a first-order reaction, the half-life $t_{1/2}$ is:',
        options: [
          '$\\frac{0.693}{k}$',
          '$\\frac{1}{k[A]_0}$',
          '$\\frac{[A]_0}{2k}$',
          '$\\frac{0.693}{k[A]_0}$',
        ],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'For first-order reactions: $t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{k}$, independent of initial concentration.',
        subjectId: chemistry.id, chapterId: chemPhysical.id,
        tags: ['chemical-kinetics', 'half-life'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The pH of a $0.01\\,\\text{M}$ solution of $\\text{HCl}$ is:',
        options: ['$2$', '$1$', '$3$', '$0.01$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: '$\\text{HCl}$ is a strong acid. $[\\text{H}^+] = 0.01\\,\\text{M}$. $\\text{pH} = -\\log(0.01) = 2$.',
        subjectId: chemistry.id, chapterId: chemPhysical.id,
        tags: ['ph', 'strong-acid'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'According to Raoult\'s law, the relative lowering of vapour pressure is equal to:',
        options: ['Mole fraction of solute', 'Mole fraction of solvent', 'Molality of solute', 'Molarity of solute'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.MEDIUM,
        explanation: 'Raoult\'s law: $\\frac{p^\\circ - p}{p^\\circ} = x_{\\text{solute}}$ for non-volatile solutes.',
        subjectId: chemistry.id, chapterId: chemPhysical.id,
        tags: ['raoult-law', 'colligative'],
      },
    }),
    // Chemical Equilibrium (3)
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'For the reaction $\\text{N}_2 + 3\\text{H}_2 \\rightleftharpoons 2\\text{NH}_3$, the expression for $K_p$ is:',
        options: [
          '$\\frac{p_{\\text{NH}_3}^2}{p_{\\text{N}_2} \\cdot p_{\\text{H}_2}^3}$',
          '$\\frac{p_{\\text{N}_2} \\cdot p_{\\text{H}_2}^3}{p_{\\text{NH}_3}^2}$',
          '$\\frac{p_{\\text{NH}_3}}{p_{\\text{N}_2} \\cdot p_{\\text{H}_2}}$',
          '$\\frac{2 p_{\\text{NH}_3}}{p_{\\text{N}_2} + 3 p_{\\text{H}_2}}$',
        ],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: '$K_p = \\frac{\\text{(products)}^{\\text{coeff}}}{\\text{(reactants)}^{\\text{coeff}}} = \\frac{p_{\\text{NH}_3}^2}{p_{\\text{N}_2} \\cdot p_{\\text{H}_2}^3}$.',
        subjectId: chemistry.id, chapterId: chemEquilibrium.id,
        tags: ['equilibrium-constant', 'kp'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'Le Chatelier\'s principle predicts that increasing pressure on the reaction $\\text{N}_2 + 3\\text{H}_2 \\rightleftharpoons 2\\text{NH}_3$ will:',
        options: ['Shift equilibrium towards products', 'Shift equilibrium towards reactants', 'Have no effect', 'Increase the equilibrium constant'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.MEDIUM,
        explanation: 'Reactants have 4 moles of gas, products have 2. Increasing pressure shifts equilibrium toward fewer moles → products.',
        subjectId: chemistry.id, chapterId: chemEquilibrium.id,
        tags: ['le-chatelier', 'pressure'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.NUMERICAL,
        text: 'The solubility product $K_{sp}$ of $\\text{AgCl}$ is $1.8 \\times 10^{-10}$. Find the molar solubility of $\\text{AgCl}$ in mol/L (express answer as $a \\times 10^{-5}$, give only the value of $a$ rounded to 2 decimal places):',
        options: null,
        correctAnswer: 1.34,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.HARD,
        explanation: '$\\text{AgCl} \\rightleftharpoons \\text{Ag}^+ + \\text{Cl}^-$. If solubility $= s$, then $K_{sp} = s^2$. $s = \\sqrt{1.8 \\times 10^{-10}} = 1.342 \\times 10^{-5}$.',
        subjectId: chemistry.id, chapterId: chemEquilibrium.id,
        tags: ['solubility-product', 'numerical'],
      },
    }),
  ]);
  console.log(`  ✓ ${chemistryQuestions.length} Chemistry questions created`);

  // ────── MATHEMATICS QUESTIONS (17) ──────────────────────────────────

  const mathQuestions = await Promise.all([
    // Calculus (5)
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The derivative of $\\sin^2 x$ with respect to $x$ is:',
        options: ['$\\sin 2x$', '$2\\sin x$', '$\\cos^2 x$', '$2\\cos 2x$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: '$\\frac{d}{dx}(\\sin^2 x) = 2\\sin x \\cdot \\cos x = \\sin 2x$ using the chain rule.',
        subjectId: mathematics.id, chapterId: mathCalculus.id,
        tags: ['differentiation', 'chain-rule'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: '$\\displaystyle\\int_0^{\\pi/2} \\sin x\\, dx$ equals:',
        options: ['$1$', '$0$', '$\\frac{\\pi}{2}$', '$2$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: '$\\int_0^{\\pi/2} \\sin x\\, dx = [-\\cos x]_0^{\\pi/2} = -\\cos(\\pi/2) + \\cos(0) = 0 + 1 = 1$.',
        subjectId: mathematics.id, chapterId: mathCalculus.id,
        tags: ['definite-integral', 'trigonometric'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The area enclosed between the curve $y = x^2$ and the line $y = 4$ is:',
        options: ['$\\frac{32}{3}$', '$\\frac{16}{3}$', '$8$', '$\\frac{64}{3}$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.MEDIUM,
        explanation: 'Intersection: $x^2 = 4 \\Rightarrow x = \\pm 2$. Area $= \\int_{-2}^{2}(4 - x^2)\\, dx = 2 \\int_0^2(4-x^2)\\,dx = 2[4x - x^3/3]_0^2 = 2(8 - 8/3) = 32/3$.',
        subjectId: mathematics.id, chapterId: mathCalculus.id,
        tags: ['area-under-curve', 'integration'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The value of $\\displaystyle\\lim_{x \\to 0} \\frac{\\sin x}{x}$ is:',
        options: ['$1$', '$0$', '$\\infty$', 'Does not exist'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'This is a standard limit: $\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1$.',
        subjectId: mathematics.id, chapterId: mathCalculus.id,
        tags: ['limits', 'standard-limit'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.NUMERICAL,
        text: 'If $f(x) = x^3 - 6x^2 + 9x + 2$, find the value of $f\'(1)$.',
        options: null,
        correctAnswer: 0,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.MEDIUM,
        explanation: '$f\'(x) = 3x^2 - 12x + 9$. $f\'(1) = 3 - 12 + 9 = 0$.',
        subjectId: mathematics.id, chapterId: mathCalculus.id,
        tags: ['derivative', 'numerical'],
      },
    }),
    // Algebra (4)
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The sum of the roots of the equation $2x^2 - 5x + 3 = 0$ is:',
        options: ['$\\frac{5}{2}$', '$\\frac{3}{2}$', '$5$', '$3$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'By Vieta\'s formulas, sum of roots $= -b/a = 5/2$.',
        subjectId: mathematics.id, chapterId: mathAlgebra.id,
        tags: ['quadratic', 'vieta-formulas'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'If $A = \\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}$, then $\\det(A) =$',
        options: ['$-2$', '$2$', '$10$', '$-10$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: '$\\det(A) = (1)(4) - (2)(3) = 4 - 6 = -2$.',
        subjectId: mathematics.id, chapterId: mathAlgebra.id,
        tags: ['matrices', 'determinant'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The number of terms in the expansion of $(a + b)^{10}$ is:',
        options: ['$11$', '$10$', '$20$', '$5$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Binomial expansion of $(a+b)^n$ has $n+1$ terms. So $(a+b)^{10}$ has 11 terms.',
        subjectId: mathematics.id, chapterId: mathAlgebra.id,
        tags: ['binomial-theorem', 'expansion'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.NUMERICAL,
        text: 'Find the value of $\\displaystyle\\sum_{k=1}^{10} k^2$.',
        options: null,
        correctAnswer: 385,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.EASY,
        explanation: '$\\sum_{k=1}^{n} k^2 = \\frac{n(n+1)(2n+1)}{6} = \\frac{10 \\times 11 \\times 21}{6} = 385$.',
        subjectId: mathematics.id, chapterId: mathAlgebra.id,
        tags: ['summation', 'series'],
      },
    }),
    // Coordinate Geometry (3)
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The equation of a circle with centre $(2, -3)$ and radius $5$ is:',
        options: [
          '$(x-2)^2 + (y+3)^2 = 25$',
          '$(x+2)^2 + (y-3)^2 = 25$',
          '$(x-2)^2 + (y-3)^2 = 5$',
          '$(x+2)^2 + (y+3)^2 = 25$',
        ],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Standard form: $(x-h)^2 + (y-k)^2 = r^2$ with $(h,k)=(2,-3)$ and $r=5$.',
        subjectId: mathematics.id, chapterId: mathCoordinate.id,
        tags: ['circle', 'standard-form'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The distance between the points $(1, 2, 3)$ and $(4, 6, 3)$ is:',
        options: ['$5$', '$\\sqrt{34}$', '$7$', '$\\sqrt{50}$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: '$d = \\sqrt{(4-1)^2 + (6-2)^2 + (3-3)^2} = \\sqrt{9 + 16 + 0} = 5$.',
        subjectId: mathematics.id, chapterId: mathCoordinate.id,
        tags: ['distance-formula', '3d-geometry'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The slope of the line $3x + 4y - 12 = 0$ is:',
        options: ['$-\\frac{3}{4}$', '$\\frac{3}{4}$', '$-\\frac{4}{3}$', '$3$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Rearranging to $y = mx + c$: $y = -\\frac{3}{4}x + 3$. Slope $m = -\\frac{3}{4}$.',
        subjectId: mathematics.id, chapterId: mathCoordinate.id,
        tags: ['straight-line', 'slope'],
      },
    }),
    // Trigonometry (3)
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The general solution of $\\sin x = \\frac{1}{2}$ is:',
        options: [
          '$x = n\\pi + (-1)^n \\frac{\\pi}{6},\\; n \\in \\mathbb{Z}$',
          '$x = 2n\\pi \\pm \\frac{\\pi}{6},\\; n \\in \\mathbb{Z}$',
          '$x = n\\pi + \\frac{\\pi}{6},\\; n \\in \\mathbb{Z}$',
          '$x = \\frac{\\pi}{6}$',
        ],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.MEDIUM,
        explanation: 'General solution of $\\sin x = \\sin \\alpha$ is $x = n\\pi + (-1)^n \\alpha$. Here $\\alpha = \\pi/6$.',
        subjectId: mathematics.id, chapterId: mathTrigonometry.id,
        tags: ['general-solution', 'trigonometric-equations'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'The value of $\\cos 60° + \\sin 30°$ is:',
        options: ['$1$', '$\\frac{\\sqrt{3}}{2}$', '$\\frac{1}{2}$', '$\\frac{\\sqrt{3} + 1}{2}$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: '$\\cos 60° = \\frac{1}{2}$ and $\\sin 30° = \\frac{1}{2}$. Sum $= 1$.',
        subjectId: mathematics.id, chapterId: mathTrigonometry.id,
        tags: ['standard-values', 'trigonometry'],
      },
    }),
    // Probability (2)
    prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: 'Two dice are thrown simultaneously. The probability of getting a sum of $7$ is:',
        options: ['$\\frac{1}{6}$', '$\\frac{1}{12}$', '$\\frac{7}{36}$', '$\\frac{5}{36}$'],
        correctAnswer: 0,
        marks: 4, negativeMarks: 1,
        difficulty: Difficulty.EASY,
        explanation: 'Favourable outcomes: $(1,6),(2,5),(3,4),(4,3),(5,2),(6,1) = 6$. Total $= 36$. $P = 6/36 = 1/6$.',
        subjectId: mathematics.id, chapterId: mathProbability.id,
        tags: ['probability', 'dice'],
      },
    }),
    prisma.question.create({
      data: {
        type: QuestionType.NUMERICAL,
        text: 'In a binomial distribution with $n = 6$ and $p = \\frac{1}{3}$, find $P(X = 2)$ rounded to 4 decimal places.',
        options: null,
        correctAnswer: 0.3292,
        marks: 4, negativeMarks: 0,
        difficulty: Difficulty.HARD,
        explanation: '$P(X=2) = \\binom{6}{2}\\left(\\frac{1}{3}\\right)^2\\left(\\frac{2}{3}\\right)^4 = 15 \\times \\frac{1}{9} \\times \\frac{16}{81} = \\frac{240}{729} \\approx 0.3292$.',
        subjectId: mathematics.id, chapterId: mathProbability.id,
        tags: ['binomial-distribution', 'numerical'],
      },
    }),
  ]);
  console.log(`  ✓ ${mathQuestions.length} Mathematics questions created`);

  const allQuestions = [...physicsQuestions, ...chemistryQuestions, ...mathQuestions];
  console.log(`  ✓ Total: ${allQuestions.length} questions seeded\n`);

  // ─── 5. CREATE EXAMS ────────────────────────────────────────────────
  console.log('📋 Creating examinations...');

  // Exam 1: MHT-CET Mock Test (15 questions per section = 45 total)
  const cetExam = await prisma.exam.create({
    data: {
      title: 'MHT-CET 2026 Mock Test — Paper I (PCM)',
      description: 'Full-length mock test simulating the MHT-CET PCM examination pattern with 3 sections: Physics, Chemistry, and Mathematics. Each section contains 15 questions with standard marking scheme.',
      duration: 90,
      totalMarks: 180,
      isPublished: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      allowReview: true,
      showResultImmediately: true,
      examEnvironment: ExamEnvironment.FULLSCREEN_BROWSER,
    },
  });

  // Create sections for CET exam
  const cetPhySection = await prisma.examSection.create({
    data: {
      examId: cetExam.id,
      subjectId: physics.id,
      name: 'Section A — Physics',
      order: 0,
      questionCount: physicsQuestions.length,
      marksPerQuestion: 4,
      negativeMarksPerQuestion: 1,
      allowSectionJump: true,
    },
  });

  const cetChemSection = await prisma.examSection.create({
    data: {
      examId: cetExam.id,
      subjectId: chemistry.id,
      name: 'Section B — Chemistry',
      order: 1,
      questionCount: chemistryQuestions.length,
      marksPerQuestion: 4,
      negativeMarksPerQuestion: 1,
      allowSectionJump: true,
    },
  });

  const cetMathSection = await prisma.examSection.create({
    data: {
      examId: cetExam.id,
      subjectId: mathematics.id,
      name: 'Section C — Mathematics',
      order: 2,
      questionCount: mathQuestions.length,
      marksPerQuestion: 4,
      negativeMarksPerQuestion: 1,
      allowSectionJump: true,
    },
  });

  // Link ALL physics questions to CET physics section
  for (let i = 0; i < physicsQuestions.length; i++) {
    await prisma.examQuestion.create({
      data: {
        examId: cetExam.id,
        sectionId: cetPhySection.id,
        questionId: physicsQuestions[i].id,
        order: i,
      },
    });
  }
  // Link ALL chemistry questions to CET chemistry section
  for (let i = 0; i < chemistryQuestions.length; i++) {
    await prisma.examQuestion.create({
      data: {
        examId: cetExam.id,
        sectionId: cetChemSection.id,
        questionId: chemistryQuestions[i].id,
        order: i,
      },
    });
  }
  // Link ALL math questions to CET math section
  for (let i = 0; i < mathQuestions.length; i++) {
    await prisma.examQuestion.create({
      data: {
        examId: cetExam.id,
        sectionId: cetMathSection.id,
        questionId: mathQuestions[i].id,
        order: i,
      },
    });
  }
  console.log(`  ✓ Exam 1: "${cetExam.title}" (${allQuestions.length} questions, 90 min)`);

  // Exam 2: JEE Main Practice (subset: 8 PHY + 8 CHEM + 9 MATH = 25 questions)
  const jeeExam = await prisma.exam.create({
    data: {
      title: 'JEE Main 2026 Practice — Paper I',
      description: 'Practice paper based on JEE Main pattern with a mix of MCQ and numerical questions. Covers core topics in Physics, Chemistry, and Mathematics.',
      duration: 60,
      totalMarks: 100,
      isPublished: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      allowReview: true,
      showResultImmediately: true,
      examEnvironment: ExamEnvironment.STANDARD_BROWSER,
    },
  });

  const jeePhySection = await prisma.examSection.create({
    data: {
      examId: jeeExam.id,
      subjectId: physics.id,
      name: 'Physics',
      order: 0,
      questionCount: 8,
      marksPerQuestion: 4,
      negativeMarksPerQuestion: 1,
      allowSectionJump: true,
    },
  });
  const jeeChemSection = await prisma.examSection.create({
    data: {
      examId: jeeExam.id,
      subjectId: chemistry.id,
      name: 'Chemistry',
      order: 1,
      questionCount: 8,
      marksPerQuestion: 4,
      negativeMarksPerQuestion: 1,
      allowSectionJump: true,
    },
  });
  const jeeMathSection = await prisma.examSection.create({
    data: {
      examId: jeeExam.id,
      subjectId: mathematics.id,
      name: 'Mathematics',
      order: 2,
      questionCount: 9,
      marksPerQuestion: 4,
      negativeMarksPerQuestion: 1,
      allowSectionJump: true,
    },
  });

  // Link subset of questions to JEE exam
  for (let i = 0; i < 8; i++) {
    await prisma.examQuestion.create({
      data: { examId: jeeExam.id, sectionId: jeePhySection.id, questionId: physicsQuestions[i].id, order: i },
    });
  }
  for (let i = 0; i < 8; i++) {
    await prisma.examQuestion.create({
      data: { examId: jeeExam.id, sectionId: jeeChemSection.id, questionId: chemistryQuestions[i].id, order: i },
    });
  }
  for (let i = 0; i < 9; i++) {
    await prisma.examQuestion.create({
      data: { examId: jeeExam.id, sectionId: jeeMathSection.id, questionId: mathQuestions[i].id, order: i },
    });
  }
  console.log(`  ✓ Exam 2: "${jeeExam.title}" (25 questions, 60 min)\n`);

  // ─── 6. ASSIGN STUDENTS TO EXAMS ───────────────────────────────────
  console.log('🎓 Assigning students to exams...');

  for (const student of [student1, student2, student3]) {
    await prisma.examAssignment.create({
      data: { examId: cetExam.id, userId: student.id },
    });
    await prisma.examAssignment.create({
      data: { examId: jeeExam.id, userId: student.id },
    });
  }
  console.log('  ✓ All 3 students assigned to both exams\n');

  // ─── 7. SUMMARY ────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🎉 CBT Platform Seed Complete!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log('  📊 Database Summary:');
  console.log(`     Users:      1 admin + 3 students`);
  console.log(`     Subjects:   3 (Physics, Chemistry, Mathematics)`);
  console.log(`     Chapters:   14`);
  console.log(`     Questions:  ${allQuestions.length}`);
  console.log(`     Exams:      2 (MHT-CET Mock + JEE Main Practice)`);
  console.log(`     Assignments: 6 (3 students × 2 exams)`);
  console.log('');
  console.log('  🔐 Login Credentials:');
  console.log('     Admin:    admin@cbt.com / admin123 (Rajat Kolhapure)');
  console.log('     Student1: student@cbt.com / student123 (Priya Sharma, CET-2026-0001)');
  console.log('     Student2: parth@cbt.com / student123 (Parth Jagdale, CET-2026-0002)');
  console.log('     Student3: rahul@cbt.com / student123 (Rahul Mehta, CET-2026-0003)');
  console.log('');
  console.log('  🌐 Access:');
  console.log('     Unified Portal: http://localhost:8080');
  console.log('═══════════════════════════════════════════════════════\n');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('\n❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
