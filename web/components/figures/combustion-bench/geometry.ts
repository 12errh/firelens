import * as k from "../../iso/iso-kit";
import * as G from "../../iso/lathe.mjs";
import type { Plane, Point3 } from "../../iso/iso-kit";
import {
  BASE,
  BASE_BOTTOM,
  BASE_H,
  BELL_BASE,
  BELL_R,
  BELL_TOP,
  BOSS_H,
  BOSS_R,
  BOTTLE,
  BOTTLE_BASE,
  BOTTLE_BODY_TOP,
  BOTTLE_NECK_TOP,
  BOTTLE_R,
  BOTTLE_VALVE_TOP,
  CAM_BODY_H,
  CAM_BODY_Z,
  CAR_X,
  CAR_Z,
  CH_X,
  CH_Y,
  CRADLE,
  DIAL_FACE,
  DIAL_R,
  DIAL_STEM_X,
  DIAL_STEM_Y,
  DIAL_X,
  DIAL_Y,
  DIAL_Z,
  FACE_NORMAL,
  FLANGE_R,
  FLANGE_TOP,
  FOOT_BOTTOM,
  FOOT_FLANGE_TOP,
  INLET_OUT,
  INLET_X,
  INLET_Z,
  KNOB_H,
  KNOB_R,
  KNOB_TOP,
  KNOB_X,
  KNOB_Y,
  LABEL,
  LABEL_TOP,
  LENS_Z,
  P,
  PED_COL_R,
  PED_COL_TOP,
  PED_FOOT_R,
  PED_FOOT_TOP,
  PED_TOP,
  PED_TOP_R,
  POST_COLLAR_R,
  POST_L,
  POST_R,
  POST_RADIUS,
  RAIL_D,
  RAIL_H,
  RAIL_Y,
  RAIL_Z,
  REC,
  REC_H,
  RULER,
  RULER_TOP,
  SAMPLE_COL_TOP,
  SAMPLE_CUP_R,
  SAMPLE_CUP_TOP,
  SCALE_R0,
  SCALE_R1,
  VENT_OUT,
  VENT_X,
  VENT_Z,
} from "./view";

const { cameraOf } = k;

/* ===================================================================== */
/* base                                                                    */
/* ===================================================================== */

/** the deck: a rounded rectangle whose front edge is one long soft radius */
export function baseRing(): Plane[] {
  const { x, y, w, d } = BASE;
  const back = 9;
  const front = 34;
  const pts: Plane[] = [];
  const arc = (cx: number, cy: number, r: number, a0: number, a1: number, steps: number) => {
    for (let i = 0; i <= steps; i += 1) {
      const a = a0 + ((a1 - a0) * i) / steps;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  arc(x + front, y + front, front, Math.PI / 2, Math.PI, 10);
  arc(x + back, y + d - back, back, Math.PI, Math.PI * 1.5, 5);
  arc(x + w - back, y + d - back, back, Math.PI * 1.5, Math.PI * 2, 5);
  arc(x + w - front, y + front, front, 0, Math.PI / 2, 10);
  return pts;
}

const FOOT_POINTS = k.corners(BASE, 12);
const SCREW_POINTS = k.corners(BASE, 12);

export const BASE_ART = {
  halo: k.haloOf(BASE, BASE_BOTTOM - 6, 12, P),
  slab: k.extrude(baseRing(), BASE_BOTTOM, BASE_H, P, { convex: true, bevel: 1.4 }),
  groove: k.planOutline(k.insetPlan({ ...BASE, r: 0 }, 5), BASE_BOTTOM + BASE_H, P, 10),
  feet: FOOT_POINTS.map(([x, y]) => ({
    pad: k.cylinder(x, y, 8.6, FOOT_BOTTOM, FOOT_FLANGE_TOP - FOOT_BOTTOM, P, 28),
    neck: k.cylinder(x, y, 5.2, FOOT_FLANGE_TOP, BASE_BOTTOM - FOOT_FLANGE_TOP, P, 24),
  })),
  screwRings: SCREW_POINTS.map(([x, y]) => k.ring(x, y, 2.3, BASE_BOTTOM + BASE_H, P, 14)).join(""),
  screws: k.pointsAt(SCREW_POINTS.map(([x, y]) => [x, y, BASE_BOTTOM + BASE_H] as Point3), P),
  ruler: k.slabOf(RULER, 0, RULER_TOP, P, 3, 0.3),
  rulerTicks: k.topTicks(RULER.x + 4, RULER.x + RULER.w - 4, 5, 5, RULER.y + 0.6, RULER_TOP, [2.4, 4.2], P, "x"),
  rulerZero: k.lineOnTop([RULER.x + 4, RULER.y + 0.6], [RULER.x + 4, RULER.y + 5.6], RULER_TOP, P),
  label: k.slabOf(LABEL, 0, LABEL_TOP, P, 3, 0.3),
  labelRule: [
    k.lineOnTop([LABEL.x + 4, LABEL.y + 4], [LABEL.x + LABEL.w - 8, LABEL.y + 4], LABEL_TOP, P),
    k.lineOnTop([LABEL.x + 4, LABEL.y + 7.6], [LABEL.x + LABEL.w - 14, LABEL.y + 7.6], LABEL_TOP, P),
    k.lineOnTop([LABEL.x + 4, LABEL.y + 11], [LABEL.x + LABEL.w - 20, LABEL.y + 11], LABEL_TOP, P),
  ].join(""),
  labelScrews: k.pointsAt(k.corners(LABEL, 3.6).map(([x, y]) => [x, y, LABEL_TOP] as Point3), P),
};

/* ===================================================================== */
/* structure: posts, rail, end stop, cable clip                            */
/* ===================================================================== */

const post = (x: number) => ({
  foot: k.cylinder(x, RAIL_Y, POST_COLLAR_R, 0, 5, P, 28),
  column: k.cylinder(x, RAIL_Y, POST_RADIUS, 5, RAIL_Z - 1, P, 24),
  seam: k.sideArc(x, RAIL_Y, POST_RADIUS, 18, P, 16) + k.sideArc(x, RAIL_Y, POST_RADIUS, 36, P, 16),
  collar: k.cylinder(x, RAIL_Y, POST_COLLAR_R * 0.72, RAIL_Z - 6, 6, P, 24),
});

export const STRUCTURE_ART = {
  postL: post(POST_L),
  postR: post(POST_R),
  rail: k.slabOf(
    { x: POST_L - 6, y: RAIL_Y - RAIL_D / 2, w: POST_R - POST_L + 12, d: RAIL_D, r: 1 },
    RAIL_Z,
    RAIL_H,
    P,
    3,
    0.5,
  ),
  railEdge: k.lineOnTop(
    [POST_L - 6, RAIL_Y - RAIL_D / 2 + 1.6],
    [POST_R + 6, RAIL_Y - RAIL_D / 2 + 1.6],
    RAIL_Z + RAIL_H,
    P,
  ),
  stop: k.slabOf(
    { x: POST_R + 1, y: RAIL_Y - RAIL_D / 2 - 3, w: 8, d: RAIL_D + 6, r: 1.6 },
    RAIL_Z + RAIL_H,
    8,
    P,
    3,
    0.4,
  ),
  stopScrews: k.pointsAt(
    [
      [POST_R + 5, RAIL_Y - RAIL_D / 2, RAIL_Z + RAIL_H + 8],
      [POST_R + 5, RAIL_Y + RAIL_D / 2, RAIL_Z + RAIL_H + 8],
    ] as Point3[],
    P,
  ),
  clip: k.slabOf({ x: 33, y: -53.5, w: 14, d: 9, r: 1.6 }, 0, 3.4, P, 3, 0.4),
  clipScrew: k.cylinder(40, -55.6, 2.2, 3.4, 2.4, P, 18),
  clipRing: k.ring(40, -55.6, 3.1, 5.8, P, 14),
};

/* ===================================================================== */
/* the gas cylinder in its cradle                                          */
/* ===================================================================== */

const BOTTLE_FRAME = G.frameAlong([BOTTLE.x, BOTTLE.y, 0], [0, 0, 1]);

const bottleProfile = [
  [BOTTLE_BASE, BOTTLE_R],
  [BOTTLE_BODY_TOP - 3, BOTTLE_R],
  [BOTTLE_BODY_TOP, BOTTLE_R - 0.3, 1],
  [BOTTLE_BODY_TOP + 4, 9.0, 1],
  [BOTTLE_BODY_TOP + 7, 6.6, 1],
  [BOTTLE_BODY_TOP + 9.5, 4.0, 1],
  [BOTTLE_BODY_TOP + 11, 3.0, 1],
  [BOTTLE_NECK_TOP, 3.0],
  [BOTTLE_NECK_TOP, 4.6],
];

export const BOTTLE_ART = {
  cradle: k.slabOf(CRADLE, 0, 4, P, 4, 0.6),
  cradleArmA: k.slabOf({ x: CRADLE.x + 1, y: CRADLE.y + 3, w: 5, d: CRADLE.d - 6, r: 1.5 }, 4, 22, P, 3, 0.4),
  cradleArmB: k.slabOf(
    { x: CRADLE.x + CRADLE.w - 6, y: CRADLE.y + 3, w: 5, d: CRADLE.d - 6, r: 1.5 },
    4,
    22,
    P,
    3,
    0.4,
  ),
  body: G.solidOf(bottleProfile, BOTTLE_FRAME, P),
  seam: G.arcOf(BOTTLE_FRAME, BOTTLE_BODY_TOP - 9, BOTTLE_R, P, { slope: 0 }),
  valve: k.slabOf({ x: BOTTLE.x - 6, y: BOTTLE.y - 5, w: 12, d: 10, r: 1.6 }, BOTTLE_NECK_TOP, 9, P, 3, 0.4),
  valveCap: k.cylinder(BOTTLE.x, BOTTLE.y, 3.6, BOTTLE_VALVE_TOP - 2, 5, P, 20),
  valveKnurl: k.knurl(BOTTLE.x, BOTTLE.y, 3.6, BOTTLE_VALVE_TOP - 1.4, BOTTLE_VALVE_TOP + 3, 22, P, 0.5),
  gauge: k.cylinder(BOTTLE.x - 9.5, BOTTLE.y, 4.6, BOTTLE_NECK_TOP + 3, 3.4, P, 24),
  outlet: G.disc(-5, 1, 3.2, G.frameAlong([BOTTLE.x + 5, BOTTLE.y + 1, 57], [1, 0, 0]), P),
};

/* ===================================================================== */
/* the combustion chamber                                                   */
/* ===================================================================== */

const CH_FRAME = G.frameAlong([CH_X, CH_Y, 0], [0, 0, 1]);
const INLET_FRAME = G.frameAlong([INLET_X, CH_Y, INLET_Z], [-1, 0, 0]);
const VENT_FRAME = G.frameAlong([VENT_X, CH_Y, VENT_Z], [1, 0, 0]);

const flangeProfile = [
  [PED_TOP, FLANGE_R],
  [FLANGE_TOP - 2.6, FLANGE_R],
  [FLANGE_TOP - 2.2, FLANGE_R - 1.2, 1],
  [FLANGE_TOP - 0.6, FLANGE_R - 1.2, 1],
  [FLANGE_TOP, FLANGE_R - 2.4],
];

const bellProfile = [
  [BELL_BASE, BELL_R - 1.4],
  [BELL_BASE + 1.4, BELL_R, 1],
  [BELL_BASE + 12, BELL_R + 0.25, 1],
  [BELL_BASE + 26, BELL_R + 0.45, 1],
  [BELL_BASE + 35, BELL_R + 0.4, 1],
  [BELL_BASE + 39, BELL_R - 0.4, 1],
  [BELL_BASE + 42, BELL_R - 2.4, 1],
  [BELL_BASE + 44, BELL_R - 6.4, 1],
  [BELL_TOP - 1, 3.6, 1],
  [BELL_TOP, 1.4, 1],
];

export const CHAMBER_ART = {
  pedestalFoot: k.cylinder(CH_X, CH_Y, PED_FOOT_R, 0, PED_FOOT_TOP, P, 56, 0.9),
  pedestalFootRing: k.ring(CH_X, CH_Y, PED_FOOT_R - 3, PED_FOOT_TOP, P, 48),
  pedestalColumn: k.cylinder(CH_X, CH_Y, PED_COL_R, PED_FOOT_TOP, PED_COL_TOP - PED_FOOT_TOP, P, 36),
  pedestalSeam: k.sideArc(CH_X, CH_Y, PED_COL_R, 11, P, 24),
  pedestalTop: k.cylinder(CH_X, CH_Y, PED_TOP_R, PED_COL_TOP, PED_TOP - PED_COL_TOP, P, 44, 0.7),
  flange: G.solidOf(flangeProfile, CH_FRAME, P),
  flangeDots: G.dotsOf(CH_FRAME, FLANGE_TOP - 0.02, FLANGE_R - 4.4, 10, P, { phase: 0.3, all: true }),
  sampleColumn: k.cylinder(CH_X, CH_Y, 5.4, FLANGE_TOP, SAMPLE_COL_TOP - FLANGE_TOP, P, 24),
  sampleCup: G.solidOf(
    [
      [SAMPLE_COL_TOP, SAMPLE_CUP_R],
      [SAMPLE_CUP_TOP - 1.8, SAMPLE_CUP_R + 0.7, 1],
      [SAMPLE_CUP_TOP - 0.4, SAMPLE_CUP_R + 0.6, 1],
      [SAMPLE_CUP_TOP, SAMPLE_CUP_R - 0.6],
    ],
    CH_FRAME,
    P,
  ),
  retainer:
    G.circleOf(CH_FRAME, SAMPLE_COL_TOP + 1.1, SAMPLE_CUP_R + 2, P, 28) +
    G.circleOf(CH_FRAME, SAMPLE_COL_TOP + 2.5, SAMPLE_CUP_R + 2, P, 28),
  sample: k.cylinder(CH_X, CH_Y, SAMPLE_CUP_R - 1.2, SAMPLE_COL_TOP + 0.6, 1.6, P, 24),
  bell: G.solidOf(bellProfile, CH_FRAME, P),
  bellHoopA:
    G.circleOf(CH_FRAME, BELL_BASE + 4, BELL_R + 1.5, P, 48) +
    G.circleOf(CH_FRAME, BELL_BASE + 6.4, BELL_R + 1.5, P, 48),
  bellHoopB:
    G.circleOf(CH_FRAME, BELL_BASE + 36.4, BELL_R + 1.5, P, 48) +
    G.circleOf(CH_FRAME, BELL_BASE + 38.8, BELL_R + 1.1, P, 48),
  bellCap:
    G.circleOf(CH_FRAME, BELL_BASE + 42.6, BELL_R - 6.6, P, 40) +
    G.circleOf(CH_FRAME, BELL_BASE + 44.2, BELL_R - 5.4, P, 40),
  bellShine: [0.42, 1.36]
    .map((angle) =>
      k.segment(
        [CH_X + (BELL_R + 0.2) * Math.cos(angle), CH_Y + (BELL_R + 0.2) * Math.sin(angle), BELL_BASE + 6],
        [CH_X + (BELL_R + 0.2) * Math.cos(angle), CH_Y + (BELL_R + 0.2) * Math.sin(angle), BELL_BASE + 33],
        P,
      ),
    )
    .join(""),
  inletBoss: G.disc(-4.2, 4.2, 4.6, INLET_FRAME, P),
  inletCollar:
    G.circleOf(INLET_FRAME, 4.2, 6.8, P, 32) + G.circleOf(INLET_FRAME, 7.4, 6.8, P, 32),
  ventBoss: G.disc(-4.4, 4.4, 3.6, VENT_FRAME, P),
  ventCap: G.disc(4.4, 6.6, 4.4, VENT_FRAME, P),
};

/* ===================================================================== */
/* the camera carriage                                                     */
/* ===================================================================== */

const LENS_FRAME = G.frameAlong([CAR_X, RAIL_Y + 5, LENS_Z], [0, 1, 0]);

export const CAMERA_ART = {
  bushingA: k.slabOf({ x: CAR_X - 13, y: RAIL_Y - 6.5, w: 8, d: 13, r: 1.4 }, CAR_Z, 8, P, 3, 0.4),
  bushingB: k.slabOf({ x: CAR_X + 5, y: RAIL_Y - 6.5, w: 8, d: 13, r: 1.4 }, CAR_Z, 8, P, 3, 0.4),
  saddle: k.slabOf({ x: CAR_X - 17, y: RAIL_Y - 8, w: 34, d: 16, r: 2 }, CAR_Z + 8, 5, P, 4, 0.5),
  bracket: k.slabOf({ x: CAR_X - 6, y: RAIL_Y - 5, w: 11, d: 9, r: 1.6 }, CAR_Z + 13, 8, P, 3, 0.4),
  brace: k.slabOf({ x: CAR_X - 3, y: RAIL_Y + 6, w: 8, d: 7, r: 1.2 }, CAR_Z + 8, 5, P, 3, 0.3),
  braceB: k.slabOf({ x: CAR_X - 13, y: RAIL_Y + 6, w: 8, d: 7, r: 1.2 }, CAR_Z + 8, 5, P, 3, 0.3),
  body: k.slabOf({ x: CAR_X - 13, y: RAIL_Y - 2, w: 22, d: 14, r: 2.4 }, CAM_BODY_Z, CAM_BODY_H, P, 4, 0.6),
  bodySeam: k.sideSeam({ x: CAR_X - 13, y: RAIL_Y - 2, w: 22, d: 14, r: 2.4 }, CAM_BODY_Z + 6, P, 4),
  bodyScrews: k.pointsAt(
    [
      [CAR_X - 10, RAIL_Y - 0.6, CAM_BODY_Z + CAM_BODY_H],
      [CAR_X + 4, RAIL_Y - 0.6, CAM_BODY_Z + CAM_BODY_H],
    ] as Point3[],
    P,
  ),
  barrel: G.solidOf(
    [
      [0, 5.4],
      [1.2, 5.4],
      [2.6, 6.4, 1],
      [9.4, 6.4, 1],
      [10.6, 5.4, 1],
      [11.2, 5.4],
    ],
    LENS_FRAME,
    P,
  ),
  hood: G.disc(9.8, 12.6, 7.2, LENS_FRAME, P),
  glass: G.disc(12.4, 12.9, 5.4, LENS_FRAME, P),
  socket: G.disc(-0.4, 2.6, 3, G.frameAlong([CAR_X, RAIL_Y - 2, CAM_BODY_Z + 5], [0, -1, 0]), P),
};

/* ===================================================================== */
/* the recorder                                                            */
/* ===================================================================== */

export const RECORDER_ART = {
  box: k.slabOf(REC, 0, REC_H, P, 4, 0.9),
  seam: k.sideSeam(REC, REC_H - 5, P, 4),
  panel: k.slabOf({ x: REC.x + 4, y: REC.y + 4, w: REC.w - 8, d: REC.d - 8, r: 1.2 }, REC_H, 1.1, P, 3, 0.3),
  lamps: k.pointsAt(
    [
      [REC.x + 8.5, REC.y + 9, REC_H + 1.1],
      [REC.x + 13.5, REC.y + 9, REC_H + 1.1],
      [REC.x + 18.5, REC.y + 9, REC_H + 1.1],
    ] as Point3[],
    P,
  ),
  lampRings: k.ring(REC.x + 8.5, REC.y + 9, 2.2, REC_H + 1.1, P, 14),
  ticks: k.topTicks(REC.x + 6, REC.x + REC.w - 6, 3, 4, REC.y + REC.d - 7, REC_H + 1.1, [1.8, 3.2], P, "x"),
  socket: G.disc(-0.4, 4.4, 3.2, G.frameAlong([REC.x, REC.y + 10, 11.5], [-1, 0, 0]), P),
};

/* ===================================================================== */
/* controls: gravity knob with its quarter scale, oxygen dial              */
/* ===================================================================== */

export const KNOB_FROM = Math.PI * 1.5;
export const KNOB_SPAN = Math.PI * 0.5;

function sectorRing(cx: number, cy: number, r0: number, r1: number, from: number, span: number, steps = 28): Plane[] {
  const pts: Plane[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const a = from + (span * i) / steps;
    pts.push([cx + Math.sin(a) * r1, cy - Math.cos(a) * r1]);
  }
  for (let i = steps; i >= 0; i -= 1) {
    const a = from + (span * i) / steps;
    pts.push([cx + Math.sin(a) * r0, cy - Math.cos(a) * r0]);
  }
  return pts;
}

export const SCALE_RING = sectorRing(KNOB_X, KNOB_Y, SCALE_R0, SCALE_R1, KNOB_FROM, KNOB_SPAN);
const ZERO_ANGLE = KNOB_FROM + KNOB_SPAN;
const ZERO_DIR: Plane = [KNOB_X + Math.sin(ZERO_ANGLE), KNOB_Y - Math.cos(ZERO_ANGLE)];

export const KNOB_ART = {
  pad: k.cylinder(KNOB_X, KNOB_Y, 16, 0, 1.3, P, 48, 0.4),
  plate: k.extrude(SCALE_RING, 1.3, 1.5, P, { convex: false, bevel: 0.3 }),
  ticks: k.radialTicks(KNOB_X, KNOB_Y, SCALE_R1 - 0.6, 18, 3, 2.8, [3.4, 5.4], P, KNOB_FROM, KNOB_SPAN),
  zero: k.lineOnTop(
    [ZERO_DIR[0], ZERO_DIR[1]],
    [
      KNOB_X + Math.sin(ZERO_ANGLE) * (SCALE_R1 - 7),
      KNOB_Y - Math.cos(ZERO_ANGLE) * (SCALE_R1 - 7),
    ],
    2.2,
    P,
  ),
  boss: k.cylinder(KNOB_X, KNOB_Y, BOSS_R, 1.3, BOSS_H - 1.3, P, 40, 0.5),
  knob: k.cylinder(KNOB_X, KNOB_Y, KNOB_R, BOSS_H, KNOB_H, P, 40, 0.6),
  knurl: k.knurl(KNOB_X, KNOB_Y, KNOB_R, BOSS_H + 0.7, KNOB_TOP - 0.7, 40, P, 0.5),
  knobRing: k.ring(KNOB_X, KNOB_Y, KNOB_R - 1.6, KNOB_TOP, P, 36),
};

/* the oxygen dial: a round gauge on a stem, its face square to the eye */

const DIAL_FRAME = G.frameAlong([DIAL_X, DIAL_Y, DIAL_Z], FACE_NORMAL);
const DIAL_ORIGIN = k.iso([DIAL_X, DIAL_Y, DIAL_Z], P);
const { k: SCALE, cosE } = cameraOf(P);

export function facePoint(a: number, b: number): [number, number] {
  return [DIAL_ORIGIN[0] + a * SCALE, DIAL_ORIGIN[1] - b * cosE * SCALE];
}

function faceLine(a0: number, b0: number, a1: number, b1: number) {
  const p = facePoint(a0, b0);
  const q = facePoint(a1, b1);
  const r = (n: number) => Math.round(n * 10) / 10;
  return `M${r(p[0])} ${r(p[1])}L${r(q[0])} ${r(q[1])}`;
}

export const OXY_FROM = (-120 * Math.PI) / 180;
export const OXY_SPAN = (240 * Math.PI) / 180;

export function needlePath(angle: number, radius: number, tail: number): string {
  const tip = facePoint(Math.sin(angle) * radius, Math.cos(angle) * radius);
  const back = facePoint(-Math.sin(angle) * tail, -Math.cos(angle) * tail);
  const r = (n: number) => Math.round(n * 10) / 10;
  return `M${r(back[0])} ${r(back[1])}L${r(tip[0])} ${r(tip[1])}`;
}

export const DIAL_ART = {
  foot: k.cylinder(DIAL_STEM_X, DIAL_STEM_Y, 8.5, 0, 3.4, P, 32, 0.5),
  stem: k.cylinder(DIAL_STEM_X, DIAL_STEM_Y, 3.4, 3.4, DIAL_Z - 3.4, P, 20),
  stemRing: k.ring(DIAL_STEM_X, DIAL_STEM_Y, 4.4, 8, P, 18),
  body: G.solidOf(
    [
      [-6, DIAL_R],
      [-5, DIAL_R + 1.3, 1],
      [DIAL_FACE - 0.7, DIAL_R + 1.3, 1],
      [DIAL_FACE, DIAL_R],
    ],
    DIAL_FRAME,
    P,
  ),
  bezel:
    G.circleOf(DIAL_FRAME, DIAL_FACE + 0.9, DIAL_R + 1.7, P, 48) +
    G.circleOf(DIAL_FRAME, DIAL_FACE + 0.9, DIAL_R - 1.3, P, 48) +
    G.circleOf(DIAL_FRAME, DIAL_FACE - 0.5, DIAL_R + 1.3, P, 48),
  faceCircle: (() => {
    const pts: string[] = [];
    for (let i = 0; i <= 64; i += 1) {
      const a = (i / 64) * Math.PI * 2;
      const p = facePoint(Math.sin(a) * (DIAL_R - 1.5), Math.cos(a) * (DIAL_R - 1.5));
      pts.push(`${Math.round(p[0] * 10) / 10} ${Math.round(p[1] * 10) / 10}`);
    }
    return `M${pts[0]}L${pts.slice(1).join("L")}Z`;
  })(),
  minor: (() => {
    const out: string[] = [];
    for (let i = 0; i <= 24; i += 1) {
      const angle = OXY_FROM + (OXY_SPAN * i) / 24;
      out.push(
        faceLine(
          Math.sin(angle) * (DIAL_R - 4.6),
          Math.cos(angle) * (DIAL_R - 4.6),
          Math.sin(angle) * (DIAL_R - 2.6),
          Math.cos(angle) * (DIAL_R - 2.6),
        ),
      );
    }
    return out.join("");
  })(),
  major: (() => {
    const out: string[] = [];
    for (let i = 0; i <= 8; i += 1) {
      const angle = OXY_FROM + (OXY_SPAN * i) / 8;
      out.push(
        faceLine(
          Math.sin(angle) * (DIAL_R - 6.6),
          Math.cos(angle) * (DIAL_R - 6.6),
          Math.sin(angle) * (DIAL_R - 2.6),
          Math.cos(angle) * (DIAL_R - 2.6),
        ),
      );
    }
    return out.join("");
  })(),
  habitat: (() => {
    const angle = OXY_FROM + OXY_SPAN;
    return faceLine(
      Math.sin(angle) * (DIAL_R - 8.6),
      Math.cos(angle) * (DIAL_R - 8.6),
      Math.sin(angle) * (DIAL_R - 2.4),
      Math.cos(angle) * (DIAL_R - 2.4),
    );
  })(),
  hub: facePoint(0, 0).map((n) => Math.round(n * 10) / 10),
};

/* ===================================================================== */
/* the cable and the hose                                                  */
/* ===================================================================== */

export const CABLE_POINTS: Point3[] = [
  [CAR_X, RAIL_Y - 4.6, CAM_BODY_Z + 5],
  [CAR_X - 6, RAIL_Y - 5.6, CAM_BODY_Z + 3],
  [CAR_X - 12, RAIL_Y - 6.4, CAM_BODY_Z],
  [-45, -63, CAM_BODY_Z - 5],
  [-50, -60, CAM_BODY_Z - 6],
  [-52, -56, CAM_BODY_Z - 8],
  [-52, -50, 74],
  [-52, -48, 60],
  [-52, -48, 20],
  [-52, -48, 6],
  [-20, -48, 4.4],
  [40, -48, 4],
  [78, -47, 4],
  [86, -44, 4],
  [88, -38, 4],
  [88, -32, 5],
  [88, -30, 9],
  [88, -30, 11.5],
];

export const CABLE_SCREEN = CABLE_POINTS.map((point) => k.iso(point, P));

export const HOSE_POINTS: Point3[] = [
  [BOTTLE.x + 6.4, BOTTLE.y + 1, 57],
  [BOTTLE.x + 12, BOTTLE.y + 5, 55],
  [BOTTLE.x + 17, BOTTLE.y + 11, 52],
  [-104, 33, 49],
  [-95, 32, 47],
  [-88, 29, 45],
  [-82, 26, 43],
  [-78, 21, 42],
  [-76, 15, 42],
  [-73, 9, 42],
  [INLET_OUT - 1.2, CH_Y + 1, INLET_Z],
];

export const HOSE_SCREEN = HOSE_POINTS.map((point) => k.iso(point, P));
