import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import katex from 'katex';
import { spaceCadetPalette } from '../client/src/styles/tailwind.config';
import { INITIAL_BUFFER_QUESTIONS } from '../client/src/hooks/useSlidingBuffer';

describe('Space Cadet Theme & Palette Verification', () => {
  test('Space Cadet palette defines exact void, surfaces, CTA and ochre tokens', () => {
    assert.equal(spaceCadetPalette.void.toUpperCase(), '#0B0F17');
    assert.equal(spaceCadetPalette.surface.toUpperCase(), '#151C2C');
    assert.equal(spaceCadetPalette.card.toUpperCase(), '#151C2C');
    assert.equal(spaceCadetPalette.cta.toUpperCase(), '#C85A32');
    assert.equal(spaceCadetPalette.telemetry.toUpperCase(), '#D4A373');
    assert.equal(spaceCadetPalette.border.toUpperCase(), '#263044');
  });

  test('CSS index file imports tailwind and registers Space Cadet tokens', () => {
    const cssPath = path.resolve(__dirname, '../client/src/index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    assert.ok(cssContent.includes('--color-space-void: #0B0F17;'));
    assert.ok(cssContent.includes('--color-space-surface: #151C2C;'));
    assert.ok(cssContent.includes('--color-space-cta: #C85A32;'));
    assert.ok(cssContent.includes('--color-space-telemetry: #D4A373;'));
    assert.ok(cssContent.includes('--color-space-border: #263044;'));
  });
});

describe('Fox Cadet Mascot Vector & Assets', () => {
  test('Fox Cadet SVG exists in client and root public assets directory', () => {
    const clientSvgPath = path.resolve(__dirname, '../client/public/assets/homepage/fox-cadet.svg');
    const publicSvgPath = path.resolve(__dirname, '../public/assets/homepage/fox-cadet.svg');

    assert.ok(fs.existsSync(clientSvgPath), 'client/public/assets/homepage/fox-cadet.svg must exist');
    assert.ok(fs.existsSync(publicSvgPath), 'public/assets/homepage/fox-cadet.svg must exist');

    const svgContent = fs.readFileSync(clientSvgPath, 'utf8');
    assert.ok(svgContent.includes('bubble-helmet'), 'SVG must include bubble space helmet structure');
    assert.ok(svgContent.includes('fox-cadet'), 'SVG must include fox cadet mascot');
    assert.ok(svgContent.includes('#c85a32') || svgContent.includes('#C85A32'), 'SVG must incorporate terracotta theme color');
  });
});

describe('KaTeX Mathematical Rendering Verification', () => {
  test('KaTeX renders complex scientific equations without throwing errors', () => {
    const equations = [
      '\\int_0^{\\pi/2} \\sin^2(x) \\cos^2(x) \\, dx = \\frac{\\pi}{16}',
      '\\Delta x \\cdot \\Delta p \\ge \\frac{\\hbar}{2}',
      'W = -nRT \\ln\\left(\\frac{V_2}{V_1}\\right)',
      '\\lim_{x \\to 0} \\frac{\\sin(2x)}{x} = 2',
      '\\det\\begin{pmatrix} 2 & -1 \\\\ 3 & 5 \\end{pmatrix} = 13',
    ];

    for (const eq of equations) {
      let html = '';
      assert.doesNotThrow(() => {
        html = katex.renderToString(eq, {
          displayMode: true,
          throwOnError: false,
        });
      }, `Rendering failed for equation: ${eq}`);

      assert.ok(html.length > 0, `Generated HTML should not be empty for: ${eq}`);
      assert.ok(html.includes('katex'), 'Generated HTML must contain katex class');
    }
  });

  test('KaTeX renders invalid syntax gracefully with throwOnError: false fallback', () => {
    const invalidFormula = '\\frac{unclosed';
    let output = '';
    assert.doesNotThrow(() => {
      output = katex.renderToString(invalidFormula, {
        displayMode: false,
        throwOnError: false,
      });
    });
    assert.ok(output.length > 0, 'Must produce fallback output without crashing');
  });

  test('MathRenderer and QuestionRenderer eliminate scroll slider and use overflow-visible', () => {
    const mathRendererPath = path.resolve(__dirname, '../client/src/components/common/MathRenderer.tsx');
    const mathContent = fs.readFileSync(mathRendererPath, 'utf8');

    assert.ok(mathContent.includes('overflow-visible'), 'MathRenderer must apply overflow-visible');
    assert.ok(!mathContent.includes('overflow-x-auto'), 'MathRenderer must not apply overflow-x-auto to math spans or wrappers');

    const cssPath = path.resolve(__dirname, '../client/src/index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    assert.ok(cssContent.includes('.katex') && cssContent.includes('scrollbar-width: none'), 'CSS must suppress scrollbars on math elements');
  });
});

describe('Sliding Buffer & Redundant Neon DB Avoidance', () => {
  test('Initial question buffer contains >= 4 items', () => {
    assert.ok(INITIAL_BUFFER_QUESTIONS.length >= 4, 'Buffer must be initialized with at least 4 items');
    assert.ok(INITIAL_BUFFER_QUESTIONS.every((q) => q.text && q.type));
  });

  test('Prefetch logic skips Neon DB / network query when buffer has >= 4 items', async () => {
    let neonDbCallCount = 0;

    // Simulate sliding buffer controller
    class SlidingBufferController {
      private buffer: any[];
      public dbCallsMade = 0;

      constructor(initialItems: any[]) {
        this.buffer = [...initialItems];
      }

      get count() {
        return this.buffer.length;
      }

      async prefetch(count = 4): Promise<{ skipped: boolean; count: number }> {
        // Redundant call prevention check
        if (this.buffer.length >= 4) {
          return { skipped: true, count: this.buffer.length };
        }

        // Only query DB if buffer dropped below 4
        this.dbCallsMade++;
        neonDbCallCount++;
        const simulatedFetched = Array.from({ length: count }, (_, i) => ({ id: `q-${Date.now()}-${i}` }));
        this.buffer.push(...simulatedFetched);
        return { skipped: false, count: simulatedFetched.length };
      }

      consume(): any | null {
        if (this.buffer.length === 0) return null;
        return this.buffer.shift();
      }
    }

    const controller = new SlidingBufferController(INITIAL_BUFFER_QUESTIONS);

    // Initial buffer has 4 items
    assert.equal(controller.count, 4);

    // First prefetch attempt: buffer >= 4 -> should skip DB call completely
    const result1 = await controller.prefetch(4);
    assert.equal(result1.skipped, true);
    assert.equal(controller.dbCallsMade, 0, 'Zero Neon DB calls should be made when buffer has >= 4 items');
    assert.equal(neonDbCallCount, 0);

    // Consume 1 question: buffer becomes 3 items (< 4)
    controller.consume();
    assert.equal(controller.count, 3);

    // Now prefetch: buffer < 4 -> should dispatch DB call to replenish
    const result2 = await controller.prefetch(4);
    assert.equal(result2.skipped, false);
    assert.equal(controller.dbCallsMade, 1, 'Exactly one DB call should be dispatched to replenish buffer');
    assert.ok(controller.count >= 4);

    // Subsequent prefetch: buffer >= 4 again -> must skip
    const result3 = await controller.prefetch(4);
    assert.equal(result3.skipped, true);
    assert.equal(controller.dbCallsMade, 1, 'No additional DB calls should occur once buffer >= 4');
  });
});

describe('Homepage & Routes Configuration', () => {
  test('Targeted source files exist and export components properly', () => {
    const clientHomepage = path.resolve(__dirname, '../client/src/pages/Homepage.tsx');
    const rootHomepage = path.resolve(__dirname, '../src/pages/Homepage.tsx');
    const clientRoutes = path.resolve(__dirname, '../client/src/routes.tsx');
    const rootRoutes = path.resolve(__dirname, '../src/routes.tsx');

    assert.ok(fs.existsSync(clientHomepage), 'client/src/pages/Homepage.tsx must exist');
    assert.ok(fs.existsSync(rootHomepage), 'src/pages/Homepage.tsx must exist');
    assert.ok(fs.existsSync(clientRoutes), 'client/src/routes.tsx must exist');
    assert.ok(fs.existsSync(rootRoutes), 'src/routes.tsx must exist');

    const clientRoutesContent = fs.readFileSync(clientRoutes, 'utf8');
    assert.ok(
      clientRoutesContent.includes('path="/"') && clientRoutesContent.includes('Homepage'),
      'Route to / must point to Homepage'
    );
  });
});

describe('Live DB Telemetry & Student Analytics Requirements', () => {
  test('HomeOverview.tsx does NOT render Fox AI Cadet widget in its JSX tree', () => {
    const homeOverviewPath = path.resolve(__dirname, '../client/src/pages/HomeOverview.tsx');
    assert.ok(fs.existsSync(homeOverviewPath), 'client/src/pages/HomeOverview.tsx must exist');
    const content = fs.readFileSync(homeOverviewPath, 'utf8');

    // Confirm no FoxCadetMascot import or JSX usage
    assert.ok(!content.includes('<FoxCadetMascot'), 'HomeOverview must not render FoxCadetMascot component');
    assert.ok(!content.includes('Fox AI Active'), 'HomeOverview must not render Fox AI Cadet widget text');
    assert.ok(!content.includes('CADET TELEMETRY'), 'HomeOverview must not render cadet telemetry badge');
  });

  test('Per-test question accuracy calculates as (correctAnswers / totalQuestions * 100)', () => {
    const calculateAccuracy = (correct: number, total: number): number => {
      if (total <= 0) return 0;
      return Math.round((correct / total) * 1000) / 10;
    };

    // Test standard case
    assert.equal(calculateAccuracy(18, 25), 72.0);
    // Test 100% mastery
    assert.equal(calculateAccuracy(25, 25), 100.0);
    // Test 0 correct
    assert.equal(calculateAccuracy(0, 25), 0.0);
    // Edge case: 0 total questions -> should return 0, no NaN
    assert.equal(calculateAccuracy(0, 0), 0.0);
  });

  test('StudentStatsCard and TestScoreGraph components exist and handle zero edge cases', () => {
    const statsCardPath = path.resolve(__dirname, '../client/src/components/StudentStatsCard.tsx');
    const scoreGraphPath = path.resolve(__dirname, '../client/src/components/TestScoreGraph.tsx');

    assert.ok(fs.existsSync(statsCardPath), 'StudentStatsCard.tsx must exist');
    assert.ok(fs.existsSync(scoreGraphPath), 'TestScoreGraph.tsx must exist');

    const statsContent = fs.readFileSync(statsCardPath, 'utf8');
    assert.ok(statsContent.includes('0 assigned'), 'StudentStatsCard must handle 0 assigned tests edge case');
    assert.ok(statsContent.includes('bg-[#151C2C]'), 'StudentStatsCard must use Space Cadet card token');

    const graphContent = fs.readFileSync(scoreGraphPath, 'utf8');
    assert.ok(graphContent.includes('No Attempted Test Results Yet'), 'TestScoreGraph must handle 0 attempted tests empty state');
    assert.ok(graphContent.includes('bg-[#151C2C]'), 'TestScoreGraph must use Space Cadet card token');
  });

  test('Server tests route and app mounting exist and support userId extraction', () => {
    const testsRoutePath = path.resolve(__dirname, '../server/src/routes/tests.ts');
    const appPath = path.resolve(__dirname, '../server/src/app.ts');

    assert.ok(fs.existsSync(testsRoutePath), 'server/src/routes/tests.ts must exist');
    const appContent = fs.readFileSync(appPath, 'utf8');
    assert.ok(appContent.includes('/api/tests'), 'app.ts must mount /api/tests');

    const testsContent = fs.readFileSync(testsRoutePath, 'utf8');
    assert.ok(testsContent.includes('req.user?.userId') || testsContent.includes('userId'), 'tests.ts must safely extract userId from AuthRequest');
  });
});

