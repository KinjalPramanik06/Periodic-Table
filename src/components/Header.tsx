import React, { useState, useRef, useEffect } from 'react';
import { LayoutMode, PhaseFilter, AmbientLightingTheme } from '../types';
import { THEME_PRESETS } from '../data/themes';
import {
  Search,
  RotateCcw,
  Play,
  Pause,
  Grid,
  Globe,
  Layers,
  Table as TableIcon,
  ZoomIn,
  ZoomOut,
  X,
  Volume2,
  VolumeX,
  Atom,
  Compass,
  Palette,
  Check,
  Film,
  SunMedium,
  Moon,
  History,
  SlidersHorizontal,
} from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import type { LayoutRegime } from '../hooks/useViewport';

interface HeaderProps {
  currentMode: LayoutMode;
  onSelectMode: (mode: LayoutMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
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
  currentThemeId?: string;
  onSelectTheme?: (themeId: string) => void;
  isFilmGrainEnabled?: boolean;
  onToggleFilmGrain?: () => void;
  ambientLighting?: AmbientLightingTheme;
  onToggleAmbientLighting?: () => void;
  isTimelineOpen?: boolean;
  onToggleTimeline?: () => void;
  timelineYear?: number;
  isTimelineActive?: boolean;
  /** Which UI regime to render. Phone/tablet use a compact bar + drawer. */
  regime?: LayoutRegime;
  /** Landscape phone: height is scarce, so the layout switcher stays in the bar. */
  isShort?: boolean;
  /** Extra content shown inside the drawer (e.g. category filter on landscape phones). */
  drawerExtra?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onSelectMode,
  searchQuery,
  onSearchChange,
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
  currentThemeId = 'prism',
  onSelectTheme,
  isFilmGrainEnabled = true,
  onToggleFilmGrain,
  ambientLighting = 'studio-bright',
  onToggleAmbientLighting,
  isTimelineOpen = false,
  onToggleTimeline,
  timelineYear = 2026,
  isTimelineActive = false,
  regime = 'desktop',
  isShort = false,
  drawerExtra,
}) => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Close theme menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    if (isThemeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isThemeMenuOpen]);

  const activeTheme = THEME_PRESETS[currentThemeId] || THEME_PRESETS['prism'];

  // Leaving the compact regime (e.g. rotating or resizing to desktop) must not leave a drawer open.
  useEffect(() => {
    if (regime === 'desktop') setIsMenuOpen(false);
  }, [regime]);

  if (regime !== 'desktop') {
    const showModes = regime === 'tablet' || isShort;
    const hasActiveSetting = phaseFilter !== 'all' || isTimelineActive || isAutoTourActive;
    return (
      <>
        <header
          className="touch-ui w-[calc(100%-1rem)] mx-auto z-30 px-2 py-1.5 floating-glass-bar rounded-2xl flex items-center gap-2 select-none shrink-0"
          style={{ marginTop: 'max(0.5rem, env(safe-area-inset-top))' }}
        >
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${activeTheme.accentGradient} flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.2)] shrink-0`}
            >
              <Atom className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline text-[15px] font-bold tracking-tight text-white whitespace-nowrap">
              Periodic Table <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 border border-white/10 align-middle">3D</span>
            </span>
          </div>

          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search element..."
              aria-label="Search elements"
              className="w-full h-11 pl-9 pr-9 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-white/30 focus:bg-white/10 font-medium truncate"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-slate-400 active:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {showModes && (
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 shrink-0">
              {(
                [
                  { id: 'grid', label: 'Grid', icon: Grid },
                  { id: 'sphere', label: 'Sphere', icon: Globe },
                  { id: 'helix', label: 'Helix', icon: Layers },
                  { id: 'table', label: 'Table', icon: TableIcon },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                const isActive = currentMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelectMode(m.id)}
                    aria-label={`${m.label} layout`}
                    aria-pressed={isActive}
                    className={`min-w-11 h-10 px-2 flex items-center justify-center gap-1 rounded-lg text-[13px] font-semibold ${
                      isActive ? 'bg-white text-slate-950 font-bold' : 'text-slate-300 active:bg-white/10'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden md:inline">{m.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open menu"
            aria-haspopup="dialog"
            className="relative w-11 h-11 shrink-0 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-100 active:bg-white/15"
          >
            <SlidersHorizontal size={18} />
            {hasActiveSetting && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-900" />
            )}
          </button>
        </header>

        <MobileMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          phaseFilter={phaseFilter}
          onPhaseFilterChange={onPhaseFilterChange}
          isAutoRotating={isAutoRotating}
          onToggleAutoRotate={onToggleAutoRotate}
          onResetCamera={onResetCamera}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          isAutoTourActive={isAutoTourActive}
          onToggleAutoTour={onToggleAutoTour}
          isSoundEnabled={isSoundEnabled}
          onToggleSound={onToggleSound}
          currentThemeId={currentThemeId}
          onSelectTheme={onSelectTheme}
          isFilmGrainEnabled={isFilmGrainEnabled}
          onToggleFilmGrain={onToggleFilmGrain}
          ambientLighting={ambientLighting}
          onToggleAmbientLighting={onToggleAmbientLighting}
          isTimelineOpen={isTimelineOpen}
          onToggleTimeline={onToggleTimeline}
          isTimelineActive={isTimelineActive}
          extra={drawerExtra}
        />
      </>
    );
  }

  return (
    <header className="w-fit max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-1.5rem)] mx-auto z-30 mt-2 px-2.5 sm:px-3.5 py-1.5 floating-glass-bar rounded-2xl flex items-center justify-center gap-1.5 sm:gap-2.5 select-none transition-all duration-300">
      {/* 1. Brand Identity */}
      <div className="flex items-center gap-2 shrink-0">
        <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${activeTheme.accentGradient} flex items-center justify-center shadow-[0_0_12px_rgba(255,255,255,0.2)] shrink-0`}>
          <Atom className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="text-[14px] sm:text-[15px] font-bold tracking-tight text-white">
            Periodic Table
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-200 border border-white/10 font-bold tracking-wider">
            3D
          </span>
        </div>
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-white/10 shrink-0 hidden sm:block" />

      {/* 2. Modern Search Input */}
      <div className="relative w-28 sm:w-36 md:w-44 shrink-0">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search element..."
          className="w-full pl-8 pr-6 py-1 bg-white/5 border border-white/10 rounded-lg text-xs sm:text-[13px] text-white placeholder-slate-400 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all font-medium truncate"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {/* 3. Phase Filter Pills */}
      <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 text-xs font-medium text-slate-400 shrink-0">
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
            className={`px-2 sm:px-2.5 py-0.5 rounded-md capitalize transition-all cursor-pointer font-medium ${
              phaseFilter === p.id
                ? 'bg-white/20 text-white font-bold shadow-sm'
                : 'hover:text-slate-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 4. Guided Tour Button */}
      <button
        onClick={onToggleAutoTour}
        title={isAutoTourActive ? 'Stop Guided Tour' : 'Start Guided Tour: Curated walkthrough of fascinating elements'}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-[13px] font-semibold transition-all cursor-pointer shrink-0 ${
          isAutoTourActive
            ? 'bg-gradient-to-r from-amber-400 to-rose-500 text-slate-950 font-bold shadow-[0_0_16px_rgba(245,158,11,0.5)] ring-2 ring-amber-300'
            : 'bg-white/5 text-amber-300 hover:text-white hover:bg-white/10 border border-amber-400/30'
        }`}
      >
        <Compass
          size={14}
          className={isAutoTourActive ? 'animate-spin text-slate-950' : 'text-amber-400'}
          style={isAutoTourActive ? { animationDuration: '6s' } : undefined}
        />
        <span className="whitespace-nowrap">{isAutoTourActive ? 'Touring' : 'Guided Tour'}</span>
      </button>

      {/* 4.5. Historical Timeline Filter Button */}
      {onToggleTimeline && (
        <button
          onClick={onToggleTimeline}
          title={
            isTimelineOpen
              ? 'Close Historical Timeline'
              : 'Historical Discovery Timeline: Scrub by era from Antiquity to Modern'
          }
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-[13px] font-semibold transition-all cursor-pointer shrink-0 ${
            isTimelineOpen
              ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_14px_rgba(251,191,36,0.5)] ring-2 ring-amber-300'
              : isTimelineActive
              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm'
              : 'bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 border border-white/10'
          }`}
        >
          <History
            size={14}
            className={
              isTimelineOpen
                ? 'text-slate-950'
                : isTimelineActive
                ? 'text-amber-400 animate-pulse'
                : 'text-amber-300/80'
            }
          />
          <span className="whitespace-nowrap">Timeline</span>
          {isTimelineActive && (
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                isTimelineOpen
                  ? 'bg-slate-950/20 text-slate-950'
                  : 'bg-amber-400/30 text-amber-200'
              }`}
            >
              {timelineYear <= 1500 ? '<1500' : timelineYear}
            </span>
          )}
        </button>
      )}

      {/* Separator */}
      <div className="h-4 w-px bg-white/10 shrink-0" />

      {/* 5. 3D Layout Mode Switcher */}
      <div className="flex items-center bg-white/5 border border-white/10 rounded-lg p-0.5 shrink-0">
        {(
          [
            { id: 'grid', label: 'Grid', icon: Grid, title: 'Grid 3D (Parallax depth & 15° pitch)' },
            { id: 'sphere', label: 'Sphere', icon: Globe, title: 'Sphere 3D layout' },
            { id: 'helix', label: 'Helix', icon: Layers, title: 'Helix spiral' },
            { id: 'table', label: 'Table', icon: TableIcon, title: 'Flat Table' },
          ] as const
        ).map((m) => {
          const Icon = m.icon;
          const isActive = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMode(m.id)}
              title={m.title}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-md text-xs sm:text-[13px] font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white text-slate-950 shadow-[0_0_10px_rgba(255,255,255,0.4)] font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
              <span className="hidden md:inline">{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div className="h-4 w-px bg-white/10 shrink-0" />

      {/* 6. Quick Camera, Sound & Theme Controls */}
      <div className="flex items-center gap-0.5 bg-white/5 border border-white/10 rounded-lg p-0.5 shrink-0">
        <button
          onClick={onToggleAutoRotate}
          title={isAutoRotating ? 'Pause Scene Rotation' : 'Auto-Rotate Scene'}
          className={`p-1 sm:p-1.5 rounded-md transition-colors cursor-pointer ${
            isAutoRotating
              ? 'bg-amber-500/25 text-amber-300 border border-amber-500/30'
              : 'text-slate-300 hover:text-white hover:bg-white/5'
          }`}
        >
          {isAutoRotating ? <Pause size={13} /> : <Play size={13} />}
        </button>

        <button
          onClick={onZoomIn}
          title="Zoom In"
          className="p-1 sm:p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer hidden lg:block"
        >
          <ZoomIn size={13} />
        </button>

        <button
          onClick={onZoomOut}
          title="Zoom Out"
          className="p-1 sm:p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer hidden lg:block"
        >
          <ZoomOut size={13} />
        </button>

        <button
          onClick={onResetCamera}
          title="Reset Camera Pitch to 15° & Center View"
          className="p-1 sm:p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <RotateCcw size={13} />
        </button>

        {/* Ambient Sound Toggle */}
        <button
          onClick={onToggleSound}
          title={
            isSoundEnabled
              ? 'Ambient Harmonic Sound FX: Enabled (Click to mute)'
              : 'Ambient Harmonic Sound FX: Muted (Click to enable)'
          }
          className={`p-1 sm:p-1.5 rounded-md transition-colors cursor-pointer ${
            isSoundEnabled
              ? 'bg-white/15 text-white border border-white/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          {isSoundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
        </button>

        {/* Tactile Post-Processing Filter (Film Grain & Chromatic Aberration) */}
        {onToggleFilmGrain && (
          <button
            onClick={onToggleFilmGrain}
            title={
              isFilmGrainEnabled
                ? 'Tactile Film Grain & Chromatic Aberration: Active (Click to toggle)'
                : 'Tactile Film Grain & Chromatic Aberration: Disabled (Click to activate)'
            }
            className={`p-1 sm:p-1.5 rounded-md transition-colors cursor-pointer ${
              isFilmGrainEnabled
                ? 'bg-white/15 text-amber-300 border border-amber-400/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Film size={13} />
          </button>
        )}

        {/* Ambient Lighting Toggle: Studio Bright vs Deep Space */}
        {onToggleAmbientLighting && (
          <button
            onClick={onToggleAmbientLighting}
            title={
              ambientLighting === 'studio-bright'
                ? "Ambient Lighting: 'Studio Bright' (Click to switch to 'Deep Space')"
                : "Ambient Lighting: 'Deep Space' (Click to switch to 'Studio Bright')"
            }
            aria-label={`Ambient Lighting mode, currently ${ambientLighting === 'studio-bright' ? 'Studio Bright' : 'Deep Space'}`}
            className={`p-1 sm:p-1.5 rounded-md transition-all cursor-pointer ${
              ambientLighting === 'studio-bright'
                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/35 hover:bg-amber-400/30 shadow-[0_0_8px_rgba(251,191,36,0.2)]'
                : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/35 hover:bg-indigo-500/30 shadow-[0_0_8px_rgba(99,102,241,0.2)]'
            }`}
          >
            {ambientLighting === 'studio-bright' ? (
              <SunMedium size={13} className="text-amber-300" />
            ) : (
              <Moon size={13} className="text-indigo-300" />
            )}
          </button>
        )}

        {/* Theme Palette Switcher Dropdown */}
        {onSelectTheme && (
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setIsThemeMenuOpen((prev) => !prev)}
              title="Modern Stylish Theme Palettes & Ambient Lighting"
              className={`p-1 sm:p-1.5 rounded-md transition-colors cursor-pointer ${
                isThemeMenuOpen
                  ? 'bg-white/20 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Palette size={13} />
            </button>

            {isThemeMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 p-1.5 rounded-xl bg-slate-900/95 border border-white/15 backdrop-blur-xl shadow-2xl z-50 flex flex-col gap-1 text-xs">
                <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-white/5">
                  Color Theme Palette
                </div>
                {Object.values(THEME_PRESETS).map((t) => {
                  const isSelected = t.id === currentThemeId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTheme(t.id);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-white/15 text-white font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex -space-x-1 shrink-0">
                          {(['alkali-metal', 'transition-metal', 'metalloid', 'noble-gas'] as const).map((c) => (
                            <span key={c} className="w-2.5 h-2.5 rounded-full ring-1 ring-slate-900" style={{ background: t.categories[c].color }} />
                          ))}
                        </span>
                        <span>{t.name}</span>
                      </div>
                      {isSelected && <Check size={12} className="text-white" />}
                    </button>
                  );
                })}

                {/* Ambient Lighting Theme Section */}
                {onToggleAmbientLighting && (
                  <div className="pt-1.5 mt-1 border-t border-white/10 flex flex-col gap-1">
                    <div className="px-2 py-0.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                      <span>Ambient Lighting</span>
                      <span className="text-[9px] text-amber-300/90 font-mono capitalize">
                        {ambientLighting === 'studio-bright' ? 'Studio' : 'Space'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 px-1">
                      <button
                        onClick={() => {
                          if (ambientLighting !== 'studio-bright') onToggleAmbientLighting();
                        }}
                        className={`flex items-center justify-center gap-1.5 py-1 px-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                          ambientLighting === 'studio-bright'
                            ? 'bg-amber-400/25 text-amber-200 border border-amber-400/40 font-bold'
                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <SunMedium size={12} className="text-amber-300" />
                        <span>Studio Bright</span>
                      </button>
                      <button
                        onClick={() => {
                          if (ambientLighting !== 'deep-space') onToggleAmbientLighting();
                        }}
                        className={`flex items-center justify-center gap-1.5 py-1 px-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                          ambientLighting === 'deep-space'
                            ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/40 font-bold'
                            : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <Moon size={12} className="text-indigo-300" />
                        <span>Deep Space</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
