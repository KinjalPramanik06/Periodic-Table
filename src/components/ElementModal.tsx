import React, { useEffect, useState, useMemo } from 'react';
import { ElementData, CATEGORIES, CategoryInfo, ElementCategory, ELEMENTS } from '../data/elements';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Atom,
  Compass,
  Play,
  Pause,
  Lightbulb,
  ArrowLeftRight,
  Search,
  Check,
  History,
} from 'lucide-react';
import { getElementDiscoveryYear } from '../data/timeline';

interface ElementModalProps {
  element: ElementData | null;
  onClose: () => void;
  onSelectElement: (element: ElementData) => void;
  categories?: Record<ElementCategory, CategoryInfo>;
  timelineYear?: number | null;
  // Auto-Tour Props
  isAutoTourActive?: boolean;
  isTourPaused?: boolean;
  tourIndex?: number;
  totalTourItems?: number;
  tourProgress?: number; // 0 to 100
  tourHighlight?: string;
  onToggleTourPause?: () => void;
  onNextTourItem?: () => void;
  onPrevTourItem?: () => void;
  onExitTour?: () => void;
}

export const ElementModal: React.FC<ElementModalProps> = ({
  element,
  onClose,
  onSelectElement,
  categories = CATEGORIES,
  timelineYear = null,
  isAutoTourActive = false,
  isTourPaused = false,
  tourIndex = 0,
  totalTourItems = 1,
  tourProgress = 0,
  tourHighlight,
  onToggleTourPause,
  onNextTourItem,
  onPrevTourItem,
  onExitTour,
}) => {
  // Compare Mode State
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [compareElement, setCompareElement] = useState<ElementData | null>(null);
  const [selectorTarget, setSelectorTarget] = useState<'primary' | 'secondary' | null>(null);
  const [selectorSearch, setSelectorSearch] = useState<string>('');

  // When element changes, ensure compareElement exists if in compare mode
  useEffect(() => {
    if (element && !compareElement) {
      // Default secondary element to adjacent element in table
      const defaultSecondary =
        element.number < ELEMENTS.length
          ? ELEMENTS[element.number]
          : ELEMENTS[0];
      setCompareElement(defaultSecondary);
    }
  }, [element, compareElement]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!element) return;
      if (e.key === 'Escape') {
        if (selectorTarget) {
          setSelectorTarget(null);
        } else if (isComparing) {
          setIsComparing(false);
        } else if (isAutoTourActive && onExitTour) {
          onExitTour();
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft' && !selectorTarget) {
        if (isAutoTourActive && onPrevTourItem) {
          onPrevTourItem();
        } else {
          const prevIndex = element.number > 1 ? element.number - 2 : ELEMENTS.length - 1;
          onSelectElement(ELEMENTS[prevIndex]);
        }
      } else if (e.key === 'ArrowRight' && !selectorTarget) {
        if (isAutoTourActive && onNextTourItem) {
          onNextTourItem();
        } else {
          const nextIndex = element.number < ELEMENTS.length ? element.number : 0;
          onSelectElement(ELEMENTS[nextIndex]);
        }
      } else if (e.key === ' ' && isAutoTourActive && onToggleTourPause) {
        e.preventDefault();
        onToggleTourPause();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    element,
    onClose,
    onSelectElement,
    isAutoTourActive,
    onExitTour,
    onPrevTourItem,
    onNextTourItem,
    onToggleTourPause,
    isComparing,
    selectorTarget,
  ]);

  // Search filtered elements for the compare picker
  const filteredElementsForPicker = useMemo(() => {
    if (!selectorSearch.trim()) return ELEMENTS;
    const q = selectorSearch.toLowerCase().trim();
    return ELEMENTS.filter(
      (el) =>
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase().includes(q) ||
        el.number.toString() === q
    );
  }, [selectorSearch]);

  if (!element) return null;

  const catInfo = categories[element.category] || CATEGORIES[element.category];
  const compCatInfo = compareElement ? (categories[compareElement.category] || CATEGORIES[compareElement.category]) : null;

  // Helper conversions
  const kelvinToCelsius = (k: number | null | undefined) => {
    if (k === null || k === undefined) return 'N/A';
    return `${(k - 273.15).toFixed(1)} °C (${k} K)`;
  };

  const handlePrev = () => {
    if (isAutoTourActive && onPrevTourItem) {
      onPrevTourItem();
    } else {
      const prev = element.number > 1 ? element.number - 2 : ELEMENTS.length - 1;
      onSelectElement(ELEMENTS[prev]);
    }
  };

  const handleNext = () => {
    if (isAutoTourActive && onNextTourItem) {
      onNextTourItem();
    } else {
      const next = element.number < ELEMENTS.length ? element.number : 0;
      onSelectElement(ELEMENTS[next]);
    }
  };

  const handleSwapElements = () => {
    if (element && compareElement) {
      const temp = element;
      onSelectElement(compareElement);
      setCompareElement(temp);
    }
  };

  const handleClose = () => {
    if (isAutoTourActive && onExitTour) onExitTour();
    else onClose();
  };

  const toggleCompare = () => {
    if (!compareElement) {
      const defaultSecondary =
        element.number < ELEMENTS.length ? ELEMENTS[element.number] : ELEMENTS[0];
      setCompareElement(defaultSecondary);
    }
    setIsComparing((prev) => !prev);
  };

  // Reusable header controls (rendered in the mobile toolbar row and the desktop header row)
  const categoryPill = (
    <span
      className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap truncate max-w-full"
      style={{
        backgroundColor: catInfo.bgRgba,
        color: catInfo.textCol,
        border: `1px solid ${catInfo.borderRgba}`,
      }}
    >
      {catInfo.name}
    </span>
  );

  const compareButton = (
    <button
      onClick={toggleCompare}
      title={isComparing ? 'Exit Comparison View' : 'Pin and Compare with Another Element'}
      className={`flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
        isComparing
          ? 'bg-white text-slate-950 font-bold shadow-md'
          : 'bg-white/10 text-slate-200 hover:text-white hover:bg-white/15 border border-white/15'
      }`}
    >
      <ArrowLeftRight size={14} />
      <span>{isComparing ? 'Exit Compare' : 'Compare'}</span>
    </button>
  );

  const navButtons = (
    <div className="flex items-center gap-1">
      <button
        onClick={handlePrev}
        title="Previous Element (Left Arrow)"
        aria-label="Previous element"
        className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl transition-colors cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={handleNext}
        title="Next Element (Right Arrow)"
        aria-label="Next element"
        className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl transition-colors cursor-pointer"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );

  // Bohr model sizing: the 176px orbit canvas is scaled down on phones
  const bohrModel = (
    <div className="relative w-33 h-33 sm:w-44 sm:h-44 shrink-0">
      <div className="absolute left-1/2 top-1/2 w-44 h-44 -translate-x-1/2 -translate-y-1/2 scale-75 sm:scale-100 flex items-center justify-center">
        {/* Nucleus */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] text-black shadow-lg z-10"
          style={{
            backgroundColor: catInfo.color,
            boxShadow: `0 0 14px ${catInfo.color}`,
          }}
        >
          +{element.number}
        </div>

        {/* Shell rings */}
        {element.shells.map((count, sIdx) => {
          const size = 50 + (sIdx + 1) * (120 / (element.shells.length + 1));
          return (
            <div
              key={sIdx}
              className="absolute rounded-full border animate-spin"
              style={{
                width: `${size}px`,
                height: `${size}px`,
                borderColor: catInfo.borderRgba,
                animationDuration: `${10 + sIdx * 5}s`,
                animationTimingFunction: 'linear',
                animationIterationCount: 'infinite',
              }}
            >
              {Array.from({ length: count }).map((_, eIdx) => {
                const angle = (eIdx / count) * 2 * Math.PI;
                const ex = 50 + 50 * Math.cos(angle);
                const ey = 50 + 50 * Math.sin(angle);
                return (
                  <div
                    key={eIdx}
                    className="absolute w-2 h-2 rounded-full -translate-x-1 -translate-y-1"
                    style={{
                      left: `${ex}%`,
                      top: `${ey}%`,
                      backgroundColor: catInfo.textCol,
                      boxShadow: `0 0 8px ${catInfo.color}`,
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );

  const propTile = (label: string, value: React.ReactNode, mono = true) => (
    <div className="p-2.5 sm:p-3 rounded-lg bg-slate-950/50 border border-white/5 min-w-0">
      <span className="text-[10px] text-slate-500 font-mono uppercase block leading-tight mb-0.5">
        {label}
      </span>
      <span
        className={`text-xs sm:text-sm font-semibold text-white wrap-break-word ${mono ? 'font-mono' : ''}`}
      >
        {value}
      </span>
    </div>
  );

  // Compact hero card used for the two pinned elements in compare mode
  const compareHero = (
    el: ElementData,
    cat: CategoryInfo,
    target: 'primary' | 'secondary'
  ) => (
    <div
      className="flex flex-col p-3 sm:p-5 rounded-xl border relative overflow-hidden transition-all min-w-0"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        borderColor: cat.color,
        boxShadow: `0 0 20px ${cat.glowColor}`,
      }}
    >
      <div className="flex items-center justify-between gap-1 mb-2 sm:mb-3">
        <span className="font-mono font-bold text-[11px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded bg-white/10 text-white">
          #{el.number}
        </span>
        <button
          onClick={() => setSelectorTarget(target)}
          className="text-[10px] sm:text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-medium transition-colors cursor-pointer whitespace-nowrap"
        >
          Change<span className="hidden sm:inline"> Element</span>
        </button>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 my-auto text-center sm:text-left">
        <span
          className="text-4xl sm:text-5xl font-black tracking-tight leading-none"
          style={{ color: cat.textCol, textShadow: `0 2px 10px ${cat.glowColor}` }}
        >
          {el.symbol}
        </span>
        <div className="min-w-0">
          <h4 className="text-sm sm:text-lg font-bold text-white truncate">{el.name}</h4>
          <span className="text-[11px] sm:text-xs text-slate-300 block truncate">{cat.name}</span>
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">{el.weight} u</span>
        </div>
      </div>
    </div>
  );

  const th = 'py-2 sm:py-3 px-2 sm:px-4';
  const td = 'py-2 sm:py-2.5 px-2 sm:px-4 wrap-break-word align-top';
  const label = `${td} text-slate-400 font-mono`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn"
      style={{
        // Gap on all four sides: ~3.5vw on phones, growing on tablet/desktop (12px → 48px),
        // and never smaller than the device's safe-area (notch / home indicator).
        paddingTop: 'max(clamp(12px, 3.5vw, 48px), env(safe-area-inset-top))',
        paddingBottom: 'max(clamp(12px, 3.5vw, 48px), env(safe-area-inset-bottom))',
        paddingLeft: 'max(clamp(12px, 3.5vw, 48px), env(safe-area-inset-left))',
        paddingRight: 'max(clamp(12px, 3.5vw, 48px), env(safe-area-inset-right))',
      }}
    >
      {/* Backdrop click to close */}
      <div
        className="absolute inset-0"
        onClick={() => {
          if (selectorTarget) setSelectorTarget(null);
          else handleClose();
        }}
      />

      {/* Main Container */}
      <div
        className="relative w-full max-w-full sm:max-w-3xl lg:max-w-4xl 2xl:max-w-5xl bg-slate-900/95 border border-slate-700/60 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col max-h-full z-10 text-slate-100"
        style={{
          boxShadow: `0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px ${catInfo.glowColor}`,
        }}
      >
        {/* Top Accent Strip */}
        <div
          className="h-1.5 w-full shrink-0 transition-colors duration-500"
          style={{
            background:
              isComparing && compCatInfo
                ? `linear-gradient(to right, ${catInfo.color}, ${compCatInfo.color})`
                : catInfo.color,
          }}
        />

        {/* GUIDED TOUR STATUS BANNER */}
        {isAutoTourActive && (
          <div className="shrink-0 bg-slate-900/95 border-b border-white/10 px-3 sm:px-4 py-2 flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-[10px] font-bold tracking-wider">
                  <Compass size={11} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>GUIDED TOUR</span>
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  {tourIndex + 1} / {totalTourItems}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={onToggleTourPause}
                  title={isTourPaused ? 'Resume Tour (Space)' : 'Pause Tour (Space)'}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
                    isTourPaused
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-white/10 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  {isTourPaused ? <Play size={12} /> : <Pause size={12} />}
                  <span>{isTourPaused ? 'Resume' : 'Pause'}</span>
                </button>
                <button
                  onClick={handleNext}
                  title="Next Tour Element"
                  className="px-2 py-1 rounded text-xs bg-white/10 text-slate-200 hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-0.5"
                >
                  <span>Skip</span>
                  <ChevronRight size={13} />
                </button>
                <button
                  onClick={onExitTour}
                  className="px-2 py-1 rounded text-xs bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 transition-colors cursor-pointer ml-1"
                >
                  Exit Tour
                </button>
              </div>
            </div>

            {tourHighlight && (
              <div className="flex items-start gap-1.5 text-xs text-slate-200 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
                <Lightbulb size={13} className="text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{tourHighlight}</span>
              </div>
            )}

            <div className="w-full bg-slate-950/60 rounded-full h-1 overflow-hidden border border-white/5">
              <div
                className="h-full transition-all duration-100 ease-linear rounded-full"
                style={{
                  width: `${tourProgress}%`,
                  backgroundColor: catInfo.color,
                  boxShadow: `0 0 8px ${catInfo.color}`,
                }}
              />
            </div>
          </div>
        )}

        {/* ============ HEADER ============ */}
        {/* Mobile: row 1 = badge + name + X, row 2 = category + compare + prev/next.
            Desktop: everything on one row, X at the far right. */}
        <div className="shrink-0 px-3 sm:px-6 py-2.5 sm:py-3.5 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-2 sm:gap-3">
            <span
              className="text-xs font-mono font-bold px-2 py-0.5 rounded shadow-sm shrink-0"
              style={{ backgroundColor: catInfo.color, color: '#000000' }}
            >
              #{element.number}
            </span>
            <h2
              className="text-lg sm:text-xl font-bold tracking-tight text-white truncate min-w-0 flex-1 sm:flex-none"
              title={element.name}
            >
              {element.name}
            </h2>

            {/* Desktop-only inline controls */}
            <div className="hidden sm:block shrink min-w-0">{categoryPill}</div>
            <div className="hidden sm:flex items-center gap-2 ml-auto">
              {compareButton}
              {navButtons}
            </div>

            {/* Close (X) – always in the top-right corner */}
            <button
              onClick={handleClose}
              title="Close (Esc)"
              aria-label="Close"
              className="shrink-0 h-9 w-9 flex items-center justify-center text-slate-300 hover:text-rose-300 bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 rounded-full transition-colors cursor-pointer sm:ml-1"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mobile toolbar row */}
          <div className="flex sm:hidden items-center gap-2 mt-2">
            <div className="min-w-0 flex-1 flex">{categoryPill}</div>
            {compareButton}
            {navButtons}
          </div>
        </div>

        {/* Historical Timeline Notice */}
        {timelineYear && timelineYear < 2026 && getElementDiscoveryYear(element) > timelineYear && (
          <div className="shrink-0 flex items-start sm:items-center gap-2.5 px-3 sm:px-6 py-2 bg-amber-500/15 border-b border-amber-500/30 text-amber-300 text-[11px] sm:text-xs font-mono">
            <History size={15} className="shrink-0 text-amber-400 mt-0.5 sm:mt-0" />
            <span>
              <strong>Historical Era Notice:</strong> In <strong>{timelineYear}</strong>, this element was unknown to science. Discovered in <strong>{element.year}</strong>{element.discoveredBy ? ` by ${element.discoveredBy}` : ''}.
            </span>
          </div>
        )}

        {/* ============ BODY ============ */}
        <div className="overflow-y-auto overscroll-contain p-3 sm:p-6 space-y-3 sm:space-y-6 min-h-0">
          {isComparing && compareElement ? (
            <div className="space-y-3 sm:space-y-6 animate-fadeIn">
              {/* Two pinned cards: always side-by-side */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4 items-stretch relative">
                {compareHero(element, catInfo, 'primary')}

                <button
                  onClick={handleSwapElements}
                  title="Swap Elements"
                  aria-label="Swap elements"
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 border border-white/20 flex items-center justify-center text-slate-200 hover:text-white hover:bg-slate-700 hover:border-white/40 shadow-xl transition-all cursor-pointer"
                >
                  <ArrowLeftRight size={14} />
                </button>

                {compareHero(
                  compareElement,
                  compCatInfo || catInfo,
                  'secondary'
                )}
              </div>

              {/* Property table */}
              <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-950/60 shadow-lg">
                <table className="w-full text-left border-collapse text-[11px] sm:text-xs table-fixed">
                  <thead>
                    <tr className="border-b border-white/10 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px] sm:text-xs">
                      <th className={`${th} w-[28%] sm:w-1/3`}>Property</th>
                      <th className={`${th} text-white font-bold wrap-break-word`}>{element.symbol}<span className="hidden sm:inline"> · {element.name}</span></th>
                      <th className={`${th} text-white font-bold wrap-break-word`}>{compareElement.symbol}<span className="hidden sm:inline"> · {compareElement.name}</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className={label}>Atomic No.</td>
                      <td className={`${td} font-bold text-white`}>#{element.number}</td>
                      <td className={`${td} font-bold text-white`}>#{compareElement.number}</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className={label}>Atomic Weight</td>
                      <td className={`${td} font-mono text-slate-200`}>{element.weight} u</td>
                      <td className={`${td} font-mono text-slate-200`}>{compareElement.weight} u</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className={label}>Category</td>
                      <td className={td}>
                        <span
                          className="inline-block px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-semibold"
                          style={{ backgroundColor: catInfo.bgRgba, color: catInfo.textCol, border: `1px solid ${catInfo.borderRgba}` }}
                        >
                          {catInfo.name}
                        </span>
                      </td>
                      <td className={td}>
                        {compCatInfo && (
                          <span
                            className="inline-block px-1.5 sm:px-2 py-0.5 rounded text-[10px] font-semibold"
                            style={{ backgroundColor: compCatInfo.bgRgba, color: compCatInfo.textCol, border: `1px solid ${compCatInfo.borderRgba}` }}
                          >
                            {compCatInfo.name}
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className={label}>Period / Group</td>
                      <td className={`${td} font-mono text-slate-200`}>P{element.period}, G{element.group}</td>
                      <td className={`${td} font-mono text-slate-200`}>P{compareElement.period}, G{compareElement.group}</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className={label}>Block</td>
                      <td className={`${td} font-mono uppercase text-slate-200`}>{element.block}-block</td>
                      <td className={`${td} font-mono uppercase text-slate-200`}>{compareElement.block}-block</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className={label}>Phase (298K)</td>
                      <td className={`${td} capitalize font-semibold text-white`}>{element.phase}</td>
                      <td className={`${td} capitalize font-semibold text-white`}>{compareElement.phase}</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className={label}>Electro-negativity</td>
                      <td className={`${td} font-mono font-bold text-cyan-300`}>{element.electronegativity !== null ? element.electronegativity : 'N/A'}</td>
                      <td className={`${td} font-mono font-bold text-cyan-300`}>{compareElement.electronegativity !== null ? compareElement.electronegativity : 'N/A'}</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className={label}>Melting Point</td>
                      <td className={`${td} font-mono text-slate-200`}>{kelvinToCelsius(element.meltingPoint)}</td>
                      <td className={`${td} font-mono text-slate-200`}>{kelvinToCelsius(compareElement.meltingPoint)}</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className={label}>Boiling Point</td>
                      <td className={`${td} font-mono text-slate-200`}>{kelvinToCelsius(element.boilingPoint)}</td>
                      <td className={`${td} font-mono text-slate-200`}>{kelvinToCelsius(compareElement.boilingPoint)}</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className={label}>Density</td>
                      <td className={`${td} font-mono text-slate-200`}>{element.density ? `${element.density} g/cm³` : 'N/A'}</td>
                      <td className={`${td} font-mono text-slate-200`}>{compareElement.density ? `${compareElement.density} g/cm³` : 'N/A'}</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className={label}>Electron Config.</td>
                      <td className={`${td} font-mono text-slate-300 text-[10px] sm:text-[11px]`}>{element.electronConfiguration}</td>
                      <td className={`${td} font-mono text-slate-300 text-[10px] sm:text-[11px]`}>{compareElement.electronConfiguration}</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className={label}>Shells</td>
                      <td className={`${td} font-mono text-slate-300`}>{element.shells.join(' · ')}</td>
                      <td className={`${td} font-mono text-slate-300`}>{compareElement.shells.join(' · ')}</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className={label}>Discovered</td>
                      <td className={`${td} text-slate-300`}>
                        {element.discoveredBy || 'Ancient'} {element.year ? `(${element.year})` : ''}
                      </td>
                      <td className={`${td} text-slate-300`}>
                        {compareElement.discoveredBy || 'Ancient'} {compareElement.year ? `(${compareElement.year})` : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <>
              {/* Hero: element tile + Bohr model (side-by-side on every screen size) */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-6 items-stretch">
                {/* Element tile */}
                <div
                  className="flex flex-col items-center justify-center p-3 sm:p-6 pt-8 sm:pt-6 rounded-xl border border-white/10 relative overflow-hidden min-w-0"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    boxShadow: `inset 0 0 30px ${catInfo.bgRgba}`,
                  }}
                >
                  <span className="absolute top-2 sm:top-3 left-3 sm:left-4 font-mono font-bold text-sm sm:text-lg text-slate-400">
                    {element.number}
                  </span>
                  <span className="absolute top-2 sm:top-3 right-3 sm:right-4 font-mono text-[10px] sm:text-sm text-slate-400">
                    {element.weight} u
                  </span>

                  <span
                    className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-none sm:mt-4 mb-1.5 sm:mb-2"
                    style={{ color: catInfo.textCol, textShadow: `0 4px 16px ${catInfo.glowColor}` }}
                  >
                    {element.symbol}
                  </span>

                  <span className="text-base sm:text-xl font-semibold text-white tracking-wide text-center wrap-break-word max-w-full">
                    {element.name}
                  </span>

                  <span className="text-[10px] sm:text-xs text-slate-400 font-mono mt-2 bg-black/40 px-2 sm:px-3 py-1 rounded-md border border-white/5 text-center wrap-break-word max-w-full">
                    {element.electronConfiguration}
                  </span>
                </div>

                {/* Bohr model */}
                <div className="flex flex-col items-center justify-center p-2.5 sm:p-4 bg-slate-950/40 rounded-xl border border-white/5 min-w-0">
                  <div className="text-[11px] sm:text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5 self-start">
                    <Atom size={14} className="shrink-0" style={{ color: catInfo.color }} />
                    <span>
                      Bohr Model<span className="hidden sm:inline"> & Shells ({element.shells.join(', ')})</span>
                    </span>
                  </div>

                  {bohrModel}

                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono text-center wrap-break-word">
                    <span className="hidden sm:inline">Shell distribution: </span>
                    {element.shells.join(' · ')}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 sm:p-4 rounded-xl bg-slate-950/60 border border-white/5">
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 sm:mb-2">
                  <Compass size={14} className="text-amber-400" />
                  Description & Discovery
                </div>
                <p className="text-[13px] sm:text-sm text-slate-300 leading-relaxed">{element.summary}</p>
                {(element.discoveredBy || element.year) && (
                  <div className="mt-2.5 pt-2.5 sm:mt-3 sm:pt-3 border-t border-white/5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                    {element.discoveredBy && (
                      <div>
                        <span className="text-slate-500">Discovered by:</span>{' '}
                        <span className="text-slate-200 font-medium">{element.discoveredBy}</span>
                      </div>
                    )}
                    {element.year && (
                      <div>
                        <span className="text-slate-500">Year:</span>{' '}
                        <span className="text-slate-200 font-medium">{element.year}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Properties */}
              <div>
                <div className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">
                  Physical & Chemical Properties
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {propTile('Phase at 298K', element.phase, false)}
                  {propTile('Block', `${element.block}-block`)}
                  {propTile('Period / Group', `Period ${element.period}, Group ${element.group}`)}
                  {propTile('Electronegativity', element.electronegativity ?? 'N/A')}
                  {propTile('Melting Point', kelvinToCelsius(element.meltingPoint))}
                  {propTile('Boiling Point', kelvinToCelsius(element.boilingPoint))}
                  {propTile('Density', element.density ? `${element.density} g/cm³` : 'N/A')}
                  {propTile('Atomic Weight', `${element.weight} u`)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer: desktop-only hint (close lives in the header X now) */}
        <div className="hidden sm:flex shrink-0 px-6 py-2.5 border-t border-white/10 bg-slate-950/70 items-center text-xs text-slate-400">
          <span>
            {isComparing
              ? 'Comparing two pinned elements side-by-side · Esc to go back'
              : isAutoTourActive
              ? 'Auto-Tour cycling elements every few seconds'
              : 'Tip: Click Compare to pin another element · ← → to browse · Esc to close'}
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* QUICK SEARCHABLE ELEMENT PICKER MODAL (FOR COMPARISON) */}
      {/* ======================================================== */}
      {selectorTarget && (
        <div
          className="touch-ui fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn"
          style={{
            paddingTop: 'max(clamp(16px, 4vw, 48px), env(safe-area-inset-top))',
            paddingBottom: 'max(clamp(16px, 4vw, 48px), env(safe-area-inset-bottom))',
            paddingLeft: 'max(clamp(16px, 4vw, 48px), env(safe-area-inset-left))',
            paddingRight: 'max(clamp(16px, 4vw, 48px), env(safe-area-inset-right))',
          }}
        >
          <div className="relative w-full max-w-full sm:max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-4 flex flex-col max-h-full">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <h4 className="text-sm font-bold text-white">
                Select Element for {selectorTarget === 'primary' ? 'Primary' : 'Comparison'} Slot
              </h4>
              <button
                onClick={() => setSelectorTarget(null)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick Search */}
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <input
                type="text"
                value={selectorSearch}
                onChange={(e) => setSelectorSearch(e.target.value)}
                placeholder="Search by name, symbol, or #..."
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-white/30 font-medium"
              />
            </div>

            {/* Element Grid / List */}
            <div className="overflow-y-auto space-y-1 pr-1 flex-1">
              {filteredElementsForPicker.map((el) => {
                const isCurrent =
                  (selectorTarget === 'primary' && el.number === element.number) ||
                  (selectorTarget === 'secondary' && el.number === compareElement?.number);
                const elCat = categories[el.category] || CATEGORIES[el.category];

                return (
                  <button
                    key={el.number}
                    onClick={() => {
                      if (selectorTarget === 'primary') {
                        onSelectElement(el);
                      } else {
                        setCompareElement(el);
                      }
                      setSelectorTarget(null);
                      setSelectorSearch('');
                    }}
                    style={
                      isCurrent
                        ? {
                            backgroundColor: elCat.bgRgba,
                            borderColor: elCat.borderRgba,
                          }
                        : undefined
                    }
                    className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer text-left ${
                      isCurrent
                        ? 'border text-white font-semibold'
                        : 'hover:bg-white/5 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-slate-400 w-6">
                        #{el.number}
                      </span>
                      <span
                        className="font-bold text-sm w-7 text-center"
                        style={{ color: elCat.textCol }}
                      >
                        {el.symbol}
                      </span>
                      <span className="text-xs font-medium text-white">{el.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 capitalize hidden sm:inline">
                        {el.category.replace('-', ' ')}
                      </span>
                      {isCurrent && <Check size={14} style={{ color: elCat.color }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};