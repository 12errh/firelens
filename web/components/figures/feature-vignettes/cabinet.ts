import * as k from "../../iso/iso-kit";
import type { Plan, Point3, Projection } from "../../iso/iso-kit";
import { BASE_TOP, projectionFor } from "./layout";
import { faceLine, faceRect, sideLine, sideRect } from "./face";

/* ------------------------------------------------------------- cabinet */

const BODY: Plan = { x: -96, y: -38, w: 192, d: 84, r: 3 };
const PLINTH: Plan = { x: -88, y: -30, w: 176, d: 76, r: 2 };
const TRAY: Plan = { x: -88, y: -34, w: 176, d: 78, r: 2 };

const BODY_BOTTOM = 16;
const BODY_TOP = 70;
const TRAY_TOP = 73;
const CHEEK_TOP = 98;

const FACE_Y = 46.1;

const COLS = [-84, -27, 30];
const DRAWER_W = 54;
const ROWS = [
  { z0: 19, z1: 43 },
  { z0: 46, z1: 67 },
];

const FOOTPRINT = { x: -104, y: -46, w: 208, d: 100, r: 7 };

export const P: Projection = projectionFor([
  [-96, 0, CHEEK_TOP + 2],
  [96, 0, CHEEK_TOP + 2],
  [-40, 26, 130],
  [40, 26, 130],
]);

export const CABINET = {
  shadow: k.planOutline(FOOTPRINT, BASE_TOP + 0.12, P, 10),
  plinth: k.slabOf(PLINTH, BASE_TOP, 6, P, 4, 0.6),
  body: k.slabOf(BODY, BODY_BOTTOM, BODY_TOP - BODY_BOTTOM, P, 5, 0.9),
  bodySeam: k.sideSeam(BODY, BODY_TOP - 12, P, 5),
  trayFloor: k.slabOf(TRAY, BODY_TOP, 3, P, 4, 0.5),
  trayEdge: k.planOutline(TRAY, TRAY_TOP, P, 6),
  cardShadow: k.planOutline({ x: -38, y: 28, w: 76, d: 10, r: 2 }, TRAY_TOP + 0.14, P, 6),
  cheekL: k.slabOf({ x: -96, y: -38, w: 9, d: 84, r: 1.5 }, TRAY_TOP, CHEEK_TOP - TRAY_TOP, P, 3, 0.6),
  cheekR: k.slabOf({ x: 87, y: -38, w: 9, d: 84, r: 1.5 }, TRAY_TOP, CHEEK_TOP - TRAY_TOP, P, 3, 0.6),
  cheekCapL: k.slabOf({ x: -98, y: -40, w: 13, d: 88, r: 1.4 }, CHEEK_TOP, 3.2, P, 3, 0.4),
  cheekCapR: k.slabOf({ x: 85, y: -40, w: 13, d: 88, r: 1.4 }, CHEEK_TOP, 3.2, P, 3, 0.4),
  backWall: k.slabOf({ x: -87, y: -38, w: 174, d: 6, r: 1 }, TRAY_TOP, CHEEK_TOP - TRAY_TOP - 4, P, 3, 0.5),
  cheekScrews: k.pointsAt(
    [
      [-91.5, 2, CHEEK_TOP + 3.2],
      [91.5, 2, CHEEK_TOP + 3.2],
    ] as Point3[],
    P,
  ),
  plate: sideRect(P, 96.12, -17, 78, 17, 91),
  plateRules:
    sideLine(P, 96.18, -13, 87.4, 13, 87.4) +
    sideLine(P, 96.18, -13, 84.4, 6, 84.4) +
    sideLine(P, 96.18, -13, 81.4, 10, 81.4),
  plateScrews: k.pointsAt(
    [
      [96.18, -13.6, 79.4],
      [96.18, 13.6, 79.4],
    ] as Point3[],
    P,
  ),
};

/* ------------------------------------------------------------- drawers */

export const DRAWERS = COLS.flatMap((x, column) =>
  ROWS.map(({ z0, z1 }, row) => {
    const cx = x + DRAWER_W / 2;
    const pullZ = (z0 + z1) / 2 - 0.9;
    return {
      id: `${column}-${row}`,
      recess: faceRect(P, FACE_Y, x, z0, x + DRAWER_W, z1),
      panel: faceRect(P, FACE_Y + 0.06, x + 1.4, z0 + 1.4, x + DRAWER_W - 1.4, z1 - 1.4),
      label: faceRect(P, FACE_Y + 0.12, cx - 16, z1 - 11.5, cx + 16, z1 - 4.5),
      labelRules:
        faceLine(P, FACE_Y + 0.18, cx - 13.4, z1 - 6.4, cx + 10, z1 - 6.4) +
        faceLine(P, FACE_Y + 0.18, cx - 13.4, z1 - 8.8, cx + 13.4, z1 - 8.8),
      pullShadow: faceLine(P, FACE_Y + 0.22, cx - 12.4, pullZ - 1.3, cx + 12.4, pullZ - 1.3),
      pull: faceRect(P, FACE_Y + 0.26, cx - 12.4, pullZ, cx + 12.4, pullZ + 1.7),
      pullCaps: [
        k.sideRing([cx - 12.6, FACE_Y + 0.3, pullZ + 0.85], 1.5, "y", P, 14),
        k.sideRing([cx + 12.6, FACE_Y + 0.3, pullZ + 0.85], 1.5, "y", P, 14),
      ],
      pullScrews: k.pointsAt(
        [
          [cx - 12.6, FACE_Y + 0.32, pullZ + 0.85],
          [cx + 12.6, FACE_Y + 0.32, pullZ + 0.85],
        ] as Point3[],
        P,
      ),
    };
  }),
);

/* --------------------------------------------------------------- records */

const RECORD_ROWS = [
  { x: -50, y: -26, w: 86, top: 124, tab: [-24, -6] as const, exposed: [121.6, 119.8] },
  { x: -40, y: -15, w: 76, top: 119, tab: [2, 20] as const, exposed: [116.6, 114.8] },
  { x: -30, y: -4, w: 66, top: 114, tab: [-10, 8] as const, exposed: [111.6, 109.8] },
];

const cardBody = (row: { x: number; y: number; w: number; top: number }) =>
  k.slabOf({ x: row.x, y: row.y, w: row.w, d: 1.1, r: 0.3 }, TRAY_TOP, row.top - TRAY_TOP, P, 2, 0.2);

const cardTab = (row: { x: number; y: number; top: number }, tab: readonly [number, number]) =>
  faceRect(P, row.y + 1.15, tab[0], row.top, tab[1], row.top + 4.4);

const backInk = (row: (typeof RECORD_ROWS)[number]) => {
  const faceY = row.y + 1.21;
  return {
    rules: row.exposed.map((z, index) =>
      faceLine(P, faceY, row.x + 5, z, row.x + row.w - (index === 0 ? 8 : 16), z),
    ),
    mark: faceRect(P, faceY + 0.02, row.x + row.w - 10, row.exposed[0] - 1.3, row.x + row.w - 5, row.exposed[0] + 1.3),
  };
};

const FRONT = { x: -33, y: 32, w: 66, top: 108 };
const CARD_FACE_Y = FRONT.y + 1.21;

export const RECORDS = {
  back: RECORD_ROWS.map((row) => ({ body: cardBody(row), tab: cardTab(row, row.tab), ink: backInk(row) })),
  front: {
    body: cardBody(FRONT),
    tab: faceRect(P, FRONT.y + 1.15, -5, FRONT.top, 11, FRONT.top + 4.4),
    heading: faceRect(P, CARD_FACE_Y, -27, 99, 27, 103.6),
    rules: [95.2, 90.4, 85.6, 80.8, 76].map((z, index) =>
      faceLine(P, CARD_FACE_Y, -27, z, index === 3 ? 12 : 27, z),
    ),
    marker: faceRect(P, CARD_FACE_Y + 0.02, 10, 87, 27, 89.4),
    shadow: faceLine(P, CARD_FACE_Y - 0.05, -33, 73.4, 33, 73.4),
  },
};

export { FACE_Y, CARD_FACE_Y };
