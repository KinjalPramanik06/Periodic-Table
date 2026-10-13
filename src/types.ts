import { ElementCategory } from './data/elements';

export type LayoutMode = 'grid' | 'sphere' | 'helix' | 'table';

export interface Transform3D {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
}

export type PhaseFilter = 'all' | 'solid' | 'liquid' | 'gas' | 'synthetic';

export type AmbientLightingTheme = 'studio-bright' | 'deep-space';

export interface TimelineFilterState {
  isEnabled: boolean;
  year: number;
  isPlaying: boolean;
}
