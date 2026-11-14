import { iso, pathOf, type Point3, type Projection } from "../../iso/iso-kit";

/**
 * Helpers for drawing on a vertical face of a machine: `y` is fixed, `x` runs
 * along the face and `z` up it.
 */
export function faceRect(
  P: Projection,
  y: number,
  x0: number,
  z0: number,
  x1: number,
  z1: number,
) {
  return pathOf(
    [
      [x0, y, z0],
      [x1, y, z0],
      [x1, y, z1],
      [x0, y, z1],
    ].map((point) => iso(point as Point3, P)),
    true,
  );
}

export function faceLine(
  P: Projection,
  y: number,
  x0: number,
  z0: number,
  x1: number,
  z1: number,
) {
  return pathOf(
    [
      [x0, y, z0],
      [x1, y, z1],
    ].map((point) => iso(point as Point3, P)),
  );
}

export function facePoint(P: Projection, y: number, x: number, z: number) {
  return iso([x, y, z], P);
}

/** Rect on a side face of a machine: `x` is fixed, `y` runs along, `z` up. */
export function sideRect(
  P: Projection,
  x: number,
  y0: number,
  z0: number,
  y1: number,
  z1: number,
) {
  return pathOf(
    [
      [x, y0, z0],
      [x, y1, z0],
      [x, y1, z1],
      [x, y0, z1],
    ].map((point) => iso(point as Point3, P)),
    true,
  );
}

export function sideLine(
  P: Projection,
  x: number,
  y0: number,
  z0: number,
  y1: number,
  z1: number,
) {
  return pathOf(
    [
      [x, y0, z0],
      [x, y1, z1],
    ].map((point) => iso(point as Point3, P)),
  );
}
