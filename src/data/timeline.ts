import { ElementData } from './elements';

export interface TimelineEra {
  id: string;
  name: string;
  year: number;
  periodLabel: string;
  description: string;
  keyHighlight: string;
}

export const TIMELINE_ERAS: TimelineEra[] = [
  {
    id: 'antiquity',
    name: 'Antiquity & Alchemy',
    year: 1500,
    periodLabel: 'Prehistoric – 1500',
    description:
      'Ancient civilizations harnessed native metals and minerals for tools, currency, and alchemy.',
    keyHighlight: '13 elements known: Gold, Copper, Silver, Lead, Tin, Iron, Mercury, Carbon, Sulfur...',
  },
  {
    id: 'enlightenment',
    name: 'Chemical Revolution',
    year: 1790,
    periodLabel: '1501 – 1799',
    description:
      'The pneumatic revolution. Lavoisier, Priestley, Cavendish, and Scheele isolated gases and overthrew phlogiston.',
    keyHighlight: 'Discovery of Oxygen, Hydrogen, Nitrogen, Chlorine, Uranium, and Titanium.',
  },
  {
    id: 'industrial',
    name: 'Electrochemical Dawn',
    year: 1850,
    periodLabel: '1800 – 1868',
    description:
      'Humphry Davy used the voltaic pile to isolate reactive alkali metals, while Berzelius introduced modern symbols.',
    keyHighlight: 'Isolation of Sodium, Potassium, Calcium, Magnesium, Silicon, and Iodine.',
  },
  {
    id: 'mendeleev',
    name: "Mendeleev's Periodic Law",
    year: 1869,
    periodLabel: '1869 – 1899',
    description:
      'Dmitri Mendeleev formulated the Periodic Law with 63 known elements, predicting undiscovered elements like Gallium & Germanium.',
    keyHighlight: 'Noble gases isolated by Ramsay; discovery of Radioactivity and Radium by the Curies.',
  },
  {
    id: 'quantum',
    name: 'Atomic & Quantum Era',
    year: 1940,
    periodLabel: '1900 – 1944',
    description:
      'Moseley mapped atomic numbers using X-ray spectra; quantum mechanics explained electron orbitals and subshells.',
    keyHighlight: 'First cyclotron syntheses: Technetium, Francium, Neptunium, and Plutonium.',
  },
  {
    id: 'cold-war',
    name: 'The Actinide Synthesis',
    year: 1999,
    periodLabel: '1945 – 1999',
    description:
      'Glenn Seaborg restructured the periodic table with the actinide series. Particle accelerators produced transuranics.',
    keyHighlight: 'Americium, Californium, Einsteinium up to Copernicium created in particle colliders.',
  },
  {
    id: 'superheavy',
    name: 'Modern Superheavy Frontier',
    year: 2026,
    periodLabel: '2000 – Present',
    description:
      'International teams in Dubna, RIKEN, and Oak Ridge synthesized elements 113–118, completely filling Period 7.',
    keyHighlight: 'Nihonium, Moscovium, Tennessine, and Oganesson complete the known periodic table.',
  },
];

/**
 * Parses any element year (number or string like "Ancient" or "1000 BC")
 * into a comparable integer calendar year.
 */
export function getElementDiscoveryYear(element: ElementData): number {
  const raw = element.year;
  if (raw === undefined || raw === null) return 2026;
  if (typeof raw === 'number') return raw;

  const str = String(raw).toLowerCase().trim();
  if (str.includes('ancient') || str.includes('antiquity') || str.includes('prehistoric')) {
    return 0; // Antiquity
  }
  if (str.includes('bc')) {
    const num = parseInt(str.replace(/\D/g, ''), 10);
    return isNaN(num) ? 0 : -num;
  }
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? 2026 : parsed;
}

/**
 * Checks if an element was discovered on or before a given historical year.
 */
export function isElementDiscoveredByYear(element: ElementData, targetYear: number): boolean {
  const discYear = getElementDiscoveryYear(element);
  return discYear <= targetYear;
}

/**
 * Formats a discovery year for clean badge display.
 */
export function formatDiscoveryYear(element: ElementData): string {
  if (typeof element.year === 'string' && (element.year === 'Ancient' || element.year.includes('BC'))) {
    return element.year;
  }
  const yr = getElementDiscoveryYear(element);
  if (yr <= 0) return 'Ancient';
  return String(yr);
}
