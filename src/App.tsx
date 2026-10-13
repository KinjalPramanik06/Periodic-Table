import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ELEMENTS, ElementData, ElementCategory } from './data/elements';
import { THEME_PRESETS, applyThemeToDocument } from './data/themes';
import { LayoutMode, PhaseFilter, AmbientLightingTheme } from './types';
import { calculateTransform } from './utils/transformLayouts';
import { ElementCard } from './components/ElementCard';
import { CategoryBar } from './components/CategoryBar';
import { Header } from './components/Header';
import { ElementModal } from './components/ElementModal';
import { TimelineFilter } from './components/TimelineFilter';
import { getElementDiscoveryYear, isElementDiscoveredByYear } from './data/timeline';
import { AUTO_TOUR_ITEMS } from './data/autoTourElements';
import { soundEngine } from './utils/soundEffects';
import { MobileDock } from './components/MobileDock';
import { useElementSize, useViewportInfo } from './hooks/useViewport';
import {
  computeFitScale,
  clampView,
  zoomAbout,
  clamp,
  DEFAULT_VIEW,
  MAX_USER_SCALE,
  MIN_USER_SCALE,
  ViewBounds,
  ViewState,
} from './utils/viewFit';
import { Move3d, Compass } from 'lucide-react';

/** Default camera per layout (pitch + distance). Zoom/pan are layered on top of this. */
const MODE_CAMERA: Record<LayoutMode, { rx: number; zoom: number }> = {
  grid: { rx: 15, zoom: -1950 },
  sphere: { rx: 2, zoom: -1850 },
  helix: { rx: 12, zoom: -2050 },
  table: { rx: 0, zoom: -1900 },
};

/** Movement (px) before a press counts as a drag instead of a tap. */
const DRAG_THRESHOLD = 8;
/** Touch: cards narrower than this (px on screen) zoom in on first tap instead of opening. */
const TAP_ZOOM_BELOW_PX = 34;
/** ...and zoom until the tapped card is about this wide. */
const TAP_ZOOM_TARGET_PX = 64;
/** Base perspective distance (px) of the original design; scaled together with the scene. */
const BASE_PERSPECTIVE = 1100;

export default function App() {
  // Theme State: Modern Stylish Palette
  const [currentThemeId, setCurrentThemeId] = useState<string>('prism');

  // Ambient Lighting State: 'studio-bright' vs 'deep-space'
  const [ambientLighting, setAmbientLighting] = useState<AmbientLightingTheme>('studio-bright');

  // Historical Timeline Filter State
  const [isTimelineOpen, setIsTimelineOpen] = useState<boolean>(false);
  const [timelineYear, setTimelineYear] = useState<number>(2026);
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(false);
  const timelinePlayIntervalRef = useRef<number | null>(null);
  const lastChimedCountRef = useRef<number>(118);

  // Tactile Post-Processing State (Film Grain & Chromatic Aberration)
  // Off by default on touch devices: a full-screen blended noise layer is costly on phone GPUs.
  const [isFilmGrainEnabled, setIsFilmGrainEnabled] = useState<boolean>(
    () => !window.matchMedia('(pointer: coarse)').matches
  );

  // Sound FX State
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);

  // Layout Mode: Defaults to 'grid'
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | null>(null);
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected element for modal
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);

  // Auto-Tour State
  const [isAutoTourActive, setIsAutoTourActive] = useState<boolean>(false);
  const [isTourPaused, setIsTourPaused] = useState<boolean>(false);
  const [tourIndex, setTourIndex] = useState<number>(0);
  const [tourProgress, setTourProgress] = useState<number>(0);

  // Camera Orbit & Zoom State
  // Requirement: "Adjust the camera position so the grid is viewed at a slight 15-degree pitch, allowing users to perceive the 3D space even when static."
  const [cameraRotX, setCameraRotX] = useState<number>(15); // 15-degree default pitch for grid
  const [cameraRotY, setCameraRotY] = useState<number>(0);
  const [cameraZoom, setCameraZoom] = useState<number>(MODE_CAMERA.grid.zoom);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(false);

  // Responsive viewport: the 3D area is measured live (ResizeObserver) and the scene is
  // scaled to fit it, so rotation / window resize / UI panels opening re-fit instantly.
  const viewport = useViewportInfo();
  const containerRef = useRef<HTMLElement>(null);
  const containerSize = useElementSize(containerRef);
  const fitScale = useMemo(
    () => computeFitScale(layoutMode, containerSize.width, containerSize.height),
    [layoutMode, containerSize.width, containerSize.height]
  );
  const [view, setView] = useState<ViewState>(DEFAULT_VIEW);
  const boundsRef = useRef<ViewBounds>({ vw: 0, vh: 0, fit: 1, mode: 'grid' });
  boundsRef.current = { vw: containerSize.width, vh: containerSize.height, fit: fitScale, mode: layoutMode };
  const totalScale = fitScale * view.scale;

  // Re-clamp pan whenever the available space or layout changes (e.g. after rotating the device).
  useEffect(() => {
    setView((v) => clampView(v, boundsRef.current));
  }, [containerSize.width, containerSize.height, layoutMode, fitScale]);

  // Active pointers (for pinch), pinch baseline, shift-drag pan baseline and tap-vs-drag flag
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchRef = useRef<{ dist: number; cx: number; cy: number; view: ViewState } | null>(null);
  const panDragRef = useRef<{ x: number; y: number; view: ViewState } | null>(null);
  const movedRef = useRef<boolean>(false);

  // Dragging & inertia refs for smooth mouse & touch orbit controls
  const isDraggingRef = useRef<boolean>(false);
  const startPointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startRotationRef = useRef<{ rx: number; ry: number }>({ rx: 15, ry: 0 });
  const lastPointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastPointerTimeRef = useRef<number>(0);
  const velocityRef = useRef<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const inertiaRafRef = useRef<number | null>(null);
  const autoRotateRafRef = useRef<number | null>(null);
  const [isInertiaActive, setIsInertiaActive] = useState<boolean>(false);

  // Stop running inertia animation
  const stopInertia = useCallback(() => {
    if (inertiaRafRef.current) {
      cancelAnimationFrame(inertiaRafRef.current);
      inertiaRafRef.current = null;
    }
    setIsInertiaActive(false);
    velocityRef.current = { vx: 0, vy: 0 };
  }, []);

  // Sound FX Toggle Handler
  const handleToggleSound = useCallback(() => {
    setIsSoundEnabled((prev) => {
      const next = !prev;
      soundEngine.setMuted(!next);
      if (next) {
        soundEngine.playModeSwitch();
      }
      return next;
    });
  }, []);

  // Theme + ambient lighting -> CSS variables (accent ramp, backdrop gradient, glass tint)
  useEffect(() => {
    applyThemeToDocument(currentThemeId, ambientLighting);
  }, [currentThemeId, ambientLighting]);

  // Ambient Lighting Toggle Handler
  const handleToggleAmbientLighting = useCallback(() => {
    setAmbientLighting((prev) => {
      const next = prev === 'studio-bright' ? 'deep-space' : 'studio-bright';
      if (isSoundEnabled) {
        soundEngine.playModeSwitch();
      }
      return next;
    });
  }, [isSoundEnabled]);

  // Timeline Handlers
  const handleToggleTimeline = useCallback(() => {
    setIsTimelineOpen((prev) => {
      const next = !prev;
      if (isSoundEnabled) soundEngine.playModeSwitch();
      return next;
    });
  }, [isSoundEnabled]);

  const handleYearChange = useCallback(
    (newYear: number) => {
      setTimelineYear((prev) => {
        if (isSoundEnabled && Math.abs(newYear - prev) >= 15) {
          soundEngine.playHover(newYear % 8);
        }
        return newYear;
      });
    },
    [isSoundEnabled]
  );

  const handleToggleTimelinePlay = useCallback(() => {
    setIsTimelinePlaying((prev) => {
      const next = !prev;
      if (next) {
        // If playing starts while already at present 2026, loop back to start of timeline
        setTimelineYear((curr) => (curr >= 2026 ? 1500 : curr));
      }
      if (isSoundEnabled) soundEngine.playModeSwitch();
      return next;
    });
  }, [isSoundEnabled]);

  const handleResetTimelineToPresent = useCallback(() => {
    setIsTimelinePlaying(false);
    setTimelineYear(2026);
    if (isSoundEnabled) soundEngine.playModeSwitch();
  }, [isSoundEnabled]);

  // Automated Timeline Time-Lapse playback loop
  useEffect(() => {
    if (!isTimelinePlaying) {
      if (timelinePlayIntervalRef.current) {
        clearInterval(timelinePlayIntervalRef.current);
        timelinePlayIntervalRef.current = null;
      }
      return;
    }

    const stepSize = (currYear: number) => {
      if (currYear < 1700) return 20; // Antiquity to 1700s
      if (currYear < 1840) return 6;  // 1700 to 1840
      if (currYear < 1940) return 4;  // 1840 to 1940
      return 3;                       // 1940 to 2026
    };

    timelinePlayIntervalRef.current = window.setInterval(() => {
      setTimelineYear((prevYear) => {
        if (prevYear >= 2026) {
          setIsTimelinePlaying(false);
          return 2026;
        }
        const delta = stepSize(prevYear);
        return Math.min(2026, prevYear + delta);
      });
    }, 150);

    return () => {
      if (timelinePlayIntervalRef.current) {
        clearInterval(timelinePlayIntervalRef.current);
        timelinePlayIntervalRef.current = null;
      }
    };
  }, [isTimelinePlaying]);

  // Calculate discovered elements count in active timeline era
  const discoveredCount = useMemo(() => {
    return ELEMENTS.filter((el) => isElementDiscoveredByYear(el, timelineYear)).length;
  }, [timelineYear]);

  // Harmonious chime when scrubbing unlocks newly discovered elements
  useEffect(() => {
    if (isSoundEnabled && discoveredCount > lastChimedCountRef.current) {
      soundEngine.playDiscoveryChime();
    }
    lastChimedCountRef.current = discoveredCount;
  }, [discoveredCount, isSoundEnabled]);

  // Recent discoveries relative to current timelineYear
  const recentElements = useMemo(() => {
    if (timelineYear <= 1500) {
      return ELEMENTS.filter((el) => getElementDiscoveryYear(el) <= 1500);
    }
    return ELEMENTS.filter((el) => {
      const yr = getElementDiscoveryYear(el);
      return yr <= timelineYear && yr > 0 && timelineYear - yr <= 12;
    }).sort((a, b) => getElementDiscoveryYear(b) - getElementDiscoveryYear(a));
  }, [timelineYear]);

  // Update camera defaults when switching modes
  const handleSelectMode = useCallback((mode: LayoutMode) => {
    stopInertia();
    soundEngine.playModeSwitch();
    setLayoutMode(mode);
    setCameraRotX(MODE_CAMERA[mode].rx);
    setCameraRotY(0);
    setCameraZoom(MODE_CAMERA[mode].zoom);
    setView(DEFAULT_VIEW);
  }, [stopInertia]);

  // Reset camera: default pitch, centred, fitted to the screen
  const handleResetCamera = useCallback(() => {
    stopInertia();
    setCameraRotX(MODE_CAMERA[layoutMode].rx);
    setCameraRotY(0);
    setCameraZoom(MODE_CAMERA[layoutMode].zoom);
    setView(DEFAULT_VIEW);
  }, [layoutMode, stopInertia]);

  // Zoom controls (buttons): zoom about the centre of the view
  const handleZoomIn = useCallback(() => {
    setView((v) => zoomAbout(v, v.scale * 1.35, 0, 0, boundsRef.current));
  }, []);

  const handleZoomOut = useCallback(() => {
    setView((v) => zoomAbout(v, v.scale / 1.35, 0, 0, boundsRef.current));
  }, []);

  // Cleanup inertia on unmount
  useEffect(() => {
    return () => {
      if (inertiaRafRef.current) cancelAnimationFrame(inertiaRafRef.current);
    };
  }, []);

  // Auto-rotation loop
  useEffect(() => {
    if (!isAutoRotating) {
      if (autoRotateRafRef.current) cancelAnimationFrame(autoRotateRafRef.current);
      return;
    }

    // Stop any inertia if auto-rotate is toggled on
    stopInertia();

    let lastTime = performance.now();
    const loop = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      setCameraRotY((prev) => (prev + delta * 9) % 360);
      autoRotateRafRef.current = requestAnimationFrame(loop);
    };

    autoRotateRafRef.current = requestAnimationFrame(loop);
    return () => {
      if (autoRotateRafRef.current) cancelAnimationFrame(autoRotateRafRef.current);
    };
  }, [isAutoRotating, stopInertia]);

  // Auto-Tour timer loop: cycles through elements every few seconds
  useEffect(() => {
    if (!isAutoTourActive || isTourPaused) return;

    const DURATION = 4500; // 4.5 seconds per element
    const TICK = 50;
    let elapsed = 0;

    const intervalId = setInterval(() => {
      elapsed += TICK;
      const progress = Math.min(100, (elapsed / DURATION) * 100);
      setTourProgress(progress);

      if (elapsed >= DURATION) {
        elapsed = 0;
        setTourProgress(0);
        setTourIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % AUTO_TOUR_ITEMS.length;
          const targetItem = AUTO_TOUR_ITEMS[nextIndex];
          const targetEl = ELEMENTS.find((el) => el.number === targetItem.number);
          if (targetEl) {
            setSelectedElement(targetEl);
            soundEngine.playSelect(targetEl.number);
          }
          return nextIndex;
        });
      }
    }, TICK);

    return () => clearInterval(intervalId);
  }, [isAutoTourActive, isTourPaused]);

  // Toggle Auto-Tour start/stop
  const handleToggleAutoTour = useCallback(() => {
    if (isAutoTourActive) {
      setIsAutoTourActive(false);
      setIsTourPaused(false);
      setSelectedElement(null);
    } else {
      setIsAutoTourActive(true);
      setIsTourPaused(false);
      setTourIndex(0);
      setTourProgress(0);
      const firstItem = AUTO_TOUR_ITEMS[0];
      const targetEl = ELEMENTS.find((el) => el.number === firstItem.number);
      if (targetEl) {
        setSelectedElement(targetEl);
        soundEngine.playSelect(targetEl.number);
      }
    }
  }, [isAutoTourActive]);

  const handleNextTourItem = useCallback(() => {
    setTourProgress(0);
    setTourIndex((prev) => {
      const nextIndex = (prev + 1) % AUTO_TOUR_ITEMS.length;
      const targetItem = AUTO_TOUR_ITEMS[nextIndex];
      const targetEl = ELEMENTS.find((el) => el.number === targetItem.number);
      if (targetEl) {
        setSelectedElement(targetEl);
        soundEngine.playSelect(targetEl.number);
      }
      return nextIndex;
    });
  }, []);

  const handlePrevTourItem = useCallback(() => {
    setTourProgress(0);
    setTourIndex((prev) => {
      const prevIndex = (prev - 1 + AUTO_TOUR_ITEMS.length) % AUTO_TOUR_ITEMS.length;
      const targetItem = AUTO_TOUR_ITEMS[prevIndex];
      const targetEl = ELEMENTS.find((el) => el.number === targetItem.number);
      if (targetEl) {
        setSelectedElement(targetEl);
        soundEngine.playSelect(targetEl.number);
      }
      return prevIndex;
    });
  }, []);

  const handleExitTour = useCallback(() => {
    setIsAutoTourActive(false);
    setIsTourPaused(false);
    setSelectedElement(null);
  }, []);

  // Pointer position relative to the centre of the 3D area
  const toCenterSpace = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: clientX - rect.left - rect.width / 2, y: clientY - rect.top - rect.height / 2 };
  };

  // Mouse, touch & pen: 1 pointer orbits, 2 pointers pinch-zoom + pan, shift+drag pans
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 1) movedRef.current = false;

    // Immediately stop ongoing inertia drift on contact
    stopInertia();

    if (pointersRef.current.size >= 2) {
      // Second finger down: switch from orbit to pinch
      isDraggingRef.current = false;
      const [a, b] = Array.from(pointersRef.current.values());
      const c = toCenterSpace((a.x + b.x) / 2, (a.y + b.y) / 2);
      pinchRef.current = { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, cx: c.x, cy: c.y, view };
      movedRef.current = true; // never treat the end of a pinch as a tap
      return;
    }

    // Only drag on left mouse button or touch/pen
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    if (e.pointerType === 'mouse' && e.shiftKey) {
      panDragRef.current = { x: e.clientX, y: e.clientY, view };
      return;
    }

    isDraggingRef.current = true;
    startPointerRef.current = { x: e.clientX, y: e.clientY };
    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
    lastPointerTimeRef.current = performance.now();
    startRotationRef.current = { rx: cameraRotX, ry: cameraRotY };
    velocityRef.current = { vx: 0, vy: 0 };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (pointersRef.current.has(e.pointerId)) {
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Pinch zoom (about the fingers' midpoint) + two-finger pan
    if (pinchRef.current && pointersRef.current.size >= 2) {
      const [a, b] = Array.from(pointersRef.current.values());
      const base = pinchRef.current;
      const dist = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const mid = toCenterSpace((a.x + b.x) / 2, (a.y + b.y) / 2);
      const nextScale = clamp((base.view.scale * dist) / base.dist, MIN_USER_SCALE, MAX_USER_SCALE);
      const ratio = nextScale / base.view.scale;
      setView(
        clampView(
          {
            scale: nextScale,
            panX: mid.x - (base.cx - base.view.panX) * ratio,
            panY: mid.y - (base.cy - base.view.panY) * ratio,
          },
          boundsRef.current
        )
      );
      return;
    }

    // Shift + drag pan (mouse)
    if (panDragRef.current) {
      const base = panDragRef.current;
      movedRef.current = true;
      setView(
        clampView(
          { scale: base.view.scale, panX: base.view.panX + (e.clientX - base.x), panY: base.view.panY + (e.clientY - base.y) },
          boundsRef.current
        )
      );
      return;
    }

    if (!isDraggingRef.current) return;

    const totalDx = e.clientX - startPointerRef.current.x;
    const totalDy = e.clientY - startPointerRef.current.y;

    // Ignore finger jitter so a tap on a card doesn't nudge the scene
    if (!movedRef.current) {
      if (Math.hypot(totalDx, totalDy) < DRAG_THRESHOLD) return;
      movedRef.current = true;
    }

    const now = performance.now();
    const dt = Math.max(1, now - lastPointerTimeRef.current);
    const moveX = e.clientX - lastPointerPosRef.current.x;
    const moveY = e.clientY - lastPointerPosRef.current.y;

    // Orbit speed follows the screen size so a full-screen swipe turns the scene about the same on any device
    const sensitivity = 0.28 * clamp(900 / Math.max(320, Math.min(containerSize.width, containerSize.height * 1.6)), 0.8, 1.6);

    const newRy = startRotationRef.current.ry + totalDx * sensitivity;
    // Clamp pitch between -75 and +75 degrees to avoid gimbal flipping
    const newRx = Math.max(-75, Math.min(75, startRotationRef.current.rx - totalDy * sensitivity));

    setCameraRotY(newRy);
    setCameraRotX(newRx);

    // Compute instantaneous angular velocity (normalized to ~16ms frame)
    const instantVx = (moveX * sensitivity * 16) / dt;
    const instantVy = (moveY * sensitivity * 16) / dt;

    // Smooth moving average for velocity to produce natural inertia
    velocityRef.current = {
      vx: velocityRef.current.vx * 0.35 + instantVx * 0.65,
      vy: velocityRef.current.vy * 0.35 + instantVy * 0.65,
    };

    lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
    lastPointerTimeRef.current = now;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);

    if (pinchRef.current) {
      // Pinch ends as soon as one finger lifts; the remaining finger must not start an orbit
      if (pointersRef.current.size < 2) pinchRef.current = null;
      isDraggingRef.current = false;
      velocityRef.current = { vx: 0, vy: 0 };
      return;
    }
    if (panDragRef.current) {
      panDragRef.current = null;
      return;
    }

    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }

    const now = performance.now();
    const timeSinceLastMove = now - lastPointerTimeRef.current;

    // If pointer was stationary before releasing, discard momentum
    if (timeSinceLastMove > 65) {
      velocityRef.current = { vx: 0, vy: 0 };
      return;
    }

    // Initiate subtle momentum / inertia drift if velocity is noticeable
    let { vx, vy } = velocityRef.current;
    const speed = Math.hypot(vx, vy);

    if (speed > 0.08 && !isAutoRotating) {
      setIsInertiaActive(true);

      // Clamp max initial flick velocity for pleasant, controlled glide
      vx = Math.max(-10, Math.min(10, vx));
      vy = Math.max(-7, Math.min(7, vy));

      const friction = 0.94; // Subtle smooth exponential deceleration

      const stepInertia = () => {
        vx *= friction;
        vy *= friction;

        setCameraRotY((prev) => (prev + vx) % 360);
        setCameraRotX((prev) => Math.max(-75, Math.min(75, prev - vy)));

        if (Math.hypot(vx, vy) > 0.015) {
          inertiaRafRef.current = requestAnimationFrame(stepInertia);
        } else {
          setIsInertiaActive(false);
          inertiaRafRef.current = null;
          velocityRef.current = { vx: 0, vy: 0 };
        }
      };

      inertiaRafRef.current = requestAnimationFrame(stepInertia);
    }
  };

  // Wheel / trackpad-pinch zoom, centred on the cursor
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // If modal is open, don't intercept wheel
      if (selectedElement) return;
      e.preventDefault();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const cx = e.clientX - rect.left - rect.width / 2;
      const cy = e.clientY - rect.top - rect.height / 2;
      // deltaMode 1 = lines (some mice); normalise to pixels
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      const factor = Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0015));
      setView((v) => zoomAbout(v, v.scale * factor, cx, cy, boundsRef.current));
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [selectedElement]);

  // Compute 3D positions for elements in current layout
  const elementTransforms = useMemo(() => {
    const total = ELEMENTS.length;
    return ELEMENTS.map((el, idx) => calculateTransform(el, idx, total, layoutMode));
  }, [layoutMode]);

  // Filtering logic
  const isElementMatching = useCallback(
    (el: ElementData): boolean => {
      // Category match
      if (selectedCategory && el.category !== selectedCategory) {
        return false;
      }
      // Phase match
      if (phaseFilter !== 'all' && el.phase !== phaseFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = el.name.toLowerCase().includes(q);
        const matchesSymbol = el.symbol.toLowerCase() === q || el.symbol.toLowerCase().includes(q);
        const matchesNumber = el.number.toString() === q;
        if (!matchesName && !matchesSymbol && !matchesNumber) {
          return false;
        }
      }
      return true;
    },
    [selectedCategory, phaseFilter, searchQuery]
  );

  const hasActiveFilter = Boolean(selectedCategory || phaseFilter !== 'all' || searchQuery.trim());

  const activeCategories = useMemo(() => {
    return THEME_PRESETS[currentThemeId]?.categories || THEME_PRESETS['prism'].categories;
  }, [currentThemeId]);

  return (
    <div
      className="relative w-full h-dvh flex flex-col mesh-gradient-bg select-none overflow-hidden text-slate-100 transition-colors duration-500"
      style={{
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
        paddingBottom: viewport.regime === 'desktop' ? undefined : 'env(safe-area-inset-bottom)',
      }}
      data-ambient-lighting={ambientLighting}
    >
      {/* Top Floating Navigation Bar (compact bar + drawer on phones & tablets) */}
      <Header
        regime={viewport.regime}
        isShort={viewport.isShort}
        drawerExtra={
          viewport.regime === 'phone' && viewport.isShort ? (
            <CategoryBar
              variant="wrap"
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              categories={activeCategories}
            />
          ) : undefined
        }
        currentMode={layoutMode}
        onSelectMode={handleSelectMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        phaseFilter={phaseFilter}
        onPhaseFilterChange={setPhaseFilter}
        isAutoRotating={isAutoRotating}
        onToggleAutoRotate={() => setIsAutoRotating((prev) => !prev)}
        onResetCamera={handleResetCamera}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        isAutoTourActive={isAutoTourActive}
        onToggleAutoTour={handleToggleAutoTour}
        isSoundEnabled={isSoundEnabled}
        onToggleSound={handleToggleSound}
        currentThemeId={currentThemeId}
        onSelectTheme={setCurrentThemeId}
        isFilmGrainEnabled={isFilmGrainEnabled}
        onToggleFilmGrain={() => setIsFilmGrainEnabled((prev) => !prev)}
        ambientLighting={ambientLighting}
        onToggleAmbientLighting={handleToggleAmbientLighting}
        isTimelineOpen={isTimelineOpen}
        onToggleTimeline={handleToggleTimeline}
        timelineYear={timelineYear}
        isTimelineActive={timelineYear < 2026}
      />

      {/* Historical Discovery Timeline Scrubber Modal/Overlay */}
      <TimelineFilter
        inline={viewport.regime !== 'desktop'}
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        timelineYear={timelineYear}
        onYearChange={handleYearChange}
        isPlaying={isTimelinePlaying}
        onTogglePlay={handleToggleTimelinePlay}
        onResetToPresent={handleResetTimelineToPresent}
        totalDiscovered={discoveredCount}
        totalElements={ELEMENTS.length}
        recentElements={recentElements}
        onSelectElement={(el) => {
          soundEngine.playSelect(el.number);
          setSelectedElement(el);
        }}
      />

      {/* 3D Viewport Area: measured live, the scene is scaled to fit whatever space is left */}
      <main
        ref={containerRef}
        id="viewport-container"
        className="relative flex-1 min-h-0 w-full overflow-hidden cursor-grab active:cursor-grabbing perspective-container touch-none my-0"
        style={{
          // Perspective scales with the scene so zoom/fit is a pure image scale (proportions never change)
          perspective: `${BASE_PERSPECTIVE * totalScale}px`,
          perspectiveOrigin: `calc(50% + ${view.panX}px) calc(50% + ${view.panY}px)`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div
          className="scene-scaler"
          style={{ transform: `translate3d(${view.panX}px, ${view.panY}px, 0) scale3d(${totalScale}, ${totalScale}, ${totalScale})` }}
        >
        {/* 3D Scene World */}
        <div
          className="scene-world"
          style={{
            transform: `translateZ(${cameraZoom}px) rotateX(${cameraRotX}deg) rotateY(${cameraRotY}deg)`,
            transition: isDraggingRef.current || isInertiaActive ? 'none' : 'transform 0.12s ease-out',
          }}
        >
          {ELEMENTS.map((element, idx) => {
            const transform = elementTransforms[idx];
            const isMatch = isElementMatching(element);
            const isCategoryActive = selectedCategory === element.category;
            const isSelected = selectedElement?.number === element.number;

            // Historical Timeline Discovery State
            const discYear = getElementDiscoveryYear(element);
            const isDiscovered = timelineYear >= 2026 || discYear <= timelineYear;
            const isUndiscovered = !isDiscovered;
            const isRecentlyDiscovered =
              timelineYear < 2026 &&
              discYear <= timelineYear &&
              discYear > 0 &&
              timelineYear - discYear <= 6;

            const isDimmed = (hasActiveFilter && !isMatch) || isUndiscovered;

            return (
              <ElementCard
                key={element.number}
                element={element}
                transform={transform}
                isCategoryActive={isCategoryActive}
                isSelected={isSelected}
                isDimmed={isDimmed}
                isUndiscovered={isUndiscovered}
                isRecentlyDiscovered={isRecentlyDiscovered}
                timelineYear={timelineYear < 2026 ? timelineYear : null}
                categories={activeCategories}
                onClick={(el, rect) => {
                  // A drag / pinch that happens to end over a card must not open it
                  if (movedRef.current) return;

                  // Touch + tiny cards (whole table fitted on a phone): the first tap zooms in on the
                  // tapped element so the next tap is easy to land; it only opens once it's finger-sized.
                  if (
                    viewport.isTouch &&
                    rect &&
                    rect.width > 0 &&
                    rect.width < TAP_ZOOM_BELOW_PX &&
                    view.scale < MAX_USER_SCALE - 0.01
                  ) {
                    const c = toCenterSpace(rect.left + rect.width / 2, rect.top + rect.height / 2);
                    const target = clamp((view.scale * TAP_ZOOM_TARGET_PX) / rect.width, MIN_USER_SCALE, MAX_USER_SCALE);
                    setView((v) => {
                      const z = zoomAbout(v, target, c.x, c.y, boundsRef.current);
                      // the tapped point stays put while zooming; then slide it to the middle of the screen
                      return clampView({ ...z, panX: z.panX - c.x, panY: z.panY - c.y }, boundsRef.current);
                    });
                    return;
                  }

                  soundEngine.playSelect(el.number);
                  setSelectedElement(el);
                }}
                onMouseEnter={(el) => soundEngine.playHover(el.number)}
              />
            );
          })}
        </div>
        </div>

        {/* Floating HUD / Camera Angles (desktop & tablet only; phones need the room) */}
        {!viewport.isTouch && viewport.regime !== 'phone' && (
        <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1.5 text-[11px] font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 backdrop-blur-md text-slate-300 shadow-md">
            <Compass size={13} className="text-amber-400" />
            <span>
              Pitch: <strong className="text-white">{cameraRotX.toFixed(1)}°</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              Yaw: <strong className="text-white">{cameraRotY.toFixed(1)}°</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              Zoom: <strong className="text-white">{(totalScale * 100).toFixed(0)}%</strong>
            </span>
          </div>
        </div>
        )}

        {/* Interaction helper: persistent on desktop, brief self-fading hint on touch devices */}
        {viewport.isTouch ? (
          <div
            key={`hint-${layoutMode}-${viewport.regime}`}
            className="hint-fade absolute left-1/2 -translate-x-1/2 bottom-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 border border-white/10 backdrop-blur-md text-slate-200 text-[11px] pointer-events-none shadow-md whitespace-nowrap"
          >
            <Move3d size={14} className="text-amber-400" />
            <span>Drag to orbit • Pinch to zoom • Tap an element</span>
          </div>
        ) : (
          <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 backdrop-blur-md text-slate-400 text-[11px] pointer-events-none shadow-md">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Move3d size={14} className="text-amber-400" />
              <span>Drag to Orbit</span>
            </div>
            <span>•</span>
            <span>Scroll to Zoom</span>
            <span>•</span>
            <span>Shift-drag to Pan</span>
            <span>•</span>
            <span>Click card for details</span>
          </div>
        )}
      </main>

      {/* Category Bar at Bottom with active glow & indicator */}
      {viewport.regime === 'phone' && !viewport.isShort && (
        <MobileDock
          currentMode={layoutMode}
          onSelectMode={handleSelectMode}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFit={handleResetCamera}
        />
      )}
      {!(viewport.regime === 'phone' && viewport.isShort) && (
        <CategoryBar
          variant={viewport.regime === 'desktop' ? 'bar' : 'scroll'}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          categories={activeCategories}
        />
      )}

      {/* Element Detail Modal */}
      <ElementModal
        element={selectedElement}
        onClose={() => {
          setSelectedElement(null);
          if (isAutoTourActive) {
            setIsAutoTourActive(false);
            setIsTourPaused(false);
          }
        }}
        onSelectElement={setSelectedElement}
        categories={activeCategories}
        timelineYear={timelineYear < 2026 ? timelineYear : null}
        isAutoTourActive={isAutoTourActive}
        isTourPaused={isTourPaused}
        tourIndex={tourIndex}
        totalTourItems={AUTO_TOUR_ITEMS.length}
        tourProgress={tourProgress}
        tourHighlight={AUTO_TOUR_ITEMS[tourIndex]?.highlight}
        onToggleTourPause={() => setIsTourPaused((prev) => !prev)}
        onNextTourItem={handleNextTourItem}
        onPrevTourItem={handlePrevTourItem}
        onExitTour={handleExitTour}
      />

      {/* Tactile Analog Post-Processing Overlays: Film Grain & Chromatic Aberration */}
      {isFilmGrainEnabled && (
        <>
          <div className="tactile-film-grain" aria-hidden="true" />
          <div className="chromatic-aberration-layer" aria-hidden="true" />
        </>
      )}
    </div>
  );
}
