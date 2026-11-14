import * as k from "../../iso/iso-kit";
import * as G from "../../iso/lathe.mjs";
import { pathOf, type Plan, type Point3, type Projection } from "../../iso/iso-kit";
import { BASE_TOP, projectionFor } from "./layout";
import { faceLine, faceRect } from "./face";

/* ------------------------------------------------------------- balance */

const COLUMN: Plan = { x: -9, y: -19, w: 18, d: 18, r: 2 };
const FOOT: Plan = { x: -32, y: -34, w: 64, d: 48, r: 3 };
const STEP: Plan = { x: -23, y: -25, w: 46, d: 30, r: 2 };
const COLUMN_TOP = 116;

const PIVOT: Point3 = [0, -10, 118];
const BEAM_L: Point3 = [-100, -10, 112];
const BEAM_R: Point3 = [100, -10, 118];

const PAN_L_Z = 64;
const PAN_R_Z = 72;
const PAN_R = 25;
const PAN_Y = -10;

const FOOTPRINT = { x: -38, y: -40, w: 84, d: 60, r: 6 };

export const P: Projection = projectionFor([
  [-124, -30, 122],
  [124, -30, 122],
  [0, PAN_Y + PAN_R, PAN_L_Z],
  [0, 40, 0],
]);

const pan = (x: number, z: number) => ({
  disc: G.disc(0, 2.6, PAN_R, G.frameAlong([x, PAN_Y, z], [0, 0, 1]), P),
  rim: k.ring(x, PAN_Y, PAN_R, z + 2.7, P, 44),
  inner: k.ring(x, PAN_Y, PAN_R - 5.2, z + 2.8, P, 44),
  shine: k.ring(x, PAN_Y, PAN_R - 2.4, z + 2.75, P, 44),
  well: k.ring(x, PAN_Y, 7, z + 2.8, P, 24),
});

const wires = (end: Point3, x: number, z: number) =>
  [90, 210, 330]
    .map((angle) => {
      const rad = (angle * Math.PI) / 180;
      return k.segment(
        end,
        [x + Math.cos(rad) * (PAN_R - 2), PAN_Y + Math.sin(rad) * (PAN_R - 2), z + 2.8],
        P,
      );
    })
    .join("");

const WEIGHTS = [0, 1, 2].map((index) => {
  const radius = 13 - index * 1.6;
  const z = PAN_L_Z + 2.8 + index * 5.5;
  return {
    body: G.disc(0, 4.6, radius, G.frameAlong([-100, PAN_Y, z], [0, 0, 1]), P),
    rim: k.ring(-100, PAN_Y, radius, z + 4.6, P, 34),
    grip: k.ring(-100, PAN_Y, radius - 2.2, z + 4.7, P, 26),
  };
});

const TOP_WEIGHT_Z = PAN_L_Z + 2.8 + 2 * 5.5 + 4.6;

export const BALANCE = {
  shadow: k.planOutline(FOOTPRINT, BASE_TOP + 0.12, P, 10),
  foot: k.slabOf(FOOT, BASE_TOP, 8, P, 4, 0.8),
  footTop: k.planOutline(FOOT, BASE_TOP + 8, P, 6),
  step: k.slabOf(STEP, BASE_TOP + 8, 5, P, 4, 0.6),
  stepTop: k.planOutline(STEP, BASE_TOP + 13, P, 6),
  column: k.slabOf(COLUMN, BASE_TOP + 13, COLUMN_TOP - BASE_TOP - 13, P, 4, 0.7),
  columnSeam: k.sideSeam(COLUMN, 58, P, 4) + k.sideSeam(COLUMN, 92, P, 4),
  collar: k.slabOf({ x: -12, y: -22, w: 24, d: 24, r: 2 }, 74, 6, P, 3, 0.6),
  cap: k.slabOf({ x: -13, y: -23, w: 26, d: 26, r: 2 }, COLUMN_TOP - 3, 6, P, 3, 0.5),
  capTop: k.planOutline({ x: -13, y: -23, w: 26, d: 26, r: 2 }, COLUMN_TOP + 3, P, 8),
  pivot: G.disc(0, 10, 7.6, G.frameAlong([0, -16, PIVOT[2]], [0, 1, 0]), P),
  pivotHub: k.sideRing([0, -5.4, PIVOT[2]], 3.4, "y", P, 20),

  beam: pathOf([k.iso(BEAM_L, P), k.iso(BEAM_R, P)]),
  beamShine: pathOf([
    k.iso([BEAM_L[0], BEAM_L[1] - 0.9, BEAM_L[2] + 1.2], P),
    k.iso([BEAM_R[0], BEAM_R[1] - 0.9, BEAM_R[2] + 1.2], P),
  ]),
  capL: G.disc(0, 3.4, 3.6, G.frameAlong([-103, -10, 112], [1, 0, 0]), P),
  capR: G.disc(0, 3.4, 3.6, G.frameAlong([100, -10, 118], [1, 0, 0]), P),

  panL: pan(-100, PAN_L_Z),
  panR: pan(100, PAN_R_Z),
  wiresL: wires(BEAM_L, -100, PAN_L_Z),
  wiresR: wires(BEAM_R, 100, PAN_R_Z),
  weights: WEIGHTS,
  weightKnob: G.disc(0, 2.6, 3.6, G.frameAlong([-100, PAN_Y, TOP_WEIGHT_Z], [0, 0, 1]), P),
  weightKnobRim: k.ring(-100, PAN_Y, 3.6, TOP_WEIGHT_Z + 2.6, P, 20),
  weightKnobCap: k.ring(-100, PAN_Y, 1.6, TOP_WEIGHT_Z + 2.65, P, 14),

  pointer: pathOf([k.iso([0, -1.4, 112.4], P), k.iso([0, -1.4, 82.6], P)]),
  pointerWeight: k.iso([0, -1.4, 82.6], P),
  scale: faceRect(P, -0.94, -13, 82, 13, 108),
  scaleTicks: [86, 90, 94, 98, 102, 106]
    .map((z) => faceLine(P, -0.9, -7.5, z, 7.5, z))
    .join(""),
  scaleZero: faceLine(P, -0.88, -12, 96, 12, 96),
  scaleBand: faceRect(P, -0.86, -1.1, 94, 1.1, 98),
  scaleEdge: faceLine(P, -0.9, -13, 82, 13, 82) + faceLine(P, -0.9, -13, 108, 13, 108),

  bubbleRing: k.ring(92, 42, 6, BASE_TOP + 0.6, P, 26),
  bubble: k.cylinder(92, 42, 3.6, BASE_TOP + 0.3, 0.8, P, 20),
  bubbleShine: k.ring(92, 42, 2, BASE_TOP + 0.95, P, 16),
};

export { PIVOT };
