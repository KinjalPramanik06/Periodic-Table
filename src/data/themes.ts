import { ElementCategory, CategoryInfo, CATEGORIES } from './elements';
import { AmbientLightingTheme } from '../types';

/** Accent colour ramp. It re-colours every `amber-*` Tailwind utility in the UI at runtime. */
export interface AccentRamp {
  c200: string;
  c300: string;
  c400: string;
  c500: string;
  /** Secondary accent (replaces `rose-500`, used as the end of accent gradients). */
  second: string;
  /** "r, g, b" of c400, used by glows written in raw CSS. */
  rgb: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  accentGradient: string;
  accent: AccentRamp;
  /** Backdrop: three glow colours ("r, g, b"), a deep base for each lighting mode, and a panel tint. */
  ambient: {
    glow: [string, string, string];
    baseStudio: string;
    baseDeep: string;
    /** "r, g, b" tint used for glass panels, toolbars and card surfaces. */
    panel: string;
  };
  categories: Record<ElementCategory, CategoryInfo>;
}

// ---------------------------------------------------------------------------
// Helpers: build a full CategoryInfo from a single hex colour
// ---------------------------------------------------------------------------

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

const lighten = (hex: string, t: number): string => {
  const [r, g, b] = hexToRgb(hex).map((v) => Math.round(v + (255 - v) * t));
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
};

const makeCategory = (id: ElementCategory, hex: string): CategoryInfo => {
  const [r, g, b] = hexToRgb(hex);
  return {
    id,
    name: CATEGORIES[id].name,
    color: hex,
    glowColor: `rgba(${r}, ${g}, ${b}, 0.55)`,
    bgRgba: `rgba(${r}, ${g}, ${b}, 0.18)`,
    borderRgba: `rgba(${r}, ${g}, ${b}, 0.5)`,
    textCol: lighten(hex, 0.45),
  };
};

const palette = (colors: Record<ElementCategory, string>): Record<ElementCategory, CategoryInfo> =>
  Object.fromEntries(
    (Object.keys(colors) as ElementCategory[]).map((id) => [id, makeCategory(id, colors[id])])
  ) as Record<ElementCategory, CategoryInfo>;

// ---------------------------------------------------------------------------
// Theme presets
// ---------------------------------------------------------------------------

export const THEME_PRESETS: Record<string, ThemePreset> = {
  prism: {
    id: 'prism',
    name: 'Prism Luxe',
    description: 'Jewel tones on midnight blue with warm amber accents',
    accentGradient: 'from-rose-500 via-amber-400 to-indigo-500',
    accent: { c200: '#fde68a', c300: '#fcd34d', c400: '#fbbf24', c500: '#f59e0b', second: '#f43f5e', rgb: '251, 191, 36' },
    ambient: { glow: ['60, 88, 138', '38, 58, 92', '50, 42, 80'], baseStudio: '#0b0f19', baseDeep: '#020408', panel: '13, 17, 26' },
    categories: palette({
      'alkali-metal': '#FF4D4D',
      'alkaline-earth': '#FF8A3D',
      'transition-metal': '#F5B731',
      'post-transition': '#10B981',
      metalloid: '#06B6D4',
      'reactive-nonmetal': '#4F6BFF',
      'noble-gas': '#A855F7',
      lanthanide: '#F43F5E',
      actinide: '#D946EF',
      unknown: '#94A3B8',
    }),
  },

  neon: {
    id: 'neon',
    name: 'Neon Cyber',
    description: 'Electric cyan and magenta glow on an ink-violet void',
    accentGradient: 'from-cyan-300 via-sky-400 to-fuchsia-500',
    accent: { c200: '#a5f3fc', c300: '#67e8f9', c400: '#22d3ee', c500: '#06b6d4', second: '#d946ef', rgb: '34, 211, 238' },
    ambient: { glow: ['0, 150, 190', '110, 40, 170', '0, 90, 150'], baseStudio: '#070a1c', baseDeep: '#02030c', panel: '8, 12, 32' },
    categories: palette({
      'alkali-metal': '#FF2E63',
      'alkaline-earth': '#FF9F1C',
      'transition-metal': '#FFE600',
      'post-transition': '#39FF88',
      metalloid: '#00E5FF',
      'reactive-nonmetal': '#3D7BFF',
      'noble-gas': '#B14CFF',
      lanthanide: '#FF4FD8',
      actinide: '#FF8FA3',
      unknown: '#8B9BB4',
    }),
  },

  solaris: {
    id: 'solaris',
    name: 'Sunset Synthwave',
    description: 'Hot pink, orange and violet, an eighties sunset horizon',
    accentGradient: 'from-orange-400 via-pink-500 to-violet-500',
    accent: { c200: '#fbcfe8', c300: '#f9a8d4', c400: '#f472b6', c500: '#ec4899', second: '#8b5cf6', rgb: '244, 114, 182' },
    ambient: { glow: ['190, 40, 120', '110, 50, 190', '230, 100, 60'], baseStudio: '#14081f', baseDeep: '#06030c', panel: '24, 10, 38' },
    categories: palette({
      'alkali-metal': '#FF3B6B',
      'alkaline-earth': '#FF7A3D',
      'transition-metal': '#FFC93C',
      'post-transition': '#2EE6A6',
      metalloid: '#29C5F6',
      'reactive-nonmetal': '#6C63FF',
      'noble-gas': '#B388FF',
      lanthanide: '#FF5CA8',
      actinide: '#D048E8',
      unknown: '#9AA0B8',
    }),
  },

  aurora: {
    id: 'aurora',
    name: 'Aurora Borealis',
    description: 'Northern-lights greens, teals and violets over a polar night',
    accentGradient: 'from-emerald-300 via-teal-400 to-violet-500',
    accent: { c200: '#a7f3d0', c300: '#6ee7b7', c400: '#34d399', c500: '#10b981', second: '#06b6d4', rgb: '52, 211, 153' },
    ambient: { glow: ['16, 150, 120', '70, 60, 170', '20, 110, 150'], baseStudio: '#06121a', baseDeep: '#020609', panel: '8, 20, 28' },
    categories: palette({
      'alkali-metal': '#FF6B8B',
      'alkaline-earth': '#FFB547',
      'transition-metal': '#A3E635',
      'post-transition': '#34D399',
      metalloid: '#22D3EE',
      'reactive-nonmetal': '#60A5FA',
      'noble-gas': '#A78BFA',
      lanthanide: '#F472B6',
      actinide: '#E879F9',
      unknown: '#94A3B8',
    }),
  },

  ocean: {
    id: 'ocean',
    name: 'Deep Ocean',
    description: 'Cool abyssal blues with coral and sand highlights',
    accentGradient: 'from-sky-300 via-blue-500 to-indigo-600',
    accent: { c200: '#bae6fd', c300: '#7dd3fc', c400: '#38bdf8', c500: '#0ea5e9', second: '#6366f1', rgb: '56, 189, 248' },
    ambient: { glow: ['20, 100, 190', '10, 70, 130', '40, 60, 170'], baseStudio: '#06101f', baseDeep: '#01050c', panel: '8, 18, 36' },
    categories: palette({
      'alkali-metal': '#FF7B6B',
      'alkaline-earth': '#FFB86B',
      'transition-metal': '#FFD86B',
      'post-transition': '#3DDBB0',
      metalloid: '#38BDF8',
      'reactive-nonmetal': '#2F6BFF',
      'noble-gas': '#8B7CFF',
      lanthanide: '#FF8FB1',
      actinide: '#C77DFF',
      unknown: '#8FA3B8',
    }),
  },

  sakura: {
    id: 'sakura',
    name: 'Sakura Dusk',
    description: 'Soft blossom pinks, peach and lavender at twilight',
    accentGradient: 'from-rose-300 via-pink-400 to-purple-400',
    accent: { c200: '#fecdd3', c300: '#fda4af', c400: '#fb7185', c500: '#f43f5e', second: '#c084fc', rgb: '251, 113, 133' },
    ambient: { glow: ['170, 70, 120', '110, 80, 170', '200, 110, 110'], baseStudio: '#170b1b', baseDeep: '#07030a', panel: '26, 12, 32' },
    categories: palette({
      'alkali-metal': '#FF5C7A',
      'alkaline-earth': '#FF9E7A',
      'transition-metal': '#FFD27A',
      'post-transition': '#7BE0B0',
      metalloid: '#7CCBFF',
      'reactive-nonmetal': '#8F8CFF',
      'noble-gas': '#D38CFF',
      lanthanide: '#FF8FC7',
      actinide: '#C77DFF',
      unknown: '#A8A4C0',
    }),
  },
};

// ---------------------------------------------------------------------------
// Applying a theme + lighting mode to the document
// ---------------------------------------------------------------------------

/**
 * Writes the active theme and lighting mode to CSS variables on <html>.
 * Overriding `--color-amber-*` / `--color-rose-500` re-colours every Tailwind
 * `amber-*` / `rose-500` utility, so the whole UI follows the theme accent.
 */
export function applyThemeToDocument(themeId: string, lighting: AmbientLightingTheme): void {
  const theme = THEME_PRESETS[themeId] ?? THEME_PRESETS.prism;
  const root = document.documentElement;
  const { accent, ambient } = theme;
  const set = (k: string, v: string) => root.style.setProperty(k, v);
  const deep = lighting === 'deep-space';

  // Accent: remaps Tailwind's amber / rose ramps
  set('--color-amber-200', accent.c200);
  set('--color-amber-300', accent.c300);
  set('--color-amber-400', accent.c400);
  set('--color-amber-500', accent.c500);
  set('--color-rose-500', accent.second);
  set('--accent-rgb', accent.rgb);
  set('--accent-400', accent.c400);
  set('--panel-rgb', ambient.panel);

  // Lighting
  root.setAttribute('data-ambient-lighting', lighting);
  set('--ambient-lighting-mode', lighting);
  set('--card-shadow-intensity', deep ? '0.95' : '0.38');
  set(
    '--card-shadow',
    deep
      ? '0 14px 42px rgba(0, 0, 0, 0.95), 0 4px 14px rgba(0, 0, 0, 0.9)'
      : '0 6px 20px rgba(0, 0, 0, 0.38), 0 2px 6px rgba(0, 0, 0, 0.22)'
  );
  set(
    '--card-shadow-hover',
    deep
      ? '0 24px 52px rgba(0, 0, 0, 0.98), 0 6px 20px rgba(0, 0, 0, 0.95)'
      : '0 16px 36px rgba(0, 0, 0, 0.6), 0 4px 12px rgba(0, 0, 0, 0.3)'
  );
  set('--card-ambient-specular', deep ? '0.07' : '0.22');
  set(
    '--card-glass-bg',
    deep
      ? `linear-gradient(145deg, rgba(255, 255, 255, 0.035) 0%, rgba(255, 255, 255, 0.01) 40%, rgba(${ambient.panel}, 0.8) 100%)`
      : `linear-gradient(145deg, rgba(255, 255, 255, 0.11) 0%, rgba(255, 255, 255, 0.035) 40%, rgba(${ambient.panel}, 0.5) 100%)`
  );

  // Backdrop mesh gradient tinted by the theme
  const [g1, g2, g3] = ambient.glow;
  const k = deep ? 0.4 : 1; // glow strength
  set('--ambient-bg-base', deep ? ambient.baseDeep : ambient.baseStudio);
  set(
    '--ambient-bg-gradient',
    `radial-gradient(circle at 50% -10%, rgba(${g1}, ${(0.7 * k).toFixed(2)}) 0%, transparent 62%), ` +
      `radial-gradient(circle at 12% 40%, rgba(${g2}, ${(0.6 * k).toFixed(2)}) 0%, transparent 52%), ` +
      `radial-gradient(circle at 88% 60%, rgba(${g3}, ${(0.55 * k).toFixed(2)}) 0%, transparent 55%), ` +
      `radial-gradient(circle at 50% 110%, rgba(${ambient.panel}, 0.9) 0%, transparent 70%)`
  );
}
