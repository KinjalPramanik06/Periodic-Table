# 🧪 3D Interactive Periodic Table

### A Responsive 3D Periodic Table built with React & CSS 3D Transforms

A modern, interactive periodic table of all **118 elements** rendered in true 3D — no WebGL, no Three.js. Explore the elements on a curved grid, a sphere, or a helix; orbit, zoom and pan the scene; filter by category or phase; scrub through the history of element discovery; and compare any two elements side by side.

The project was built to understand how **3D scenes, camera controls, and responsive layouts** work using nothing but the browser's CSS engine and React state.

---

## ✨ Overview

A periodic table is more than a grid of boxes.

This project shows how an interactive 3D interface works behind the screen:

```text
User (mouse / touch / keyboard)
 │
 ▼
React App (state + gestures)
 │
 ├──────────────► Layout Maths ──► 3D position of each element
 │
 ├──────────────► Camera ────────► orbit, zoom, pan, inertia
 │
 ├──────────────► Filters ───────► category, phase, search, timeline
 │
 └──────────────► Web Audio ─────► synthesised sound effects
                         │
                         ▼
               CSS 3D Transforms
```

---

## 🏗️ System Architecture

```text
                       ┌──────────────────────┐
                       │         USER         │
                       └──────────┬───────────┘
                                  │
                       mouse / touch / keyboard
                                  │
                                  ▼
                ┌──────────────────────────────────┐
                │          APP.TSX (STATE)         │
                │                                  │
                │  Layout   Camera   Filters       │
                │  Timeline  Tour    Theme         │
                └───────┬──────────────┬───────────┘
                        │              │
              ┌─────────┘              └──────────┐
              ▼                                   ▼
   ┌─────────────────────┐            ┌─────────────────────┐
   │     UI COMPONENTS   │            │     3D SCENE        │
   │                     │            │                     │
   │  Header             │            │  scene-scaler       │
   │  MobileMenu / Dock  │            │    └─ scene-world   │
   │  CategoryBar        │            │        └─ 118 cards │
   │  TimelineFilter     │            │                     │
   │  ElementModal       │            └──────────┬──────────┘
   └─────────────────────┘                       │
                                                 ▼
        ┌──────────────────┬────────────────────────────────┐
        ▼                  ▼                                ▼
 ┌─────────────┐   ┌───────────────┐              ┌─────────────────┐
 │    data/    │   │    utils/     │              │     hooks/      │
 │             │   │               │              │                 │
 │  elements   │   │ transform     │              │  useViewport    │
 │  themes     │   │   Layouts     │              │  (ResizeObserver│
 │  timeline   │   │ viewFit       │              │   + regimes)    │
 │  tour       │   │ soundEffects  │              │                 │
 └─────────────┘   └───────────────┘              └─────────────────┘
```

---

## ✨ Key Features

- 🌐 4 layouts: curved Grid, Sphere, Helix and flat Table
- 🖱️ Orbit with inertia, zoom about the cursor, pan, auto-rotate
- 🔍 Search by name, symbol or atomic number
- 🎛️ Filter by 10 categories and 4 phases
- 📖 Detailed element panel with electron shells and properties
- ⚖️ Compare mode for any two elements
- ⏳ Discovery timeline from antiquity to 2026 with play/pause
- 🎬 Auto-tour of 18 notable elements
- 🎨 6 colour themes and 2 lighting modes
- 🔊 Synthesised Web Audio sound effects
- 📱 Fully responsive: phone, tablet and desktop

---

## 🛠️ Tech Stack

| Technology | Purpose |
| ---------- | ------- |
| React 19 | UI and state |
| TypeScript | Type safety |
| Vite | Dev server and build |
| Tailwind CSS v4 | Styling |
| CSS 3D Transforms | The 3D scene |
| Web Audio API | Synthesised sound effects |
| Lucide React | Icons |
| ResizeObserver | Live responsive fitting |

---

## 📂 Project Structure

```text
src/
├── App.tsx                 # State, camera, gestures, scene render
├── main.tsx                # React entry point
├── index.css               # 3D scene, card and theme styles
├── types.ts                # Shared types
│
├── components/
│   ├── ElementCard.tsx     # Memoised 3D card
│   ├── ElementModal.tsx    # Details, compare mode, tour overlay
│   ├── Header.tsx          # Search, layouts, filters, theme menu
│   ├── MobileMenu.tsx      # Drawer for phone / tablet
│   ├── MobileDock.tsx      # Bottom bar on phones
│   ├── CategoryBar.tsx     # Category filter
│   └── TimelineFilter.tsx  # Discovery timeline
│
├── data/
│   ├── elements.ts         # 118 elements
│   ├── themes.ts           # 6 colour themes
│   ├── timeline.ts         # 7 historical eras
│   └── autoTourElements.ts # Tour stops
│
├── hooks/
│   └── useViewport.ts      # Sizing and phone/tablet/desktop regime
│
└── utils/
    ├── transformLayouts.ts # Layout maths
    ├── viewFit.ts          # Fit scale, zoom, pan clamping
    └── soundEffects.ts     # Web Audio engine
```

---

## 🎨 Themes

| Theme | Look |
| ----- | ---- |
| Prism Luxe | Jewel tones on midnight blue |
| Neon Cyber | Electric cyan and magenta |
| Sunset Synthwave | Hot pink, orange and violet |
| Aurora Borealis | Greens, teals and violets |
| Deep Ocean | Cool blues with coral highlights |
| Sakura Dusk | Soft pinks and lavender |

---

## 🎮 Controls

| Input | Action |
| ----- | ------ |
| Drag | Orbit |
| Scroll / pinch | Zoom |
| Shift + drag / two-finger drag | Pan |
| Click / tap a card | Open details |
| ← / → in the panel | Previous / next element |
| Esc | Close the current layer |

---

## 🧠 What I Learned

* Building 3D scenes with CSS transforms
* Camera maths: orbit, zoom about a point, pan clamping
* Pointer events for mouse, touch and pinch gestures
* Inertia and easing animation
* Responsive design with ResizeObserver
* Performance with React.memo and memoised layout data
* Synthesising sound with the Web Audio API
* Theming with CSS variables

---

## 🚀 Getting Started

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
npm install
npm run dev
```

Open **http://localhost:5500**

---

## 👩‍💻 Author

**Kinjal Pramanik**

Computer Science & Engineering student building full-stack, backend, and AI-powered applications.

⭐ If you find the project useful, consider starring the repository.
