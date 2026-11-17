import { ElementCategory, CategoryInfo, CATEGORIES } from './elements';

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
// Category colours (single fixed palette)
// ---------------------------------------------------------------------------

export const CATEGORY_COLORS: Record<ElementCategory, CategoryInfo> = palette({
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
  });
