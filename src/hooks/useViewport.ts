import { useEffect, useLayoutEffect, useRef, useState, RefObject } from 'react';

export interface Size {
  width: number;
  height: number;
}

/**
 * Tracks the rendered size of an element with a ResizeObserver.
 * Fires on window resize, orientation change, mobile browser UI show/hide, and
 * whenever sibling UI (timeline panel, dock, category bar) changes the space the
 * element gets, so the 3D scene can be re-fitted immediately without a refresh.
 */
export function useElementSize<T extends HTMLElement>(ref: RefObject<T | null>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize((prev) =>
        Math.abs(prev.width - rect.width) < 0.5 && Math.abs(prev.height - rect.height) < 0.5
          ? prev
          : { width: rect.width, height: rect.height }
      );
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    // Some mobile browsers fire orientationchange before layout settles; re-measure after it does.
    const onOrientation = () => window.setTimeout(measure, 200);
    window.addEventListener('orientationchange', onOrientation);
    return () => {
      observer.disconnect();
      window.removeEventListener('orientationchange', onOrientation);
    };
  }, [ref]);

  return size;
}

export type LayoutRegime = 'phone' | 'tablet' | 'desktop';

export interface ViewportInfo {
  regime: LayoutRegime;
  /** Landscape phones: plenty of width but very little height, so vertical chrome must be minimal. */
  isShort: boolean;
  isPortrait: boolean;
  /** Primary input is a finger (no hover). */
  isTouch: boolean;
}

function readViewport(): ViewportInfo {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isShort = h < 520 && w < 1000;
  let regime: LayoutRegime;
  if (w < 640 || isShort) regime = 'phone';
  else if (w < 1100) regime = 'tablet';
  else regime = 'desktop';
  return {
    regime,
    isShort,
    isPortrait: h >= w,
    isTouch: window.matchMedia('(pointer: coarse)').matches,
  };
}

/** Which UI regime (phone / tablet / desktop) to render, kept live across resizes and rotation. */
export function useViewportInfo(): ViewportInfo {
  const [info, setInfo] = useState<ViewportInfo>(() => readViewport());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const update = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const next = readViewport();
        setInfo((prev) =>
          prev.regime === next.regime &&
          prev.isShort === next.isShort &&
          prev.isPortrait === next.isPortrait &&
          prev.isTouch === next.isTouch
            ? prev
            : next
        );
      });
    };
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return info;
}
