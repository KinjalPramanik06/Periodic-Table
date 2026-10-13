import React, { useMemo, useState } from 'react';
import { ElementData } from '../data/elements';
import { TIMELINE_ERAS, TimelineEra } from '../data/timeline';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  History,
  X,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';

interface TimelineFilterProps {
  isOpen: boolean;
  onClose: () => void;
  timelineYear: number;
  onYearChange: (year: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetToPresent: () => void;
  totalDiscovered: number;
  totalElements: number;
  recentElements?: ElementData[];
  onSelectElement?: (element: ElementData) => void;
  /**
   * Render in the page flow (pushes the 3D view down and shrinks it) instead of floating over it.
   * Used on phones/tablets so the panel never covers the interactive table.
   */
  inline?: boolean;
}

export const TimelineFilter: React.FC<TimelineFilterProps> = ({
  inline = false,
  isOpen,
  onClose,
  timelineYear,
  onYearChange,
  isPlaying,
  onTogglePlay,
  onResetToPresent,
  totalDiscovered,
  totalElements,
  recentElements = [],
  onSelectElement,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Active era based on current timelineYear
  const currentEra = useMemo<TimelineEra>(() => {
    if (timelineYear <= 1500) return TIMELINE_ERAS[0];
    const found = TIMELINE_ERAS.slice()
      .reverse()
      .find((era) => timelineYear >= era.year);
    return found || TIMELINE_ERAS[TIMELINE_ERAS.length - 1];
  }, [timelineYear]);

  // Percentage for scrubber track gradient
  const progressPercent = useMemo(() => {
    const min = 1500;
    const max = 2026;
    const clamped = Math.max(min, Math.min(max, timelineYear));
    return ((clamped - min) / (max - min)) * 100;
  }, [timelineYear]);

  // Jump to specific era
  const handleSelectEra = (era: TimelineEra) => {
    onYearChange(era.year);
  };

  // Step -10 or +10 years
  const handleStep = (delta: number) => {
    const next = Math.max(1500, Math.min(2026, timelineYear + delta));
    onYearChange(next);
  };

  // Step to prev or next milestone era
  const handlePrevEra = () => {
    const currentIndex = TIMELINE_ERAS.findIndex((e) => e.id === currentEra.id);
    if (currentIndex > 0) {
      onYearChange(TIMELINE_ERAS[currentIndex - 1].year);
    } else {
      onYearChange(1500);
    }
  };

  const handleNextEra = () => {
    const currentIndex = TIMELINE_ERAS.findIndex((e) => e.id === currentEra.id);
    if (currentIndex < TIMELINE_ERAS.length - 1) {
      onYearChange(TIMELINE_ERAS[currentIndex + 1].year);
    } else {
      onYearChange(2026);
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      aria-label="Historical Discovery Timeline"
      className={
        inline
          ? 'touch-ui relative shrink-0 mx-auto mt-1.5 z-30 w-[calc(100%-1rem)] max-w-4xl max-h-[40dvh] overflow-y-auto overscroll-contain rounded-2xl'
          : 'absolute top-16 left-1/2 -translate-x-1/2 z-30 w-[96vw] max-w-4xl transition-all duration-300'
      }
    >
      <div className="bg-slate-900/90 border border-white/15 backdrop-blur-xl rounded-2xl shadow-2xl p-3 sm:p-4 text-slate-100 flex flex-col gap-3">
        {/* Top Control Bar: Era indicator, discovery counter & action buttons */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Left: Era Title & Discovery Counter */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <History size={16} />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm sm:text-base font-bold text-amber-300">
                  {timelineYear <= 1500 ? 'Antiquity (< 1500 AD)' : `Year ${timelineYear}`}
                </span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="text-xs font-semibold text-slate-300 truncate hidden sm:inline">
                  {currentEra.name}
                </span>
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                <span>
                  Discovered:{' '}
                  <strong className="text-white">
                    {totalDiscovered} / {totalElements}
                  </strong>{' '}
                  ({Math.round((totalDiscovered / totalElements) * 100)}%)
                </span>
                {timelineYear < 2026 && (
                  <span className="text-amber-400/90 font-medium hidden md:inline">
                    ({totalElements - totalDiscovered} undiscovered)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Scrub & Playback Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap max-w-full">
            {/* Prev era */}
            <button
              onClick={handlePrevEra}
              title="Previous Historic Era"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Step -10 yrs */}
            <button
              onClick={() => handleStep(-10)}
              title="Step -10 Years"
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-mono font-semibold transition-colors cursor-pointer"
            >
              -10y
            </button>

            {/* Play / Pause Time-Lapse */}
            <button
              onClick={onTogglePlay}
              title={isPlaying ? 'Pause Historical Time-Lapse' : 'Play Historical Time-Lapse (Antiquity to 2026)'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                isPlaying
                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.5)]'
                  : 'bg-white/10 text-slate-100 hover:bg-white/15 hover:text-white border border-white/20'
              }`}
            >
              {isPlaying ? <Pause size={13} className="fill-current" /> : <Play size={13} className="fill-current" />}
              <span className="hidden sm:inline">{isPlaying ? 'Pause' : 'Play Time-Lapse'}</span>
            </button>

            {/* Step +10 yrs */}
            <button
              onClick={() => handleStep(10)}
              title="Step +10 Years"
              className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-[11px] font-mono font-semibold transition-colors cursor-pointer"
            >
              +10y
            </button>

            {/* Next era */}
            <button
              onClick={handleNextEra}
              title="Next Historic Era"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>

            {/* Reset to Present (All elements) */}
            <button
              onClick={onResetToPresent}
              title="Show All Elements (Present Day 2026)"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw size={15} />
            </button>

            {/* Expand / Collapse Info */}
            <button
              onClick={() => setIsExpanded((prev) => !prev)}
              title={isExpanded ? 'Hide Era Details' : 'Show Era Context & Discoveries'}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                isExpanded
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                  : 'bg-white/5 text-slate-400 hover:text-white border-white/10'
              }`}
            >
              <Info size={15} />
            </button>

            {/* Close Timeline */}
            <button
              onClick={onClose}
              title="Close Timeline Filter"
              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Timeline Slider Track */}
        <div className="relative flex flex-col gap-1.5 px-1 py-1">
          <div className="relative w-full flex items-center">
            {/* Range slider input */}
            <input
              type="range"
              min={1500}
              max={2026}
              step={1}
              value={timelineYear}
              onChange={(e) => onYearChange(parseInt(e.target.value, 10))}
              aria-label="Historical Discovery Year Slider"
              className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-ew-resize accent-amber-400 focus:outline-none transition-all"
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #fbbf24 ${progressPercent}%, #1e293b ${progressPercent}%, #1e293b 100%)`,
              }}
            />
          </div>

          {/* Timeline Milestones Labels */}
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 px-0.5">
            <span
              onClick={() => onYearChange(1500)}
              className="cursor-pointer hover:text-amber-300 transition-colors"
            >
              Antiquity
            </span>
            <span
              onClick={() => onYearChange(1790)}
              className="cursor-pointer hover:text-amber-300 transition-colors hidden sm:inline"
            >
              1790 (Lavoisier)
            </span>
            <span
              onClick={() => onYearChange(1869)}
              className="cursor-pointer hover:text-amber-300 font-semibold text-amber-400/90 transition-colors"
            >
              1869 (Mendeleev)
            </span>
            <span
              onClick={() => onYearChange(1940)}
              className="cursor-pointer hover:text-amber-300 transition-colors hidden sm:inline"
            >
              1940 (Atomic)
            </span>
            <span
              onClick={() => onYearChange(2026)}
              className="cursor-pointer hover:text-amber-300 transition-colors font-medium"
            >
              2026 (Present)
            </span>
          </div>
        </div>

        {/* Quick Era Navigation Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {TIMELINE_ERAS.map((era) => {
            const isEraActive = currentEra.id === era.id;
            return (
              <button
                key={era.id}
                onClick={() => handleSelectEra(era)}
                className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-[11px] font-medium transition-all cursor-pointer shrink-0 border ${
                  isEraActive
                    ? 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                    : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border-white/10'
                }`}
              >
                {era.name}
              </button>
            );
          })}
        </div>

        {/* Expandable Historical Context Narrative & Recent Discoveries */}
        {isExpanded && (
          <div className="pt-2 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-3 animate-fadeIn text-xs">
            {/* Era Narrative */}
            <div className="md:col-span-2 bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Calendar size={13} />
                <span>
                  {currentEra.name} ({currentEra.periodLabel})
                </span>
              </div>
              <p className="text-slate-300 text-[11.5px] leading-relaxed">
                {currentEra.description}
              </p>
              <div className="text-[11px] text-slate-400 font-mono">
                <strong className="text-slate-200">Milestone:</strong> {currentEra.keyHighlight}
              </div>
            </div>

            {/* Elements Discovered Around Current Year */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-1.5 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
                <Sparkles size={13} />
                <span>Recently Discovered Elements</span>
              </div>

              {recentElements.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto pr-1">
                  {recentElements.slice(0, 8).map((el) => (
                    <button
                      key={el.number}
                      onClick={() => onSelectElement?.(el)}
                      title={`#${el.number} ${el.name} (Discovered: ${el.year})`}
                      className="px-2 py-0.5 rounded bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-slate-200 text-[10.5px] font-mono transition-colors cursor-pointer border border-white/10 flex items-center gap-1"
                    >
                      <span className="font-bold">{el.symbol}</span>
                      <span className="text-[9px] opacity-75">{el.year}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-[11px] italic">
                  Ancient elements known from antiquity before modern record-keeping.
                </p>
              )}

              <div className="text-[10px] text-slate-500 font-mono">
                Click any discovered card in the 3D scene to inspect.
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
