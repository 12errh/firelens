import { iso, onTop, pathOf, type Flat } from "../../iso/iso-kit";
import { AZIMUTH, CH_X, CH_Y, ELEVATION, KNOB_TOP, KNOB_X, KNOB_Y, P } from "./view";
import { flameOf as flameShapeOf, pointerAngleOf, type FlameShape } from "./model";

const A = (AZIMUTH * Math.PI) / 180;
const E = (ELEVATION * Math.PI) / 180;
const TAN_E = Math.tan(E);
const SAMPLES = 44;

interface Sampled {
  z: number[];
  r: number[];
}

function sample(shape: FlameShape, breath: number): Sampled {
  const z: number[] = [];
  const r: number[] = [];
  const scale = 1 + 0.015 * breath;
  for (let i = 0; i <= SAMPLES; i += 1) {
    const u = i / SAMPLES;
    z.push(shape.bottom + u * shape.height * scale);
    r.push(shape.radius * shape.profile(u) * scale);
  }
  return { z, r };
}

/** the silhouette of a surface of revolution about the vertical axis */
function silhouette(shape: FlameShape, breath: number): string {
  const { z, r } = sample(shape, breath);
  const left: Flat[] = [];
  const right: Flat[] = [];
  let half0 = 0;
  for (let i = 0; i <= SAMPLES; i += 1) {
    const i0 = Math.max(i - 1, 0);
    const i1 = Math.min(i + 1, SAMPLES);
    const dz = z[i1] - z[i0];
    const dr = (r[i1] - r[i0]) / (dz === 0 ? 1e-6 : dz);
    const half = Math.acos(Math.max(-1, Math.min(1, dr * TAN_E)));
    if (i === 0) half0 = half;
    const l = iso([CH_X + r[i] * Math.cos(A + half), CH_Y + r[i] * Math.sin(A + half), z[i]], P);
    const q = iso([CH_X + r[i] * Math.cos(A - half), CH_Y + r[i] * Math.sin(A - half), z[i]], P);
    left.push(l);
    right.push(q);
  }
  const rim: Flat[] = [];
  for (let i = 1; i < 14; i += 1) {
    const angle = A - half0 + ((2 * half0 * i) / 14);
    rim.push(iso([CH_X + r[0] * Math.cos(angle), CH_Y + r[0] * Math.sin(angle), z[0]], P));
  }
  const pts = [...left, ...right.slice().reverse(), ...rim];
  return pathOf(pts, true);
}

/** the lit subject: one shape that morphs from a teardrop to a sphere */
export function flameOf(gravity: number, breath = 0): { outer: string; core: string } {
  const shape = flameShapeOf(gravity);
  const core: FlameShape = {
    bottom: shape.bottom + shape.height * 0.14,
    height: shape.height * 0.66,
    radius: shape.radius * 0.46,
    profile: shape.profile,
  };
  return { outer: silhouette(shape, breath), core: silhouette(core, breath) };
}

/** the pointer line engraved on the knob's face */
export function pointerPath(gravity: number): string {
  const angle = pointerAngleOf(gravity);
  const dx = Math.sin(angle);
  const dy = -Math.cos(angle);
  const from: [number, number] = [KNOB_X + dx * 1.5, KNOB_Y + dy * 1.5];
  const to: [number, number] = [KNOB_X + dx * 8.4, KNOB_Y + dy * 8.4];
  return onTop([from, to], KNOB_TOP, P);
}

export function pointerTip(gravity: number): Flat {
  const angle = pointerAngleOf(gravity);
  return iso([KNOB_X + Math.sin(angle) * 8.4, KNOB_Y - Math.cos(angle) * 8.4, KNOB_TOP], P);
}
