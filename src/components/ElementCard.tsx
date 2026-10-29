import React, { memo } from 'react';
import { ElementData, CATEGORIES, CategoryInfo, ElementCategory } from '../data/elements';
import { Transform3D } from '../types';
import { getTransformString } from '../utils/transformLayouts';

interface ElementCardProps {
  element: ElementData;
  transform: Transform3D;
  isCategoryActive: boolean;
  isSelected: boolean;
  isDimmed: boolean;
  isUndiscovered?: boolean;
  isRecentlyDiscovered?: boolean;
  timelineYear?: number | null;
  categories?: Record<ElementCategory, CategoryInfo>;
  onClick: (element: ElementData, rect?: DOMRect) => void;
  onMouseEnter?: (element: ElementData) => void;
}

export const ElementCard: React.FC<ElementCardProps> = memo(({
  element,
  transform,
  isCategoryActive,
  isSelected,
  isDimmed,
  isUndiscovered = false,
  isRecentlyDiscovered = false,
  timelineYear = null,
  categories = CATEGORIES,
  onClick,
  onMouseEnter,
}) => {
  const catInfo = categories[element.category] || CATEGORIES[element.category];

  const cardStyle: React.CSSProperties & Record<string, string> = {
    transform: getTransformString(transform),
    '--card-color': catInfo.color,
    '--card-glow': catInfo.glowColor,
    '--card-glow-subtle': catInfo.bgRgba,
  };

  const cardClasses = [
    'element-card-3d',
    isCategoryActive ? 'category-active' : '',
    isSelected ? 'element-selected' : '',
    isDimmed ? 'dimmed' : '',
    isUndiscovered ? 'undiscovered' : '',
    isRecentlyDiscovered ? 'recently-discovered' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={cardClasses}
      style={cardStyle}
      onClick={(e) => onClick(element, e.currentTarget.getBoundingClientRect())}
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') onMouseEnter?.(element);
      }}
      role="button"
      tabIndex={0}
      aria-label={`${element.name}, atomic number ${element.number}, symbol ${element.symbol}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(element);
        }
      }}
    >
      <div
        className="card-glass relative overflow-hidden group"
        style={{
          borderColor: isSelected
            ? '#ffffff'
            : isCategoryActive
            ? catInfo.color
            : 'rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Modern category color indicator bar at the top */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] transition-all duration-300"
          style={{
            backgroundColor: catInfo.color,
            boxShadow: isCategoryActive || isSelected ? `0 0 10px ${catInfo.color}` : 'none',
          }}
        />

        {/* Top row: High contrast Atomic Number & Element Weight or Discovery Status */}
        <div className="flex items-center justify-between w-full pt-1">
          {/* Atomic Number Badge */}
          <div className="flex items-center gap-1">
            <span
              className="font-mono font-bold text-[12px] leading-none px-1.5 py-0.5 rounded tracking-wide transition-colors duration-200"
              style={{
                backgroundColor: isUndiscovered
                  ? 'rgba(255, 255, 255, 0.06)'
                  : isCategoryActive
                  ? catInfo.color
                  : 'rgba(255, 255, 255, 0.12)',
                color: isUndiscovered
                  ? '#94a3b8'
                  : isCategoryActive
                  ? '#090d16'
                  : '#ffffff',
              }}
            >
              {element.number}
            </span>
            {isRecentlyDiscovered && (
              <span className="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-widest animate-pulse">
                NEW
              </span>
            )}
          </div>

          {/* Atomic Weight or Future Discovery Year */}
          {isUndiscovered ? (
            <span className="font-mono text-[9px] text-amber-300/80 truncate max-w-[68px] text-right font-medium">
              Disc. {element.year}
            </span>
          ) : (
            <span className="font-mono text-[10px] text-slate-400 truncate max-w-[62px] text-right font-medium">
              {typeof element.weight === 'number' ? element.weight.toFixed(2) : element.weight}
            </span>
          )}
        </div>

        {/* Center: Large Distinct Symbol */}
        <div className="flex flex-col items-center justify-center my-auto py-1">
          <span
            className="text-3xl font-extrabold tracking-tight transition-colors duration-200"
            style={{
              color: isUndiscovered
                ? 'rgba(255, 255, 255, 0.35)'
                : isSelected
                ? '#ffffff'
                : catInfo.textCol,
              textShadow: isUndiscovered ? 'none' : `0 2px 10px ${catInfo.glowColor}`,
            }}
          >
            {element.symbol}
          </span>
          <span className="text-[11px] font-medium text-slate-200 tracking-wide truncate max-w-[102px] text-center mt-0.5">
            {element.name}
          </span>
        </div>

        {/* Bottom row: Category badge & phase or Discovery Status */}
        <div className="flex items-center justify-between w-full pt-1 border-t border-white/10 text-[9px] text-slate-400">
          {isUndiscovered ? (
            <>
              <span className="truncate max-w-[76px] font-medium text-amber-400/80 italic text-[8.5px]">
                {timelineYear ? `Future (${timelineYear})` : 'Undiscovered'}
              </span>
              <span className="uppercase text-[8px] font-bold tracking-wider text-slate-400 px-1 py-0.2 rounded bg-black/40">
                ???
              </span>
            </>
          ) : (
            <>
              <span className="capitalize truncate max-w-[70px] font-medium text-slate-300">
                {element.category.replace('-', ' ')}
              </span>
              <span className="uppercase text-[8px] font-bold tracking-wider text-slate-300 px-1 py-0.2 rounded bg-black/40">
                {element.phase.slice(0, 3)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

ElementCard.displayName = 'ElementCard';

