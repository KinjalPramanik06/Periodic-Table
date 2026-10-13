import React from 'react';
import { CATEGORIES, CategoryInfo, ElementCategory, ELEMENTS } from '../data/elements';

interface CategoryBarProps {
  selectedCategory: ElementCategory | null;
  onSelectCategory: (category: ElementCategory | null) => void;
  categories?: Record<ElementCategory, CategoryInfo>;
  /**
   * bar    - centered floating pill bar (desktop)
   * scroll - full-width, horizontally scrollable, touch-sized pills (phone / tablet)
   * wrap   - wrapping grid for use inside the mobile drawer
   */
  variant?: 'bar' | 'scroll' | 'wrap';
}

interface CategoryDisplayItem {
  id: ElementCategory;
  name: string;
  shortName: string;
}

const CATEGORY_ITEMS: CategoryDisplayItem[] = [
  { id: 'alkali-metal', name: 'Alkali Metal', shortName: 'Alkali' },
  { id: 'alkaline-earth', name: 'Alkaline Earth', shortName: 'Alkaline' },
  { id: 'transition-metal', name: 'Transition Metal', shortName: 'Transition' },
  { id: 'post-transition', name: 'Post-Transition', shortName: 'Post-Trans' },
  { id: 'metalloid', name: 'Metalloid', shortName: 'Metalloid' },
  { id: 'reactive-nonmetal', name: 'Reactive Nonmetal', shortName: 'Nonmetal' },
  { id: 'noble-gas', name: 'Noble Gas', shortName: 'Noble Gas' },
  { id: 'lanthanide', name: 'Lanthanide', shortName: 'Lanthanide' },
  { id: 'actinide', name: 'Actinide', shortName: 'Actinide' },
  { id: 'unknown', name: 'Superheavy', shortName: 'Unknown' },
];

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  categories = CATEGORIES,
  variant = 'bar',
}) => {
  // Count elements per category
  const counts = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const el of ELEMENTS) {
      map[el.category] = (map[el.category] || 0) + 1;
    }
    return map;
  }, []);

  const isTouchSized = variant !== 'bar';
  // NOTE: scrollable rows use justify-start. justify-center on an overflowing flex container
  // makes the first items unreachable (they overflow to the left of the scroll origin).
  const containerClass =
    variant === 'wrap'
      ? 'touch-ui flex flex-wrap gap-1.5 select-none'
      : variant === 'scroll'
      ? 'touch-ui w-[calc(100%-1rem)] mx-auto mb-1.5 px-1.5 py-1.5 floating-glass-bar rounded-2xl z-30 flex items-center justify-start gap-1.5 select-none overflow-x-auto overscroll-x-contain scrollbar-none shrink-0'
      : 'w-fit max-w-[calc(100%-1rem)] sm:max-w-[calc(100%-1.5rem)] mx-auto mb-2.5 px-2.5 py-1.5 floating-glass-bar rounded-2xl z-30 flex items-center justify-start gap-1 sm:gap-1.5 select-none transition-all duration-300 overflow-x-auto scrollbar-none';
  const pillSize = isTouchSized ? 'min-h-11 px-3' : 'py-1';

  return (
    <div className={containerClass}>
      {/* "All" button */}
      <button
        onClick={() => onSelectCategory(null)}
        className={`${isTouchSized ? pillSize : 'px-2.5 py-1'} rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 shrink-0 cursor-pointer ${
          selectedCategory === null
            ? 'bg-white text-slate-950 shadow-[0_0_12px_rgba(255,255,255,0.4)] font-bold'
            : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
        }`}
      >
        <span>All</span>
        <span
          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
            selectedCategory === null
              ? 'bg-black/20 text-slate-900 font-bold'
              : 'bg-black/30 text-slate-400'
          }`}
        >
          118
        </span>
      </button>

      {/* Category Pills in single clean row */}
      {CATEGORY_ITEMS.map((item) => {
        const catInfo = categories[item.id] || CATEGORIES[item.id];
        const isActive = selectedCategory === item.id;
        const count = counts[item.id] || 0;

        return (
          <button
            key={item.id}
            onClick={() => onSelectCategory(isActive ? null : item.id)}
            style={{
              borderColor: isActive ? catInfo.color : undefined,
              boxShadow: isActive
                ? `0 0 14px ${catInfo.glowColor}, inset 0 0 8px ${catInfo.bgRgba}`
                : undefined,
              backgroundColor: isActive ? catInfo.bgRgba : undefined,
            }}
            className={`${isTouchSized ? pillSize : 'px-2 sm:px-2.5 py-1'} rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 shrink-0 cursor-pointer ${
              isActive
                ? 'border-2 text-white font-bold'
                : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10'
            }`}
          >
            {/* Color Dot with glow */}
            <span
              className={`w-2 h-2 rounded-full shrink-0 transition-transform duration-200 ${
                isActive ? 'scale-125' : ''
              }`}
              style={{
                backgroundColor: catInfo.color,
                boxShadow: isActive ? `0 0 8px ${catInfo.color}` : 'none',
              }}
            />

            {/* Label: full name on 2xl screens, short name on standard screens */}
            <span className="hidden 2xl:inline">{item.name}</span>
            <span className="2xl:hidden">{item.shortName}</span>

            {/* Element Count Badge */}
            <span
              className="text-[10px] px-1.5 py-0.2 rounded-full font-mono transition-colors"
              style={{
                backgroundColor: isActive ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.06)',
                color: isActive ? catInfo.textCol : '#94a3b8',
              }}
            >
              {count}
            </span>
          </button>
        );
      })}

      {/* Clear category filter indicator if active */}
      {selectedCategory && (
        <button
          onClick={() => onSelectCategory(null)}
          className={`${isTouchSized ? 'min-h-11 px-3' : 'px-2 py-1'} rounded-xl text-[11px] font-medium text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer shrink-0 ml-0.5`}
        >
          Reset ×
        </button>
      )}
    </div>
  );
};

