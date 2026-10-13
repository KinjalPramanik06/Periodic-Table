import React, { useEffect } from 'react';
import { AmbientLightingTheme, PhaseFilter } from '../types';
import { THEME_PRESETS } from '../data/themes';
import {
  X,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Maximize,
  Compass,
  History,
  Volume2,
  VolumeX,
  Film,
  SunMedium,
  Moon,
  Check,
} from 'lucide-react';

export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  phaseFilter: PhaseFilter;
  onPhaseFilterChange: (p: PhaseFilter) => void;
  isAutoRotating: boolean;
  onToggleAutoRotate: () => void;
  onResetCamera: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  isAutoTourActive: boolean;
  onToggleAutoTour: () => void;
  isSoundEnabled: boolean;
  onToggleSound: () => void;
  currentThemeId: string;
  onSelectTheme?: (themeId: string) => void;
  isFilmGrainEnabled: boolean;
  onToggleFilmGrain?: () => void;
  ambientLighting: AmbientLightingTheme;
  onToggleAmbientLighting?: () => void;
  isTimelineOpen: boolean;
  onToggleTimeline?: () => void;
  isTimelineActive: boolean;
  /** Extra content (e.g. the category filter on landscape phones where there is no room for the bar). */
  extra?: React.ReactNode;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-1 pb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{children}</div>
);

const ToggleRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    role="switch"
    aria-checked={active}
    className="w-full flex items-center justify-between gap-3 px-3 min-h-12 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-100 active:bg-white/10"
  >
    <span className="flex items-center gap-2.5">
      {icon}
      {label}
    </span>
    <span
      className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${active ? 'bg-amber-400' : 'bg-slate-700'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          active ? 'translate-x-4' : ''
        }`}
      />
    </span>
  </button>
);

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  phaseFilter,
  onPhaseFilterChange,
  isAutoRotating,
  onToggleAutoRotate,
  onResetCamera,
  onZoomIn,
  onZoomOut,
  isAutoTourActive,
  onToggleAutoTour,
  isSoundEnabled,
  onToggleSound,
  currentThemeId,
  onSelectTheme,
  isFilmGrainEnabled,
  onToggleFilmGrain,
  ambientLighting,
  onToggleAmbientLighting,
  isTimelineOpen,
  onToggleTimeline,
  isTimelineActive,
  extra,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const camBtn =
    'flex flex-col items-center justify-center gap-1 min-h-14 rounded-xl bg-white/5 border border-white/10 text-[11px] font-medium text-slate-200 active:bg-white/15';

  return (
    <div className="fixed inset-0 z-40 animate-fadeIn" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="touch-ui absolute inset-x-0 bottom-0 max-h-[88dvh] rounded-t-2xl sm:inset-x-auto sm:right-0 sm:top-0 sm:bottom-0 sm:max-h-none sm:w-80 sm:rounded-t-none sm:rounded-l-2xl
                   bg-slate-900/95 border border-white/15 shadow-2xl flex flex-col overflow-hidden"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          paddingRight: 'env(safe-area-inset-right)',
        }}
      >
        <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
          <div className="mx-auto sm:hidden absolute left-1/2 -translate-x-1/2 top-1.5 w-10 h-1 rounded-full bg-white/20" />
          <span className="text-sm font-bold text-white tracking-tight">Menu</span>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-11 h-11 -mr-2 flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto overscroll-contain px-4 pb-4 flex flex-col gap-4">
          {/* Phase filter */}
          <section>
            <SectionTitle>State of matter</SectionTitle>
            <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'solid', label: 'Solid' },
                  { id: 'liquid', label: 'Liquid' },
                  { id: 'gas', label: 'Gas' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => onPhaseFilterChange(p.id)}
                  className={`min-h-11 rounded-lg text-sm font-medium transition-colors ${
                    phaseFilter === p.id ? 'bg-white text-slate-950 font-bold' : 'text-slate-300 active:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          {/* Explore */}
          <section>
            <SectionTitle>Explore</SectionTitle>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onToggleAutoTour();
                  onClose();
                }}
                className={`flex items-center justify-center gap-2 min-h-12 rounded-xl text-sm font-semibold border ${
                  isAutoTourActive
                    ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 border-amber-300'
                    : 'bg-white/5 text-amber-300 border-amber-400/30 active:bg-white/10'
                }`}
              >
                <Compass size={16} />
                {isAutoTourActive ? 'Stop Tour' : 'Guided Tour'}
              </button>
              {onToggleTimeline && (
                <button
                  onClick={() => {
                    onToggleTimeline();
                    onClose();
                  }}
                  className={`flex items-center justify-center gap-2 min-h-12 rounded-xl text-sm font-semibold border ${
                    isTimelineOpen
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : isTimelineActive
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'bg-white/5 text-slate-200 border-white/10 active:bg-white/10'
                  }`}
                >
                  <History size={16} />
                  Timeline
                </button>
              )}
            </div>
          </section>

          {/* Camera */}
          <section>
            <SectionTitle>Camera</SectionTitle>
            <div className="grid grid-cols-4 gap-2">
              <button onClick={onToggleAutoRotate} className={camBtn} aria-pressed={isAutoRotating}>
                {isAutoRotating ? <Pause size={18} className="text-amber-300" /> : <Play size={18} />}
                {isAutoRotating ? 'Pause' : 'Rotate'}
              </button>
              <button onClick={onZoomOut} className={camBtn}>
                <ZoomOut size={18} />
                Zoom out
              </button>
              <button onClick={onZoomIn} className={camBtn}>
                <ZoomIn size={18} />
                Zoom in
              </button>
              <button onClick={onResetCamera} className={camBtn}>
                <Maximize size={18} />
                Fit
              </button>
            </div>
          </section>

          {/* Display toggles */}
          <section className="flex flex-col gap-2">
            <SectionTitle>Display &amp; sound</SectionTitle>
            <ToggleRow
              icon={isSoundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
              label="Sound effects"
              active={isSoundEnabled}
              onClick={onToggleSound}
            />
            {onToggleFilmGrain && (
              <ToggleRow
                icon={<Film size={17} />}
                label="Film grain"
                active={isFilmGrainEnabled}
                onClick={onToggleFilmGrain}
              />
            )}
            {onToggleAmbientLighting && (
              <ToggleRow
                icon={ambientLighting === 'studio-bright' ? <SunMedium size={17} /> : <Moon size={17} />}
                label="Studio lighting"
                active={ambientLighting === 'studio-bright'}
                onClick={onToggleAmbientLighting}
              />
            )}
          </section>

          {/* Themes */}
          {onSelectTheme && (
            <section>
              <SectionTitle>Color theme</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(THEME_PRESETS).map((t) => {
                  const selected = t.id === currentThemeId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onSelectTheme(t.id)}
                      className={`flex items-center justify-between gap-2 px-3 min-h-11 rounded-xl text-sm border ${
                        selected
                          ? 'bg-white/15 text-white font-bold border-white/30'
                          : 'bg-white/5 text-slate-300 border-white/10 active:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className="flex -space-x-1 shrink-0">
                          {(['alkali-metal', 'transition-metal', 'metalloid', 'noble-gas'] as const).map((c) => (
                            <span key={c} className="w-3 h-3 rounded-full ring-1 ring-slate-900" style={{ background: t.categories[c].color }} />
                          ))}
                        </span>
                        <span className="truncate">{t.name}</span>
                      </span>
                      {selected && <Check size={14} className="shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {extra && (
            <section>
              <SectionTitle>Categories</SectionTitle>
              {extra}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
