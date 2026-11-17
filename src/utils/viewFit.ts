import { LayoutMode } from '../types';

/**
 * Rendered footprint (in CSS px) of each layout at fit-scale 1 with the default camera.
 * Measured from the original desktop build at 1440x900 - these are the proportions the
 * scene had when it was designed, so scaling by (container / extent) keeps them intact.
 */
export const LAYOUT_EXTENTS: Record<LayoutMode, { w: number; h: number }> = {
  // h = measured height + 2 x the layout's vertical offset from centre, so the *offset* scene still fits
  // (grid's 15deg pitch pushes it ~43px low; helix sits ~15px high; table ~5px low).
  grid: { w: 848, h: 640 },
  sphere: { w: 685, h: 736 },
  helix: { w: 731, h: 633 },
  table: { w: 892, h: 626 },
};

/** Breathing room around the scene, as a fraction of the container (min px as floor). */
const MARGIN_FRACTION = 0.04;
const MARGIN_MIN_PX = 8;

export const MIN_FIT_SCALE = 0.12;
export const MAX_FIT_SCALE = 1.9;
export const MIN_USER_SCALE = 0.6;
export const MAX_USER_SCALE = 6;

/** Uniform scale that makes the whole layout fit inside the container, whatever its size. */
export function computeFitScale(mode: LayoutMode, width: number, height: number): number {
  if (width <= 0 || height <= 0) return 1;
  const ext = LAYOUT_EXTENTS[mode];
  const availW = width - Math.max(MARGIN_MIN_PX * 2, width * MARGIN_FRACTION * 2);
  const availH = height - Math.max(MARGIN_MIN_PX * 2, height * MARGIN_FRACTION * 2);
  const fit = Math.min(availW / ext.w, availH / ext.h);
  return Math.max(MIN_FIT_SCALE, Math.min(MAX_FIT_SCALE, fit));
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** User-driven view on top of the automatic fit: zoom multiplier and screen-space pan (px). */
export interface ViewState {
  scale: number;
  panX: number;
  panY: number;
}

export const DEFAULT_VIEW: ViewState = { scale: 1, panX: 0, panY: 0 };

export interface ViewBounds {
  /** Container size in px. */
  vw: number;
  vh: number;
  /** Auto-fit scale for the current layout. */
  fit: number;
  mode: LayoutMode;
}

/** Keeps at least a slice of the scene on screen so it can never be panned out of reach. */
export function clampView(v: ViewState, b: ViewBounds): ViewState {
  const scale = clamp(v.scale, MIN_USER_SCALE, MAX_USER_SCALE);
  const ext = LAYOUT_EXTENTS[b.mode];
  const total = b.fit * scale;
  const maxX = Math.max(0, (ext.w * total - b.vw) / 2) + b.vw * 0.3;
  const maxY = Math.max(0, (ext.h * total - b.vh) / 2) + b.vh * 0.3;
  return { scale, panX: clamp(v.panX, -maxX, maxX), panY: clamp(v.panY, -maxY, maxY) };
}

/**
 * Change zoom while keeping the scene point under (cx, cy) fixed on screen.
 * cx/cy are relative to the container centre. Used by pinch, wheel and the zoom buttons.
 */
export function zoomAbout(v: ViewState, nextScale: number, cx: number, cy: number, b: ViewBounds): ViewState {
  const scale = clamp(nextScale, MIN_USER_SCALE, MAX_USER_SCALE);
  const ratio = scale / v.scale;
  return clampView({ scale, panX: cx - (cx - v.panX) * ratio, panY: cy - (cy - v.panY) * ratio }, b);
}
