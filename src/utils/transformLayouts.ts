import { ElementData } from '../data/elements';
import { LayoutMode, Transform3D } from '../types';

/**
 * Calculates 3D coordinates and rotation angles for an element given a layout mode.
 */
export function calculateTransform(
  element: ElementData,
  index: number,
  total: number,
  mode: LayoutMode
): Transform3D {
  switch (mode) {
    case 'grid': {
      // Periodic Table Grid spacing
      const spacingX = 136;
      const spacingY = 166;

      const colNorm = element.gridCol - 9.5; // range roughly -8.5 to +8.5
      const rowNorm = element.gridRow - 5.5; // range roughly -4.5 to +4.5

      const x = colNorm * spacingX;
      // Slight vertical adjustment: Lanthanides and Actinides separated cleanly
      let y = rowNorm * spacingY;
      if (element.gridRow >= 9) {
        y += 28; // subtle gap for f-block series
      }

      // Parallax 3D Depth enhancement:
      // Z-offset is calculated based on column curvature and row position
      // Creates an elegant concave amphitheater / curved display feel
      const zCurvature = -Math.pow(colNorm, 2) * 2.8 - Math.pow(rowNorm, 2) * 2.2;
      // Stagger alternating columns subtly for tactile layered depth
      const zStagger = (element.gridCol % 2 === 0 ? 8 : -8);
      const z = zCurvature + zStagger;

      // Subtle rotation to face slightly inward toward camera for true 3D parallax
      const rx = rowNorm * 1.5; // degrees tilt on X axis
      const ry = -colNorm * 1.3; // degrees tilt on Y axis

      return {
        x,
        y,
        z,
        rx,
        ry,
        rz: 0,
      };
    }

    case 'sphere': {
      // Fibonacci sphere distribution for 118 elements
      const phi = Math.acos(-1 + (2 * index) / total);
      const theta = Math.sqrt(total * Math.PI) * phi;
      const radius = 880;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = -radius * Math.cos(phi); // negative so lighter elements sit at top
      const z = radius * Math.sin(theta) * Math.sin(phi);

      // Rotate card so its normal faces radially outward from sphere origin
      const ry = -(theta * (180 / Math.PI)) + 90;
      const rx = (phi * (180 / Math.PI)) - 90;

      return {
        x,
        y,
        z,
        rx,
        ry,
        rz: 0,
      };
    }

    case 'helix': {
      // Double/single cylindrical helix rising vertically
      const angle = index * 0.175 + Math.PI;
      const radius = 920;
      const y = -(index * 13) + 760; // climb from bottom to top

      const x = radius * Math.sin(angle);
      const z = radius * Math.cos(angle);

      const ry = -(angle * (180 / Math.PI));

      return {
        x,
        y,
        z,
        rx: 0,
        ry,
        rz: 0,
      };
    }

    case 'table': {
      // Classic flat planar table with no Z curvature (for flat comparison)
      const spacingX = 136;
      const spacingY = 166;
      const x = (element.gridCol - 9.5) * spacingX;
      let y = (element.gridRow - 5.5) * spacingY;
      if (element.gridRow >= 9) {
        y += 28;
      }

      return {
        x,
        y,
        z: 0,
        rx: 0,
        ry: 0,
        rz: 0,
      };
    }
  }
}

/**
 * Returns the CSS transform string for an element
 */
export function getTransformString(t: Transform3D): string {
  return `translate3d(${t.x.toFixed(2)}px, ${t.y.toFixed(2)}px, ${t.z.toFixed(2)}px) rotateX(${t.rx.toFixed(2)}deg) rotateY(${t.ry.toFixed(2)}deg) rotateZ(${t.rz.toFixed(2)}deg)`;
}
