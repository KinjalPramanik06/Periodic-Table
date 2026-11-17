import React from 'react';
import { LayoutMode } from '../types';
import { Grid, Globe, Layers, Table as TableIcon, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface MobileDockProps {
  currentMode: LayoutMode;
  onSelectMode: (mode: LayoutMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

const MODES = [
  { id: 'grid', label: 'Grid', icon: Grid },
  { id: 'sphere', label: 'Sphere', icon: Globe },
  { id: 'helix', label: 'Helix', icon: Layers },
  { id: 'table', label: 'Table', icon: TableIcon },
] as const;

/**
 * Thumb-reach toolbar for phones: layout switcher + zoom/fit.
 * It sits in the page flow (not over the canvas), so the 3D scene is fitted to what is left.
 */
export const MobileDock: React.FC<MobileDockProps> = ({ currentMode, onSelectMode, onZoomIn, onZoomOut, onFit }) => {
  const tool = 'flex-1 min-w-0 min-h-11 flex items-center justify-center rounded-lg text-slate-200 active:bg-white/15';
  return (
    <div className="touch-ui w-[calc(100%-1rem)] mx-auto mb-1.5 p-1 floating-glass-bar rounded-2xl z-30 flex items-stretch gap-1 select-none">
      <div className="flex flex-[4] items-stretch gap-0.5 min-w-0">
        {MODES.map((m) => {
          const Icon = m.icon;
          const active = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              aria-label={`${m.label} layout`}
              aria-pressed={active}
              className={`flex-1 min-w-0 min-h-11 flex flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-semibold ${
                active ? 'bg-white text-slate-950' : 'text-slate-300 active:bg-white/10'
              }`}
            >
              <Icon size={16} />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>
      <div className="w-px bg-white/10 my-1.5 shrink-0" />
      <div className="flex flex-[3] items-stretch gap-0.5 min-w-0">
        <button onClick={onZoomOut} aria-label="Zoom out" className={tool}>
          <ZoomOut size={18} />
        </button>
        <button onClick={onZoomIn} aria-label="Zoom in" className={tool}>
          <ZoomIn size={18} />
        </button>
        <button onClick={onFit} aria-label="Fit table to screen" className={tool}>
          <Maximize size={18} />
        </button>
      </div>
    </div>
  );
};
