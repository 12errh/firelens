import {
  boxCorners,
  cameraOf,
  fitProjection,
  iso,
  type Flat,
  type Plan,
  type Point3,
  type Projection,
} from "../../iso/iso-kit";

export const WIDTH = 720;
export const HEIGHT = 440;
export const AZIMUTH = 52;
export const ELEVATION = 32;

export const DEG = Math.PI / 180;
export const RAD = 180 / Math.PI;

/* ------------------------------------------------------------------ base */

export const BASE: Plan = { x: -150, y: -80, w: 300, d: 160, r: 0 };
export const BASE_BOTTOM = -11;
export const BASE_H = 11;
export const BASE_TOP = 0;
export const FOOT_BOTTOM = -17;
export const FOOT_FLANGE_TOP = -14.4;
export const FOOT_NECK_TOP = BASE_BOTTOM;

/* ruler strip along the front edge */
export const RULER: Plan = { x: -100, y: 67, w: 200, d: 9, r: 1.5 };
export const RULER_TOP = 0.7;
/* engraved label plate, front left */
export const LABEL: Plan = { x: -142, y: 60, w: 38, d: 16, r: 2 };
export const LABEL_TOP = 0.9;

/* --------------------------------------------------------- gas cylinder */

export const BOTTLE = { x: -125, y: 18 };
export const BOTTLE_R = 11;
export const BOTTLE_BASE = 4;
export const BOTTLE_BODY_TOP = 40;
export const BOTTLE_NECK_TOP = 52;
export const BOTTLE_VALVE_TOP = 64;
export const CRADLE: Plan = { x: -140, y: 4, w: 30, d: 28, r: 3 };

/* ------------------------------------------------------- chamber group */

export const CH_X = -45;
export const CH_Y = 5;
export const PED_FOOT_R = 20;
export const PED_FOOT_TOP = 5;
export const PED_COL_R = 11;
export const PED_COL_TOP = 18;
export const PED_TOP_R = 14;
export const PED_TOP = 22;
export const FLANGE_R = 18;
export const FLANGE_TOP = 27;
export const BELL_R = 15;
export const BELL_BASE = FLANGE_TOP;
export const BELL_TOP = 72;
export const SAMPLE_COL_TOP = 36;
export const SAMPLE_CUP_TOP = 40;
export const SAMPLE_CUP_R = 5.6;
export const FLAME_BASE = 40.6;
export const FLAME_TOP = 66.4;

/* ports on the bell */
export const INLET_Z = 42;
export const INLET_X = CH_X - BELL_R; // -60
export const INLET_OUT = CH_X - BELL_R - 9; // -69
export const VENT_Z = 52;
export const VENT_X = CH_X + BELL_R; // -30
export const VENT_OUT = CH_X + BELL_R + 8; // -22

/* --------------------------------------------------------- structure */

export const RAIL_Y = -60;
export const RAIL_D = 9;
export const RAIL_Z = 60;
export const RAIL_H = 8;
export const POST_L = -112;
export const POST_R = 72;
export const POST_RADIUS = 4.6;
export const POST_COLLAR_R = 8;

/* camera carriage on the rail */
export const CAR_X = -30;
export const CAR_Z = RAIL_Z + RAIL_H; // 68
export const CAM_BODY_Z = 88;
export const CAM_BODY_H = 12;
export const LENS_Z = CAM_BODY_Z + 6;

/* recorder */
export const REC: Plan = { x: 92, y: -44, w: 38, d: 28, r: 2.5 };
export const REC_H = 22;

/* ------------------------------------------------------------- controls */

export const KNOB_X = 100;
export const KNOB_Y = 40;
export const BOSS_R = 10;
export const BOSS_H = 3.4;
export const KNOB_R = 6;
export const KNOB_H = 5.2;
export const KNOB_TOP = BOSS_H + KNOB_H;
export const SCALE_R0 = 22;
export const SCALE_R1 = 30;

export const DIAL_X = 30;
export const DIAL_Y = 50;
export const DIAL_Z = 36;
export const DIAL_R = 15;
export const DIAL_FACE = 4.2; // distance of the printed face along the view axis
export const DIAL_STEM_X = 26.3;
export const DIAL_STEM_Y = 45.3;

/* face basis of the oxygen gauge */
export const FACE_RIGHT: Point3 = [Math.sin(AZIMUTH * DEG), -Math.cos(AZIMUTH * DEG), 0];
export const FACE_UP: Point3 = [0, 0, 1];
export const FACE_NORMAL: Point3 = [Math.cos(AZIMUTH * DEG), Math.sin(AZIMUTH * DEG), 0];

/* ------------------------------------------------------------ projection */

const BASE_PLAN: Plan = { ...BASE, r: 0 };

const extremes: Point3[] = [
  ...boxCorners(BASE_PLAN, FOOT_BOTTOM, 0),
  ...boxCorners({ x: CH_X - FLANGE_R, y: CH_Y - FLANGE_R, w: FLANGE_R * 2, d: FLANGE_R * 2, r: 0 }, 0, BELL_TOP),
  ...boxCorners({ x: POST_L - 9, y: RAIL_Y - 9, w: POST_R - POST_L + 9, d: 18, r: 0 }, 0, RAIL_Z + RAIL_H),
  ...boxCorners({ x: CAR_X - 16, y: RAIL_Y - 12, w: 32, d: 24, r: 0 }, CAR_Z, CAM_BODY_Z + CAM_BODY_H),
  ...boxCorners({ x: BOTTLE.x - 12, y: BOTTLE.y - 12, w: 24, d: 24, r: 0 }, 0, BOTTLE_VALVE_TOP + 4),
  ...boxCorners(REC, 0, REC_H + 2),
  ...boxCorners({ x: DIAL_X - DIAL_R, y: DIAL_Y - DIAL_R, w: DIAL_R * 2, d: DIAL_R * 2, r: 0 }, 0, DIAL_Z + DIAL_R),
  ...boxCorners({ x: KNOB_X - SCALE_R1, y: KNOB_Y - SCALE_R1, w: SCALE_R1 * 2, d: SCALE_R1 * 2, r: 0 }, 0, KNOB_TOP),
];

export const P: Projection = fitProjection(extremes, WIDTH, HEIGHT, {
  pad: 26,
  azimuth: AZIMUTH,
  elevation: ELEVATION,
});

export const at = (point: Point3): Flat => iso(point, P);

export const camera = () => cameraOf(P);

/** world -> floor plane point, undoing the projection at a known height */
export function floorAt(screen: Flat, z: number): [number, number] {
  const { sinA, cosA, sinE, cosE, k } = cameraOf(P);
  const u = (screen[0] - P.origin[0]) / k;
  const v = (screen[1] - P.origin[1]) / k;
  const w = (v + z * cosE) / sinE;
  return [u * sinA + w * cosA, -u * cosA + w * sinA];
}

/** face plane -> screen (the dial face is perpendicular to the view axis) */
export function faceAt(a: number, b: number): Flat {
  const { sinA, cosA, sinE, cosE, k } = cameraOf(P);
  return [P.origin[0] + a * k, P.origin[1] - b * cosE * k];
}

const DIAL_SCREEN = iso([DIAL_X, DIAL_Y, DIAL_Z], P);

/** the gravity a pointer at this screen position asks for */
export function gravityAtScreen(screen: Flat): number {
  const [x, y] = floorAt(screen, KNOB_TOP);
  let angle = Math.atan2(x - KNOB_X, -(y - KNOB_Y));
  if (angle < 0) angle += Math.PI * 2;
  const KNOB_FROM = Math.PI * 1.5;
  const KNOB_SPAN = Math.PI * 0.5;
  return Math.min(1, Math.max(0, 1 - (angle - KNOB_FROM) / KNOB_SPAN));
}

/** the oxygen a pointer at this screen position asks for */
export function oxygenAtScreen(screen: Flat): number {
  const { cosE, k } = cameraOf(P);
  const a = (screen[0] - DIAL_SCREEN[0]) / k;
  const b = -(screen[1] - DIAL_SCREEN[1]) / (cosE * k);
  const angle = Math.atan2(a, b);
  const OXY_FROM = (-120 * Math.PI) / 180;
  const OXY_SPAN = (240 * Math.PI) / 180;
  const value = 21 + ((angle - OXY_FROM) / OXY_SPAN) * 9;
  return Math.min(30, Math.max(21, value));
}
