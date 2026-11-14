import { evidencePoints } from "@/lib/data";
import * as k from "../../iso/iso-kit";
import * as G from "../../iso/lathe.mjs";
import { pathOf, type Plan, type Point3, type Projection } from "../../iso/iso-kit";
import { BASE_TOP, projectionFor } from "./layout";

/* ------------------------------------------------------------- geometry */

const PLATEN: Plan = { x: -112, y: -42, w: 216, d: 80, r: 4 };
const PLATEN_TOP = BASE_TOP + 8;
const SHEET: Plan = { x: -106, y: -36, w: 204, d: 70, r: 2 };
const SHEET_TOP = PLATEN_TOP + 1.1;

const LEFT_POST_X = -124;
const RIGHT_POST_X = 116;
const POST_TOP = 106;
const BEAM_BOTTOM = 97;
const BEAM_TOP = 105;
const SCREW_Z = 86;
const CARRIAGE_X = -10;
const WHEEL_Z = 74;

const X0 = -88;
const X1 = 88;
const O2_MAX = 90;
const xOf = (o2: number) => X0 + (Math.min(o2, O2_MAX) / O2_MAX) * (X1 - X0);

const SHEET_TOP_Y = SHEET.y;
const SHEET_BOTTOM_Y = SHEET.y + SHEET.d;
const AXIS_Y = 27;

/**
 * The paper repeats the evidence map: one lane per gravity/phase group,
 * ranges as capped bars, medians as dots, and the partial-gravity lane left
 * visibly empty under a hatch.
 */
const LANES = [
  { id: "partial", gravity: "partial_gravity_analog", phase: undefined, y: -28.5, empty: true },
  { id: "micro-solid", gravity: "microgravity", phase: "solid", y: -18 },
  { id: "micro-liquid", gravity: "microgravity", phase: "liquid", y: -7 },
  { id: "micro-gas", gravity: "microgravity", phase: "gas", y: 4 },
  { id: "normal-solid", gravity: "normal_gravity", phase: "solid", y: 16 },
] as const;

type Lane = (typeof LANES)[number];

const pointsIn = (lane: Lane) =>
  evidencePoints.filter(
    (point) =>
      point.o2 && point.gravity === lane.gravity && (!lane.phase || point.phase === lane.phase),
  );

const laneRows = LANES.map((lane) => {
  const points = pointsIn(lane);
  const offsets = points.length
    ? points.map(
        (_, index) =>
          (index - (points.length - 1) / 2) * Math.min(3.2, 11 / points.length),
      )
    : [];
  return { lane, points, offsets };
});

export const P: Projection = projectionFor([
  [LEFT_POST_X - 6, -2, POST_TOP + 2],
  [RIGHT_POST_X + 12, -2, POST_TOP + 2],
  [RIGHT_POST_X + 14, -2, WHEEL_Z + 12],
  [0, SHEET_BOTTOM_Y, 0],
]);

function planeRect(x0: number, y0: number, x1: number, y1: number, z: number) {
  return pathOf(
    [
      [x0, y0],
      [x1, y0],
      [x1, y1],
      [x0, y1],
    ].map(([x, y]) => k.iso([x, y, z], P)),
    true,
  );
}

/** 45° hatching in the plane of the paper, clipped to a rectangle. */
function hatchRect(x0: number, y0: number, x1: number, y1: number, z: number, gap: number) {
  const lines: string[] = [];
  for (let c = x0 + y0 + gap; c < x1 + y1; c += gap) {
    let a: [number, number] | null = null;
    let b: [number, number] | null = null;
    const yA = c - x0;
    if (yA >= y0 && yA <= y1) a = [x0, yA];
    else if (c - y0 >= x0 && c - y0 <= x1) a = [c - y0, y0];
    const yB = c - x1;
    if (yB >= y0 && yB <= y1) b = [x1, yB];
    else if (c - y1 >= x0 && c - y1 <= x1) b = [c - y1, y1];
    if (a && b && (a[0] !== b[0] || a[1] !== b[1])) lines.push(k.lineOnTop(a, b, z, P));
  }
  return lines.join("");
}

const LUNAR_X = xOf(30);
const LUNAR_BAND = planeRect(LUNAR_X, SHEET_TOP_Y, X1, SHEET_BOTTOM_Y, SHEET_TOP);
const LUNAR_HATCH = hatchRect(LUNAR_X, SHEET_TOP_Y, X1, SHEET_BOTTOM_Y, SHEET_TOP, 5.2);

const PARTIAL_BAND = { y0: -33, y1: -24 };
const PARTIAL_PATH = planeRect(X0, PARTIAL_BAND.y0, X1, PARTIAL_BAND.y1, SHEET_TOP);
const PARTIAL_EDGE = pathOf(
  [
    [X0, PARTIAL_BAND.y0],
    [X1, PARTIAL_BAND.y0],
    [X1, PARTIAL_BAND.y1],
    [X0, PARTIAL_BAND.y1],
  ].map(([x, y]) => k.iso([x, y, SHEET_TOP + 0.05], P)),
  true,
);

const NONE_CENTER: [number, number] = [X0 + 16, (PARTIAL_BAND.y0 + PARTIAL_BAND.y1) / 2];
const NONE_MARK =
  k.onTop(k.circleRing(NONE_CENTER[0], NONE_CENTER[1], 2.6, 28), SHEET_TOP + 0.08, P, true) +
  k.lineOnTop(
    [NONE_CENTER[0] - 1.8, NONE_CENTER[1] - 1.8],
    [NONE_CENTER[0] + 1.8, NONE_CENTER[1] + 1.8],
    SHEET_TOP + 0.08,
    P,
  );

const AXIS_LINE = k.lineOnTop([X0, AXIS_Y], [X1, AXIS_Y], SHEET_TOP, P);
const AXIS_TICKS = (() => {
  const minor: string[] = [];
  const major: string[] = [];
  for (let o2 = 0; o2 <= O2_MAX; o2 += 5) {
    const x = xOf(o2);
    const d = k.lineOnTop([x, AXIS_Y], [x, AXIS_Y - (o2 % 30 === 0 ? 3.4 : 1.9)], SHEET_TOP, P);
    (o2 % 30 === 0 ? major : minor).push(d);
  }
  return { minor: minor.join(""), major: major.join("") };
})();

const GRID = Array.from({ length: 10 }, (_, index) => xOf(index * 10))
  .map((x) => k.lineOnTop([x, SHEET_TOP_Y], [x, AXIS_Y], SHEET_TOP, P))
  .join("");

const LANE_RULES = [-21.4, -12.5, -1.5, 9.4]
  .map((y) => k.lineOnTop([X0, y], [X1, y], SHEET_TOP, P))
  .join("");

const BARS = laneRows.flatMap(({ lane, points, offsets }) =>
  points.map((point, index) => {
    const y = lane.y + (offsets[index] ?? 0);
    const from = xOf(point.o2!.min);
    const to = Math.max(xOf(point.o2!.max), from + 1.1);
    const cap = 1;
    return {
      id: `${lane.id}-${index}`,
      phase: point.phase,
      y,
      d:
        k.lineOnTop([from, y], [to, y], SHEET_TOP + 0.15, P) +
        k.lineOnTop([from, y - cap], [from, y + cap], SHEET_TOP + 0.15, P) +
        k.lineOnTop([to, y - cap], [to, y + cap], SHEET_TOP + 0.15, P),
      dot: k.iso([xOf(point.o2!.median), y, SHEET_TOP + 0.2], P),
    };
  }),
);

const LANE_LABEL_X = -100;

function laneBracket(y0: number, y1: number) {
  return (
    k.lineOnTop([LANE_LABEL_X, y0], [LANE_LABEL_X, y1], SHEET_TOP + 0.05, P) +
    k.lineOnTop([LANE_LABEL_X, y0], [LANE_LABEL_X + 2.2, y0], SHEET_TOP + 0.05, P) +
    k.lineOnTop([LANE_LABEL_X, y1], [LANE_LABEL_X + 2.2, y1], SHEET_TOP + 0.05, P)
  );
}

const BRACKETS = laneRows
  .map(({ lane, offsets }) => {
    if ("empty" in lane) return laneBracket(PARTIAL_BAND.y0 + 0.8, PARTIAL_BAND.y1 - 0.8);
    const half = offsets.length ? Math.max(...offsets.map(Math.abs)) + 2 : 2.4;
    return laneBracket(lane.y - half, lane.y + half);
  })
  .join("");

/* ---------------------------------------------------------------- machine */

const BEAM: Plan = { x: LEFT_POST_X - 5, y: -7, w: RIGHT_POST_X - LEFT_POST_X + 15, d: 14, r: 1.5 };
const SCREW = G.solidOf(
  [
    [0, 1.5],
    [RIGHT_POST_X - LEFT_POST_X + 8, 1.5],
  ],
  G.frameAlong([LEFT_POST_X + 4, 0, SCREW_Z], [1, 0, 0]),
  P,
);

const WHEEL_FRAME = G.frameAlong([RIGHT_POST_X + 8, 0, WHEEL_Z], [1, 0, 0]);

export const PLOTTER = {
  shadow: k.planOutline({ x: -128, y: -58, w: 248, d: 104, r: 8 }, BASE_TOP + 0.12, P, 10),
  platen: k.slabOf(PLATEN, BASE_TOP, PLATEN_TOP - BASE_TOP, P, 6, 1),
  platenEdge: k.planOutline(PLATEN, PLATEN_TOP, P, 10),
  sheetShadow: k.planOutline({ x: -110, y: -40, w: 212, d: 78, r: 3 }, PLATEN_TOP + 0.06, P, 8),
  sheet: k.slabOf(SHEET, PLATEN_TOP, 1, P, 3, 0.2),
  sheetEdge: k.planOutline(SHEET, SHEET_TOP, P, 4),
  grid: GRID,
  lunarBand: LUNAR_BAND,
  lunarHatch: LUNAR_HATCH,
  lunarEdge: k.lineOnTop([LUNAR_X, SHEET_TOP_Y], [LUNAR_X, SHEET_BOTTOM_Y], SHEET_TOP, P),
  partialBand: PARTIAL_PATH,
  partialEdge: PARTIAL_EDGE,
  noneMark: NONE_MARK,
  axis: AXIS_LINE,
  axisTicksMinor: AXIS_TICKS.minor,
  axisTicksMajor: AXIS_TICKS.major,
  laneRules: LANE_RULES,
  bars: BARS,
  brackets: BRACKETS,

  postL: k.slabOf(
    { x: LEFT_POST_X - 5, y: -5, w: 10, d: 10, r: 1.4 },
    BASE_TOP,
    POST_TOP - BASE_TOP,
    P,
    3,
    0.6,
  ),
  postR: k.slabOf(
    { x: RIGHT_POST_X - 5, y: -5, w: 10, d: 10, r: 1.4 },
    BASE_TOP,
    POST_TOP - BASE_TOP,
    P,
    3,
    0.6,
  ),
  postFootL: k.slabOf({ x: LEFT_POST_X - 11, y: -11, w: 22, d: 22, r: 2 }, BASE_TOP, 3.4, P, 3, 0.5),
  postFootR: k.slabOf({ x: RIGHT_POST_X - 11, y: -11, w: 22, d: 22, r: 2 }, BASE_TOP, 3.4, P, 3, 0.5),
  collarL: k.slabOf(
    { x: LEFT_POST_X - 7, y: -7, w: 14, d: 14, r: 1.6 },
    BEAM_BOTTOM - 12,
    4,
    P,
    3,
    0.5,
  ),
  collarR: k.slabOf(
    { x: RIGHT_POST_X - 7, y: -7, w: 14, d: 14, r: 1.6 },
    BEAM_BOTTOM - 12,
    4,
    P,
    3,
    0.5,
  ),
  postSeamL: k.sideSeam({ x: LEFT_POST_X - 5, y: -5, w: 10, d: 10, r: 1.4 }, BASE_TOP + 26, P, 3),
  postSeamR: k.sideSeam({ x: RIGHT_POST_X - 5, y: -5, w: 10, d: 10, r: 1.4 }, BASE_TOP + 26, P, 3),
  beam: k.slabOf(BEAM, BEAM_BOTTOM, BEAM_TOP - BEAM_BOTTOM, P, 4, 0.7),
  beamGroove: k.lineOnTop([LEFT_POST_X + 2, -3.4], [RIGHT_POST_X - 2, -3.4], BEAM_TOP, P),
  beamScrews: k.pointsAt(
    [
      [LEFT_POST_X + 9, 0, BEAM_TOP],
      [RIGHT_POST_X - 9, 0, BEAM_TOP],
    ] as Point3[],
    P,
  ),
  screw: SCREW,
  screwShine: k.segment([LEFT_POST_X + 8, 0, SCREW_Z + 1.4], [RIGHT_POST_X - 2, 0, SCREW_Z + 1.4], P),
  wheel: G.disc(0, 2.2, 10, WHEEL_FRAME, P),
  wheelRim: G.circleOf(WHEEL_FRAME, 2.4, 10, P, 40),
  wheelSpokes: [0, 1, 2]
    .map((index) => {
      const angle = (index / 3) * Math.PI * 2 + 0.4;
      return k.segment(
        [RIGHT_POST_X + 10.6, Math.cos(angle) * 8, WHEEL_Z + Math.sin(angle) * 8],
        [RIGHT_POST_X + 10.6, -Math.cos(angle) * 8, WHEEL_Z - Math.sin(angle) * 8],
        P,
      );
    })
    .join(""),
  wheelHub: G.disc(2.2, 3.6, 2.6, WHEEL_FRAME, P),
  wheelHandle: G.disc(2.2, 6.4, 1.7, G.frameAlong([RIGHT_POST_X + 10, 6.6, WHEEL_Z + 6.6], [1, 0, 0]), P),

  controlBox: k.slabOf({ x: 22, y: -54, w: 96, d: 10, r: 1.6 }, BASE_TOP, 7.4, P, 3, 0.5),
  controlPanel: k.slabOf({ x: 26, y: -53, w: 88, d: 8, r: 1.2 }, BASE_TOP + 7.4, 0.7, P, 3, 0.2),
  lamps: k.pointsAt(
    [
      [32, -49, BASE_TOP + 8.3],
      [40, -49, BASE_TOP + 8.3],
      [48, -49, BASE_TOP + 8.3],
    ] as Point3[],
    P,
  ),
  lampRings: k.ring(32, -49, 2.2, BASE_TOP + 8.3, P, 14),
  buttons: [
    [96, -49],
    [106, -49],
  ].map(([x, y]) => k.cylinder(x, y, 3, BASE_TOP + 8.2, 1.6, P, 16)),
  vent: [0, 1, 2]
    .map((index) => k.lineOnTop([80, -52 + index * 2.4], [90, -52 + index * 2.4], BASE_TOP + 7.4, P))
    .join(""),
};

/* -------------------------------------------------------- moving group */

const CARRIAGE = {
  bushing: k.slabOf(
    { x: CARRIAGE_X - 11, y: -8, w: 22, d: 16, r: 1.6 },
    SCREW_Z - 8,
    8,
    P,
    3,
    0.4,
  ),
  body: k.slabOf({ x: CARRIAGE_X - 10, y: -7, w: 20, d: 14, r: 1.8 }, 76, 13, P, 3, 0.6),
  bodySeam: k.sideSeam({ x: CARRIAGE_X - 10, y: -7, w: 20, d: 14, r: 1.8 }, 84, P, 3),
  bracket: k.slabOf({ x: CARRIAGE_X - 4, y: -4, w: 8, d: 8, r: 1 }, 50, 6, P, 3, 0.3),
  arm: k.cylinder(CARRIAGE_X, 0, 1.1, 22, 56, P, 14),
  collar: k.cylinder(CARRIAGE_X, 0, 2.7, 48, 3, P, 16),
  clamp: k.cylinder(CARRIAGE_X, 0, 2, 32, 2.4, P, 14),
  lamp: k.iso([CARRIAGE_X + 8, -7.4, 86], P),
};

const PEN_PROFILE: Array<[number, number]> = [
  [0, 0.35],
  [1.6, 0.7],
  [5.2, 0.9],
  [6.4, 2.5],
  [11.6, 2.5],
  [12.4, 1.6],
];

export const PEN = G.solidOf(PEN_PROFILE, G.frameAlong([CARRIAGE_X, 0, 10.4], [0, 0, 1]), P);

export { CARRIAGE };
