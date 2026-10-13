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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Backdrop click to close */}
      <div
        className="absolute inset-0"
        onClick={() => {
          if (selectorTarget) {
            setSelectorTarget(null);
          } else if (isAutoTourActive && onExitTour) {
            onExitTour();
          } else {
            onClose();
          }
        }}
      />

      {/* Main Container */}
      <div
        className="touch-ui relative w-full max-w-4xl bg-slate-900/90 border border-slate-700/60 rounded-t-2xl rounded-b-none sm:rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col max-h-[94dvh] sm:max-h-[92dvh] z-10 text-slate-100 pb-[env(safe-area-inset-bottom)] sm:pb-0"
        style={{
          boxShadow: `0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px ${catInfo.glowColor}`,
        }}
      >
        {/* Top Accent Strip */}
        <div
          className="h-1.5 w-full transition-colors duration-500"
          style={{
            background: isComparing && compCatInfo
              ? `linear-gradient(to right, ${catInfo.color}, ${compCatInfo.color})`
              : catInfo.color,
          }}
        />

        {/* GUIDED TOUR STATUS BANNER */}
        {isAutoTourActive && (
          <div className="bg-slate-900/95 border-b border-white/10 px-4 py-2.5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-[10px] font-bold tracking-wider">
                  <Compass size={11} className="text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                  <span>GUIDED TOUR</span>
                </span>
                <span className="text-xs text-slate-300 font-mono">
                  {tourIndex + 1} / {totalTourItems}
                </span>
              </div>

              {/* Tour Controls in Modal Banner */}
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

            {/* Curiosity Note Highlight */}
            {tourHighlight && (
              <div className="flex items-start gap-1.5 text-xs text-slate-200 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5">
                <Lightbulb size={13} className="text-amber-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{tourHighlight}</span>
              </div>
            )}

            {/* Countdown Progress Bar */}
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

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-mono font-bold px-2 py-0.5 rounded shadow-sm"
              style={{
                backgroundColor: catInfo.color,
                color: '#000000',
              }}
            >
              #{element.number}
            </span>
            <span className="text-xl font-bold tracking-tight text-white">
              {element.name}
            </span>
            <span
              className="text-xs px-2.5 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: catInfo.bgRgba,
                color: catInfo.textCol,
                border: `1px solid ${catInfo.borderRgba}`,
              }}
            >
              {catInfo.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Compare Toggle Button */}
            <button
              onClick={() => {
                if (!compareElement) {
                  const defaultSecondary =
                    element.number < ELEMENTS.length
                      ? ELEMENTS[element.number]
                      : ELEMENTS[0];
                  setCompareElement(defaultSecondary);
                }
                setIsComparing((prev) => !prev);
              }}
              title={isComparing ? 'Exit Comparison View' : 'Pin and Compare with Another Element'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isComparing
                  ? 'bg-white text-slate-950 font-bold shadow-md'
                  : 'bg-white/10 text-slate-200 hover:text-white hover:bg-white/15 border border-white/15'
              }`}
            >
              <ArrowLeftRight size={13} />
              <span>{isComparing ? 'Close Compare' : 'Compare'}</span>
            </button>

            {/* Prev / Next */}
            <button
              onClick={handlePrev}
              title="Previous Element (Left Arrow)"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              title="Next Element (Right Arrow)"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => {
                if (isAutoTourActive && onExitTour) {
                  onExitTour();
                } else {
                  onClose();
                }
              }}
              title="Close (Esc)"
              className="p-1.5 ml-1 text-slate-400 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Historical Timeline Notice Banner if undiscovered in current scrub year */}
        {timelineYear && timelineYear < 2026 && getElementDiscoveryYear(element) > timelineYear && (
          <div className="flex items-center gap-2.5 px-6 py-2.5 bg-amber-500/15 border-b border-amber-500/30 text-amber-300 text-xs font-mono">
            <History size={15} className="shrink-0 text-amber-400" />
            <span>
              <strong>Historical Era Notice:</strong> In <strong>{timelineYear}</strong>, this element was unknown to science. Discovered in <strong>{element.year}</strong>{element.discoveredBy ? ` by ${element.discoveredBy}` : ''}.
            </span>
          </div>
        )}

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* ======================================================== */}
          {/* COMPARE VIEW: SIDE-BY-SIDE PROPERTY COMPARISON TABLE */}
          {/* ======================================================== */}
          {isComparing && compareElement ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Header Hero: Both Pinned Cards Side-by-Side with Swap Control */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch relative">
                {/* Element 1 Card */}
                <div
                  className="flex flex-col p-5 rounded-xl border relative overflow-hidden transition-all"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    borderColor: catInfo.color,
                    boxShadow: `0 0 20px ${catInfo.glowColor}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-white/10 text-white">
                      #{element.number}
                    </span>
                    <button
                      onClick={() => setSelectorTarget('primary')}
                      className="text-[11px] px-2.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-medium transition-colors cursor-pointer"
                    >
                      Change Element
                    </button>
                  </div>

                  <div className="flex items-center gap-4 my-auto">
                    <span
                      className="text-5xl font-black tracking-tight"
                      style={{
                        color: catInfo.textCol,
                        textShadow: `0 2px 10px ${catInfo.glowColor}`,
                      }}
                    >
                      {element.symbol}
                    </span>
                    <div>
                      <h4 className="text-lg font-bold text-white">{element.name}</h4>
                      <span className="text-xs text-slate-300 block">{catInfo.name}</span>
                      <span className="text-[11px] font-mono text-slate-400">{element.weight} u</span>
                    </div>
                  </div>
                </div>

                {/* Swap Elements Button (Floating in Center) */}
                <button
                  onClick={handleSwapElements}
                  title="Swap Elements"
                  className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-slate-800/90 border border-white/20 items-center justify-center text-slate-200 hover:text-white hover:bg-white/20 hover:border-white/40 shadow-xl transition-all cursor-pointer"
                >
                  <ArrowLeftRight size={14} />
                </button>

                {/* Element 2 Card */}
                <div
                  className="flex flex-col p-5 rounded-xl border relative overflow-hidden transition-all"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    borderColor: compCatInfo ? compCatInfo.color : '#ffffff',
                    boxShadow: compCatInfo ? `0 0 20px ${compCatInfo.glowColor}` : 'none',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-white/10 text-white">
                      #{compareElement.number}
                    </span>
                    <button
                      onClick={() => setSelectorTarget('secondary')}
                      className="text-[11px] px-2.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white font-medium transition-colors cursor-pointer"
                    >
                      Change Element
                    </button>
                  </div>

                  <div className="flex items-center gap-4 my-auto">
                    <span
                      className="text-5xl font-black tracking-tight"
                      style={{
                        color: compCatInfo ? compCatInfo.textCol : '#ffffff',
                        textShadow: compCatInfo ? `0 2px 10px ${compCatInfo.glowColor}` : 'none',
                      }}
                    >
                      {compareElement.symbol}
                    </span>
                    <div>
                      <h4 className="text-lg font-bold text-white">{compareElement.name}</h4>
                      <span className="text-xs text-slate-300 block">
                        {compCatInfo ? compCatInfo.name : compareElement.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{compareElement.weight} u</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Properties Table */}
              <div className="border border-white/10 rounded-xl overflow-hidden bg-slate-950/60 shadow-lg">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-slate-900/80 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4 w-1/3">Physical Property</th>
                      <th className="py-3 px-4 w-1/3 text-white font-bold">{element.name} ({element.symbol})</th>
                      <th className="py-3 px-4 w-1/3 text-white font-bold">{compareElement.name} ({compareElement.symbol})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-medium">
                    {/* Atomic Number */}
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-mono">Atomic Number</td>
                      <td className="py-2.5 px-4 font-bold text-white">#{element.number}</td>
                      <td className="py-2.5 px-4 font-bold text-white">#{compareElement.number}</td>
                    </tr>

                    {/* Atomic Weight */}
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-mono">Atomic Weight</td>
                      <td className="py-2.5 px-4 font-mono text-slate-200">{element.weight} u</td>
                      <td className="py-2.5 px-4 font-mono text-slate-200">{compareElement.weight} u</td>
                    </tr>

                    {/* Category */}
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-mono">Chemical Category</td>
                      <td className="py-2.5 px-4">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold"
                          style={{
                            backgroundColor: catInfo.bgRgba,
                            color: catInfo.textCol,
                            border: `1px solid ${catInfo.borderRgba}`,
                          }}
                        >
                          {catInfo.name}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        {compCatInfo && (
                          <span
                            className="px-2 py-0.5 rounded text-[10px] font-semibold"
                            style={{
                              backgroundColor: compCatInfo.bgRgba,
                              color: compCatInfo.textCol,
                              border: `1px solid ${compCatInfo.borderRgba}`,
                            }}
                          >
                            {compCatInfo.name}
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Period & Group */}
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-mono">Period / Group</td>
                      <td className="py-2.5 px-4 font-mono text-slate-200">
                        Period {element.period}, Group {element.group}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-200">
                        Period {compareElement.period}, Group {compareElement.group}
                      </td>
                    </tr>

                    {/* Block */}
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-mono">Electron Block</td>
                      <td className="py-2.5 px-4 font-mono uppercase text-slate-200">{element.block}-block</td>
                      <td className="py-2.5 px-4 font-mono uppercase text-slate-200">{compareElement.block}-block</td>
                    </tr>

                    {/* Phase at 298K */}
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-mono">Phase at 298K</td>
                      <td className="py-2.5 px-4 capitalize font-semibold text-white">{element.phase}</td>
                      <td className="py-2.5 px-4 capitalize font-semibold text-white">{compareElement.phase}</td>
                    </tr>

                    {/* Electronegativity */}
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-mono">Electronegativity (Pauling)</td>
                      <td className="py-2.5 px-4 font-mono font-bold text-cyan-300">
                        {element.electronegativity !== null ? element.electronegativity : 'N/A'}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-bold text-cyan-300">
                        {compareElement.electronegativity !== null ? compareElement.electronegativity : 'N/A'}
                      </td>
                    </tr>

                    {/* Melting Point */}
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-mono">Melting Point</td>
                      <td className="py-2.5 px-4 font-mono text-slate-200">{kelvinToCelsius(element.meltingPoint)}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-200">{kelvinToCelsius(compareElement.meltingPoint)}</td>
                    </tr>

                    {/* Boiling Point */}
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-mono">Boiling Point</td>
                      <td className="py-2.5 px-4 font-mono text-slate-200">{kelvinToCelsius(element.boilingPoint)}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-200">{kelvinToCelsius(compareElement.boilingPoint)}</td>
                    </tr>

                    {/* Density */}
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-mono">Density</td>
                      <td className="py-2.5 px-4 font-mono text-slate-200">
                        {element.density ? `${element.density} g/cm³` : 'N/A'}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-200">
                        {compareElement.density ? `${compareElement.density} g/cm³` : 'N/A'}
                      </td>
                    </tr>

                    {/* Electron Configuration */}
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-mono">Electron Configuration</td>
                      <td className="py-2.5 px-4 font-mono text-slate-300 text-[11px]">{element.electronConfiguration}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-300 text-[11px]">{compareElement.electronConfiguration}</td>
                    </tr>

                    {/* Shells */}
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-mono">Electrons per Shell</td>
                      <td className="py-2.5 px-4 font-mono text-slate-300">{element.shells.join(' · ')}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-300">{compareElement.shells.join(' · ')}</td>
                    </tr>

                    {/* Discovery */}
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-4 text-slate-400 font-mono">Discovered By (Year)</td>
                      <td className="py-2.5 px-4 text-slate-300">
                        {element.discoveredBy || 'Ancient'} {element.year ? `(${element.year})` : ''}
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">
                        {compareElement.discoveredBy || 'Ancient'} {compareElement.year ? `(${compareElement.year})` : ''}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* SINGLE ELEMENT VIEW: BOHR MODEL & PHYSICAL DETAILS */
            /* ======================================================== */
            <>
              {/* Top Hero: Element Big Card + Bohr Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Visual Element Tile */}
                <div
                  className="flex flex-col items-center justify-center p-6 rounded-xl border border-white/10 relative overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    boxShadow: `inset 0 0 30px ${catInfo.bgRgba}`,
                  }}
                >
                  <span className="absolute top-3 left-4 font-mono font-bold text-lg text-slate-400">
                    {element.number}
                  </span>
                  <span className="absolute top-3 right-4 font-mono text-sm text-slate-400">
                    {element.weight} u
                  </span>

                  <span
                    className="text-7xl font-extrabold tracking-tight mt-4 mb-2"
                    style={{
                      color: catInfo.textCol,
                      textShadow: `0 4px 16px ${catInfo.glowColor}`,
                    }}
                  >
                    {element.symbol}
                  </span>

                  <span className="text-xl font-semibold text-white tracking-wide">
                    {element.name}
                  </span>

                  <span className="text-xs text-slate-400 font-mono mt-2 bg-black/40 px-3 py-1 rounded-md border border-white/5">
                    {element.electronConfiguration}
                  </span>
                </div>

                {/* Interactive Bohr Orbital Shells */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-950/40 rounded-xl border border-white/5 relative min-h-[220px]">
                  <div className="text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5 self-start">
                    <Atom size={14} style={{ color: catInfo.color }} />
                    <span>Bohr Model & Shells ({element.shells.join(', ')})</span>
                  </div>

                  {/* Animated Orbital Canvas / Rings */}
                  <div className="relative w-44 h-44 flex items-center justify-center my-2">
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
                          {/* Distribute electrons around this ring */}
                          {Array.from({ length: Math.min(count, 8) }).map((_, eIdx) => {
                            const angle = (eIdx / Math.min(count, 8)) * 2 * Math.PI;
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

                  <div className="text-[11px] text-slate-400 font-mono mt-1 text-center">
                    Shell distribution: {element.shells.join(' · ')}
                  </div>
                </div>
              </div>

              {/* Element Summary */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  <Compass size={14} className="text-amber-400" />
                  Description & Discovery
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {element.summary}
                </p>
                {(element.discoveredBy || element.year) && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-4 text-xs text-slate-400">
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

              {/* Properties Grid */}
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Physical & Chemical Properties
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-slate-950/50 border border-white/5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Phase at 298K</span>
                    <span className="text-sm font-semibold text-white capitalize">{element.phase}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/50 border border-white/5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Block</span>
                    <span className="text-sm font-semibold text-white font-mono uppercase">{element.block}-block</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/50 border border-white/5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Period / Group</span>
                    <span className="text-sm font-semibold text-white font-mono">Period {element.period}, Group {element.group}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/50 border border-white/5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Electronegativity</span>
                    <span className="text-sm font-semibold text-white font-mono">
                      {element.electronegativity ?? 'N/A'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/50 border border-white/5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Melting Point</span>
                    <span className="text-sm font-semibold text-white font-mono">
                      {kelvinToCelsius(element.meltingPoint)}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/50 border border-white/5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Boiling Point</span>
                    <span className="text-sm font-semibold text-white font-mono">
                      {kelvinToCelsius(element.boilingPoint)}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/50 border border-white/5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Density</span>
                    <span className="text-sm font-semibold text-white font-mono">
                      {element.density ? `${element.density} g/cm³` : 'N/A'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950/50 border border-white/5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Atomic Weight</span>
                    <span className="text-sm font-semibold text-white font-mono">
                      {element.weight} u
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <span>
            {isComparing
              ? 'Comparing two pinned elements side-by-side'
              : isAutoTourActive
              ? 'Auto-Tour cycling elements every few seconds'
              : 'Tip: Click Compare to pin another element and inspect differences'}
          </span>
          <div className="flex items-center gap-2">
            {isComparing && (
              <button
                onClick={() => setIsComparing(false)}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer"
              >
                Back to Detail View
              </button>
            )}
            <button
              onClick={() => {
                if (isAutoTourActive && onExitTour) {
                  onExitTour();
                } else {
                  onClose();
                }
              }}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* QUICK SEARCHABLE ELEMENT PICKER MODAL (FOR COMPARISON) */}
      {/* ======================================================== */}
      {selectorTarget && (
        <div className="touch-ui fixed inset-0 z-60 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 flex flex-col max-h-[80dvh] pb-[max(1rem,env(safe-area-inset-bottom))]">
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
