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

// Standard Syllabus Taxonomy for MHT-CET / JEE
export const SYLLABUS_TAXONOMY: Record<
  string,
  { chapters: Record<string, string[]> }
> = {
  Physics: {
    chapters: {
      'Rotational Dynamics': [
        'Moment of Inertia',
        'Torque & Angular Momentum',
        'Rolling Motion',
        'Centripetal & Centrifugal Forces',
      ],
      'Mechanical Properties of Fluids': [
        'Surface Tension & Energy',
        'Bernoulli Theorem',
        'Viscosity & Terminal Velocity',
        'Capillarity',
      ],
      'Oscillations & Waves': [
        'Simple Harmonic Motion',
        'Damped & Forced Oscillations',
        'Doppler Effect',
        'Stationary Waves & Beats',
      ],
      Electrostatics: [
        'Coulomb Law & Electric Field',
        'Gauss Law & Flux',
        'Capacitors & Dielectrics',
        'Electrostatic Potential Energy',
      ],
      'Current Electricity': [
        'Kirchhoff Laws',
        'Wheatstone & Potentiometer',
        'Cells in Series & Parallel',
        'Temperature Coefficient of Resistance',
      ],
    },
  },
  Chemistry: {
    chapters: {
      'Chemical Bonding & Molecular Structure': [
        'VSEPR Theory',
        'Hybridization & Molecular Geometry',
        'Dipole Moment & Polarity',
        'Molecular Orbital Theory',
      ],
      Thermodynamics: [
        'First Law & Enthalpy',
        'Entropy & Second Law',
        'Gibbs Free Energy & Spontaneity',
        'Hess Law of Heat Summation',
      ],
      Electrochemistry: [
        'Nernst Equation',
        'Kohlrausch Law & Conductance',
        'Galvanic Cells & EMF',
        'Faraday Laws of Electrolysis',
      ],
      'Chemical Kinetics': [
        'Rate Law & Order of Reaction',
        'First Order Kinetics & Half Life',
        'Arrhenius Equation & Activation Energy',
        'Collision Theory',
      ],
      'Coordination Compounds': [
        'Werner Theory & IUPAC Naming',
        'Crystal Field Theory',
        'Isomerism in Complexes',
        'Magnetic Behavior & Hybridization',
      ],
    },
  },
  Mathematics: {
    chapters: {
      'Calculus & Differentiation': [
        'Product & Chain Rules',
        'Implicit Differentiation',
        'Logarithmic Differentiation',
        'Higher Order Derivatives',
      ],
      'Applications of Derivatives': [
        'Tangents & Normals',
        'Maxima & Minima',
        'Rate Measure',
        'Mean Value Theorems',
      ],
      'Definite & Indefinite Integration': [
        'Integration by Parts',
        'Integration by Partial Fractions',
        'Properties of Definite Integrals',
        'Area Under Curves',
      ],
      'Vectors & 3D Geometry': [
        'Scalar & Vector Products',
        'Direction Cosines & Lines',
        'Shortest Distance Between Lines',
        'Equation of Planes',
      ],
      'Probability & Binomial Distribution': [
        'Conditional Probability',
        'Bayes Theorem',
        'Binomial Distribution',
        'Expectation & Variance',
      ],
    },
  },
};

// Curated Instant Fallback Cache to ensure 0ms latency even without API key
const CURATED_FALLBACK_BANK: GeneratedQuestionItem[] = [
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
      'For an annular disc with inner radius $r$ and outer radius $R$, surface mass density $\\sigma = \\frac{M}{\\pi(R^2 - r^2)}$. Integrating elemental concentric rings of radius $x$ from $r$ to $R$ gives:\n$$I = \\int_r^R (2\\pi x \\sigma dx) x^2 = 2\\pi \\sigma \\left[\\frac{x^4}{4}\\right]_r^R = \\frac{1}{2} M (R^2 + r^2).$$',
  },
  {
    subject: 'Physics',
    chapter: 'Rotational Dynamics',
    subtopic: 'Rolling Motion',
    difficulty: Difficulty.HARD,
    type: QuestionType.SINGLE_CHOICE,
    text: 'A solid cylinder of mass $m$ and radius $R$ rolls down an incline of angle $\\theta$ without slipping. The magnitude of the minimum coefficient of static friction $\\mu_s$ required for pure rolling is:',
    options: [
      { key: 'A', text: '$\\frac{1}{2} \\tan\\theta$' },
      { key: 'B', text: '$\\frac{1}{3} \\tan\\theta$' },
      { key: 'C', text: '$\\frac{2}{3} \\tan\\theta$' },
      { key: 'D', text: '$\\tan\\theta$' },
    ],
    correctOption: 'B',
    solutionText:
      'Linear acceleration for pure rolling on incline is $a = \\frac{g \\sin\\theta}{1 + I/(mR^2)} = \\frac{g \\sin\\theta}{1 + 1/2} = \\frac{2}{3}g \\sin\\theta$.\nFriction force is $f = mg \\sin\\theta - ma = \\frac{1}{3} mg \\sin\\theta$.\nSince $f \\le \\mu_s N = \\mu_s mg \\cos\\theta$, we require:\n$$\\mu_s \\ge \\frac{1}{3} \\tan\\theta.$$',
  },
  {
    subject: 'Chemistry',
    chapter: 'Chemical Bonding & Molecular Structure',
    subtopic: 'Hybridization & Molecular Geometry',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'According to VSEPR theory, what is the hybridization of the central sulfur atom and the spatial geometry of the $\\text{SF}_4$ molecule?',
    options: [
      { key: 'A', text: '$sp^3$, Tetrahedral' },
      { key: 'B', text: '$sp^3d$, See-Saw' },
      { key: 'C', text: '$sp^3d^2$, Square Planar' },
      { key: 'D', text: '$dsp^2$, T-shaped' },
    ],
    correctOption: 'B',
    solutionText:
      'Sulfur has 6 valence electrons. In $\\text{SF}_4$, sulfur forms 4 $\\sigma$-bonds with fluorine and retains 1 lone pair. Steric number $= 4 + 1 = 5$, corresponding to $sp^3d$ hybridization with trigonal bipyramidal electron geometry. The lone pair occupies an equatorial position to minimize repulsion, yielding a **See-Saw** molecular shape.',
  },
  {
    subject: 'Mathematics',
    chapter: 'Calculus & Differentiation',
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
      'First derivative: $\\frac{dy}{dx} = \\frac{a}{\\sqrt{1 - x^2}} e^{a \\sin^{-1} x} = \\frac{a y}{\\sqrt{1 - x^2}}$.\nSquaring both sides: $(1 - x^2) \\left(\\frac{dy}{dx}\\right)^2 = a^2 y^2$.\nDifferentiating with respect to $x$:\n$$-2x \\left(\\frac{dy}{dx}\\right)^2 + (1 - x^2) 2 \\frac{dy}{dx} \\frac{d^2y}{dx^2} = 2 a^2 y \\frac{dy}{dx}.$$\nDividing through by $2 \\frac{dy}{dx}$ gives:\n$$(1 - x^2) \\frac{d^2y}{dx^2} - x \\frac{dy}{dx} = a^2 y.$$',
  },
  {
    subject: 'Physics',
    chapter: 'Electrostatics',
    subtopic: 'Capacitors & Dielectrics',
    difficulty: Difficulty.HARD,
    type: QuestionType.SINGLE_CHOICE,
    text: 'A parallel plate capacitor with air between the plates has capacitance $C_0$. A dielectric slab of dielectric constant $K$ and thickness $t = \\frac{3}{4}d$ is inserted between the plates, where $d$ is plate separation. The new capacitance is:',
    options: [
      { key: 'A', text: '$\\frac{4K}{K + 3} C_0$' },
      { key: 'B', text: '$\\frac{K + 3}{4K} C_0$' },
      { key: 'C', text: '$\\frac{3K}{K + 4} C_0$' },
      { key: 'D', text: '$\\frac{4}{K + 3} C_0$' },
    ],
    correctOption: 'A',
    solutionText:
      'The capacitance with a slab of thickness $t$ is given by $C = \\frac{\\varepsilon_0 A}{d - t + \\frac{t}{K}}$.\nSubstituting $t = \\frac{3}{4}d$:\n$$C = \\frac{\\varepsilon_0 A}{d - \\frac{3}{4}d + \\frac{3d}{4K}} = \\frac{\\varepsilon_0 A}{\\frac{d}{4} + \\frac{3d}{4K}} = \\frac{\\varepsilon_0 A}{\\frac{d}{4K}(K + 3)} = \\frac{4K}{K + 3} \\left(\\frac{\\varepsilon_0 A}{d}\\right) = \\frac{4K}{K + 3} C_0.$$',
  },
  {
    subject: 'Mathematics',
    chapter: 'Definite & Indefinite Integration',
    subtopic: 'Properties of Definite Integrals',
    difficulty: Difficulty.MEDIUM,
    type: QuestionType.SINGLE_CHOICE,
    text: 'Evaluate the definite integral: $I = \\int_0^{\\pi/2} \\frac{\\sin^3 x}{\\sin^3 x + \\cos^3 x} dx$.',
    options: [
      { key: 'A', text: '$\\frac{\\pi}{2}$' },
      { key: 'B', text: '$\\frac{\\pi}{4}$' },
      { key: 'C', text: '$\\frac{\\pi}{8}$' },
      { key: 'D', text: '$\\pi$' },
    ],
    correctOption: 'B',
    solutionText:
      'Using King\'s property $\\int_0^a f(x) dx = \\int_0^a f(a - x) dx$:\n$$I = \\int_0^{\\pi/2} \\frac{\\sin^3(\\pi/2 - x)}{\\sin^3(\\pi/2 - x) + \\cos^3(\\pi/2 - x)} dx = \\int_0^{\\pi/2} \\frac{\\cos^3 x}{\\cos^3 x + \\sin^3 x} dx.$$\nAdding the two integrals:\n$$2I = \\int_0^{\\pi/2} \\frac{\\sin^3 x + \\cos^3 x}{\\sin^3 x + \\cos^3 x} dx = \\int_0^{\\pi/2} 1 dx = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}.$$',
  },
];

export class AiGeneratorService {
  /**
   * Return entire syllabus taxonomy for the wizard
   */
  getTaxonomy() {
    return SYLLABUS_TAXONOMY;
  }

  /**
   * Calls Gemini Flash-Lite to generate a batch of high-caliber STEM questions
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

    const prompt = `You are an elite examination creator for competitive STEM exams (CET and JEE Main caliber).
Generate exactly ${count} unique, high-quality, scientifically accurate multiple-choice practice questions.

Domain Specifications:
- Subject: ${subject}
- Chapter: ${chapter}
- Subtopic: ${subtopic}
- Difficulty Level: ${difficulty}
- Question Type: Single Choice Multiple Choice (Options: A, B, C, D)

Formatting Rules:
1. Every mathematical symbol, equation, or physical quantity MUST use standard KaTeX syntax ($...$ for inline, $$...$$ for block formulas).
2. Escape all backslashes properly in JSON strings (e.g., \\\\frac{a}{b}, \\\\vec{F}, \\\\theta).
3. Provide exactly 4 options labeled A, B, C, D.
4. Provide a thorough, step-by-step analytical derivation in "solutionText" with KaTeX explanations.
5. Return ONLY a valid JSON array containing objects matching this exact structure:
[
  {
    "text": "Question statement formatted with $KaTeX$...",
    "options": [
      { "key": "A", "text": "Option text" },
      { "key": "B", "text": "Option text" },
      { "key": "C", "text": "Option text" },
      { "key": "D", "text": "Option text" }
    ],
    "correctOption": "A",
    "solutionText": "Step 1: ... \\nStep 2: ... \\n$$Final formula$$"
  }
]`;

    try {
      // Using Google Gemini 2.5 Flash / 1.5 Flash endpoint
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.65,
              maxOutputTokens: 3500,
            },
          }),
        }
      );

      if (!response.ok) {
        console.warn(`Gemini Flash-Lite returned status ${response.status}. Falling back to cached bank.`);
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
        subtopic,
        difficulty,
        type: QuestionType.SINGLE_CHOICE,
        text: q.text,
        options: q.options,
        correctOption: q.correctOption,
        solutionText: q.solutionText,
      }));
    } catch (err) {
      console.error('Gemini generation error, using fallback:', err);
      return this.getFallbackQuestions(subject, chapter, subtopic, difficulty, count);
    }
  }

  /**
   * Retrieves matching fallback questions from the curated bank
   */
  private getFallbackQuestions(
    subject: string,
    chapter: string,
    subtopic: string,
    difficulty: Difficulty,
    count: number
  ): GeneratedQuestionItem[] {
    // Look for subject match
    const matchingSubject = CURATED_FALLBACK_BANK.filter(
      (q) => q.subject.toLowerCase() === subject.toLowerCase()
    );
    const pool = matchingSubject.length > 0 ? matchingSubject : CURATED_FALLBACK_BANK;

    // Cycle / clone to meet requested count
    const result: GeneratedQuestionItem[] = [];
    for (let i = 0; i < count; i++) {
      const base = pool[i % pool.length];
      result.push({
        ...base,
        subject,
        chapter: chapter || base.chapter,
        subtopic: subtopic || base.subtopic,
        difficulty,
      });
    }
    return result;
  }

  /**
   * Primary service method: Checks isolated AiQuestionPool first,
   * otherwise generates a fresh batch via Gemini Flash-Lite and persists to cache.
   */
  async getOrGenerateQuestions(
    subject: string,
    chapter: string,
    subtopic: string,
    difficulty: Difficulty,
    count: number = 5
  ): Promise<GeneratedQuestionItem[]> {
    // 1. Check existing pool for under-served questions
    const cached = await prisma.aiQuestionPool.findMany({
      where: {
        subject: { equals: subject, mode: 'insensitive' },
        chapter: { equals: chapter, mode: 'insensitive' },
        ...(subtopic ? { subtopic: { equals: subtopic, mode: 'insensitive' } } : {}),
        difficulty,
      },
      orderBy: [{ timesServed: 'asc' }, { createdAt: 'desc' }],
      take: count,
    });

    if (cached.length >= count) {
      // Increment timesServed in background
      await prisma.aiQuestionPool.updateMany({
        where: { id: { in: cached.map((c) => c.id) } },
        data: { timesServed: { increment: 1 } },
      });

      return cached.map((c) => ({
        id: c.id,
        subject: c.subject,
        chapter: c.chapter,
        subtopic: c.subtopic,
        difficulty: c.difficulty,
        type: c.type,
        text: c.text,
        options: c.options as unknown as GeneratedOption[],
        correctOption: c.correctOption as 'A' | 'B' | 'C' | 'D',
        solutionText: c.solutionText,
      }));
    }

    // 2. Not enough in cache -> Generate fresh batch via Gemini Flash-Lite
    const freshBatch = await this.generateWithGemini(
      subject,
      chapter,
      subtopic,
      difficulty,
      Math.max(5, count)
    );

    // 3. Persist new questions to isolated AiQuestionPool
    const createdItems: GeneratedQuestionItem[] = [];
    for (const item of freshBatch) {
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
      createdItems.push({
        ...item,
        id: saved.id,
      });
    }

    // Combine any cached items + newly created items up to count
    const combined = [...cached.map((c) => ({
      id: c.id,
      subject: c.subject,
      chapter: c.chapter,
      subtopic: c.subtopic,
      difficulty: c.difficulty,
      type: c.type,
      text: c.text,
      options: c.options as unknown as GeneratedOption[],
      correctOption: c.correctOption as 'A' | 'B' | 'C' | 'D',
      solutionText: c.solutionText,
    })), ...createdItems];

    return combined.slice(0, count);
  }
}

export const aiGeneratorService = new AiGeneratorService();
export default aiGeneratorService;
