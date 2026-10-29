/* ═══════════════════════════════════════════
   3D PERIODIC TABLE  ·  main.js
   Pure CSS3D transforms (no Three.js renderer)
   Drag to rotate · Scroll to zoom · Click info
═══════════════════════════════════════════ */

// ─── ELEMENT DATA ─────────────────────────
const ELEMENTS = [
  { n:1,  s:'H',  name:'Hydrogen',      mass:'1.008',    cat:'nonmetal',    col:7,  row:1 },
  { n:2,  s:'He', name:'Helium',        mass:'4.003',    cat:'noble',       col:18, row:1 },
  { n:3,  s:'Li', name:'Lithium',       mass:'6.941',    cat:'alkali',      col:1,  row:2 },
  { n:4,  s:'Be', name:'Beryllium',     mass:'9.012',    cat:'alkaline',    col:2,  row:2 },
  { n:5,  s:'B',  name:'Boron',         mass:'10.81',    cat:'metalloid',   col:13, row:2 },
  { n:6,  s:'C',  name:'Carbon',        mass:'12.011',   cat:'nonmetal',    col:14, row:2 },
  { n:7,  s:'N',  name:'Nitrogen',      mass:'14.007',   cat:'nonmetal',    col:15, row:2 },
  { n:8,  s:'O',  name:'Oxygen',        mass:'15.999',   cat:'nonmetal',    col:16, row:2 },
  { n:9,  s:'F',  name:'Fluorine',      mass:'18.998',   cat:'halogen',     col:17, row:2 },
  { n:10, s:'Ne', name:'Neon',          mass:'20.18',    cat:'noble',       col:18, row:2 },
  { n:11, s:'Na', name:'Sodium',        mass:'22.99',    cat:'alkali',      col:1,  row:3 },
  { n:12, s:'Mg', name:'Magnesium',     mass:'24.305',   cat:'alkaline',    col:2,  row:3 },
  { n:13, s:'Al', name:'Aluminum',      mass:'26.982',   cat:'post-trans',  col:13, row:3 },
  { n:14, s:'Si', name:'Silicon',       mass:'28.086',   cat:'metalloid',   col:14, row:3 },
  { n:15, s:'P',  name:'Phosphorus',    mass:'30.974',   cat:'nonmetal',    col:15, row:3 },
  { n:16, s:'S',  name:'Sulfur',        mass:'32.06',    cat:'nonmetal',    col:16, row:3 },
  { n:17, s:'Cl', name:'Chlorine',      mass:'35.45',    cat:'halogen',     col:17, row:3 },
  { n:18, s:'Ar', name:'Argon',         mass:'39.948',   cat:'noble',       col:18, row:3 },
  { n:19, s:'K',  name:'Potassium',     mass:'39.098',   cat:'alkali',      col:1,  row:4 },
  { n:20, s:'Ca', name:'Calcium',       mass:'40.078',   cat:'alkaline',    col:2,  row:4 },
  { n:21, s:'Sc', name:'Scandium',      mass:'44.956',   cat:'transition',  col:3,  row:4 },
  { n:22, s:'Ti', name:'Titanium',      mass:'47.867',   cat:'transition',  col:4,  row:4 },
  { n:23, s:'V',  name:'Vanadium',      mass:'50.942',   cat:'transition',  col:5,  row:4 },
  { n:24, s:'Cr', name:'Chromium',      mass:'51.996',   cat:'transition',  col:6,  row:4 },
  { n:25, s:'Mn', name:'Manganese',     mass:'54.938',   cat:'transition',  col:7,  row:4 },
  { n:26, s:'Fe', name:'Iron',          mass:'55.845',   cat:'transition',  col:8,  row:4 },
  { n:27, s:'Co', name:'Cobalt',        mass:'58.933',   cat:'transition',  col:9,  row:4 },
  { n:28, s:'Ni', name:'Nickel',        mass:'58.693',   cat:'transition',  col:10, row:4 },
  { n:29, s:'Cu', name:'Copper',        mass:'63.546',   cat:'transition',  col:11, row:4 },
  { n:30, s:'Zn', name:'Zinc',          mass:'65.38',    cat:'transition',  col:12, row:4 },
  { n:31, s:'Ga', name:'Gallium',       mass:'69.723',   cat:'post-trans',  col:13, row:4 },
  { n:32, s:'Ge', name:'Germanium',     mass:'72.63',    cat:'metalloid',   col:14, row:4 },
  { n:33, s:'As', name:'Arsenic',       mass:'74.922',   cat:'metalloid',   col:15, row:4 },
  { n:34, s:'Se', name:'Selenium',      mass:'78.971',   cat:'nonmetal',    col:16, row:4 },
  { n:35, s:'Br', name:'Bromine',       mass:'79.904',   cat:'halogen',     col:17, row:4 },
  { n:36, s:'Kr', name:'Krypton',       mass:'83.798',   cat:'noble',       col:18, row:4 },
  { n:37, s:'Rb', name:'Rubidium',      mass:'85.468',   cat:'alkali',      col:1,  row:5 },
  { n:38, s:'Sr', name:'Strontium',     mass:'87.62',    cat:'alkaline',    col:2,  row:5 },
  { n:39, s:'Y',  name:'Yttrium',       mass:'88.906',   cat:'transition',  col:3,  row:5 },
  { n:40, s:'Zr', name:'Zirconium',     mass:'91.224',   cat:'transition',  col:4,  row:5 },
  { n:41, s:'Nb', name:'Niobium',       mass:'92.906',   cat:'transition',  col:5,  row:5 },
  { n:42, s:'Mo', name:'Molybdenum',    mass:'95.95',    cat:'transition',  col:6,  row:5 },
  { n:43, s:'Tc', name:'Technetium',    mass:'(98)',      cat:'transition',  col:7,  row:5 },
  { n:44, s:'Ru', name:'Ruthenium',     mass:'101.07',   cat:'transition',  col:8,  row:5 },
  { n:45, s:'Rh', name:'Rhodium',       mass:'102.906',  cat:'transition',  col:9,  row:5 },
  { n:46, s:'Pd', name:'Palladium',     mass:'106.42',   cat:'transition',  col:10, row:5 },
  { n:47, s:'Ag', name:'Silver',        mass:'107.868',  cat:'transition',  col:11, row:5 },
  { n:48, s:'Cd', name:'Cadmium',       mass:'112.414',  cat:'transition',  col:12, row:5 },
  { n:49, s:'In', name:'Indium',        mass:'114.818',  cat:'post-trans',  col:13, row:5 },
  { n:50, s:'Sn', name:'Tin',           mass:'118.71',   cat:'post-trans',  col:14, row:5 },
  { n:51, s:'Sb', name:'Antimony',      mass:'121.76',   cat:'metalloid',   col:15, row:5 },
  { n:52, s:'Te', name:'Tellurium',     mass:'127.6',    cat:'metalloid',   col:16, row:5 },
  { n:53, s:'I',  name:'Iodine',        mass:'126.904',  cat:'halogen',     col:17, row:5 },
  { n:54, s:'Xe', name:'Xenon',         mass:'131.293',  cat:'noble',       col:18, row:5 },
  { n:55, s:'Cs', name:'Caesium',       mass:'132.905',  cat:'alkali',      col:1,  row:6 },
  { n:56, s:'Ba', name:'Barium',        mass:'137.327',  cat:'alkaline',    col:2,  row:6 },
  { n:57, s:'La', name:'Lanthanum',     mass:'138.905',  cat:'lanthanide',  col:4,  row:9 },
  { n:58, s:'Ce', name:'Cerium',        mass:'140.116',  cat:'lanthanide',  col:5,  row:9 },
  { n:59, s:'Pr', name:'Praseodymium',  mass:'140.908',  cat:'lanthanide',  col:6,  row:9 },
  { n:60, s:'Nd', name:'Neodymium',     mass:'144.242',  cat:'lanthanide',  col:7,  row:9 },
  { n:61, s:'Pm', name:'Promethium',    mass:'(145)',     cat:'lanthanide',  col:8,  row:9 },
  { n:62, s:'Sm', name:'Samarium',      mass:'150.36',   cat:'lanthanide',  col:9,  row:9 },
  { n:63, s:'Eu', name:'Europium',      mass:'151.964',  cat:'lanthanide',  col:10, row:9 },
  { n:64, s:'Gd', name:'Gadolinium',    mass:'157.25',   cat:'lanthanide',  col:11, row:9 },
  { n:65, s:'Tb', name:'Terbium',       mass:'158.925',  cat:'lanthanide',  col:12, row:9 },
  { n:66, s:'Dy', name:'Dysprosium',    mass:'162.5',    cat:'lanthanide',  col:13, row:9 },
  { n:67, s:'Ho', name:'Holmium',       mass:'164.930',  cat:'lanthanide',  col:14, row:9 },
  { n:68, s:'Er', name:'Erbium',        mass:'167.259',  cat:'lanthanide',  col:15, row:9 },
  { n:69, s:'Tm', name:'Thulium',       mass:'168.934',  cat:'lanthanide',  col:16, row:9 },
  { n:70, s:'Yb', name:'Ytterbium',     mass:'173.045',  cat:'lanthanide',  col:17, row:9 },
  { n:71, s:'Lu', name:'Lutetium',      mass:'174.967',  cat:'lanthanide',  col:18, row:9 },
  { n:72, s:'Hf', name:'Hafnium',       mass:'178.49',   cat:'transition',  col:4,  row:6 },
  { n:73, s:'Ta', name:'Tantalum',      mass:'180.948',  cat:'transition',  col:5,  row:6 },
  { n:74, s:'W',  name:'Tungsten',      mass:'183.84',   cat:'transition',  col:6,  row:6 },
  { n:75, s:'Re', name:'Rhenium',       mass:'186.207',  cat:'transition',  col:7,  row:6 },
  { n:76, s:'Os', name:'Osmium',        mass:'190.23',   cat:'transition',  col:8,  row:6 },
  { n:77, s:'Ir', name:'Iridium',       mass:'192.217',  cat:'transition',  col:9,  row:6 },
  { n:78, s:'Pt', name:'Platinum',      mass:'195.084',  cat:'transition',  col:10, row:6 },
  { n:79, s:'Au', name:'Gold',          mass:'196.967',  cat:'transition',  col:11, row:6 },
  { n:80, s:'Hg', name:'Mercury',       mass:'200.592',  cat:'transition',  col:12, row:6 },
  { n:81, s:'Tl', name:'Thallium',      mass:'204.38',   cat:'post-trans',  col:13, row:6 },
  { n:82, s:'Pb', name:'Lead',          mass:'207.2',    cat:'post-trans',  col:14, row:6 },
  { n:83, s:'Bi', name:'Bismuth',       mass:'208.980',  cat:'post-trans',  col:15, row:6 },
  { n:84, s:'Po', name:'Polonium',      mass:'(209)',     cat:'metalloid',   col:16, row:6 },
  { n:85, s:'At', name:'Astatine',      mass:'(210)',     cat:'halogen',     col:17, row:6 },
  { n:86, s:'Rn', name:'Radon',         mass:'(222)',     cat:'noble',       col:18, row:6 },
  { n:87, s:'Fr', name:'Francium',      mass:'(223)',     cat:'alkali',      col:1,  row:7 },
  { n:88, s:'Ra', name:'Radium',        mass:'(226)',     cat:'alkaline',    col:2,  row:7 },
  { n:89, s:'Ac', name:'Actinium',      mass:'(227)',     cat:'actinide',    col:4,  row:10},
  { n:90, s:'Th', name:'Thorium',       mass:'232.038',  cat:'actinide',    col:5,  row:10},
  { n:91, s:'Pa', name:'Protactinium',  mass:'231.036',  cat:'actinide',    col:6,  row:10},
  { n:92, s:'U',  name:'Uranium',       mass:'238.029',  cat:'actinide',    col:7,  row:10},
  { n:93, s:'Np', name:'Neptunium',     mass:'(237)',     cat:'actinide',    col:8,  row:10},
  { n:94, s:'Pu', name:'Plutonium',     mass:'(244)',     cat:'actinide',    col:9,  row:10},
  { n:95, s:'Am', name:'Americium',     mass:'(243)',     cat:'actinide',    col:10, row:10},
  { n:96, s:'Cm', name:'Curium',        mass:'(247)',     cat:'actinide',    col:11, row:10},
  { n:97, s:'Bk', name:'Berkelium',     mass:'(247)',     cat:'actinide',    col:12, row:10},
  { n:98, s:'Cf', name:'Californium',   mass:'(251)',     cat:'actinide',    col:13, row:10},
  { n:99, s:'Es', name:'Einsteinium',   mass:'(252)',     cat:'actinide',    col:14, row:10},
  { n:100,s:'Fm', name:'Fermium',       mass:'(257)',     cat:'actinide',    col:15, row:10},
  { n:101,s:'Md', name:'Mendelevium',   mass:'(258)',     cat:'actinide',    col:16, row:10},
  { n:102,s:'No', name:'Nobelium',      mass:'(259)',     cat:'actinide',    col:17, row:10},
  { n:103,s:'Lr', name:'Lawrencium',    mass:'(262)',     cat:'actinide',    col:18, row:10},
  { n:104,s:'Rf', name:'Rutherfordium', mass:'(267)',     cat:'transition',  col:4,  row:7 },
  { n:105,s:'Db', name:'Dubnium',       mass:'(268)',     cat:'transition',  col:5,  row:7 },
  { n:106,s:'Sg', name:'Seaborgium',    mass:'(271)',     cat:'transition',  col:6,  row:7 },
  { n:107,s:'Bh', name:'Bohrium',       mass:'(272)',     cat:'transition',  col:7,  row:7 },
  { n:108,s:'Hs', name:'Hassium',       mass:'(270)',     cat:'transition',  col:8,  row:7 },
  { n:109,s:'Mt', name:'Meitnerium',    mass:'(276)',     cat:'unknown',     col:9,  row:7 },
  { n:110,s:'Ds', name:'Darmstadtium',  mass:'(281)',     cat:'unknown',     col:10, row:7 },
  { n:111,s:'Rg', name:'Roentgenium',   mass:'(280)',     cat:'unknown',     col:11, row:7 },
  { n:112,s:'Cn', name:'Copernicium',   mass:'(285)',     cat:'transition',  col:12, row:7 },
  { n:113,s:'Nh', name:'Nihonium',      mass:'(284)',     cat:'unknown',     col:13, row:7 },
  { n:114,s:'Fl', name:'Flerovium',     mass:'(289)',     cat:'unknown',     col:14, row:7 },
  { n:115,s:'Mc', name:'Moscovium',     mass:'(288)',     cat:'unknown',     col:15, row:7 },
  { n:116,s:'Lv', name:'Livermorium',   mass:'(293)',     cat:'unknown',     col:16, row:7 },
  { n:117,s:'Ts', name:'Tennessine',    mass:'(294)',     cat:'unknown',     col:17, row:7 },
  { n:118,s:'Og', name:'Oganesson',     mass:'(294)',     cat:'unknown',     col:18, row:7 },
];

// ─── CATEGORY COLORS ──────────────────────
const CAT_COLOR = {
  'alkali':     'var(--col-alkali)',
  'alkaline':   'var(--col-alkaline)',
  'transition': 'var(--col-transition)',
  'post-trans': 'var(--col-post-trans)',
  'metalloid':  'var(--col-metalloid)',
  'nonmetal':   'var(--col-nonmetal)',
  'halogen':    'var(--col-halogen)',
  'noble':      'var(--col-noble)',
  'lanthanide': 'var(--col-lanthanide)',
  'actinide':   'var(--col-actinide)',
  'unknown':    'var(--col-unknown)',
};

const CAT_LABEL = {
  'alkali':     'Alkali Metal',
  'alkaline':   'Alkaline Earth Metal',
  'transition': 'Transition Metal',
  'post-trans': 'Post-transition Metal',
  'metalloid':  'Metalloid',
  'nonmetal':   'Reactive Nonmetal',
  'halogen':    'Halogen',
  'noble':      'Noble Gas',
  'lanthanide': 'Lanthanide',
  'actinide':   'Actinide',
  'unknown':    'Unknown Properties',
};

// ─── STATE ────────────────────────────────
const scene = document.getElementById('css3d-scene');
const container = document.getElementById('scene-container');

let rotX = -10, rotY = 20;
let targetRotX = rotX, targetRotY = rotY;
let zoom = 1, targetZoom = 1;
let isDragging = false, lastX = 0, lastY = 0;
let currentView = 'table';
let cards = [];
let positions = { table: [], sphere: [], helix: [], grid: [] };
let animating = false;
let rafId = null;

// ─── BUILD CARDS ──────────────────────────
function buildCards() {
  scene.innerHTML = '';
  cards = [];

  ELEMENTS.forEach((el, i) => {
    const div = document.createElement('div');
    div.className = `element-card el-${el.cat}`;
    div.style.setProperty('--cat-color', CAT_COLOR[el.cat] || 'var(--accent)');
    div.innerHTML = `
      <span class="el-number">${el.n}</span>
      <span class="el-symbol">${el.s}</span>
      <span class="el-name">${el.name}</span>
      <span class="el-mass">${el.mass}</span>
    `;
    div.addEventListener('click', (e) => {
      e.stopPropagation();
      showInfo(el);
    });
    scene.appendChild(div);
    cards.push(div);
  });
}

// ─── POSITION GENERATORS ──────────────────

function computeTablePositions() {
  const W = 86, H = 86, GAP = 4;
  const step = W + GAP;
  return ELEMENTS.map(el => {
    // for lanthanides/actinides use row 9/10 with offset
    let col = el.col, row = el.row;
    // shift lanthanide/actinide rows to create gap
    let extraY = row > 8 ? 1 : 0;
    return {
      x: (col - 9.5) * step,
      y: (row + extraY - 4.5) * step,
      z: 0,
      rx: 0, ry: 0, rz: 0
    };
  });
}

function computeSpherePositions() {
  const N = ELEMENTS.length;
  const R = 700;
  return ELEMENTS.map((_, i) => {
    const phi   = Math.acos(-1 + (2 * i) / N);
    const theta = Math.sqrt(N * Math.PI) * phi;
    return {
      x: R * Math.cos(theta) * Math.sin(phi),
      y: R * Math.sin(theta) * Math.sin(phi),
      z: R * Math.cos(phi),
      rx: 0, ry: theta * (180 / Math.PI), rz: 0
    };
  });
}

function computeHelixPositions() {
  const N = ELEMENTS.length;
  return ELEMENTS.map((_, i) => {
    const t     = (i / N) * Math.PI * 4;
    const R     = 400;
    return {
      x: Math.sin(t) * R,
      y: (i - N / 2) * 22,
      z: Math.cos(t) * R,
      rx: 0,
      ry: -(t * 180 / Math.PI),
      rz: 0
    };
  });
}

function computeGridPositions() {
  const COLS = 10;
  const W = 100;
  return ELEMENTS.map((_, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    return {
      x: (col - COLS / 2) * W + W / 2,
      y: (row - 6) * W,
      z: 0,
      rx: 0, ry: 0, rz: 0
    };
  });
}

function precomputePositions() {
  positions.table  = computeTablePositions();
  positions.sphere = computeSpherePositions();
  positions.helix  = computeHelixPositions();
  positions.grid   = computeGridPositions();
}

// ─── APPLY POSITIONS (animated) ───────────
function applyPositions(view) {
  const pos = positions[view];
  animating = true;
  const duration = 900;
  const start = performance.now();

  // snapshot current transforms
  const from = cards.map(card => {
    const s = card.style.transform;
    // extract translate3d and rotate values
    const tMatch = s.match(/translate3d\(([^)]+)\)/);
    const rxMatch = s.match(/rotateX\(([-\d.]+)deg\)/);
    const ryMatch = s.match(/rotateY\(([-\d.]+)deg\)/);
    const rzMatch = s.match(/rotateZ\(([-\d.]+)deg\)/);
    let x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0;
    if (tMatch) {
      const parts = tMatch[1].split(',').map(p => parseFloat(p));
      x = parts[0]; y = parts[1]; z = parts[2];
    }
    if (rxMatch) rx = parseFloat(rxMatch[1]);
    if (ryMatch) ry = parseFloat(ryMatch[1]);
    if (rzMatch) rz = parseFloat(rzMatch[1]);
    return { x, y, z, rx, ry, rz };
  });

  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = easeInOutCubic(t);

    cards.forEach((card, i) => {
      const f = from[i], to = pos[i];
      const x  = lerp(f.x,  to.x,  ease);
      const y  = lerp(f.y,  to.y,  ease);
      const z  = lerp(f.z,  to.z,  ease);
      const rx = lerp(f.rx, to.rx, ease);
      const ry = lerp(f.ry, to.ry, ease);
      const rz = lerp(f.rz, to.rz, ease);
      card.style.transform =
        `translate3d(${x}px,${y}px,${z}px)` +
        (rx ? ` rotateX(${rx}deg)` : '') +
        (ry ? ` rotateY(${ry}deg)` : '') +
        (rz ? ` rotateZ(${rz}deg)` : '');
    });

    if (t < 1) { requestAnimationFrame(tick); }
    else { animating = false; }
  }
  requestAnimationFrame(tick);
}

function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOutCubic(t) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
}

// ─── RENDER LOOP ──────────────────────────
function renderLoop() {
  rotX += (targetRotX - rotX) * 0.08;
  rotY += (targetRotY - rotY) * 0.08;
  zoom += (targetZoom - zoom) * 0.08;

  scene.style.transform =
    `scale(${zoom}) rotateX(${rotX}deg) rotateY(${rotY}deg)`;

  rafId = requestAnimationFrame(renderLoop);
}

// ─── DRAG ─────────────────────────────────
container.addEventListener('mousedown', e => {
  isDragging = true;
  lastX = e.clientX;
  lastY = e.clientY;
  e.preventDefault();
});
window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;
  targetRotY += dx * 0.4;
  targetRotX -= dy * 0.4;
  targetRotX = Math.max(-80, Math.min(80, targetRotX));
  lastX = e.clientX;
  lastY = e.clientY;
});
window.addEventListener('mouseup', () => { isDragging = false; });

// Touch support
container.addEventListener('touchstart', e => {
  isDragging = true;
  lastX = e.touches[0].clientX;
  lastY = e.touches[0].clientY;
}, { passive: true });
window.addEventListener('touchmove', e => {
  if (!isDragging) return;
  const dx = e.touches[0].clientX - lastX;
  const dy = e.touches[0].clientY - lastY;
  targetRotY += dx * 0.4;
  targetRotX -= dy * 0.4;
  targetRotX = Math.max(-80, Math.min(80, targetRotX));
  lastX = e.touches[0].clientX;
  lastY = e.touches[0].clientY;
}, { passive: true });
window.addEventListener('touchend', () => { isDragging = false; });

// Scroll zoom
window.addEventListener('wheel', e => {
  e.preventDefault();
  targetZoom = Math.max(0.25, Math.min(2.5, targetZoom - e.deltaY * 0.001));
}, { passive: false });

// ─── VIEW BUTTONS ─────────────────────────
document.querySelectorAll('.view-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    if (view === currentView) return;
    currentView = view;
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyPositions(view);

    // auto-reset rotation for table/grid
    if (view === 'table' || view === 'grid') {
      targetRotX = -10; targetRotY = 0; targetZoom = 0.7;
    } else if (view === 'sphere') {
      targetRotX = 10; targetRotY = 30; targetZoom = 0.8;
    } else if (view === 'helix') {
      targetRotX = 0; targetRotY = 40; targetZoom = 0.9;
    }
  });
});

// ─── INFO PANEL ───────────────────────────
const infoPanel = document.getElementById('info-panel');

function showInfo(el) {
  document.getElementById('info-number').textContent  = `ELEMENT ${el.n}`;
  document.getElementById('info-symbol').textContent  = el.s;
  document.getElementById('info-name').textContent    = el.name;
  document.getElementById('info-mass').textContent    = `Atomic mass: ${el.mass}`;
  document.getElementById('info-category').textContent = CAT_LABEL[el.cat] || el.cat;
  document.getElementById('info-category').style.borderColor = CAT_COLOR[el.cat] || 'var(--accent)';
  document.getElementById('info-category').style.color       = CAT_COLOR[el.cat] || 'var(--accent)';
  document.getElementById('info-symbol').style.color         = CAT_COLOR[el.cat] || 'var(--accent)';
  document.getElementById('info-symbol').style.textShadow    = `0 0 20px ${CAT_COLOR[el.cat] || 'var(--accent)'}`;
  infoPanel.classList.remove('hidden');
}

document.getElementById('info-close').addEventListener('click', () => {
  infoPanel.classList.add('hidden');
});

// ─── INIT ─────────────────────────────────
function init() {
  buildCards();
  precomputePositions();

  // place all cards at table positions immediately
  const pos = positions.table;
  cards.forEach((card, i) => {
    const p = pos[i];
    card.style.transform = `translate3d(${p.x}px,${p.y}px,${p.z}px)`;
  });

  targetZoom = 0.7;
  zoom = 0.7;

  renderLoop();

  // staggered entrance
  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transition = 'opacity 0.4s';
    setTimeout(() => { card.style.opacity = '1'; }, 20 + i * 4);
  });
}

init();