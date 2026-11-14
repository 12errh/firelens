import * as k from "../../iso/iso-kit";
import * as G from "../../iso/lathe.mjs";
import { pathOf, type Plan, type Point3, type Projection } from "../../iso/iso-kit";
import { BASE_TOP, projectionFor } from "./layout";
import { faceLine, facePoint, faceRect, sideLine } from "./face";

/* -------------------------------------------------------------- reader */

const BODY: Plan = { x: -100, y: -40, w: 200, d: 80, r: 3 };
const HOOD: Plan = { x: -44, y: 20, w: 88, d: 28, r: 2 };
const TRAY: Plan = { x: -50, y: 40, w: 100, d: 17, r: 1.6 };
const FICHE: Plan = { x: -42, y: 42, w: 84, d: 12, r: 0.5 };

const BODY_TOP = 84;
const HOOD_TOP = 86.6;
const FACE_Y = 40.05;
const PAGE_Y = 40.25;

const KNOB_Y = 4;
const KNOB_Z = 50;
const KNOB_OUT = 9;

const FOOTPRINT = { x: -105, y: -45, w: 210, d: 94, r: 6 };

export const P: Projection = projectionFor([
  [-103, 0, HOOD_TOP + 2],
  [104, 0, HOOD_TOP + 2],
  [104 + KNOB_OUT, 8, KNOB_Z + 9],
  [0, 62, 0],
]);

export const READER = {
  shadow: k.planOutline(FOOTPRINT, BASE_TOP + 0.12, P, 10),
  body: k.slabOf(BODY, BASE_TOP, BODY_TOP - BASE_TOP, P, 5, 0.9),
  bodySeam: k.sideSeam(BODY, 33, P, 5),
  topEdge: k.planOutline(BODY, BODY_TOP, P, 6),
  hood: k.slabOf(HOOD, BODY_TOP - 1.6, HOOD_TOP - BODY_TOP + 1.6, P, 3, 0.7),
  hoodLip: k.lineOnTop([-38, 47.7], [38, 47.7], HOOD_TOP, P),
  hoodSeam: k.sideSeam(HOOD, HOOD_TOP - 1.2, P, 3),
  hoodScrews: k.pointsAt(
    [
      [-36, 30, HOOD_TOP],
      [36, 30, HOOD_TOP],
    ] as Point3[],
    P,
  ),
  hoodLamp: faceRect(P, FACE_Y, -34, 81.2, 34, 83.3),

  topGroove: k.planOutline({ x: -76, y: -31, w: 152, d: 42, r: 3 }, BODY_TOP, P, 8),
  topScrews: k.pointsAt(
    [
      [-82, -34, BODY_TOP],
      [82, -34, BODY_TOP],
      [-82, 8, BODY_TOP],
      [82, 8, BODY_TOP],
    ] as Point3[],
    P,
  ),
  sideVents: [0, 1, 2, 3, 4]
    .map((index) => sideLine(P, 100.1, -30, 22 + index * 2.1, -14, 22 + index * 2.1))
    .join(""),
  sideScrews: k.pointsAt(
    [
      [100.15, -34, 76],
      [100.15, 30, 76],
      [100.15, -34, 16],
    ] as Point3[],
    P,
  ),

  bezelOuter: faceRect(P, FACE_Y, -39, 30, 39, 81),
  bezel: faceRect(P, FACE_Y + 0.04, -32, 33, 32, 78),
  pageShadow: faceRect(P, FACE_Y + 0.07, -30, 32.4, 32, 76.2),
  page: faceRect(P, PAGE_Y, -31, 34, 31, 77),
  pageEdge: pathOf(
    [
      [-31, 34],
      [31, 34],
      [31, 77],
      [-31, 77],
    ].map(([x, z]) => k.iso([x, PAGE_Y, z], P)),
    true,
  ),
  pageShade: faceRect(P, PAGE_Y + 0.07, -31, 74, 31, 77),

  trayFloor: k.slabOf(TRAY, 17, 5, P, 3, 0.5),
  trayLip: k.slabOf({ x: -53, y: 54, w: 106, d: 3, r: 1 }, 17, 8.4, P, 3, 0.4),
  trayNotch: faceRect(P, 57.05, -13, 20.5, 13, 23),
  fiche: k.slabOf(FICHE, 22, 0.9, P, 2, 0.1),
  ficheTab: k.slabOf({ x: -8, y: 52, w: 16, d: 4, r: 0.5 }, 22, 0.9, P, 2, 0.1),
  ficheGrid: (() => {
    const lines: string[] = [];
    for (let row = 1; row < 6; row++) {
      const y = FICHE.y + (FICHE.d / 6) * row;
      lines.push(k.lineOnTop([FICHE.x + 1.4, y], [FICHE.x + FICHE.w - 1.4, y], 22.95, P));
    }
    for (let col = 1; col < 5; col++) {
      const x = FICHE.x + (FICHE.w / 5) * col;
      lines.push(k.lineOnTop([x, FICHE.y + 1.2], [x, FICHE.y + FICHE.d - 1.2], 22.95, P));
    }
    return lines.join("");
  })(),

  control: faceRect(P, FACE_Y, 54, 52, 92, 76),
  buttons: [60, 68, 76].map((x) => ({
    well: faceRect(P, FACE_Y + 0.06, x - 3, 66, x + 3, 72),
    cap: faceRect(P, FACE_Y + 0.1, x - 2, 67.2, x + 2, 70.8),
  })),
  lamps: [62, 70].map((x) => ({
    well: faceRect(P, FACE_Y + 0.06, x - 2.2, 57, x + 2.2, 61.4),
    dot: facePoint(P, FACE_Y + 0.12, x, 59.2),
  })),
  badge: faceRect(P, FACE_Y, -92, 54, -56, 70),
  badgeRules:
    faceLine(P, FACE_Y + 0.06, -88, 66.4, -60, 66.4) +
    faceLine(P, FACE_Y + 0.06, -88, 63.2, -66, 63.2) +
    faceLine(P, FACE_Y + 0.06, -88, 60, -72, 60) +
    faceLine(P, FACE_Y + 0.06, -88, 56.8, -78, 56.8),
  vents: [0, 1, 2, 3, 4]
    .map((index) => faceLine(P, FACE_Y, -92, 18.4 + index * 2, -62, 18.4 + index * 2))
    .join(""),
  grille: [0, 1, 2, 3, 4, 5, 6]
    .map((index) => faceLine(P, FACE_Y, 58 + index * 5, 18.4, 58 + index * 5, 30))
    .join(""),

  knob: G.solidOf(
    [
      [0, 8.6],
      [1.6, 8.6],
      [2.4, 7.4],
      [5.2, 7.4],
      [6.2, 6],
      [6.2, 0],
    ],
    G.frameAlong([100, KNOB_Y, KNOB_Z], [1, 0, 0]),
    P,
  ),
  knobFace: k.sideRing([100 + KNOB_OUT - 3.1, KNOB_Y, KNOB_Z], 6.5, "x", P, 30),
  knobGrip: [0, 1, 2, 3, 4, 5, 6, 7]
    .map((index) => {
      const angle = (index / 8) * Math.PI * 2;
      return k.segment(
        [100 + KNOB_OUT + 0.1, KNOB_Y + Math.cos(angle) * 7.6, KNOB_Z + Math.sin(angle) * 7.6],
        [100 + KNOB_OUT + 0.1, KNOB_Y + Math.cos(angle) * 9.2, KNOB_Z + Math.sin(angle) * 9.2],
        P,
      );
    })
    .join(""),
  knobHub: k.sideRing([100 + KNOB_OUT + 0.15, KNOB_Y, KNOB_Z], 2, "x", P, 16),
};

/* ---------------------------------------------------------------- page */

const inkY = PAGE_Y + 0.1;

const line = (z: number, from: number, to: number) => faceLine(P, inkY, from, z, to, z);

const HEADING = {
  title: faceRect(P, inkY, -27, 72.4, -4, 75.2),
  subtitle: faceRect(P, inkY, -27, 69.4, -10, 71),
  byline: faceLine(P, inkY, -27, 67.2, -15, 67.2),
  rule: faceLine(P, inkY, -27, 65.2, 27, 65.2),
};

const BODY_LINES = [
  line(61, -27, 27),
  line(56.8, -27, 22),
  line(52.6, -27, 26),
  line(48.4, -27, 17),
  line(44.2, -27, 24),
  line(40, -27, -12),
].join("");

const QUOTE = faceRect(P, inkY, -28, 47.4, 6, 58);
const QUOTE_RULE = faceLine(P, inkY, -28, 47.4, -28, 58);

const CITE = faceRect(P, PAGE_Y + 0.1, 8, 35.4, 27, 41.6);
const CITE_RULES =
  faceLine(P, PAGE_Y + 0.15, 11, 39.2, 24, 39.2) +
  faceLine(P, PAGE_Y + 0.15, 11, 37.4, 21, 37.4);
const CITE_DOT = facePoint(P, PAGE_Y + 0.17, 24.4, 37.6);
const CITE_PIN = facePoint(P, PAGE_Y + 0.17, 10.4, 37.6);

const GLARE = pathOf(
  [
    [-31, 77],
    [-24, 77],
    [-15, 34],
    [-22, 34],
  ].map(([x, z]) => k.iso([x, PAGE_Y + 0.03, z], P)),
  true,
);

const SCAN_START = 71;
const SCAN_END = 38;

export const PAGE = {
  heading: HEADING,
  body: BODY_LINES,
  quote: QUOTE,
  quoteRule: QUOTE_RULE,
  cite: CITE,
  citeRules: CITE_RULES,
  citeDot: CITE_DOT,
  citePin: CITE_PIN,
  glare: GLARE,
  scan: line(SCAN_START, -30, 30),
  scanDrop: SCAN_END - SCAN_START,
};
