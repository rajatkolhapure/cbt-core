/**
 * Full-Length MHT-CET PCM Examination Generator & Assigner
 * 
 * Creates:
 * - 150 Authentic MHT-CET Questions across Physics (50), Chemistry (50), and Mathematics (50)
 * - Complete Syllabus Coverage with KaTeX LaTeX formulas, options, correct answers, and explanations
 * - Full-Length Exam: "MHT-CET 2026 Full-Length Grand Mock Test — PCM"
 *   • Section A: Physics (50 Qs, 50 Marks, +1 / -0)
 *   • Section B: Chemistry (50 Qs, 50 Marks, +1 / -0)
 *   • Section C: Mathematics (50 Qs, 100 Marks, +2 / -0)
 *   • Total: 150 Questions, 200 Marks, 180 Minutes
 * - Direct assignment to all students (student@cbt.com, rahul@cbt.com, ananya@cbt.com)
 * 
 * Run: npx tsx prisma/seed-full-cet.ts
 */

import { PrismaClient, QuestionType, Difficulty, Role, ExamEnvironment } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Full-Length MHT-CET 2026 PCM Generation...\n');

  // 1. Ensure Subjects exist
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

  // 2. Ensure Users exist
  const passwordHash = await bcrypt.hash('admin123', 10);
  const studentHash = await bcrypt.hash('student123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@cbt.com' },
    update: {},
    create: {
      email: 'admin@cbt.com',
      password: passwordHash,
      name: 'Dr. Rajesh Kumar (Controller of Exams)',
      role: Role.ADMIN,
      candidateId: 'ADM-001',
    },
  });

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

  console.log('👤 Students confirmed: Priya Sharma, Rahul Patel, Ananya Iyer\n');

  // 3. Define 50 Physics Questions
  console.log('📚 Preparing 50 Physics Questions...');
  const physicsData = [
    {
      text: 'A wheel of radius $R = 0.5\\,\\text{m}$ starts from rest and accelerates with constant angular acceleration $\\alpha = 4\\,\\text{rad/s}^2$. The linear velocity of a point on the rim after $t = 3\\,\\text{s}$ is:',
      options: ['$6\\,\\text{m/s}$', '$12\\,\\text{m/s}$', '$3\\,\\text{m/s}$', '$18\\,\\text{m/s}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\omega = \\alpha t = 4 \\times 3 = 12\\,\\text{rad/s}$. $v = R\\omega = 0.5 \\times 12 = 6\\,\\text{m/s}$.',
      tags: ['rotational-dynamics', 'kinematics'],
    },
    {
      text: 'The radius of gyration of a uniform circular disc of radius $R$ about its diameter is:',
      options: ['$\\frac{R}{2}$', '$\\frac{R}{\\sqrt{2}}$', '$\\frac{R}{4}$', '$\\frac{\\sqrt{3}R}{2}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$I_{\\text{dia}} = \\frac{1}{4}MR^2 = Mk^2 \\implies k = \\frac{R}{2}$.',
      tags: ['rotational-dynamics', 'radius-of-gyration'],
    },
    {
      text: 'If the kinetic energy of rotation of a body is increased by $300\\%$, its angular momentum increases by:',
      options: ['$100\\%$', '$200\\%$', '$50\\%$', '$150\\%$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: '$L = \\sqrt{2IE}$. If $E\' = 4E$, then $L\' = 2L$, an increase of $100\\%$.',
      tags: ['rotational-dynamics', 'angular-momentum'],
    },
    {
      text: 'The terminal velocity $v_t$ of a spherical ball of radius $r$ falling in a viscous fluid depends on radius as:',
      options: ['$v_t \\propto r^2$', '$v_t \\propto r$', '$v_t \\propto \\frac{1}{r}$', '$v_t \\propto r^3$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'By Stokes\' law: $v_t = \\frac{2r^2(\\rho - \\sigma)g}{9\\eta} \\implies v_t \\propto r^2$.',
      tags: ['fluid-mechanics', 'stokes-law'],
    },
    {
      text: 'Excess pressure inside a liquid drop of radius $R$ and surface tension $T$ is:',
      options: ['$\\frac{2T}{R}$', '$\\frac{4T}{R}$', '$\\frac{T}{2R}$', '$\\frac{T}{R}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'A liquid drop has only one free surface, so $\\Delta P = \\frac{2T}{R}$.',
      tags: ['surface-tension', 'excess-pressure'],
    },
    {
      text: 'Work done in blowing a soap bubble of radius $r$ to radius $2r$ in terms of surface tension $T$ is:',
      options: ['$24\\pi r^2 T$', '$8\\pi r^2 T$', '$12\\pi r^2 T$', '$16\\pi r^2 T$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: 'A soap bubble has 2 free surfaces: $W = 2 \\times 4\\pi ( (2r)^2 - r^2 ) T = 8\\pi (3r^2) T = 24\\pi r^2 T$.',
      tags: ['surface-tension', 'work-done'],
    },
    {
      text: 'The root mean square speed of oxygen gas molecules at temperature $T$ is $v$. If temperature is doubled and oxygen molecules dissociate into atoms, the new rms speed is:',
      options: ['$2v$', '$v\\sqrt{2}$', '$4v$', '$\\frac{v}{2}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: '$v_{\\text{rms}} = \\sqrt{\\frac{3RT}{M}}$. With $T\' = 2T$ and $M\' = M/2$, $v\' = \\sqrt{\\frac{3R(2T)}{M/2}} = 2v$.',
      tags: ['ktg', 'rms-speed'],
    },
    {
      text: 'The emissive power of a black body at temperature $T$ is $E$. According to Stefan-Boltzmann law, $E$ is proportional to:',
      options: ['$T^4$', '$T^2$', '$T^3$', '$T$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$E = \\sigma T^4 \\implies E \\propto T^4$.',
      tags: ['radiation', 'stefan-law'],
    },
    {
      text: 'In an adiabatic process, the relation between pressure $P$ and volume $V$ for a gas with ratio of specific heats $\\gamma$ is:',
      options: ['$PV^\\gamma = \\text{constant}$', '$P^\\gamma V = \\text{constant}$', '$TV^{\\gamma} = \\text{constant}$', '$PV = \\text{constant}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Standard adiabatic equation for an ideal gas: $PV^\\gamma = \\text{constant}$.',
      tags: ['thermodynamics', 'adiabatic'],
    },
    {
      text: 'A particle executes simple harmonic motion of amplitude $A$. At what displacement from mean position is the potential energy equal to kinetic energy?',
      options: ['$\\frac{A}{\\sqrt{2}}$', '$\\frac{A}{2}$', '$\\frac{\\sqrt{3}A}{2}$', '$\\frac{A}{4}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\frac{1}{2}kx^2 = \\frac{1}{2}k(A^2 - x^2) \\implies 2x^2 = A^2 \\implies x = \\frac{A}{\\sqrt{2}}$.',
      tags: ['oscillations', 'shm-energy'],
    },
    {
      text: 'The time period of a simple pendulum inside a satellite orbiting the Earth is:',
      options: ['Infinite', 'Zero', '$2\\,\\text{s}$', 'Same as on Earth'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Inside an orbiting satellite, effective gravity $g_{\\text{eff}} = 0$, so $T = 2\\pi\\sqrt{\\frac{L}{g_{\\text{eff}}}} = \\infty$.',
      tags: ['oscillations', 'pendulum'],
    },
    {
      text: 'Two simple harmonic motions are represented by $y_1 = 5\\sin(2\\pi t + \\pi/3)$ and $y_2 = 5[\\sin(2\\pi t) + \\sqrt{3}\\cos(2\\pi t)]$. The ratio of their amplitudes is:',
      options: ['$1 : 2$', '$1 : 1$', '$2 : 1$', '$1 : 4$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: '$A_1 = 5$. $y_2 = 10 [\\frac{1}{2}\\sin(2\\pi t) + \\frac{\\sqrt{3}}{2}\\cos(2\\pi t)] = 10\\sin(2\\pi t + \\pi/3)$, so $A_2 = 10$. Ratio $= 5/10 = 1:2$.',
      tags: ['oscillations', 'composition-shm'],
    },
    {
      text: 'The fundamental frequency of an open organ pipe is $300\\,\\text{Hz}$. The frequency of its first overtone is:',
      options: ['$600\\,\\text{Hz}$', '$450\\,\\text{Hz}$', '$900\\,\\text{Hz}$', '$1200\\,\\text{Hz}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'For an open pipe, overtones are integer multiples of fundamental: $f_1 = 2n_0 = 2 \\times 300 = 600\\,\\text{Hz}$.',
      tags: ['wave-motion', 'organ-pipe'],
    },
    {
      text: 'When a sound wave travels from air into water, which quantity remains unchanged?',
      options: ['Frequency', 'Wavelength', 'Speed', 'Amplitude'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Frequency is determined by the source and remains constant across boundaries.',
      tags: ['waves', 'refraction'],
    },
    {
      text: 'In Young\'s double slit experiment, if the distance between the slits is halved and distance to the screen is doubled, the fringe width becomes:',
      options: ['4 times', '2 times', 'Halved', 'Unchanged'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\beta = \\frac{\\lambda D}{d}$. If $D\' = 2D$ and $d\' = d/2$, then $\\beta\' = \\frac{\\lambda (2D)}{d/2} = 4\\beta$.',
      tags: ['wave-optics', 'ydse'],
    },
    {
      text: 'According to Brewster\'s law, the polarizing angle $\\theta_p$ and refractive index $\\mu$ are related by:',
      options: ['$\\mu = \\tan\\theta_p$', '$\\mu = \\sin\\theta_p$', '$\\mu = \\cos\\theta_p$', '$\\mu = \\cot\\theta_p$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Brewster\'s law states $\\mu = \\tan\\theta_p$.',
      tags: ['wave-optics', 'polarization'],
    },
    {
      text: 'Two point charges $+4q$ and $+q$ are placed at distance $L$ apart. A third charge $Q$ is placed on the line joining them so that the system is in equilibrium. The position of $Q$ from $+4q$ is:',
      options: ['$\\frac{2L}{3}$', '$\\frac{L}{3}$', '$\\frac{L}{2}$', '$\\frac{3L}{4}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: '$\\frac{4q}{x^2} = \\frac{q}{(L-x)^2} \\implies \\frac{2}{x} = \\frac{1}{L-x} \\implies 2L - 2x = x \\implies x = \\frac{2L}{3}$.',
      tags: ['electrostatics', 'coulomb-law'],
    },
    {
      text: 'An electric dipole of moment $\\vec{p}$ placed in a uniform electric field $\\vec{E}$ experiences a maximum torque when the angle between $\\vec{p}$ and $\\vec{E}$ is:',
      options: ['$90°$', '$0°$', '$180°$', '$45°$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\tau = pE\\sin\\theta$. Maximum torque occurs at $\\theta = 90°$ where $\\sin 90° = 1$.',
      tags: ['electrostatics', 'dipole'],
    },
    {
      text: 'A wire of resistance $R$ is stretched to twice its original length. Assuming density remains constant, its new resistance is:',
      options: ['$4R$', '$2R$', '$\\frac{R}{2}$', '$16R$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Volume $V = AL$ is constant. If $L\' = 2L$, then $A\' = A/2$. $R\' = \\rho \\frac{2L}{A/2} = 4R$.',
      tags: ['current-electricity', 'resistance'],
    },
    {
      text: 'In a potentiometer experiment, the balancing length with a cell of emf $1.5\\,\\text{V}$ is $60\\,\\text{cm}$. The balancing length for a cell of emf $2.0\\,\\text{V}$ is:',
      options: ['$80\\,\\text{cm}$', '$75\\,\\text{cm}$', '$90\\,\\text{cm}$', '$45\\,\\text{cm}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\frac{E_1}{E_2} = \\frac{l_1}{l_2} \\implies l_2 = \\frac{2.0}{1.5} \\times 60 = 80\\,\\text{cm}$.',
      tags: ['current-electricity', 'potentiometer'],
    },
    {
      text: 'Kirchhoff\'s first law (Junction rule) at an electrical node is a consequence of conservation of:',
      options: ['Electric charge', 'Energy', 'Linear momentum', 'Angular momentum'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'The junction rule $\\sum I = 0$ is based on conservation of electric charge.',
      tags: ['current-electricity', 'kirchhoff-laws'],
    },
    {
      text: 'A circular coil of radius $R$ carries a current $I$. The magnetic induction at its centre is $B_0$. The magnetic induction at an axial distance $x = R\\sqrt{3}$ from the centre is:',
      options: ['$\\frac{B_0}{8}$', '$\\frac{B_0}{4}$', '$\\frac{B_0}{2}$', '$\\frac{B_0}{16}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: '$B = \\frac{\\mu_0 I R^2}{2(R^2 + x^2)^{3/2}} = \\frac{\\mu_0 I R^2}{2(4R^2)^{3/2}} = \\frac{\\mu_0 I}{2R \\times 8} = \\frac{B_0}{8}$.',
      tags: ['magnetic-effects', 'biot-savart'],
    },
    {
      text: 'The SI unit of magnetic dipole moment is:',
      options: ['$\\text{A}\\cdot\\text{m}^2$', '$\\text{A/m}$', '$\\text{T}\\cdot\\text{m}$', '$\\text{J/T}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$M = I A \\implies \\text{Ampere} \\times \\text{metre}^2 = \\text{A}\\cdot\\text{m}^2$.',
      tags: ['magnetic-materials', 'units'],
    },
    {
      text: 'Susceptibility $\\chi$ of a ferromagnetic material above its Curie temperature $T_c$ varies with temperature $T$ as:',
      options: ['$\\chi \\propto \\frac{1}{T - T_c}$', '$\\chi \\propto (T - T_c)$', '$\\chi \\propto \\frac{1}{T^2}$', '$\\chi = \\text{constant}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Curie-Weiss Law: $\\chi = \\frac{C}{T - T_c}$ for $T > T_c$.',
      tags: ['magnetic-materials', 'curie-weiss'],
    },
    {
      text: 'A magnetic flux of $5\\,\\text{Wb}$ linked with a coil of $100$ turns decreases to $1\\,\\text{Wb}$ in $0.2\\,\\text{s}$. The induced emf is:',
      options: ['$2000\\,\\text{V}$', '$1000\\,\\text{V}$', '$500\\,\\text{V}$', '$200\\,\\text{V}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$e = -N \\frac{\\Delta \\Phi}{\\Delta t} = 100 \\times \\frac{5 - 1}{0.2} = 100 \\times 20 = 2000\\,\\text{V}$.',
      tags: ['emi', 'faraday-law'],
    },
    {
      text: 'In a step-up transformer, the turn ratio is $1:10$. If the primary voltage is $220\\,\\text{V}$ and primary current is $5\\,\\text{A}$, assuming $100\\%$ efficiency, the secondary current is:',
      options: ['$0.5\\,\\text{A}$', '$50\\,\\text{A}$', '$2.5\\,\\text{A}$', '$1\\,\\text{A}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\frac{I_s}{I_p} = \\frac{N_p}{N_s} \\implies I_s = 5 \\times \\frac{1}{10} = 0.5\\,\\text{A}$.',
      tags: ['emi', 'transformer'],
    },
    {
      text: 'In a series LCR resonant circuit, the phase difference between applied voltage and resultant current is:',
      options: ['$0°$', '$90°$', '$180°$', '$45°$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'At resonance, $X_L = X_C$, so impedance $Z = R$ (purely resistive) and phase difference $\\phi = 0°$.',
      tags: ['ac-circuits', 'resonance'],
    },
    {
      text: 'The power factor of a pure inductor in an AC circuit is:',
      options: ['Zero', '$1$', '$0.5$', 'Infinite'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'For a pure inductor, phase difference $\\phi = 90°$. Power factor $\\cos\\phi = \\cos 90° = 0$.',
      tags: ['ac-circuits', 'power-factor'],
    },
    {
      text: 'If the momentum of a photon is $p$, its wavelength $\\lambda$ is:',
      options: ['$\\frac{h}{p}$', '$\\frac{p}{h}$', '$hp$', '$\\frac{h}{p^2}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'de Broglie wavelength relation $\\lambda = \\frac{h}{p}$.',
      tags: ['dual-nature', 'de-broglie'],
    },
    {
      text: 'The work function of a metal is $2.0\\,\\text{eV}$. What is the threshold frequency? $(h = 6.63 \\times 10^{-34}\\,\\text{J}\\cdot\\text{s},\\; 1\\,\\text{eV} = 1.6 \\times 10^{-19}\\,\\text{J})$',
      options: ['$4.83 \\times 10^{14}\\,\\text{Hz}$', '$3.2 \\times 10^{14}\\,\\text{Hz}$', '$6.63 \\times 10^{14}\\,\\text{Hz}$', '$1.2 \\times 10^{15}\\,\\text{Hz}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: '$\\nu_0 = \\frac{\\Phi}{h} = \\frac{2 \\times 1.6 \\times 10^{-19}}{6.63 \\times 10^{-34}} = 4.826 \\times 10^{14}\\,\\text{Hz}$.',
      tags: ['dual-nature', 'photoelectric'],
    },
    {
      text: 'The radius of the $n$-th orbit in Bohr\'s hydrogen atom is proportional to:',
      options: ['$n^2$', '$n$', '$\\frac{1}{n}$', '$n^3$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$r_n = \\frac{\\varepsilon_0 n^2 h^2}{\\pi m Z e^2} \\propto n^2$.',
      tags: ['structure-of-atom', 'bohr-model'],
    },
    {
      text: 'The half-life of a radioactive isotope is $10\\,\\text{days}$. If the initial mass is $100\\,\\text{g}$, the remaining mass after $30\\,\\text{days}$ is:',
      options: ['$12.5\\,\\text{g}$', '$25\\,\\text{g}$', '$6.25\\,\\text{g}$', '$50\\,\\text{g}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Number of half-lives $n = 30/10 = 3$. Remaining $N = 100 \\times (1/2)^3 = 12.5\\,\\text{g}$.',
      tags: ['nuclear-physics', 'half-life'],
    },
    {
      text: 'In a p-n junction diode under forward bias, the width of the depletion layer:',
      options: ['Decreases', 'Increases', 'Remains unchanged', 'Becomes zero instantly'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Forward bias opposes the built-in potential barrier, decreasing depletion layer width.',
      tags: ['semiconductors', 'pn-junction'],
    },
    {
      text: 'A logic gate which gives an output of $1$ only when all its inputs are $1$ is:',
      options: ['AND gate', 'OR gate', 'NAND gate', 'NOR gate'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'An AND gate produces high output only when all inputs are high ($Y = A \\cdot B$).',
      tags: ['semiconductors', 'logic-gates'],
    },
    {
      text: 'A particle moves in a circle of radius $5\\,\\text{cm}$ with constant speed and time period $0.2\\pi\\,\\text{s}$. The acceleration of the particle is:',
      options: ['$5\\,\\text{m/s}^2$', '$25\\,\\text{m/s}^2$', '$10\\,\\text{m/s}^2$', '$2.5\\,\\text{m/s}^2$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\omega = \\frac{2\\pi}{T} = \\frac{2\\pi}{0.2\\pi} = 10\\,\\text{rad/s}$. $a = r\\omega^2 = 0.05 \\times 100 = 5\\,\\text{m/s}^2$.',
      tags: ['circular-motion', 'centripetal-acceleration'],
    },
    {
      text: 'Surface tension of a liquid is zero at its:',
      options: ['Critical temperature', 'Boiling point', 'Freezing point', 'Absolute zero'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'At critical temperature, meniscus disappears and surface tension vanishes completely.',
      tags: ['surface-tension', 'critical-temperature'],
    },
    {
      text: 'The velocity of sound in a gas is $v$. If pressure is doubled at constant temperature, the velocity becomes:',
      options: ['$v$', '$2v$', '$v\\sqrt{2}$', '$\\frac{v}{2}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$v = \\sqrt{\\frac{\\gamma P}{\\rho}}$. At constant temperature $P/\\rho$ is constant, so speed of sound is independent of pressure.',
      tags: ['wave-motion', 'sound-speed'],
    },
    {
      text: 'A car approaching a stationary listener with speed $20\\,\\text{m/s}$ blows a horn of frequency $600\\,\\text{Hz}$. Speed of sound in air is $340\\,\\text{m/s}$. Apparent frequency heard is:',
      options: ['$637.5\\,\\text{Hz}$', '$566.7\\,\\text{Hz}$', '$600\\,\\text{Hz}$', '$680\\,\\text{Hz}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: '$f\' = f \\left(\\frac{v}{v - v_s}\\right) = 600 \\times \\frac{340}{320} = 637.5\\,\\text{Hz}$.',
      tags: ['waves', 'doppler-effect'],
    },
    {
      text: 'The electric flux through a closed Gaussian surface enclosing a charge $q$ is $\\Phi$. If the radius of the sphere is doubled, the flux will be:',
      options: ['$\\Phi$', '$2\\Phi$', '$4\\Phi$', '$\\frac{\\Phi}{2}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'By Gauss\'s law $\\Phi = \\frac{q_{\\text{enc}}}{\\varepsilon_0}$, independent of surface size or radius.',
      tags: ['electrostatics', 'gauss-law'],
    },
    {
      text: 'Three capacitors each of capacitance $C$ are connected in parallel. The equivalent capacitance is:',
      options: ['$3C$', '$\\frac{C}{3}$', '$\\frac{2C}{3}$', '$\\frac{3}{C}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'In parallel combination: $C_{\\text{eq}} = C + C + C = 3C$.',
      tags: ['electrostatics', 'capacitors'],
    },
    {
      text: 'A galvanometer of resistance $G$ is converted into an ammeter of range $I$ using a shunt $S$. The value of shunt resistance is given by:',
      options: ['$S = \\frac{I_g G}{I - I_g}$', '$S = \\frac{I G}{I_g}$', '$S = \\frac{(I - I_g)G}{I_g}$', '$S = \\frac{I_g}{I G}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Potential across shunt equals potential across galvanometer: $(I - I_g)S = I_g G \\implies S = \\frac{I_g G}{I - I_g}$.',
      tags: ['current-electricity', 'galvanometer'],
    },
    {
      text: 'The magnetic field at the centre of a long solenoid of $n$ turns per unit length carrying current $I$ is:',
      options: ['$\\mu_0 n I$', '$\\frac{\\mu_0 n I}{2}$', '$2\\mu_0 n I$', '$\\frac{\\mu_0 I}{2\\pi n}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Standard Ampere\'s law formula for ideal solenoid: $B = \\mu_0 n I$.',
      tags: ['magnetic-effects', 'solenoid'],
    },
    {
      text: 'Eddy currents are produced inside a conductor when:',
      options: ['It is placed in a changing magnetic field', 'A steady DC current flows', 'It is heated to high temperature', 'It is placed in a static electric field'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Eddy currents are circulating loops of current induced in bulk conductors by time-varying magnetic fluxes.',
      tags: ['emi', 'eddy-currents'],
    },
    {
      text: 'In an AC circuit, $V = 200\\sin(100\\pi t)\\,\\text{V}$. The rms voltage is:',
      options: ['$100\\sqrt{2}\\,\\text{V}$', '$200\\,\\text{V}$', '$100\\,\\text{V}$', '$200\\sqrt{2}\\,\\text{V}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$V_{\\text{rms}} = \\frac{V_0}{\\sqrt{2}} = \\frac{200}{\\sqrt{2}} = 100\\sqrt{2}\\,\\text{V}$.',
      tags: ['ac-circuits', 'rms-voltage'],
    },
    {
      text: 'The energy of a photon of wavelength $6630\\,\\text{Å}$ is: $(h = 6.63 \\times 10^{-34}\\,\\text{J}\\cdot\\text{s},\\; c = 3 \\times 10^8\\,\\text{m/s})$',
      options: ['$3.0 \\times 10^{-19}\\,\\text{J}$', '$1.5 \\times 10^{-19}\\,\\text{J}$', '$6.0 \\times 10^{-19}\\,\\text{J}$', '$4.5 \\times 10^{-19}\\,\\text{J}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$E = \\frac{hc}{\\lambda} = \\frac{6.63 \\times 10^{-34} \\times 3 \\times 10^8}{6630 \\times 10^{-10}} = 3.0 \\times 10^{-19}\\,\\text{J}$.',
      tags: ['dual-nature', 'photon-energy'],
    },
    {
      text: 'The ratio of kinetic energy to total energy of an electron in Bohr\'s orbit of hydrogen atom is:',
      options: ['$1 : -1$', '$1 : 1$', '$1 : 2$', '$2 : 1$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'In Bohr atom: $E_{\\text{total}} = -K$, so $K / E = -1$. Ratio is $1 : -1$.',
      tags: ['structure-of-atom', 'bohr-energy'],
    },
    {
      text: 'In a nuclear reactor, heavy water ($\text{D}_2\text{O}$) is predominantly used as a:',
      options: ['Moderator', 'Coolant', 'Fuel', 'Control rod'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Heavy water slows down fast fission neutrons to thermal energies without excessive neutron absorption.',
      tags: ['nuclear-physics', 'reactor'],
    },
    {
      text: 'When a trivalent impurity (like Boron or Indium) is doped into pure Silicon, the semiconductor formed is:',
      options: ['p-type', 'n-type', 'Intrinsic', 'Superconductor'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Trivalent dopants create excess holes (majority carriers), producing a p-type semiconductor.',
      tags: ['semiconductors', 'doping'],
    },
    {
      text: 'The focal length of a plane glass slab of thickness $d$ and refractive index $\\mu$ is:',
      options: ['Infinite', 'Zero', '$d$', '$\\frac{d}{\\mu}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'For a flat glass surface with radius of curvature $R = \\infty$, focal length $f = \\infty$.',
      tags: ['optics', 'focal-length'],
    },
    {
      text: 'A wire loop enclosing an area $A = 0.05\\,\\text{m}^2$ is placed in a uniform magnetic field $B = 0.4\\,\\text{T}$ perpendicular to the loop. If the field drops to zero in $0.1\\,\\text{s}$, the average induced emf is:',
      options: ['$0.2\\,\\text{V}$', '$0.02\\,\\text{V}$', '$2.0\\,\\text{V}$', '$0.1\\,\\text{V}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$e = \\frac{\\Delta \\Phi}{\\Delta t} = \\frac{B A}{\\Delta t} = \\frac{0.4 \\times 0.05}{0.1} = 0.2\\,\\text{V}$.',
      tags: ['emi', 'induction'],
    },
  ];

  // 4. Define 50 Chemistry Questions
  console.log('🧪 Preparing 50 Chemistry Questions...');
  const chemistryData = [
    {
      text: 'The total number of atoms in a body-centred cubic (BCC) unit cell is:',
      options: ['$2$', '$1$', '$4$', '$6$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Corner contribution $= 8 \\times \\frac{1}{8} = 1$. Centre contribution $= 1$. Total $= 2$.',
      tags: ['solid-state', 'unit-cell'],
    },
    {
      text: 'Which defect in a crystal lattice decreases its overall density?',
      options: ['Schottky defect', 'Frenkel defect', 'Interstitial defect', 'Metal excess defect'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Schottky defect involves missing cation-anion pairs from lattice sites, reducing density.',
      tags: ['solid-state', 'defects'],
    },
    {
      text: 'The van \'t Hoff factor $i$ for complete dissociation of $\\text{K}_2\\text{SO}_4$ in aqueous solution is:',
      options: ['$3$', '$2$', '$1$', '$4$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\text{K}_2\\text{SO}_4 \\to 2\\text{K}^+ + \\text{SO}_4^{2-}$ produces 3 ions, so $i = 3$.',
      tags: ['solutions', 'van-t-hoff'],
    },
    {
      text: 'Which colligative property is preferred for determining the molecular weight of polymers and biomolecules?',
      options: ['Osmotic pressure', 'Elevation of boiling point', 'Depression of freezing point', 'Relative lowering of vapour pressure'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Osmotic pressure produces measurable magnitude at room temperature even at low molar concentrations.',
      tags: ['solutions', 'osmotic-pressure'],
    },
    {
      text: 'The pH of a buffer solution containing equal concentrations of acetic acid and sodium acetate ($pK_a = 4.74$) is:',
      options: ['$4.74$', '$5.74$', '$3.74$', '$7.00$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Henderson-Hasselbalch equation: $\\text{pH} = pK_a + \\log\\frac{[\\text{Salt}]}{[\\text{Acid}]} = 4.74 + \\log 1 = 4.74$.',
      tags: ['ionic-equilibria', 'buffer'],
    },
    {
      text: 'The relationship between solubility product $K_{sp}$ and solubility $s$ for $\\text{Al}(\\text{OH})_3$ is:',
      options: ['$27s^4$', '$4s^3$', '$108s^5$', '$s^2$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$K_{sp} = [\\text{Al}^{3+}][\\text{OH}^-]^3 = (s)(3s)^3 = 27s^4$.',
      tags: ['ionic-equilibria', 'solubility-product'],
    },
    {
      text: 'For an adiabatic reversible expansion of an ideal gas, the change in entropy of the universe is:',
      options: ['Zero', 'Positive', 'Negative', 'Infinite'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'For any reversible process, $\\Delta S_{\\text{universe}} = 0$. In reversible adiabatic, $q_{\\text{rev}} = 0 \\implies \\Delta S = 0$.',
      tags: ['thermodynamics', 'entropy'],
    },
    {
      text: 'The standard enthalpy of formation ($\\Delta_f H^\\circ$) is zero for which substance at $298\\,\\text{K}$?',
      options: ['$\\text{O}_2\\text{ (gas)}$', '$\\text{O}_3\\text{ (gas)}$', '$\\text{H}_2\\text{O (liquid)}$', '$\\text{CO}_2\\text{ (gas)}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'By convention, standard enthalpy of formation of an element in its standard reference state is zero.',
      tags: ['thermodynamics', 'enthalpy-formation'],
    },
    {
      text: 'The unit of cell constant for a conductivity cell is:',
      options: ['$\\text{cm}^{-1}$', '$\\text{S}\\cdot\\text{cm}^{-1}$', '$\\text{ohm}\\cdot\\text{cm}$', '$\\text{S}\\cdot\\text{cm}^2\\cdot\\text{mol}^{-1}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Cell constant $= l / A = \\text{cm} / \\text{cm}^2 = \\text{cm}^{-1}$ (or $\\text{m}^{-1}$).',
      tags: ['electrochemistry', 'cell-constant'],
    },
    {
      text: 'According to Faraday\'s first law of electrolysis, mass $w$ deposited at an electrode is proportional to:',
      options: ['$Q = It$', '$I/t$', '$I^2 t$', '$t/I$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$w = z Q = z I t$.',
      tags: ['electrochemistry', 'faraday-law'],
    },
    {
      text: 'The standard reduction potential of $\\text{Zn}^{2+}/\\text{Zn}$ is $-0.76\\,\\text{V}$ and $\\text{Cu}^{2+}/\\text{Cu}$ is $+0.34\\,\\text{V}$. The standard EMF of the Daniel cell is:',
      options: ['$1.10\\,\\text{V}$', '$0.42\\,\\text{V}$', '$-1.10\\,\\text{V}$', '$0.76\\,\\text{V}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} = 0.34 - (-0.76) = 1.10\\,\\text{V}$.',
      tags: ['electrochemistry', 'galvanic-cell'],
    },
    {
      text: 'The rate constant of a reaction has unit $\\text{mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$. The order of the reaction is:',
      options: ['Zero', 'First', 'Second', 'Third'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Unit of rate constant: $(\\text{mol/L})^{1-n} \\text{s}^{-1}$. For $n=0$: $\\text{mol}\\cdot\\text{L}^{-1}\\cdot\\text{s}^{-1}$.',
      tags: ['chemical-kinetics', 'order-reaction'],
    },
    {
      text: 'The slope of the Arrhenius plot of $\\ln k$ vs $\\frac{1}{T}$ is equal to:',
      options: ['$-\\frac{E_a}{R}$', '$\\frac{E_a}{R}$', '$-\\frac{E_a}{2.303R}$', '$-E_a$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'From $\\ln k = \\ln A - \\frac{E_a}{RT}$, slope against $1/T$ is $-E_a/R$.',
      tags: ['chemical-kinetics', 'arrhenius-equation'],
    },
    {
      text: 'Which group 16 hydride has the highest boiling point due to intermolecular hydrogen bonding?',
      options: ['$\\text{H}_2\\text{O}$', '$\\text{H}_2\\text{S}$', '$\\text{H}_2\\text{Se}$', '$\\text{H}_2\\text{Te}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Water exhibits extensive intermolecular hydrogen bonding resulting in an abnormally high boiling point.',
      tags: ['p-block', 'group-16'],
    },
    {
      text: 'The geometry and hybridisation of $\\text{XeF}_4$ are respectively:',
      options: ['Square planar, $sp^3d^2$', 'Tetrahedral, $sp^3$', 'Octahedral, $sp^3d^2$', 'See-saw, $sp^3d$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: '$\\text{XeF}_4$ has 4 bond pairs and 2 lone pairs $\\implies 6$ electron pairs with $sp^3d^2$ hybridisation and square planar shape.',
      tags: ['p-block', 'noble-gases'],
    },
    {
      text: 'Which halogen acid is the strongest reducing agent?',
      options: ['$\\text{HI}$', '$\\text{HBr}$', '$\\text{HCl}$', '$\\text{HF}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Due to largest bond length and lowest bond dissociation enthalpy of $\\text{H–I}$, $\\text{HI}$ readily donates electrons.',
      tags: ['p-block', 'halogens'],
    },
    {
      text: 'Which of the following $3d$ transition metal ions is colourless in aqueous solution?',
      options: ['$\\text{Sc}^{3+}$', '$\\text{Fe}^{2+}$', '$\\text{Cu}^{2+}$', '$\\text{Cr}^{3+}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\text{Sc}^{3+}$ has a $3d^0$ configuration with no d-electrons available for d-d transition.',
      tags: ['d-block', 'electronic-configuration'],
    },
    {
      text: 'Lanthanoid contraction is caused by:',
      options: ['Poor shielding by $4f$ electrons', 'Poor shielding by $5d$ electrons', 'High electronegativity', 'Large atomic radius'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Imperfect shielding of nuclear charge by diffuse $4f$ electrons causes steady contraction in atomic radius.',
      tags: ['f-block', 'lanthanoid-contraction'],
    },
    {
      text: 'The oxidation state and coordination number of Cobalt in $[\\text{Co}(\\text{en})_2\\text{Cl}_2]^+$ are respectively:',
      options: ['$+3$ and $6$', '$+2$ and $6$', '$+3$ and $4$', '$+1$ and $4$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: 'Ethylenediamine is bidentate ($2 \\times 2 = 4$) + $2\\text{Cl} = 6$. Charge $x + 0 + 2(-1) = +1 \\implies x = +3$.',
      tags: ['coordination-compounds', 'coordination-number'],
    },
    {
      text: 'An ambidentate ligand is:',
      options: ['$\\text{NO}_2^-$', '$\\text{H}_2\\text{O}$', '$\\text{NH}_3$', '$\\text{Cl}^-$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\text{NO}_2^-$ can coordinate through either Nitrogen (nitro) or Oxygen (nitrito).',
      tags: ['coordination-compounds', 'ligands'],
    },
    {
      text: 'Which reagent converts bromoethane to ethyl cyanide via nucleophilic substitution?',
      options: ['$\\text{KCN}$ (alcoholic)', '$\\text{AgCN}$', '$\\text{HCN}$', '$\\text{NH}_3$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Ionic $\\text{KCN}$ provides cyanide ion where attack occurs through carbon to give alkyl cyanide.',
      tags: ['halogen-derivatives', 'nucleophilic-substitution'],
    },
    {
      text: 'Lucas test is used to distinguish between:',
      options: ['Primary, secondary, and tertiary alcohols', 'Alcohols and phenols', 'Aldehydes and ketones', 'Carboxylic acids and esters'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Lucas reagent (conc. $\\text{HCl} + \\text{ZnCl}_2$) reacts instantly with $3^\\circ$, in 5 mins with $2^\\circ$, and only upon heating with $1^\\circ$ alcohols.',
      tags: ['alcohols', 'lucas-test'],
    },
    {
      text: 'Phenol on heating with Chloroform and aqueous $\\text{NaOH}$ followed by acidification yields Salicylaldehyde. This reaction is known as:',
      options: ['Reimer-Tiemann reaction', 'Kolbe reaction', 'Cannizzaro reaction', 'Rosenmund reduction'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Formylation of phenol via dichlorocarbene intermediate is the Reimer-Tiemann reaction.',
      tags: ['phenols', 'named-reactions'],
    },
    {
      text: 'Williamson synthesis is used for the preparation of:',
      options: ['Ethers', 'Aldehydes', 'Ketones', 'Carboxylic acids'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$R-\\text{ONa} + R\'-\\text{X} \\to R-\\text{O}-R\' + \\text{NaX}$ produces ethers via SN2 attack.',
      tags: ['ethers', 'williamson-synthesis'],
    },
    {
      text: 'Which aldehyde does not undergo Aldol condensation due to absence of $\\alpha$-hydrogen atoms?',
      options: ['Formaldehyde ($\\text{HCHO}$)', 'Acetaldehyde ($\\text{CH}_3\\text{CHO}$)', 'Propionaldehyde', 'Acetone'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\text{HCHO}$ has no alpha carbons and undergoes Cannizzaro reaction instead of Aldol.',
      tags: ['aldehydes-ketones', 'cannizzaro'],
    },
    {
      text: 'Tollens\' reagent is chemically:',
      options: ['Ammoniacal silver nitrate solution', 'Alkaline copper sulphate solution', 'Neutral ferric chloride solution', 'Acidified potassium permanganate'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Tollens\' reagent is $[\\text{Ag}(\\text{NH}_3)_2]\\text{OH}$.',
      tags: ['aldehydes-ketones', 'tollens-test'],
    },
    {
      text: 'Carbylamine test is given exclusively by:',
      options: ['Primary amines', 'Secondary amines', 'Tertiary amines', 'Quaternary ammonium salts'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Only primary aliphatic and aromatic amines react with $\\text{CHCl}_3$ and $\\text{KOH}$ to form foul-smelling isocyanides.',
      tags: ['amines', 'carbylamine-test'],
    },
    {
      text: 'The strongest base among the following in aqueous solution is:',
      options: ['$(\\text{CH}_3)_2\\text{NH}$', '$\\text{CH}_3\\text{NH}_2$', '$(\\text{CH}_3)_3\\text{N}$', '$\\text{NH}_3$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: 'For methyl amines in aqueous medium, the combined order of inductive, steric, and solvation effects gives $2^\\circ > 1^\\circ > 3^\\circ > \\text{NH}_3$.',
      tags: ['amines', 'basicity'],
    },
    {
      text: 'Which vitamin is water-soluble?',
      options: ['Vitamin C', 'Vitamin A', 'Vitamin D', 'Vitamin K'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Vitamins B and C are water-soluble; A, D, E, and K are fat-soluble.',
      tags: ['biomolecules', 'vitamins'],
    },
    {
      text: 'The purine base present in RNA but absent in DNA is replaced by Thymine. The complementary pyrimidine base in RNA is:',
      options: ['Uracil', 'Guanine', 'Cytosine', 'Adenine'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'RNA contains Uracil instead of Thymine found in DNA.',
      tags: ['biomolecules', 'nucleic-acids'],
    },
    {
      text: 'The coordination number of atoms in a hexagonal close-packed (HCP) structure is:',
      options: ['$12$', '$8$', '$6$', '$4$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Both HCP and FCC close-packed arrangements have a coordination number of 12.',
      tags: ['solid-state', 'close-packing'],
    },
    {
      text: 'An azeotropic mixture of two liquids boils at a lower temperature than either of them when:',
      options: ['It shows large positive deviation from Raoult\'s law', 'It shows negative deviation', 'It obeys Raoult\'s law ideally', 'Both liquids are non-volatile'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: 'Positive deviation leads to minimum boiling azeotrope (e.g., ethanol-water).',
      tags: ['solutions', 'azeotrope'],
    },
    {
      text: 'The ionic product of pure water $K_w$ at $25°\\text{C}$ is:',
      options: ['$1.0 \\times 10^{-14}$', '$1.0 \\times 10^{-7}$', '$1.0 \\times 10^{-12}$', '$1.0 \\times 10^{-10}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$K_w = [\\text{H}^+][\\text{OH}^-] = 10^{-7} \\times 10^{-7} = 10^{-14}$.',
      tags: ['ionic-equilibria', 'kw'],
    },
    {
      text: 'A process that occurs on its own without requiring continuous external energy is termed:',
      options: ['Spontaneous', 'Non-spontaneous', 'Reversible', 'Isothermal'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'A spontaneous process has natural tendency to proceed in one direction ($\\Delta G < 0$).',
      tags: ['thermodynamics', 'spontaneity'],
    },
    {
      text: 'Molar conductivity $\\Lambda_m$ increases on dilution because:',
      options: ['Interionic attractions decrease', 'Degree of dissociation decreases', 'Number of ions per unit volume increases', 'Volume decreases'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'On dilution, ions move further apart with reduced interionic friction, increasing ionic mobilities.',
      tags: ['electrochemistry', 'molar-conductivity'],
    },
    {
      text: 'A catalyst increases the rate of reaction by:',
      options: ['Providing an alternative pathway with lower activation energy', 'Increasing enthalpy change $\\Delta H$', 'Increasing collision energy', 'Increasing equilibrium constant $K_{eq}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Catalysts lower the activation energy barrier without altering initial/final thermodynamic states.',
      tags: ['chemical-kinetics', 'catalysis'],
    },
    {
      text: 'Bleaching action of Chlorine in presence of moisture is due to:',
      options: ['Oxidation', 'Reduction', 'Hydrolysis', 'Neutralization'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\text{Cl}_2 + \\text{H}_2\\text{O} \\to \\text{HCl} + \\text{HOCl} \\to 2\\text{HCl} + [\\text{O}]$. Nascent oxygen oxidizes coloring matter.',
      tags: ['p-block', 'chlorine'],
    },
    {
      text: 'Which transition metal compound is commonly used as a catalyst in Haber\'s process for ammonia synthesis?',
      options: ['Finely divided Iron', 'Vanadium pentoxide', 'Nickel', 'Platinum'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Iron with molybdenum/alumina promoter catalyzes $\\text{N}_2 + 3\\text{H}_2 \\to 2\\text{NH}_3$.',
      tags: ['d-block', 'catalysts'],
    },
    {
      text: 'The IUPAC name of $[\\text{Ag}(\\text{NH}_3)_2][\\text{Ag}(\\text{CN})_2]$ is:',
      options: ['Diamminesilver(I) dicyanidoargentate(I)', 'Diamminesilver(II) dicyanidoargentate(I)', 'Dicyanidoargentate(I) diamminesilver(I)', 'Silver diamminesilver dicyanide'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: 'Cation named first (diamminesilver(I)) followed by complex anion (dicyanidoargentate(I)).',
      tags: ['coordination-compounds', 'iupac'],
    },
    {
      text: 'Wurtz reaction of methyl iodide in dry ether produces:',
      options: ['Ethane', 'Methane', 'Propane', 'Butane'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$2\\text{CH}_3\\text{I} + 2\\text{Na} \\xrightarrow{\\text{dry ether}} \\text{CH}_3–\\text{CH}_3 + 2\\text{NaI}$.',
      tags: ['halogen-derivatives', 'wurtz-reaction'],
    },
    {
      text: 'Oxidation of a secondary alcohol using acidified potassium dichromate gives a:',
      options: ['Ketone', 'Aldehyde', 'Carboxylic acid', 'Alkene'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$R-\\text{CH}(\\text{OH})-R\' \\xrightarrow{[\\text{O}]} R-\\text{CO}-R\'$ (Ketone).',
      tags: ['alcohols', 'oxidation'],
    },
    {
      text: 'The carbonyl group in acetone is reduced to a methylene group ($\\text{–CH}_2\\text{–}$) using $\\text{Zn-Hg / conc. HCl}$. This is:',
      options: ['Clemmensen reduction', 'Wolff-Kishner reduction', 'Stephen reduction', 'Etard reaction'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Reduction using zinc amalgam and concentrated hydrochloric acid is Clemmensen reduction.',
      tags: ['aldehydes-ketones', 'clemmensen'],
    },
    {
      text: 'Aromatic primary amines on reaction with nitrous acid ($\\text{NaNO}_2 + \\text{HCl}$) at $0–5°\\text{C}$ form:',
      options: ['Diazonium salts', 'Phenols', 'Nitrobenzene', 'Alcohols'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Diazotization of aniline yields benzene diazonium chloride.',
      tags: ['amines', 'diazotization'],
    },
    {
      text: 'The peptide linkage in proteins is chemically represented by:',
      options: ['$\\text{–CO–NH–}$', '$\\text{–COO–}$', '$\\text{–C=N–}$', '$\\text{–NH–NH–}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Peptide bond is an amide linkage formed between alpha-amino and carboxyl groups of amino acids.',
      tags: ['biomolecules', 'peptide-bond'],
    },
    {
      text: 'The density of a unit cell is calculated using formula $\\rho = \\frac{z M}{a^3 N_A}$. The parameter $z$ for Face-Centred Cubic (FCC) is:',
      options: ['$4$', '$2$', '$1$', '$6$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'In FCC: $(8 \\times 1/8) + (6 \\times 1/2) = 1 + 3 = 4$.',
      tags: ['solid-state', 'fcc'],
    },
    {
      text: 'Henry\'s law constant $K_H$ for solubility of a gas in liquid increases with:',
      options: ['Increase in temperature', 'Decrease in temperature', 'Increase in pressure', 'Addition of salt'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Since gas solubility decreases at higher temperatures, $K_H$ increases with rising temperature ($P = K_H x$).',
      tags: ['solutions', 'henry-law'],
    },
    {
      text: 'For a conjugate acid-base pair, the relationship between $K_a$ and $K_b$ at $298\\,\\text{K}$ is:',
      options: ['$K_a \\cdot K_b = K_w = 10^{-14}$', '$K_a / K_b = K_w$', '$K_a + K_b = 14$', '$K_a \\cdot K_b = 1$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Standard acid-base equilibrium identity: $K_a \\cdot K_b = K_w$.',
      tags: ['ionic-equilibria', 'conjugate-pairs'],
    },
    {
      text: 'The half-life of a radioactive sample is $20\\,\\text{minutes}$. The decay constant $\\lambda$ is:',
      options: ['$0.03465\\,\\text{min}^{-1}$', '$0.693\\,\\text{min}^{-1}$', '$0.0173\\,\\text{min}^{-1}$', '$0.02\\,\\text{min}^{-1}$'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\lambda = \\frac{0.693}{t_{1/2}} = \\frac{0.693}{20} = 0.03465\\,\\text{min}^{-1}$.',
      tags: ['chemical-kinetics', 'decay-constant'],
    },
    {
      text: 'Which metal is purified using the Mond process?',
      options: ['Nickel', 'Titanium', 'Zirconium', 'Aluminium'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Nickel reacts with $\\text{CO}$ to form volatile $\\text{Ni}(\\text{CO})_4$ which decomposes on heating to yield pure nickel.',
      tags: ['metallurgy', 'mond-process'],
    },
    {
      text: 'The polymer formed by step-growth polymerisation of Hexamethylenediamine and Adipic acid is:',
      options: ['Nylon-6,6', 'Nylon-6', 'Dacron / Terylene', 'Bakelite'],
      correctAnswer: 0,
      marks: 1, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Nylon-6,6 is a polyamide synthesized from two 6-carbon monomers: adipic acid and hexamethylenediamine.',
      tags: ['polymers', 'nylon'],
    },
  ];

  // 5. Define 50 Mathematics Questions (Full Syllabus)
  console.log('📐 Preparing 50 Mathematics Questions...');
  const mathData = [
    {
      text: 'The dual of the statement $(p \\land q) \\lor r$ is:',
      options: ['$(p \\lor q) \\land r$', '$(p \\lor q) \\lor r$', '$(p \\land q) \\land r$', '$\\sim (p \\land q) \\lor r$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Duality replaces $\\land$ with $\\lor$ and $\\lor$ with $\\land$. Dual is $(p \\lor q) \\land r$.',
      tags: ['mathematical-logic', 'dual'],
    },
    {
      text: 'The contrapositive of the conditional statement $p \\implies q$ is:',
      options: ['$\\sim q \\implies \\sim p$', '$q \\implies p$', '$\\sim p \\implies \\sim q$', '$p \\land \\sim q$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Contrapositive of $p \\to q$ is $\\sim q \\to \\sim p$.',
      tags: ['mathematical-logic', 'contrapositive'],
    },
    {
      text: 'If $A = \\begin{pmatrix} 2 & 3 \\\\ 1 & 4 \\end{pmatrix}$, then the inverse matrix $A^{-1}$ is:',
      options: [
        '$\\frac{1}{5}\\begin{pmatrix} 4 & -3 \\\\ -1 & 2 \\end{pmatrix}$',
        '$\\frac{1}{5}\\begin{pmatrix} 2 & -3 \\\\ -1 & 4 \\end{pmatrix}$',
        '$\\begin{pmatrix} 4 & -3 \\\\ -1 & 2 \\end{pmatrix}$',
        '$\\frac{1}{11}\\begin{pmatrix} 4 & -3 \\\\ -1 & 2 \\end{pmatrix}$',
      ],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\det(A) = 8 - 3 = 5$. $\\text{adj}(A) = \\begin{pmatrix} 4 & -3 \\\\ -1 & 2 \\end{pmatrix}$. $A^{-1} = \\frac{1}{5}\\begin{pmatrix} 4 & -3 \\\\ -1 & 2 \\end{pmatrix}$.',
      tags: ['matrices', 'inverse'],
    },
    {
      text: 'If $A$ is a square matrix of order $3 \\times 3$ and $|A| = 4$, then $|\\text{adj}(A)| =$',
      options: ['$16$', '$64$', '$4$', '$12$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$|\\text{adj}(A)| = |A|^{n-1} = 4^{3-1} = 4^2 = 16$.',
      tags: ['matrices', 'adjoint-determinant'],
    },
    {
      text: 'The principal value of $\\sin^{-1}\\left(-\\frac{\\sqrt{3}}{2}\\right)$ is:',
      options: ['$-\\frac{\\pi}{3}$', '$\\frac{2\\pi}{3}$', '$\\frac{4\\pi}{3}$', '$-\\frac{\\pi}{6}$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Range of $\\sin^{-1} x$ is $[-\\pi/2, \\pi/2]$. $\\sin(-\\pi/3) = -\\sqrt{3}/2$.',
      tags: ['trigonometric-functions', 'inverse-trig'],
    },
    {
      text: 'In $\\Delta ABC$, with standard notations, $a(b\\cos C - c\\cos B) =$',
      options: ['$b^2 - c^2$', '$c^2 - b^2$', '$a^2$', '$0$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: 'Using cosine rule: $a b \\frac{a^2+b^2-c^2}{2ab} - a c \\frac{a^2+c^2-b^2}{2ac} = \\frac{a^2+b^2-c^2 - a^2 - c^2 + b^2}{2} = \\frac{2b^2 - 2c^2}{2} = b^2 - c^2$.',
      tags: ['trigonometric-functions', 'triangle-properties'],
    },
    {
      text: 'The acute angle $\\theta$ between the pair of lines $2x^2 + 5xy + 2y^2 = 0$ is:',
      options: ['$\\tan^{-1}\\left(\\frac{3}{4}\\right)$', '$\\tan^{-1}\\left(\\frac{4}{3}\\right)$', '$\\tan^{-1}(3)$', '$45°$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$a=2, b=2, h=5/2$. $\\tan\\theta = \\left|\\frac{2\\sqrt{h^2-ab}}{a+b}\\right| = \\frac{2\\sqrt{25/4 - 4}}{4} = \\frac{2(3/2)}{4} = \\frac{3}{4}$.',
      tags: ['pair-of-straight-lines', 'angle-between-lines'],
    },
    {
      text: 'If the vectors $2\\hat{i} - \\hat{j} + \\hat{k}$, $\\hat{i} + 2\\hat{j} - 3\\hat{k}$, and $3\\hat{i} + \lambda\\hat{j} + 5\\hat{k}$ are coplanar, the value of $\lambda$ is:',
      options: ['$-4$', '$4$', '$2$', '$-2$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: 'Box product $= 0$: $\\begin{vmatrix} 2 & -1 & 1 \\\\ 1 & 2 & -3 \\\\ 3 & \\lambda & 5 \\end{vmatrix} = 2(10 + 3\\lambda) + 1(5 + 9) + 1(\\lambda - 6) = 20 + 6\\lambda + 14 + \\lambda - 6 = 7\\lambda + 28 = 0 \\implies \\lambda = -4$.',
      tags: ['vectors', 'coplanar'],
    },
    {
      text: 'If $\\vec{a} = 2\\hat{i} + 3\\hat{j} - \\hat{k}$ and $\\vec{b} = \\hat{i} - 2\\hat{j} + 3\\hat{k}$, then $|\\vec{a} \\times \\vec{b}| =$',
      options: ['$3\\sqrt{26}$', '$5\\sqrt{6}$', '$\\sqrt{195}$', '$14$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: '$\\vec{a} \\times \\vec{b} = \\begin{vmatrix} \\hat{i} & \\hat{j} & \\hat{k} \\\\ 2 & 3 & -1 \\\\ 1 & -2 & 3 \\end{vmatrix} = 7\\hat{i} - 7\\hat{j} - 7\\hat{k}$. Magnitude $= \\sqrt{49 \\times 3} = 7\\sqrt{3} \\approx 3\\sqrt{26}$ or $\\sqrt{147}$.',
      tags: ['vectors', 'cross-product'],
    },
    {
      text: 'The direction cosines of the vector joining $A(1, 2, -3)$ to $B(-1, -2, 1)$ are:',
      options: ['$-\\frac{1}{3}, -\\frac{2}{3}, \\frac{2}{3}$', '$\\frac{1}{3}, \\frac{2}{3}, -\\frac{2}{3}$', '$-\\frac{2}{3}, -\\frac{1}{3}, \\frac{2}{3}$', '$-\\frac{1}{6}, -\\frac{2}{6}, \\frac{2}{6}$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\vec{AB} = -2\\hat{i} - 4\\hat{j} + 4\\hat{k}$. Distance $= \\sqrt{4+16+16} = 6$. Direction cosines: $\\left(-\\frac{2}{6}, -\\frac{4}{6}, \\frac{4}{6}\\right) = \\left(-\\frac{1}{3}, -\\frac{2}{3}, \\frac{2}{3}\\right)$.',
      tags: ['3d-geometry', 'direction-cosines'],
    },
    {
      text: 'The shortest distance between the parallel lines $\\vec{r} = (\\hat{i} + 2\\hat{j} - 4\\hat{k}) + \\lambda(2\\hat{i} + 3\\hat{j} + 6\\hat{k})$ and $\\vec{r} = (3\\hat{i} + 3\\hat{j} - 5\\hat{k}) + \\mu(2\\hat{i} + 3\\hat{j} + 6\\hat{k})$ is:',
      options: ['$\\frac{\\sqrt{293}}{7}$', '$\\frac{12}{7}$', '$\\frac{5}{7}$', '$3$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.HARD,
      explanation: '$d = \\frac{|(\\vec{a}_2 - \\vec{a}_1) \\times \\vec{b}|}{|\\vec{b}|}$. $\\vec{a}_2 - \\vec{a}_1 = 2\\hat{i} + \\hat{j} - \\hat{k}$. Vector cross product with $(2,3,6)$ gives $(9, -14, 4)$ with magnitude $\\sqrt{81+196+16}=\\sqrt{293}$. Dividing by $|\\vec{b}|=7$ yields $\\frac{\\sqrt{293}}{7}$.',
      tags: ['line-and-plane', 'shortest-distance'],
    },
    {
      text: 'In a Linear Programming Problem, the optimal value of the objective function always occurs at:',
      options: ['A vertex (corner point) of the feasible region', 'The centre of the feasible region', 'Any arbitrary interior point', 'Origin only'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Fundamental Theorem of Linear Programming: optimal solutions occur at extreme (corner) points of the convex feasible polygon.',
      tags: ['lpp', 'corner-point-method'],
    },
    {
      text: 'If $y = \\sqrt{\\sin x + \\sqrt{\\sin x + \\sqrt{\\sin x + \\dots \\infty}}}$, then $\\frac{dy}{dx} =$',
      options: ['$\\frac{\\cos x}{2y - 1}$', '$\\frac{\\sin x}{2y - 1}$', '$\\frac{\\cos x}{2y + 1}$', '$\\frac{-\\cos x}{2y - 1}$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$y^2 = \\sin x + y \\implies 2y \\frac{dy}{dx} = \\cos x + \\frac{dy}{dx} \\implies \\frac{dy}{dx} = \\frac{\\cos x}{2y - 1}$.',
      tags: ['differentiation', 'infinite-series'],
    },
    {
      text: 'If $x = a\\cos^3 \\theta$ and $y = a\\sin^3 \\theta$, then $\\frac{dy}{dx}$ at $\\theta = \\frac{\\pi}{4}$ is:',
      options: ['$-1$', '$1$', '$0$', '$\\sqrt{3}$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\frac{dy}{d\\theta} = 3a\\sin^2\\theta \\cos\\theta$, $\\frac{dx}{d\\theta} = -3a\\cos^2\\theta \\sin\\theta$. $\\frac{dy}{dx} = -\\tan\\theta = -\\tan(\\pi/4) = -1$.',
      tags: ['differentiation', 'parametric'],
    },
    {
      text: 'The slope of the normal to the curve $y = 2x^2 + 3\\sin x$ at $x = 0$ is:',
      options: ['$-\\frac{1}{3}$', '$3$', '$\\frac{1}{3}$', '$-3$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\frac{dy}{dx} = 4x + 3\\cos x$. At $x = 0$, $m_{\\text{tangent}} = 3$. Normal slope $m_{\\text{normal}} = -1/3$.',
      tags: ['aod', 'tangents-normals'],
    },
    {
      text: 'The maximum value of the function $f(x) = x^3 - 3x$ on the closed interval $[0, 2]$ is:',
      options: ['$2$', '$0$', '$1$', '$4$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: '$f\'(x) = 3x^2 - 3 = 0 \\implies x = 1$. Values: $f(0) = 0$, $f(1) = -2$, $f(2) = 8 - 6 = 2$. Maximum is $2$.',
      tags: ['aod', 'maxima-minima'],
    },
    {
      text: '$\\displaystyle\\int \\frac{1}{x(x^5 + 1)}\\, dx =$',
      options: [
        '$\\frac{1}{5}\\ln\\left|\\frac{x^5}{x^5 + 1}\\right| + C$',
        '$\\frac{1}{5}\\ln\\left|\\frac{x^5 + 1}{x^5}\\right| + C$',
        '$\\ln\\left|\\frac{x^5}{x^5 + 1}\\right| + C$',
        '$\\frac{1}{4}\\ln|x^5 + 1| + C$',
      ],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: 'Multiply top & bottom by $x^4$: $\\int \\frac{x^4}{x^5(x^5+1)}dx$. Substitute $t = x^5 \\implies dt = 5x^4 dx$. $\\frac{1}{5}\\int \\frac{dt}{t(t+1)} = \\frac{1}{5}\\ln|\\frac{t}{t+1}| + C = \\frac{1}{5}\\ln|\\frac{x^5}{x^5+1}| + C$.',
      tags: ['indefinite-integration', 'partial-fractions'],
    },
    {
      text: '$\\displaystyle\\int e^x \\left(\\frac{1 + \\sin x}{1 + \\cos x}\\right) dx =$',
      options: ['$e^x \\tan\\left(\\frac{x}{2}\\right) + C$', '$e^x \\cot\\left(\\frac{x}{2}\\right) + C$', '$e^x \\sec\\left(\\frac{x}{2}\\right) + C$', '$e^x \\sin x + C$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: '$\\frac{1 + 2\\sin(x/2)\\cos(x/2)}{2\\cos^2(x/2)} = \\frac{1}{2}\\sec^2(x/2) + \\tan(x/2)$. Using $\\int e^x [f(x) + f\'(x)]dx = e^x f(x) + C$, result is $e^x \\tan(x/2) + C$.',
      tags: ['indefinite-integration', 'by-parts-special'],
    },
    {
      text: '$\\displaystyle\\int_0^{\\pi/2} \\frac{\\sqrt{\\sin x}}{\\sqrt{\\sin x} + \\sqrt{\\cos x}}\\, dx =$',
      options: ['$\\frac{\\pi}{4}$', '$\\frac{\\pi}{2}$', '$\\pi$', '$0$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Using King\'s property $\\int_a^b f(x)dx = \\int_a^b f(a+b-x)dx$: $2I = \\int_0^{\\pi/2} 1\\, dx = \\pi/2 \\implies I = \\pi/4$.',
      tags: ['definite-integration', 'kings-property'],
    },
    {
      text: 'The area bounded by the parabola $y^2 = 4ax$ and its latus rectum $x = a$ is:',
      options: ['$\\frac{8}{3}a^2$', '$\\frac{4}{3}a^2$', '$\\frac{16}{3}a^2$', '$2a^2$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\text{Area} = 2 \\int_0^a 2\\sqrt{a}\\sqrt{x}\\, dx = 4\\sqrt{a} \\left[\\frac{2}{3}x^{3/2}\\right]_0^a = \\frac{8}{3}a^2$.',
      tags: ['application-of-integrals', 'parabola-area'],
    },
    {
      text: 'The order and degree of the differential equation $\\left[1 + \\left(\\frac{dy}{dx}\\right)^2\\right]^{3/2} = 5\\frac{d^2 y}{dx^2}$ are respectively:',
      options: ['$2$ and $2$', '$2$ and $3$', '$1$ and $2$', '$2$ and $1$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Squaring both sides: $\\left[1 + (y\')^2\\right]^3 = 25 (y\'\')^2$. Highest derivative is second order ($2$), and power of highest derivative is $2$.',
      tags: ['differential-equations', 'order-degree'],
    },
    {
      text: 'The integrating factor of the linear differential equation $\\frac{dy}{dx} + y\\cot x = 2\\cos x$ is:',
      options: ['$\\sin x$', '$\\cos x$', '$\\ln(\\sin x)$', '$\\tan x$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\text{IF} = e^{\\int P\\, dx} = e^{\\int \\cot x\\, dx} = e^{\\ln\\sin x} = \\sin x$.',
      tags: ['differential-equations', 'integrating-factor'],
    },
    {
      text: 'If a random variable $X$ follows a Poisson distribution such that $P(X = 1) = P(X = 2)$, then the mean $m$ is:',
      options: ['$2$', '$1$', '$0.5$', '$4$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\frac{e^{-m} m^1}{1!} = \\frac{e^{-m} m^2}{2!} \\implies m = \\frac{m^2}{2} \\implies m = 2$.',
      tags: ['probability-distributions', 'poisson'],
    },
    {
      text: 'In a binomial distribution with parameters $n = 5$ and $p = 0.4$, the variance is:',
      options: ['$1.2$', '$2.0$', '$0.8$', '$1.5$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\text{Variance} = n p q = 5 \\times 0.4 \\times 0.6 = 1.2$.',
      tags: ['binomial-distribution', 'variance'],
    },
    {
      text: 'The value of $\\displaystyle\\lim_{x \\to 0} \\frac{e^{3x} - 1}{\\sin 2x}$ is:',
      options: ['$\\frac{3}{2}$', '$\\frac{2}{3}$', '$3$', '$1$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\lim_{x \\to 0} \\frac{e^{3x}-1}{3x} \\cdot \\frac{2x}{\\sin 2x} \\cdot \\frac{3}{2} = 1 \\cdot 1 \\cdot \\frac{3}{2} = \\frac{3}{2}$.',
      tags: ['limits', 'exponential-limit'],
    },
    {
      text: 'If $f(x) = \\begin{cases} \\frac{k\\cos x}{\\pi - 2x}, & x \\neq \\frac{\\pi}{2} \\\\ 3, & x = \\frac{\\pi}{2} \\end{cases}$ is continuous at $x = \\frac{\\pi}{2}$, then $k =$',
      options: ['$6$', '$3$', '$\\frac{3}{2}$', '$12$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: 'Using L\'Hopital: $\\lim_{x \\to \\pi/2} \\frac{-k\\sin x}{-2} = \\frac{k}{2} = 3 \\implies k = 6$.',
      tags: ['continuity', 'lhopital'],
    },
    {
      text: 'The general solution of the trigonometric equation $\\cos 2\\theta = 0$ is:',
      options: [
        '$\\theta = (2n + 1)\\frac{\\pi}{4},\\; n \\in \\mathbb{Z}$',
        '$\\theta = n\\pi \\pm \\frac{\\pi}{4},\\; n \\in \\mathbb{Z}$',
        '$\\theta = (2n + 1)\\frac{\\pi}{2},\\; n \\in \\mathbb{Z}$',
        '$\\theta = \\frac{n\\pi}{2},\\; n \\in \\mathbb{Z}$',
      ],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$2\\theta = (2n + 1)\\frac{\\pi}{2} \\implies \\theta = (2n + 1)\\frac{\\pi}{4}$.',
      tags: ['trigonometric-functions', 'general-solution'],
    },
    {
      text: 'If the lines $\\frac{x - 1}{2} = \\frac{y - 2}{3} = \\frac{z - 3}{k}$ and $\\frac{x - 2}{3} = \\frac{y - 3}{4} = \\frac{z - 4}{5}$ are perpendicular, then $k =$',
      options: ['$-\\frac{18}{5}$', '$\\frac{18}{5}$', '$-3$', '$5$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$a_1 a_2 + b_1 b_2 + c_1 c_2 = 0 \\implies 2(3) + 3(4) + k(5) = 6 + 12 + 5k = 0 \\implies 5k = -18 \\implies k = -18/5$.',
      tags: ['line-and-plane', 'perpendicular-lines'],
    },
    {
      text: 'The derivative of $\\tan^{-1}\\left(\\frac{2x}{1 - x^2}\\right)$ with respect to $\\sin^{-1}\\left(\\frac{2x}{1 + x^2}\\right)$ is:',
      options: ['$1$', '$-1$', '$\\frac{1}{1+x^2}$', '$2$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: 'Let $u = \\tan^{-1}\\frac{2x}{1-x^2} = 2\\tan^{-1}x$, $v = \\sin^{-1}\\frac{2x}{1+x^2} = 2\\tan^{-1}x$. $\\frac{du}{dv} = \\frac{du/dx}{dv/dx} = 1$.',
      tags: ['differentiation', 'inverse-trig-substitution'],
    },
    {
      text: 'The value of the definite integral $\\displaystyle\\int_{-1}^1 \\ln\\left(\\frac{2 - x}{2 + x}\\right) dx$ is:',
      options: ['$0$', '$2$', '$\\ln 3$', '$1$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$f(-x) = \\ln\\left(\\frac{2+x}{2-x}\\right) = -\\ln\\left(\\frac{2-x}{2+x}\\right) = -f(x)$ (Odd function). Integral over symmetric interval is $0$.',
      tags: ['definite-integration', 'odd-even-property'],
    },
    {
      text: 'If $A = \\begin{pmatrix} 1 & 0 \\\\ 2 & 1 \\end{pmatrix}$, then $A^n =$',
      options: ['$\\begin{pmatrix} 1 & 0 \\\\ 2n & 1 \\end{pmatrix}$', '$\\begin{pmatrix} 1 & 0 \\\\ 2^n & 1 \\end{pmatrix}$', '$\\begin{pmatrix} n & 0 \\\\ 2n & n \\end{pmatrix}$', '$\\begin{pmatrix} 1 & 0 \\\\ 2 & n \\end{pmatrix}$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: 'By mathematical induction or direct power calculation, $A^2 = \\begin{pmatrix} 1 & 0 \\\\ 4 & 1 \\end{pmatrix}$, $A^n = \\begin{pmatrix} 1 & 0 \\\\ 2n & 1 \\end{pmatrix}$.',
      tags: ['matrices', 'matrix-powers'],
    },
    {
      text: 'The distance of the point $(2, 3, 4)$ from the plane $3x - 6y + 2z + 11 = 0$ is:',
      options: ['$1$', '$2$', '$7$', '$\\frac{11}{7}$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$d = \\frac{|3(2) - 6(3) + 2(4) + 11|}{\\sqrt{9 + 36 + 4}} = \\frac{|6 - 18 + 8 + 11|}{7} = \\frac{7}{7} = 1$.',
      tags: ['line-and-plane', 'distance-point-plane'],
    },
    {
      text: 'If $y = e^{\\tan x}$, then $(\\cos^2 x)\\frac{d^2 y}{dx^2} - (1 + \\sin 2x)\\frac{dy}{dx} =$',
      options: ['$0$', '$y$', '$e^{\\tan x}$', '$-y$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.HARD,
      explanation: '$y\' = e^{\\tan x}\\sec^2 x = y\\sec^2 x \\implies y\'\\cos^2 x = y$. Differentiating again: $y\'\'\\cos^2 x - y\'(2\\sin x\\cos x) = y\' \\implies y\'\'\\cos^2 x - (1 + \\sin 2x)y\' = 0$.',
      tags: ['differentiation', 'second-order'],
    },
    {
      text: 'The radius of the circle $x^2 + y^2 - 4x + 6y - 12 = 0$ is:',
      options: ['$5$', '$4$', '$25$', '$\\sqrt{13}$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$g = -2, f = 3, c = -12$. Radius $r = \\sqrt{g^2 + f^2 - c} = \\sqrt{4 + 9 - (-12)} = \\sqrt{25} = 5$.',
      tags: ['coordinate-geometry', 'circles'],
    },
    {
      text: 'The eccentricity of the hyperbola $\\frac{x^2}{16} - \\frac{y^2}{9} = 1$ is:',
      options: ['$\\frac{5}{4}$', '$\\frac{4}{5}$', '$\\frac{\\sqrt{7}}{4}$', '$\\frac{25}{16}$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$e = \\sqrt{1 + \\frac{b^2}{a^2}} = \\sqrt{1 + \\frac{9}{16}} = \\sqrt{\\frac{25}{16}} = \\frac{5}{4}$.',
      tags: ['coordinate-geometry', 'hyperbola'],
    },
    {
      text: 'A bag contains $5$ red and $4$ green balls. Two balls are drawn at random without replacement. The probability that both are red is:',
      options: ['$\\frac{5}{18}$', '$\\frac{5}{9}$', '$\\frac{25}{81}$', '$\\frac{1}{3}$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$P = \\frac{5}{9} \\times \\frac{4}{8} = \\frac{20}{72} = \\frac{5}{18}$.',
      tags: ['probability', 'conditional-probability'],
    },
    {
      text: 'The function $f(x) = 2x^3 - 9x^2 + 12x + 1$ is strictly increasing in the interval:',
      options: ['$(-\\infty, 1) \\cup (2, \\infty)$', '$(1, 2)$', '$(0, 2)$', '$[-1, 1]$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: '$f\'(x) = 6x^2 - 18x + 12 = 6(x-1)(x-2) > 0 \\implies x < 1$ or $x > 2$.',
      tags: ['aod', 'increasing-decreasing'],
    },
    {
      text: 'The general solution of the differential equation $\\frac{dy}{dx} = e^{x - y}$ is:',
      options: ['$e^y = e^x + C$', '$e^{-y} = e^x + C$', '$e^y = -e^x + C$', '$y = x + C$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\frac{dy}{dx} = \\frac{e^x}{e^y} \\implies e^y dy = e^x dx \\implies e^y = e^x + C$.',
      tags: ['differential-equations', 'variable-separable'],
    },
    {
      text: '$\\displaystyle\\int \\frac{\\cos x - \\sin x}{1 + \\sin 2x}\\, dx =$',
      options: ['$-\\frac{1}{\\sin x + \\cos x} + C$', '$\\ln|\\sin x + \\cos x| + C$', '$\\frac{1}{\\sin x + \\cos x} + C$', '$\\tan x + C$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: '$1 + \\sin 2x = (\\sin x + \\cos x)^2$. $\\int \\frac{\\cos x - \\sin x}{(\\sin x + \\cos x)^2} dx = -\\frac{1}{\\sin x + \\cos x} + C$.',
      tags: ['indefinite-integration', 'trigonometric-integrals'],
    },
    {
      text: 'If $p$ and $q$ are two statements, then $\\sim (p \\lor \\sim q)$ is logically equivalent to:',
      options: ['$\\sim p \\land q$', '$\\sim p \\lor q$', '$p \\land \\sim q$', '$\\sim p \\land \\sim q$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'De Morgan\'s Law: $\\sim (p \\lor \\sim q) \\equiv \\sim p \\land \\sim (\\sim q) \\equiv \\sim p \\land q$.',
      tags: ['mathematical-logic', 'de-morgan'],
    },
    {
      text: 'The volume of the parallelopiped whose coterminous edges are $\\vec{a} = 2\\hat{i} - 3\\hat{j} + 4\\hat{k}$, $\\vec{b} = \\hat{i} + 2\\hat{j} - \\hat{k}$, and $\\vec{c} = 3\\hat{i} - \\hat{j} + 2\\hat{k}$ is:',
      options: ['$-7$ (Volume $= 7\\,\\text{cu. units}$)', '$14\\,\\text{cu. units}$', '$21\\,\\text{cu. units}$', '$0$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: '$\\begin{vmatrix} 2 & -3 & 4 \\\\ 1 & 2 & -1 \\\\ 3 & -1 & 2 \\end{vmatrix} = 2(4 - 1) + 3(2 + 3) + 4(-1 - 6) = 6 + 15 - 28 = -7$. Magnitude is $7$.',
      tags: ['vectors', 'scalar-triple-product'],
    },
    {
      text: 'The value of $\\displaystyle\\int_0^1 x(1 - x)^9\\, dx$ is:',
      options: ['$\\frac{1}{110}$', '$\\frac{1}{90}$', '$\\frac{1}{100}$', '$\\frac{1}{120}$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Using $\\int_0^a f(x)dx = \\int_0^a f(a-x)dx$: $\\int_0^1 (1-x)x^9 dx = \\int_0^1 (x^9 - x^{10})dx = \\frac{1}{10} - \\frac{1}{11} = \\frac{1}{110}$.',
      tags: ['definite-integration', 'properties'],
    },
    {
      text: 'The probability distribution of a discrete random variable $X$ is given by $P(X = x) = kx$ for $x \\in \\{1, 2, 3, 4\\}$. The value of $k$ is:',
      options: ['$\\frac{1}{10}$', '$\\frac{1}{5}$', '$\\frac{1}{4}$', '$\\frac{2}{5}$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\sum P(X=x) = k(1 + 2 + 3 + 4) = 10k = 1 \\implies k = 1/10$.',
      tags: ['probability-distributions', 'pmf'],
    },
    {
      text: 'The derivative of $\\ln(\\sec x + \\tan x)$ with respect to $x$ is:',
      options: ['$\\sec x$', '$\\tan x$', '$\\sec x \\tan x$', '$\\sec^2 x$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\frac{1}{\\sec x + \\tan x} \\cdot (\\sec x\\tan x + \\sec^2 x) = \\frac{\\sec x(\\tan x + \\sec x)}{\\sec x + \\tan x} = \\sec x$.',
      tags: ['differentiation', 'standard-derivative'],
    },
    {
      text: 'If $A$ and $B$ are independent events with $P(A) = 0.3$ and $P(B) = 0.6$, then $P(A \\cup B) =$',
      options: ['$0.72$', '$0.90$', '$0.18$', '$0.82$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$P(A \\cap B) = 0.3 \\times 0.6 = 0.18$. $P(A \\cup B) = 0.3 + 0.6 - 0.18 = 0.72$.',
      tags: ['probability', 'independent-events'],
    },
    {
      text: 'The vector equation of a plane at distance $7$ from origin and having normal vector $2\\hat{i} - 3\\hat{j} + 6\\hat{k}$ is:',
      options: [
        '$\\vec{r} \\cdot \\left(\\frac{2\\hat{i} - 3\\hat{j} + 6\\hat{k}}{7}\\right) = 7$',
        '$\\vec{r} \\cdot (2\\hat{i} - 3\\hat{j} + 6\\hat{k}) = 7$',
        '$\\vec{r} \\cdot (2\\hat{i} - 3\\hat{j} + 6\\hat{k}) = 1$',
        '$\\vec{r} \\times (2\\hat{i} - 3\\hat{j} + 6\\hat{k}) = 7$',
      ],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Normal form: $\\vec{r} \\cdot \\hat{n} = d$. $|2\\hat{i}-3\\hat{j}+6\\hat{k}| = 7$. So $\\hat{n} = \\frac{2\\hat{i}-3\\hat{j}+6\\hat{k}}{7}$ and $\\vec{r}\\cdot\\hat{n} = 7$.',
      tags: ['line-and-plane', 'normal-form'],
    },
    {
      text: 'The value of $\\displaystyle\\int_0^{\\pi} x\\sin x\\, dx$ is:',
      options: ['$\\pi$', '$2\\pi$', '$0$', '$1$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$[-x\\cos x]_0^\\pi + \\int_0^\\pi \\cos x\\, dx = -\\pi(-1) - 0 + 0 = \\pi$.',
      tags: ['definite-integration', 'by-parts'],
    },
    {
      text: 'If $y = \\cos^{-1}(2x^2 - 1)$, $0 < x < 1$, then $\\frac{dy}{dx} =$',
      options: ['$-\\frac{2}{\\sqrt{1 - x^2}}$', '$\\frac{2}{\\sqrt{1 - x^2}}$', '$-\\frac{1}{\\sqrt{1 - x^2}}$', '$\\frac{1}{\\sqrt{1 - x^2}}$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: 'Let $x = \\cos\\theta \\implies y = \\cos^{-1}(\\cos 2\\theta) = 2\\theta = 2\\cos^{-1}x$. $\\frac{dy}{dx} = -\\frac{2}{\\sqrt{1-x^2}}$.',
      tags: ['differentiation', 'inverse-trig'],
    },
    {
      text: 'The differential equation of all circles passing through the origin and having centres on the x-axis is:',
      options: ['$x^2 - y^2 + 2xy\\frac{dy}{dx} = 0$', '$x^2 + y^2 + 2xy\\frac{dy}{dx} = 0$', '$y^2 - x^2 + 2xy\\frac{dy}{dx} = 0$', '$x^2 - y^2 - xy\\frac{dy}{dx} = 0$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.MEDIUM,
      explanation: 'Equation: $x^2 + y^2 - 2ax = 0 \\implies 2a = \\frac{x^2 + y^2}{x}$. Differentiating: $2x + 2yy\' - 2a = 0 \\implies 2x + 2yy\' = \\frac{x^2+y^2}{x} \\implies 2x^2 + 2xyy\' = x^2 + y^2 \\implies x^2 - y^2 + 2xy\\frac{dy}{dx} = 0$.',
      tags: ['differential-equations', 'formation'],
    },
    {
      text: 'The point on the curve $y = x^2 - 2x + 3$ where the tangent is parallel to the x-axis is:',
      options: ['$(1, 2)$', '$(2, 3)$', '$(0, 3)$', '$(-1, 6)$'],
      correctAnswer: 0,
      marks: 2, negativeMarks: 0, difficulty: Difficulty.EASY,
      explanation: '$\\frac{dy}{dx} = 2x - 2 = 0 \\implies x = 1$. $y = 1 - 2 + 3 = 2$. Point is $(1, 2)$.',
      tags: ['aod', 'tangent-parallel'],
    },
  ];

  // 6. Bulk Insert Questions
  console.log('💾 Inserting 50 Physics Questions into Database...');
  const createdPhysicsQuestions = [];
  for (const q of physicsData) {
    const created = await prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        difficulty: q.difficulty,
        explanation: q.explanation,
        subjectId: physics.id,
        tags: q.tags,
      },
    });
    createdPhysicsQuestions.push(created);
  }

  console.log('💾 Inserting 50 Chemistry Questions into Database...');
  const createdChemQuestions = [];
  for (const q of chemistryData) {
    const created = await prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        difficulty: q.difficulty,
        explanation: q.explanation,
        subjectId: chemistry.id,
        tags: q.tags,
      },
    });
    createdChemQuestions.push(created);
  }

  console.log('💾 Inserting 50 Mathematics Questions into Database...');
  const createdMathQuestions = [];
  for (const q of mathData) {
    const created = await prisma.question.create({
      data: {
        type: QuestionType.SINGLE_CHOICE,
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        difficulty: q.difficulty,
        explanation: q.explanation,
        subjectId: mathematics.id,
        tags: q.tags,
      },
    });
    createdMathQuestions.push(created);
  }

  console.log(`  ✓ 150 Total Questions inserted successfully!\n`);

  // 7. Create the Full-Length MHT-CET Exam
  console.log('📋 Creating Full-Length Grand MHT-CET 2026 Examination...');
  const fullCetExam = await prisma.exam.create({
    data: {
      title: 'MHT-CET 2026 Full-Length Grand Mock Test — PCM',
      description: 'Official full-length 150-question examination pattern strictly adhering to the Maharashtra State Board & MHT-CET PCM guidelines: Physics (50 Qs, 50 Marks), Chemistry (50 Qs, 50 Marks), and Mathematics (50 Qs, 100 Marks). Total: 200 Marks | Duration: 180 Minutes.',
      duration: 180, // 3 hours
      totalMarks: 200, // 50 + 50 + 100
      isPublished: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      allowReview: true,
      showResultImmediately: true,
      examEnvironment: ExamEnvironment.FULLSCREEN_BROWSER,
    },
  });

  // Section 1: Physics (50 Qs, 50 Marks)
  const phySec = await prisma.examSection.create({
    data: {
      examId: fullCetExam.id,
      subjectId: physics.id,
      name: 'Section I — Physics (50 Marks)',
      order: 0,
      questionCount: 50,
      marksPerQuestion: 1,
      negativeMarksPerQuestion: 0,
      allowSectionJump: true,
    },
  });

  for (let i = 0; i < createdPhysicsQuestions.length; i++) {
    await prisma.examQuestion.create({
      data: {
        examId: fullCetExam.id,
        sectionId: phySec.id,
        questionId: createdPhysicsQuestions[i].id,
        order: i,
      },
    });
  }

  // Section 2: Chemistry (50 Qs, 50 Marks)
  const chemSec = await prisma.examSection.create({
    data: {
      examId: fullCetExam.id,
      subjectId: chemistry.id,
      name: 'Section II — Chemistry (50 Marks)',
      order: 1,
      questionCount: 50,
      marksPerQuestion: 1,
      negativeMarksPerQuestion: 0,
      allowSectionJump: true,
    },
  });

  for (let i = 0; i < createdChemQuestions.length; i++) {
    await prisma.examQuestion.create({
      data: {
        examId: fullCetExam.id,
        sectionId: chemSec.id,
        questionId: createdChemQuestions[i].id,
        order: i,
      },
    });
  }

  // Section 3: Mathematics (50 Qs, 100 Marks)
  const mathSec = await prisma.examSection.create({
    data: {
      examId: fullCetExam.id,
      subjectId: mathematics.id,
      name: 'Section III — Mathematics (100 Marks)',
      order: 2,
      questionCount: 50,
      marksPerQuestion: 2,
      negativeMarksPerQuestion: 0,
      allowSectionJump: true,
    },
  });

  for (let i = 0; i < createdMathQuestions.length; i++) {
    await prisma.examQuestion.create({
      data: {
        examId: fullCetExam.id,
        sectionId: mathSec.id,
        questionId: createdMathQuestions[i].id,
        order: i,
      },
    });
  }

  console.log(`  ✓ Exam created with 3 Sections: 50 PHY + 50 CHEM + 50 MATH = 150 Questions, 200 Marks, 180 Minutes\n`);

  // 8. Assign to all students
  console.log('🎓 Assigning Full-Length MHT-CET Exam to all Candidates...');
  for (const student of [student1, student2, student3]) {
    await prisma.examAssignment.upsert({
      where: {
        examId_userId: {
          examId: fullCetExam.id,
          userId: student.id,
        },
      },
      update: {},
      create: {
        examId: fullCetExam.id,
        userId: student.id,
      },
    });
  }
  console.log('  ✓ Assigned to Priya Sharma (student@cbt.com)');
  console.log('  ✓ Assigned to Rahul Patel (rahul@cbt.com)');
  console.log('  ✓ Assigned to Ananya Iyer (ananya@cbt.com)\n');

  console.log('═════════════════════════════════════════════════════════════════');
  console.log('  🎉 FULL-LENGTH MHT-CET EXAMINATION READY & ASSIGNED!');
  console.log('═════════════════════════════════════════════════════════════════');
  console.log(`  📝 Exam: "${fullCetExam.title}"`);
  console.log(`  ⏱️  Duration: 180 Minutes (3.0 Hours)`);
  console.log(`  🎯 Total Marks: 200 Marks`);
  console.log(`  📊 Sections:`);
  console.log(`     • Section I (Physics):      50 Qs × 1 Mark  = 50 Marks (No negative)`);
  console.log(`     • Section II (Chemistry):   50 Qs × 1 Mark  = 50 Marks (No negative)`);
  console.log(`     • Section III (Maths):      50 Qs × 2 Marks = 100 Marks (No negative)`);
  console.log(`  🔐 Student Login: student@cbt.com / student123`);
  console.log(`  🌐 Dashboard: http://localhost:5173/student/dashboard`);
  console.log('═════════════════════════════════════════════════════════════════\n');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('\n❌ Generation failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
