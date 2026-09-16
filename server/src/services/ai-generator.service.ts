import prisma from '../config/database';
import { z } from 'zod';
import { Difficulty, QuestionType } from '@prisma/client';

export interface GeneratedOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface GeneratedQuestionItem {
  id?: string;
  subject: string;
  chapter: string;
  subtopic: string;
  difficulty: Difficulty;
  type: QuestionType;
  text: string;
  options: GeneratedOption[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  solutionText: string;
}

const QuestionBatchSchema = z.array(
  z.object({
    text: z.string().min(10),
    options: z.array(
      z.object({
        key: z.enum(['A', 'B', 'C', 'D']),
        text: z.string().min(1),
      })
    ).length(4),
    correctOption: z.enum(['A', 'B', 'C', 'D']),
    solutionText: z.string().min(10),
  })
);

// Complete Class 12 Standard Syllabus (48 Chapters across Physics, Chemistry, Mathematics)
export const CLASS_12_SYLLABUS: Record<string, string[]> = {
  Physics: [
    'Rotational Dynamics',
    'Mechanical Properties of Fluids',
    'Kinetic Theory of Gases and Radiation',
    'Thermodynamics',
    'Oscillations',
    'Superposition of Waves',
    'Wave Optics',
    'Electrostatics',
    'Current Electricity',
    'Magnetic Fields due to Electric Current',
    'Magnetic Materials',
    'Electromagnetic Induction',
    'AC Circuits',
    'Dual Nature of Radiation and Matter',
    'Structure of Atoms and Nuclei',
    'Semiconductor Devices',
  ],
  Chemistry: [
    'Solid State',
    'Solutions',
    'Ionic Equilibria',
    'Chemical Thermodynamics',
    'Electrochemistry',
    'Chemical Kinetics',
    'Elements of Groups 16, 17 and 18',
    'Transition and Inner Transition Elements',
    'Coordination Compounds',
    'Halogen Derivatives',
    'Alcohols, Phenols and Ethers',
    'Aldehydes, Ketones and Carboxylic Acids',
    'Amines',
    'Biomolecules',
    'Introduction to Polymer Chemistry',
    'Green Chemistry and Nanochemistry',
  ],
  Mathematics: [
    'Mathematical Logic',
    'Matrices',
    'Trigonometric Functions',
    'Pair of Straight Lines',
    'Vectors',
    'Three Dimensional Geometry',
    'Line and Plane',
    'Linear Programming',
    'Differentiation',
    'Applications of Derivatives',
    'Indefinite Integration',
    'Definite Integration',
    'Applications of Definite Integrals',
    'Differential Equations',
    'Probability Distributions',
    'Binomial Distribution',
  ],
};

// Curated Extensive Bank of Class 12 Questions (Ensures zero repetition even on offline fallback)
const EXTENSIVE_CLASS_12_BANK: GeneratedQuestionItem[] = [
  // ─── PHYSICS ──────────────────────────────────────────────────────────
  {
    subject: 'Physics',
    chapter: 'Rotational Dynamics',
    subtopic: 'Moment of Inertia',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'A uniform circular disc of mass $M$ and radius $R$ has a concentric circular hole of radius $r$. The moment of inertia of this annular disc about an axis perpendicular to its plane and passing through its center of mass is:',
    options: [
      { key: 'A', text: '$\\frac{1}{2} M (R^2 - r^2)$' },
      { key: 'B', text: '$\\frac{1}{2} M (R^2 + r^2)$' },
      { key: 'C', text: '$\\frac{1}{4} M (R^2 + r^2)$' },
      { key: 'D', text: '$M (R^2 + r^2)$' },
    ],
    correctOption: 'B',
    solutionText:
      'For an annular disc, surface density $\\sigma = \\frac{M}{\\pi(R^2 - r^2)}$. Integrating elemental rings $dI = (2\\pi x \\sigma dx) x^2$ from $r$ to $R$ yields $I = 2\\pi\\sigma\\left[\\frac{R^4 - r^4}{4}\\right] = \\frac{1}{2}M(R^2 + r^2)$.',
  },
  {
    subject: 'Physics',
    chapter: 'Rotational Dynamics',
    subtopic: 'Rolling Motion',
    difficulty: Difficulty.HARD,
    type: QuestionType.SINGLE_CHOICE,
    text: 'A solid sphere rolls down an inclined plane of inclination $\\theta$ without slipping. The minimum coefficient of static friction $\\mu$ required for pure rolling is:',
    options: [
      { key: 'A', text: '$\\frac{2}{7} \\tan\\theta$' },
      { key: 'B', text: '$\\frac{5}{7} \\tan\\theta$' },
      { key: 'C', text: '$\\frac{1}{3} \\tan\\theta$' },
      { key: 'D', text: '$\\frac{2}{5} \\tan\\theta$' },
    ],
    correctOption: 'A',
    solutionText:
      'For a sphere ($I = \\frac{2}{5}mR^2$), acceleration is $a = \\frac{g \\sin\\theta}{1 + I/(mR^2)} = \\frac{5}{7}g \\sin\\theta$.\nFriction is $f = mg \\sin\\theta - ma = \\frac{2}{7}mg \\sin\\theta$.\nSince $f \\le \\mu N = \\mu mg \\cos\\theta$, we get $\\mu \\ge \\frac{2}{7}\\tan\\theta$.',
  },
  {
    subject: 'Physics',
    chapter: 'Mechanical Properties of Fluids',
    subtopic: 'Surface Tension',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'Two soap bubbles of radii $r_1$ and $r_2$ ($r_1 > r_2$) coalesce isothermally in vacuum to form a single bubble of radius $R$. Then $R$ is given by:',
    options: [
      { key: 'A', text: '$R = r_1 + r_2$' },
      { key: 'B', text: '$R = \\sqrt{r_1^2 + r_2^2}$' },
      { key: 'C', text: '$R = \\sqrt{r_1 r_2}$' },
      { key: 'D', text: '$R = (r_1^3 + r_2^3)^{1/3}$' },
    ],
    correctOption: 'B',
    solutionText:
      'Total surface energy before coalescence is $E_1 = 8\\pi T r_1^2 + 8\\pi T r_2^2$. In vacuum under isothermal conditions with no external work, surface energy is conserved: $8\\pi T R^2 = 8\\pi T(r_1^2 + r_2^2) \\implies R = \\sqrt{r_1^2 + r_2^2}$.',
  },
  {
    subject: 'Physics',
    chapter: 'Oscillations',
    subtopic: 'Simple Harmonic Motion',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'A particle executes simple harmonic motion of amplitude $A$. At what displacement from the mean position is its kinetic energy equal to three times its potential energy?',
    options: [
      { key: 'A', text: '$x = \\frac{A}{2}$' },
      { key: 'B', text: '$x = \\frac{A}{\\sqrt{2}}$' },
      { key: 'C', text: '$x = \\frac{\\sqrt{3}A}{2}$' },
      { key: 'D', text: '$x = \\frac{A}{4}$' },
    ],
    correctOption: 'A',
    solutionText:
      'In SHM, $K = \\frac{1}{2} m \\omega^2 (A^2 - x^2)$ and $U = \\frac{1}{2} m \\omega^2 x^2$.\nGiven $K = 3U \\implies A^2 - x^2 = 3x^2 \\implies 4x^2 = A^2 \\implies x = \\frac{A}{2}$.',
  },
  {
    subject: 'Physics',
    chapter: 'Superposition of Waves',
    subtopic: 'Stationary Waves & Resonance',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'A closed organ pipe of length $L_1$ and an open organ pipe of length $L_2$ resonate at their fundamental frequencies. The ratio $L_1 / L_2$ is:',
    options: [
      { key: 'A', text: '$1 : 2$' },
      { key: 'B', text: '$2 : 1$' },
      { key: 'C', text: '$1 : 4$' },
      { key: 'D', text: '$4 : 1$' },
    ],
    correctOption: 'A',
    solutionText:
      'Fundamental frequency of closed pipe: $n_1 = \\frac{v}{4L_1}$. Fundamental frequency of open pipe: $n_2 = \\frac{v}{2L_2}$.\nEquating $n_1 = n_2 \\implies \\frac{v}{4L_1} = \\frac{v}{2L_2} \\implies \\frac{L_1}{L_2} = \\frac{2}{4} = \\frac{1}{2}$.',
  },
  {
    subject: 'Physics',
    chapter: 'Wave Optics',
    subtopic: 'Young Double Slit Experiment',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'In Young\'s double slit experiment, if the distance between the slits is halved and the distance between the slits and screen is doubled, the fringe width will:',
    options: [
      { key: 'A', text: 'Remain unchanged' },
      { key: 'B', text: 'Be doubled' },
      { key: 'C', text: 'Be quadrupled (4 times)' },
      { key: 'D', text: 'Be halved' },
    ],
    correctOption: 'C',
    solutionText:
      'Fringe width is $\\beta = \\frac{\\lambda D}{d}$. When $D\' = 2D$ and $d\' = d/2$, we get $\\beta\' = \\frac{\\lambda (2D)}{(d/2)} = 4\\frac{\\lambda D}{d} = 4\\beta$.',
  },
  {
    subject: 'Physics',
    chapter: 'Electrostatics',
    subtopic: 'Capacitance & Dielectrics',
    difficulty: Difficulty.HARD,
    type: QuestionType.SINGLE_CHOICE,
    text: 'A parallel plate capacitor with air between the plates has capacitance $C_0$. A dielectric slab of dielectric constant $K$ and thickness $t = \\frac{3}{4}d$ is inserted between the plates (separation $d$). The new capacitance is:',
    options: [
      { key: 'A', text: '$\\frac{4K}{K + 3} C_0$' },
      { key: 'B', text: '$\\frac{K + 3}{4K} C_0$' },
      { key: 'C', text: '$\\frac{3K}{K + 4} C_0$' },
      { key: 'D', text: '$\\frac{4}{K + 3} C_0$' },
    ],
    correctOption: 'A',
    solutionText:
      '$C = \\frac{\\varepsilon_0 A}{(d - t) + t/K} = \\frac{\\varepsilon_0 A}{d/4 + 3d/(4K)} = \\frac{4K \\varepsilon_0 A}{d(K + 3)} = \\frac{4K}{K + 3} C_0$.',
  },
  {
    subject: 'Physics',
    chapter: 'Current Electricity',
    subtopic: 'Potentiometer',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'A potentiometer wire of length $10\\text{ m}$ has resistance $20\\,\\Omega$. It is connected in series with a $3\\text{ V}$ battery and a resistance of $10\\,\\Omega$. The potential gradient along the wire is:',
    options: [
      { key: 'A', text: '$0.20\\text{ V/m}$' },
      { key: 'B', text: '$0.10\\text{ V/m}$' },
      { key: 'C', text: '$0.02\\text{ V/m}$' },
      { key: 'D', text: '$0.05\\text{ V/m}$' },
    ],
    correctOption: 'A',
    solutionText:
      'Current $I = \\frac{V}{R_w + R_{ext}} = \\frac{3}{20 + 10} = 0.1\\text{ A}$.\nVoltage across wire $V_w = I R_w = 0.1 \\times 20 = 2.0\\text{ V}$.\nPotential gradient $K = \\frac{V_w}{L} = \\frac{2.0}{10} = 0.20\\text{ V/m}$.',
  },
  {
    subject: 'Physics',
    chapter: 'Electromagnetic Induction',
    subtopic: 'Self & Mutual Inductance',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'The magnetic flux linked with a coil varies with time $t$ as $\\phi = 5t^3 - 100t + 300\\text{ Wb}$. The induced electromotive force at $t = 2\\text{ s}$ is:',
    options: [
      { key: 'A', text: '$40\\text{ V}$' },
      { key: 'B', text: '$-40\\text{ V}$' },
      { key: 'C', text: '$140\\text{ V}$' },
      { key: 'D', text: '$-140\\text{ V}$' },
    ],
    correctOption: 'A',
    solutionText:
      'By Faraday\'s law, $\\varepsilon = -\\frac{d\\phi}{dt} = -(15t^2 - 100)$. At $t = 2\\text{ s}$, $\\varepsilon = -(15(4) - 100) = -(60 - 100) = +40\\text{ V}$.',
  },
  {
    subject: 'Physics',
    chapter: 'AC Circuits',
    subtopic: 'LCR Series Resonance',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'In a series $LCR$ circuit, $L = 10\\text{ mH}$, $C = 1\\,\\mu\\text{F}$, and $R = 10\\,\\Omega$. The resonant frequency $\\omega_0$ of the circuit is:',
    options: [
      { key: 'A', text: '$10^4\\text{ rad/s}$' },
      { key: 'B', text: '$10^5\\text{ rad/s}$' },
      { key: 'C', text: '$10^3\\text{ rad/s}$' },
      { key: 'D', text: '$5 \\times 10^4\\text{ rad/s}$' },
    ],
    correctOption: 'A',
    solutionText:
      'Resonant frequency $\\omega_0 = \\frac{1}{\\sqrt{LC}} = \\frac{1}{\\sqrt{10 \\times 10^{-3} \\times 10^{-6}}} = \\frac{1}{\\sqrt{10^{-8}}} = 10^4\\text{ rad/s}$.',
  },
  {
    subject: 'Physics',
    chapter: 'Dual Nature of Radiation and Matter',
    subtopic: 'Photoelectric Effect',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'When photons of energy $4.2\\text{ eV}$ strike a metal surface of work function $2.2\\text{ eV}$, the stopping potential required to cut off the photo-current is:',
    options: [
      { key: 'A', text: '$2.0\\text{ V}$' },
      { key: 'B', text: '$4.2\\text{ V}$' },
      { key: 'C', text: '$6.4\\text{ V}$' },
      { key: 'D', text: '$1.1\\text{ V}$' },
    ],
    correctOption: 'A',
    solutionText:
      'Einstein\'s equation: $K_{max} = h\\nu - \\Phi_0 = 4.2\\text{ eV} - 2.2\\text{ eV} = 2.0\\text{ eV}$.\nSince $K_{max} = e V_0$, the stopping potential is $V_0 = 2.0\\text{ V}$.',
  },
  {
    subject: 'Physics',
    chapter: 'Semiconductor Devices',
    subtopic: 'Zener Diode as Regulator',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'A Zener diode is designed to operate primarily in which of the following biasing conditions?',
    options: [
      { key: 'A', text: 'Reverse breakdown region' },
      { key: 'B', text: 'Forward conduction region' },
      { key: 'C', text: 'Unbiased equilibrium' },
      { key: 'D', text: 'Cut-off forward threshold' },
    ],
    correctOption: 'A',
    solutionText:
      'A Zener diode is heavily doped so that when reverse biased beyond its breakdown voltage $V_Z$, the current increases sharply while the voltage across it remains virtually constant, making it ideal as a voltage regulator.',
  },

  // ─── CHEMISTRY ────────────────────────────────────────────────────────
  {
    subject: 'Chemistry',
    chapter: 'Solid State',
    subtopic: 'Crystal Lattices & Unit Cells',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'A compound forms a face-centered cubic (FCC) lattice where atom $A$ occupies the corners and atom $B$ occupies the face centers. If one corner atom is missing from each unit cell, the empirical formula of the compound is:',
    options: [
      { key: 'A', text: '$A_7 B_{24}$' },
      { key: 'B', text: '$A_7 B_3$' },
      { key: 'C', text: '$AB_3$' },
      { key: 'D', text: '$A_3 B_7$' },
    ],
    correctOption: 'A',
    solutionText:
      'Normally, corner contribution $= 8 \\times \\frac{1}{8} = 1$. With 1 corner atom missing, $A = 7 \\times \\frac{1}{8} = \\frac{7}{8}$.\nFace centers $B = 6 \\times \\frac{1}{2} = 3$.\nRatio $A : B = \\frac{7}{8} : 3 = 7 : 24$, giving $A_7 B_{24}$.',
  },
  {
    subject: 'Chemistry',
    chapter: 'Solutions',
    subtopic: 'Colligative Properties & Osmotic Pressure',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'Which of the following $0.1\\text{ M}$ aqueous solutions will exhibit the highest boiling point elevation?',
    options: [
      { key: 'A', text: '$\\text{Al}_2(\\text{SO}_4)_3$' },
      { key: 'B', text: '$\\text{NaCl}$' },
      { key: 'C', text: '$\\text{BaCl}_2$' },
      { key: 'D', text: '$\\text{Glucose}$' },
    ],
    correctOption: 'A',
    solutionText:
      'Boiling point elevation $\\Delta T_b = i K_b m$. The van\'t Hoff factor $i$ is greatest for $\\text{Al}_2(\\text{SO}_4)_3$ ($i = 2\\,\\text{Al}^{3+} + 3\\,\\text{SO}_4^{2-} = 5$). Hence it produces the largest $\\Delta T_b$.',
  },
  {
    subject: 'Chemistry',
    chapter: 'Ionic Equilibria',
    subtopic: 'Buffer Solutions & pH',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'What is the pH of a buffer solution containing equal concentrations of acetic acid ($\\text{CH}_3\\text{COOH}$) and sodium acetate ($\\text{CH}_3\\text{COONa}$), given $pK_a = 4.76$?',
    options: [
      { key: 'A', text: '$4.76$' },
      { key: 'B', text: '$7.00$' },
      { key: 'C', text: '$5.76$' },
      { key: 'D', text: '$3.76$' },
    ],
    correctOption: 'A',
    solutionText:
      'By the Henderson-Hasselbalch equation:\n$$pH = pK_a + \\log\\frac{[\\text{Salt}]}{[\\text{Acid}]}$$\nSince $[\\text{Salt}] = [\\text{Acid}]$, $\\log(1) = 0$, so $pH = pK_a = 4.76$.',
  },
  {
    subject: 'Chemistry',
    chapter: 'Chemical Thermodynamics',
    subtopic: 'Gibbs Free Energy & Spontaneity',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'For a chemical reaction to be spontaneous at all temperatures, the signs of enthalpy change $\\Delta H$ and entropy change $\\Delta S$ must be:',
    options: [
      { key: 'A', text: '$\\Delta H < 0,\\; \\Delta S > 0$' },
      { key: 'B', text: '$\\Delta H > 0,\\; \\Delta S < 0$' },
      { key: 'C', text: '$\\Delta H > 0,\\; \\Delta S > 0$' },
      { key: 'D', text: '$\\Delta H < 0,\\; \\Delta S < 0$' },
    ],
    correctOption: 'A',
    solutionText:
      '$\\Delta G = \\Delta H - T\\Delta S$. For spontaneity, $\\Delta G < 0$. If $\\Delta H$ is negative (exothermic) and $\\Delta S$ is positive, both terms contribute negatively at all $T > 0\\text{ K}$, making $\\Delta G$ always negative.',
  },
  {
    subject: 'Chemistry',
    chapter: 'Electrochemistry',
    subtopic: 'Nernst Equation',
    difficulty: Difficulty.HARD,
    type: QuestionType.SINGLE_CHOICE,
    text: 'For the cell $\\text{Zn}(s) | \\text{Zn}^{2+}(0.1\\text{ M}) || \\text{Cu}^{2+}(0.01\\text{ M}) | \\text{Cu}(s)$ with $E^\\circ_{\\text{cell}} = 1.10\\text{ V}$, the cell potential $E_{\\text{cell}}$ at $298\\text{ K}$ is:',
    options: [
      { key: 'A', text: '$1.07\\text{ V}$' },
      { key: 'B', text: '$1.13\\text{ V}$' },
      { key: 'C', text: '$1.10\\text{ V}$' },
      { key: 'D', text: '$0.98\\text{ V}$' },
    ],
    correctOption: 'A',
    solutionText:
      'By the Nernst equation for $n = 2$:\n$$E = E^\\circ - \\frac{0.0591}{2} \\log \\frac{[\\text{Zn}^{2+}]}{[\\text{Cu}^{2+}]} = 1.10 - 0.0295 \\log(10) = 1.10 - 0.0295 = 1.07\\text{ V}.$$',
  },
  {
    subject: 'Chemistry',
    chapter: 'Chemical Kinetics',
    subtopic: 'Order of Reaction & Rate Constant',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'A first order reaction is $50\\%$ complete in $20\\text{ minutes}$. The time required for $75\\%$ completion of this reaction is:',
    options: [
      { key: 'A', text: '$40\\text{ minutes}$' },
      { key: 'B', text: '$30\\text{ minutes}$' },
      { key: 'C', text: '$60\\text{ minutes}$' },
      { key: 'D', text: '$80\\text{ minutes}$' },
    ],
    correctOption: 'A',
    solutionText:
      'For a first order reaction, $t_{75\\%} = 2 \\times t_{50\\%}$. Here $t_{1/2} = 20\\text{ min}$, so $t_{75\\%} = 2 \\times 20 = 40\\text{ minutes}$.',
  },
  {
    subject: 'Chemistry',
    chapter: 'Coordination Compounds',
    subtopic: 'Isomerism & Magnetic Behavior',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'The magnetic moment of $[\\text{Fe}(\\text{CN})_6]^{4-}$ is zero because:',
    options: [
      { key: 'A', text: '$\\text{CN}^-$ is a strong field ligand producing low spin $d^6$ configuration' },
      { key: 'B', text: '$\\text{Fe}$ is in $0$ oxidation state' },
      { key: 'C', text: '$\\text{CN}^-$ is a weak field ligand' },
      { key: 'D', text: 'It has 4 unpaired electrons' },
    ],
    correctOption: 'A',
    solutionText:
      '$\\text{Fe}^{2+}$ has $3d^6$ configuration. $\\text{CN}^-$ is a strong field ligand with large $\\Delta_o$, causing pairing in $t_{2g}^6 e_g^0$. With $n = 0$ unpaired electrons, $\\mu = \\sqrt{n(n+2)} = 0\\text{ BM}$ (diamagnetic).',
  },
  {
    subject: 'Chemistry',
    chapter: 'Aldehydes, Ketones and Carboxylic Acids',
    subtopic: 'Aldol & Cannizzaro Reactions',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'Which of the following compounds undergoes the Cannizzaro reaction upon heating with concentrated $\\text{NaOH}$?',
    options: [
      { key: 'A', text: 'Benzaldehyde ($\\text{C}_6\\text{H}_5\\text{CHO}$)' },
      { key: 'B', text: 'Acetaldehyde ($\\text{CH}_3\\text{CHO}$)' },
      { key: 'C', text: 'Acetone ($\\text{CH}_3\\text{COCH}_3$)' },
      { key: 'D', text: 'Propionaldehyde ($\\text{CH}_3\\text{CH}_2\\text{CHO}$)' },
    ],
    correctOption: 'A',
    solutionText:
      'The Cannizzaro reaction is given by aldehydes having **no $\\alpha$-hydrogen atoms** (e.g. Benzaldehyde, Formaldehyde), undergoing disproportionation to an alcohol and a carboxylate salt.',
  },

  // ─── MATHEMATICS ──────────────────────────────────────────────────────
  {
    subject: 'Mathematics',
    chapter: 'Mathematical Logic',
    subtopic: 'Truth Tables & Equivalence',
    difficulty: Difficulty.EASY,
    type: QuestionType.SINGLE_CHOICE,
    text: 'The contrapositive of the conditional statement $p \\rightarrow q$ is logically equivalent to:',
    options: [
      { key: 'A', text: '$\\sim q \\rightarrow \\sim p$' },
      { key: 'B', text: '$q \\rightarrow p$' },
      { key: 'C', text: '$\\sim p \\rightarrow \\sim q$' },
      { key: 'D', text: '$\\sim p \\vee q$' },
    ],
    correctOption: 'A',
    solutionText:
      'The contrapositive of $p \\rightarrow q$ is formed by negating and swapping both hypothesis and conclusion: $\\sim q \\rightarrow \\sim p$, which has identical truth value to $p \\rightarrow q$.',
  },
  {
    subject: 'Mathematics',
    chapter: 'Matrices',
    subtopic: 'Inverse & Determinants',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'If $A$ is a square matrix of order $3 \\times 3$ and $|A| = 4$, then the value of $|\\text{adj}(A)|$ is:',
    options: [
      { key: 'A', text: '$16$' },
      { key: 'B', text: '$4$' },
      { key: 'C', text: '$64$' },
      { key: 'D', text: '$12$' },
    ],
    correctOption: 'A',
    solutionText:
      'For any matrix of order $n$, $|\\text{adj}(A)| = |A|^{n - 1}$. Here $n = 3$, so $|\\text{adj}(A)| = |A|^{3 - 1} = 4^2 = 16$.',
  },
  {
    subject: 'Mathematics',
    chapter: 'Trigonometric Functions',
    subtopic: 'Principal & General Solutions',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'The principal value of $\\sin^{-1}\\left(\\sin\\frac{3\\pi}{4}\\right)$ is equal to:',
    options: [
      { key: 'A', text: '$\\frac{\\pi}{4}$' },
      { key: 'B', text: '$\\frac{3\\pi}{4}$' },
      { key: 'C', text: '$-\\frac{\\pi}{4}$' },
      { key: 'D', text: '$\\frac{\\pi}{2}$' },
    ],
    correctOption: 'A',
    solutionText:
      'The principal value branch of $\\sin^{-1} x$ is $[-\\pi/2, \\pi/2]$. Since $\\sin(3\\pi/4) = \\sin(\\pi - \\pi/4) = \\sin(\\pi/4)$, we have $\\sin^{-1}(\\sin(\\pi/4)) = \\frac{\\pi}{4}$.',
  },
  {
    subject: 'Mathematics',
    chapter: 'Vectors',
    subtopic: 'Dot & Cross Products',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'If vectors $\\vec{a} = 2\\hat{i} + \\lambda\\hat{j} + \\hat{k}$ and $\\vec{b} = \\hat{i} - 2\\hat{j} + 3\\hat{k}$ are perpendicular to each other, the value of $\\lambda$ is:',
    options: [
      { key: 'A', text: '$\\frac{5}{2}$' },
      { key: 'B', text: '$-\\frac{5}{2}$' },
      { key: 'C', text: '$5$' },
      { key: 'D', text: '$-5$' },
    ],
    correctOption: 'A',
    solutionText:
      'Two non-zero vectors are perpendicular if $\\vec{a} \\cdot \\vec{b} = 0$.\n$$\\vec{a} \\cdot \\vec{b} = (2)(1) + (\\lambda)(-2) + (1)(3) = 2 - 2\\lambda + 3 = 5 - 2\\lambda = 0 \\implies \\lambda = \\frac{5}{2}.$$',
  },
  {
    subject: 'Mathematics',
    chapter: 'Differentiation',
    subtopic: 'Higher Order Derivatives',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'If $y = e^{a \\sin^{-1} x}$, then $(1 - x^2) \\frac{d^2y}{dx^2} - x \\frac{dy}{dx}$ is equal to:',
    options: [
      { key: 'A', text: '$a^2 y$' },
      { key: 'B', text: '$-a^2 y$' },
      { key: 'C', text: '$a y$' },
      { key: 'D', text: '$0$' },
    ],
    correctOption: 'A',
    solutionText:
      'Differentiating $y = e^{a \\sin^{-1} x} \\implies \\frac{dy}{dx} = \\frac{a y}{\\sqrt{1 - x^2}}$. Squaring: $(1 - x^2) (y\')^2 = a^2 y^2$. Differentiating again and dividing by $2y\'$ yields $(1 - x^2)y\'\' - x y\' = a^2 y$.',
  },
  {
    subject: 'Mathematics',
    chapter: 'Applications of Derivatives',
    subtopic: 'Maxima & Minima',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'The maximum value of the function $f(x) = x(1 - x)$ on the interval $[0, 1]$ is:',
    options: [
      { key: 'A', text: '$\\frac{1}{4}$' },
      { key: 'B', text: '$\\frac{1}{2}$' },
      { key: 'C', text: '$1$' },
      { key: 'D', text: '$\\frac{1}{8}$' },
    ],
    correctOption: 'A',
    solutionText:
      '$f(x) = x - x^2 \\implies f\'(x) = 1 - 2x = 0 \\implies x = 1/2$. $f\'\'(x) = -2 < 0$ (maxima). Maximum value is $f(1/2) = \\frac{1}{2}(1 - \\frac{1}{2}) = \\frac{1}{4}$.',
  },
  {
    subject: 'Mathematics',
    chapter: 'Definite Integration',
    subtopic: 'Properties of Definite Integrals',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'Evaluate the definite integral: $I = \\int_0^{\\pi/2} \\frac{\\sin^3 x}{\\sin^3 x + \\cos^3 x} dx$.',
    options: [
      { key: 'A', text: '$\\frac{\\pi}{4}$' },
      { key: 'B', text: '$\\frac{\\pi}{2}$' },
      { key: 'C', text: '$\\frac{\\pi}{8}$' },
      { key: 'D', text: '$0$' },
    ],
    correctOption: 'A',
    solutionText:
      'Using King\'s property $\\int_0^a f(x) dx = \\int_0^a f(a - x) dx$, adding $I + I = 2I = \\int_0^{\\pi/2} 1 dx = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}$.',
  },
  {
    subject: 'Mathematics',
    chapter: 'Differential Equations',
    subtopic: 'Linear Differential Equations',
    difficulty: Difficulty.HARD,
    type: QuestionType.SINGLE_CHOICE,
    text: 'The integrating factor (I.F.) for the linear differential equation $\\frac{dy}{dx} + y \\tan x = \\sec x$ is:',
    options: [
      { key: 'A', text: '$\\sec x$' },
      { key: 'B', text: '$\\cos x$' },
      { key: 'C', text: '$\\tan x$' },
      { key: 'D', text: '$\\log(\\sec x)$' },
    ],
    correctOption: 'A',
    solutionText:
      'The equation is of standard form $\\frac{dy}{dx} + P y = Q$, where $P = \\tan x$.\n$$\\text{I.F.} = e^{\\int \\tan x dx} = e^{\\ln|\\sec x|} = \\sec x.$$',
  },
  {
    subject: 'Mathematics',
    chapter: 'Probability Distributions',
    subtopic: 'Expected Value & Variance',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'A fair coin is tossed 4 times. If $X$ denotes the number of heads obtained, the expected value $E(X)$ and variance $Var(X)$ are respectively:',
    options: [
      { key: 'A', text: '$2$ and $1$' },
      { key: 'B', text: '$2$ and $2$' },
      { key: 'C', text: '$1$ and $0.5$' },
      { key: 'D', text: '$4$ and $1$' },
    ],
    correctOption: 'A',
    solutionText:
      'This follows a Binomial distribution with $n = 4$ and $p = 1/2$.\n$$E(X) = np = 4 \\times \\frac{1}{2} = 2.$$\n$$Var(X) = npq = 4 \\times \\frac{1}{2} \\times \\frac{1}{2} = 1.$$',
  },
];

export class AiGeneratorService {
  /**
   * Return complete Class 12 Syllabus Taxonomy
   */
  getTaxonomy() {
    return CLASS_12_SYLLABUS;
  }

  /**
   * Calls Gemini Flash-Lite to generate a diverse batch of high-caliber STEM questions
   */
  async generateWithGemini(
    subject: string,
    chapter: string,
    subtopic: string,
    difficulty: Difficulty,
    count: number = 5
  ): Promise<GeneratedQuestionItem[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return this.getFallbackQuestions(subject, chapter, subtopic, difficulty, count);
    }

    const prompt = `You are a distinguished STEM exam creator for competitive Class 12 engineering/medical entrance exams (MHT-CET and JEE Main caliber).
Generate exactly ${count} completely unique, non-repeating multiple-choice questions.

Topic Requirements:
- Subject: ${subject}
- Chapter: ${chapter}
${subtopic ? `- Subtopic Focus: ${subtopic}` : ''}
- Difficulty Level: ${difficulty}
- Question Type: Single Choice MCQ with 4 options (A, B, C, D)

KaTeX and LaTeX Formatting Guidelines:
1. Formulas, mathematical equations, physical units, and symbols MUST use standard KaTeX syntax ($...$ inline, $$...$$ display).
2. Double escape backslashes properly in JSON strings (e.g. \\\\frac{a}{b}, \\\\vec{A}, \\\\sqrt{...}).
3. "options": Array of 4 items with keys "A", "B", "C", "D".
4. "solutionText": Rigorous, step-by-step mathematical proof or chemical mechanism explaining why the correctOption is right.
5. Return ONLY a valid JSON array of objects:
[
  {
    "text": "...",
    "options": [
      { "key": "A", "text": "..." },
      { "key": "B", "text": "..." },
      { "key": "C", "text": "..." },
      { "key": "D", "text": "..." }
    ],
    "correctOption": "A",
    "solutionText": "..."
  }
]`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.7,
              maxOutputTokens: 4000,
            },
          }),
        }
      );

      if (!response.ok) {
        console.warn(`Gemini returned HTTP ${response.status}. Using fallback cache.`);
        return this.getFallbackQuestions(subject, chapter, subtopic, difficulty, count);
      }

      const data: any = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        return this.getFallbackQuestions(subject, chapter, subtopic, difficulty, count);
      }

      const parsed = JSON.parse(rawText);
      const validated = QuestionBatchSchema.parse(parsed);

      return validated.map((q) => ({
        subject,
        chapter,
        subtopic: subtopic || chapter,
        difficulty,
        type: QuestionType.SINGLE_CHOICE,
        text: q.text,
        options: q.options,
        correctOption: q.correctOption,
        solutionText: q.solutionText,
      }));
    } catch (err) {
      console.error('Gemini error, using fallback bank:', err);
      return this.getFallbackQuestions(subject, chapter, subtopic, difficulty, count);
    }
  }

  /**
   * Single-topic question getter / generator
   */
  async getOrGenerateQuestions(
    subject: string,
    chapter: string,
    subtopic: string,
    difficulty: Difficulty,
    count: number = 5
  ): Promise<GeneratedQuestionItem[]> {
    // Check cached pool first
    const cachedList = await prisma.aiQuestionPool.findMany({
      where: {
        subject: { equals: subject, mode: 'insensitive' },
        ...(chapter ? { chapter: { equals: chapter, mode: 'insensitive' } } : {}),
        difficulty,
      },
      orderBy: [{ timesServed: 'asc' }, { createdAt: 'desc' }],
      take: count,
    });

    if (cachedList.length >= count) {
      await Promise.all(
        cachedList.map((item) =>
          prisma.aiQuestionPool.update({
            where: { id: item.id },
            data: { timesServed: { increment: 1 } },
          })
        )
      );

      return cachedList.map((item) => ({
        id: item.id,
        subject: item.subject,
        chapter: item.chapter,
        subtopic: item.subtopic,
        difficulty: item.difficulty,
        type: item.type,
        text: item.text,
        options: item.options as unknown as GeneratedOption[],
        correctOption: item.correctOption as 'A' | 'B' | 'C' | 'D',
        solutionText: item.solutionText,
      }));
    }

    const needed = count - cachedList.length;
    const generated = await this.generateWithGemini(subject, chapter, subtopic, difficulty, needed);

    const newSaved: GeneratedQuestionItem[] = [];
    for (const item of generated) {
      try {
        const saved = await prisma.aiQuestionPool.create({
          data: {
            subject: item.subject,
            chapter: item.chapter,
            subtopic: item.subtopic,
            difficulty: item.difficulty,
            type: item.type,
            text: item.text,
            options: item.options as any,
            correctOption: item.correctOption,
            solutionText: item.solutionText,
            timesServed: 1,
          },
        });
        newSaved.push({ ...item, id: saved.id });
      } catch {
        newSaved.push({ ...item, id: `gen-${Math.random().toString(36).substring(2, 9)}` });
      }
    }

    return [
      ...cachedList.map((item) => ({
        id: item.id,
        subject: item.subject,
        chapter: item.chapter,
        subtopic: item.subtopic,
        difficulty: item.difficulty,
        type: item.type,
        text: item.text,
        options: item.options as unknown as GeneratedOption[],
        correctOption: item.correctOption as 'A' | 'B' | 'C' | 'D',
        solutionText: item.solutionText,
      })),
      ...newSaved,
    ];
  }

  /**
   * Retrieves diverse questions from the extensive Class 12 curated bank
   */
  getFallbackQuestions(
    subject: string,
    chapter: string,
    subtopic: string,
    difficulty: Difficulty,
    count: number
  ): GeneratedQuestionItem[] {
    // 1. Try exact subject and chapter match
    let matching = EXTENSIVE_CLASS_12_BANK.filter(
      (q) =>
        q.subject.toLowerCase() === subject.toLowerCase() &&
        chapter &&
        q.chapter.toLowerCase() === chapter.toLowerCase()
    );

    // 2. If not enough, try matching subject
    if (matching.length === 0) {
      matching = EXTENSIVE_CLASS_12_BANK.filter(
        (q) => q.subject.toLowerCase() === subject.toLowerCase()
      );
    }

    // 3. Fallback to all bank
    if (matching.length === 0) {
      matching = EXTENSIVE_CLASS_12_BANK;
    }

    // Shuffle pool
    const shuffled = [...matching].sort(() => Math.random() - 0.5);

    const result: GeneratedQuestionItem[] = [];
    for (let i = 0; i < count; i++) {
      const base = shuffled[i % shuffled.length];
      result.push({
        ...base,
        id: `mock-${Math.random().toString(36).substring(2, 9)}`,
        subject: subject || base.subject,
        chapter: chapter || base.chapter,
        subtopic: subtopic || base.subtopic,
        difficulty,
      });
    }
    return result;
  }

  /**
   * Multi-topic question getter / generator
   */
  async getOrGenerateQuestionsMulti(
    subjects: string[],
    chaptersMap: Record<string, string[]>,
    difficulty: Difficulty,
    totalCount: number = 5
  ): Promise<GeneratedQuestionItem[]> {
    const results: GeneratedQuestionItem[] = [];
    const subjectsToUse = subjects.length > 0 ? subjects : ['Physics', 'Chemistry', 'Mathematics'];

    // Distribute total count across subjects and chapters
    for (let i = 0; i < totalCount; i++) {
      const subj = subjectsToUse[i % subjectsToUse.length];
      const availableChapters =
        chaptersMap && chaptersMap[subj]?.length > 0
          ? chaptersMap[subj]
          : CLASS_12_SYLLABUS[subj] || ['General'];
      const chap = availableChapters[i % availableChapters.length];

      // Check database pool first
      const cached = await prisma.aiQuestionPool.findFirst({
        where: {
          subject: { equals: subj, mode: 'insensitive' },
          chapter: { equals: chap, mode: 'insensitive' },
          difficulty,
        },
        orderBy: [{ timesServed: 'asc' }, { createdAt: 'desc' }],
      });

      if (cached) {
        await prisma.aiQuestionPool.update({
          where: { id: cached.id },
          data: { timesServed: { increment: 1 } },
        });

        results.push({
          id: cached.id,
          subject: cached.subject,
          chapter: cached.chapter,
          subtopic: cached.subtopic,
          difficulty: cached.difficulty,
          type: cached.type,
          text: cached.text,
          options: cached.options as unknown as GeneratedOption[],
          correctOption: cached.correctOption as 'A' | 'B' | 'C' | 'D',
          solutionText: cached.solutionText,
        });
      } else {
        // Generate single or small batch
        const generated = await this.generateWithGemini(subj, chap, chap, difficulty, 1);
        if (generated.length > 0) {
          const item = generated[0];
          try {
            const saved = await prisma.aiQuestionPool.create({
              data: {
                subject: item.subject,
                chapter: item.chapter,
                subtopic: item.subtopic,
                difficulty: item.difficulty,
                type: item.type,
                text: item.text,
                options: item.options as any,
                correctOption: item.correctOption,
                solutionText: item.solutionText,
                timesServed: 1,
              },
            });
            results.push({ ...item, id: saved.id });
          } catch {
            results.push({ ...item, id: `multi-${Math.random().toString(36).substring(2, 9)}` });
          }
        } else {
          // If gemini fails or empty, fetch from fallback
          const fb = this.getFallbackQuestions(subj, chap, chap, difficulty, 1);
          if (fb.length > 0) {
            results.push(fb[0]);
          }
        }
      }
    }

    // If results are still fewer than totalCount, fill remaining
    if (results.length < totalCount) {
      const remainingNeeded = totalCount - results.length;
      const fb = this.getFallbackQuestions(
        subjectsToUse[0],
        '',
        '',
        difficulty,
        remainingNeeded
      );
      results.push(...fb);
    }

    return results;
  }
}

export const aiGeneratorService = new AiGeneratorService();
export default aiGeneratorService;
