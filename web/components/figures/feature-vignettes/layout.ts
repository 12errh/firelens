import { fitProjection, iso, type Point3, type Projection } from "../../iso/iso-kit";

/**
 * Four small instruments, one per feature card. They share a camera, a
 * footprint and a base so the set reads as one bench photographed four times.
 */
export const VW = 340;
export const VH = 230;
export const AZIMUTH = 52;
export const ELEVATION = 32;

export const BASE = { x: -132, y: -56, w: 264, d: 112, r: 10 };
export const BASE_TOP = 10;
export const FOOT_BOTTOM = -10;

export const BASE_CORNERS: Point3[] = [
  [BASE.x, BASE.y, FOOT_BOTTOM],
  [BASE.x + BASE.w, BASE.y, FOOT_BOTTOM],
  [BASE.x, BASE.y + BASE.d, FOOT_BOTTOM],
  [BASE.x + BASE.w, BASE.y + BASE.d, FOOT_BOTTOM],
];

/** Fit the shared base plus this instrument's tallest points into the card. */
export function projectionFor(extents: Point3[]): Projection {
  return fitProjection([...BASE_CORNERS, ...extents], VW, VH, {
    pad: 6,
    azimuth: AZIMUTH,
    elevation: ELEVATION,
  });
}

export function project(P: Projection, point: Point3) {
  return iso(point, P);
}

/** screen delta for a movement of `dx, dy, dz` world units, as CSS px */
export function screenDelta(P: Projection, delta: Point3): [number, number] {
  const [x0, y0] = iso([0, 0, 0], P);
  const [x1, y1] = iso(delta, P);
  return [x1 - x0, y1 - y0];
}

export function px([x, y]: [number, number]) {
  return `${x.toFixed(2)}px ${y.toFixed(2)}px`;
}
