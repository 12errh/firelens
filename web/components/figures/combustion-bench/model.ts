/**
 * The truth of the bench: gravity, oxygen, and everything the reader is told.
 * Pure numbers, no DOM, no SVG.
 */

export const GRAVITY_MAX = 1;
export const GRAVITY_MIN = 0;
export const OXYGEN_MIN = 21;
export const OXYGEN_MAX = 30;

/** below this the flame is a free sphere */
export const MICRO_G = 0.05;

export const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function smoothstep(a: number, b: number, x: number) {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

/* ----------------------------------------------------------- the flame */

/** 0 = free sphere (microgravity), 1 = tall teardrop (1 g) */
export const teardropOf = (gravity: number) => smoothstep(MICRO_G, 0.8, gravity);

export const shapeName = (gravity: number) => (gravity <= MICRO_G ? "sphere" : "teardrop");

export const readoutOf = (gravity: number, oxygen: number) =>
  `O₂ ${oxygen.toFixed(1)}% · g ${gravity.toFixed(2)} · ${shapeName(gravity)}`;

/** the flame profile, in fractions of its own height: [u, r] */
const TEARDROP: ReadonlyArray<readonly [number, number]> = [
  [0, 0.62],
  [0.125, 0.93],
  [0.25, 1],
  [0.375, 0.92],
  [0.5, 0.78],
  [0.625, 0.6],
  [0.75, 0.4],
  [0.875, 0.2],
  [1, 0],
];

function catmull(u: number) {
  const n = TEARDROP.length;
  const x = clamp(u, 0, 1) * (n - 1);
  const i = Math.min(Math.floor(x), n - 2);
  const f = x - i;
  const r = (a: number, b: number, c: number, d: number) =>
    0.5 *
    (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f);
  const p = (k: number) => TEARDROP[clamp(k, 0, n - 1)]![1];
  return r(p(i - 1), p(i), p(i + 1), p(i + 2));
}

export const sphereProfile = (u: number) => Math.sqrt(Math.max(0, 1 - (2 * u - 1) * (2 * u - 1)));

export const teardropProfile = (u: number) => catmull(u);

/* flame dimensions, world units */
export const FLAME = {
  base: 40.6,
  teardropH: 28,
  teardropR: 28 / 4.4, // 2.2 x taller than wide
  sphereR: 9.5,
  sphereH: 9.5 * 1.85, // slightly flattened
  lift: 4.5, // the sphere leaves the burner and floats
};

export interface FlameShape {
  bottom: number;
  height: number;
  radius: number;
  profile: (u: number) => number;
}

/** the continuous flame: one shape, morphing, never swapped */
export function flameOf(gravity: number): FlameShape {
  const t = teardropOf(gravity);
  const height = lerp(FLAME.sphereH, FLAME.teardropH, t);
  const radius = lerp(FLAME.sphereR, FLAME.teardropR, t);
  const bottom = FLAME.base + (1 - t) * FLAME.lift;
  let peak = 0;
  const blended = (u: number) => {
    const value = lerp(sphereProfile(u), teardropProfile(u), t);
    if (value > peak) peak = value;
    return value;
  };
  for (let i = 0; i <= 32; i += 1) blended(i / 32);
  const scale = peak > 0 ? 1 / peak : 1;
  return { bottom, height, radius, profile: (u: number) => blended(u) * scale };
}

/* ------------------------------------------------------- the controls */

export const KNOB_FROM = Math.PI * 1.5; // the pointer starts at 1.00 g
export const KNOB_SPAN = Math.PI * 0.5; // and sweeps a quarter turn to 0.00 g

/** the pointer angle on the quarter-circle scale */
export const pointerAngleOf = (gravity: number) => KNOB_FROM + (1 - clamp(gravity, 0, 1)) * KNOB_SPAN;

/** read a gravity back out of a pointer angle */
export const gravityOfPointer = (angle: number) => clamp(1 - (angle - KNOB_FROM) / KNOB_SPAN, 0, 1);

export const OXY_FROM = (-120 * Math.PI) / 180;
export const OXY_SPAN = (240 * Math.PI) / 180;

/** the needle angle on the oxygen dial */
export const needleAngleOf = (oxygen: number) =>
  OXY_FROM + ((clamp(oxygen, OXYGEN_MIN, OXYGEN_MAX) - OXYGEN_MIN) / (OXYGEN_MAX - OXYGEN_MIN)) * OXY_SPAN;

/** read an oxygen back out of a needle angle */
export const oxygenOfNeedle = (angle: number) =>
  OXYGEN_MIN + ((angle - OXY_FROM) / OXY_SPAN) * (OXYGEN_MAX - OXYGEN_MIN);

export const REST_GRAVITY = 1;
export const REST_OXYGEN = 21;
export const REST_READOUT = readoutOf(REST_GRAVITY, REST_OXYGEN);
