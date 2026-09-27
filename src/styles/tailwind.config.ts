/**
 * Space Cadet Theme Configuration & Design Tokens
 * 
 * Void / Canvas: #0B0F17
 * Cards / Surfaces: #151C2C
 * CTA Buttons: #C85A32 (Hover: #DC6C40)
 * Telemetry / Ochre Accents: #D4A373
 * Borders: #263044
 * Muted Text: #8791A5
 */

export const spaceCadetPalette = {
  void: '#0B0F17',
  canvas: '#0B0F17',
  surface: '#151C2C',
  card: '#151C2C',
  cardHover: '#1B2438',
  cta: '#C85A32',
  ctaHover: '#DC6C40',
  telemetry: '#D4A373',
  ochre: '#D4A373',
  ochreFaint: 'rgba(212, 163, 115, 0.15)',
  border: '#263044',
  borderHighlight: 'rgba(212, 163, 115, 0.35)',
  muted: '#8791A5',
  foreground: '#F3F4F6',
  emerald: '#10B981',
  coral: '#EF4444',
} as const;

export default {
  theme: {
    extend: {
      colors: {
        'space-void': spaceCadetPalette.void,
        'space-canvas': spaceCadetPalette.canvas,
        'space-surface': spaceCadetPalette.surface,
        'space-card': spaceCadetPalette.card,
        'space-cta': spaceCadetPalette.cta,
        'space-cta-hover': spaceCadetPalette.ctaHover,
        'space-telemetry': spaceCadetPalette.telemetry,
        'space-ochre': spaceCadetPalette.ochre,
        'space-border': spaceCadetPalette.border,
        'space-muted': spaceCadetPalette.muted,
      },
    },
  },
};
