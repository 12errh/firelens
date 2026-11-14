import * as k from "../../iso/iso-kit";
import type { Plan, Point3, Projection } from "../../iso/iso-kit";
import { BASE, BASE_TOP, FOOT_BOTTOM } from "./layout";

const RULER: Plan = { x: -46, y: 47, w: 156, d: 8, r: 1.2 };
const RULER_TOP = BASE_TOP + 0.7;
const LABEL: Plan = { x: -122, y: 45, w: 50, d: 10, r: 1.5 };
const LABEL_TOP = BASE_TOP + 0.8;

const FOOT_POINTS = k.corners(BASE, 13);
const SCREW_POINTS = k.corners(BASE, 15);

/**
 * The shared bench: four feet, a heavy rounded plate, a groove, corner
 * screws, a ruler along the front edge and an engraved label plate.
 */
export function baseArt(P: Projection) {
  return {
    halo: k.haloOf(BASE, FOOT_BOTTOM - 5, 9, P),
    feet: FOOT_POINTS.map(([x, y]) => ({
      pad: k.cylinder(x, y, 7.4, FOOT_BOTTOM, 4, P, 22),
      neck: k.cylinder(x, y, 4.6, FOOT_BOTTOM + 4, -FOOT_BOTTOM - 4, P, 20),
    })),
    slab: k.slabOf(BASE, 0, BASE_TOP, P, 12, 1.3),
    groove: k.planOutline(k.insetPlan(BASE, 4.5), BASE_TOP, P, 12),
    screwRings: SCREW_POINTS.map(([x, y]) => k.ring(x, y, 2, BASE_TOP, P, 12)).join(""),
    screws: k.pointsAt(
      SCREW_POINTS.map(([x, y]) => [x, y, BASE_TOP] as Point3),
      P,
    ),
    ruler: k.slabOf(RULER, BASE_TOP, 0.7, P, 3, 0.2),
    rulerTicks: k.topTicks(
      RULER.x + 4,
      RULER.x + RULER.w - 4,
      5,
      5,
      RULER.y + 0.8,
      RULER_TOP,
      [1.8, 3.4],
      P,
      "x",
    ),
    rulerZero: k.lineOnTop(
      [RULER.x + 4, RULER.y + 0.8],
      [RULER.x + 4, RULER.y + 5.6],
      RULER_TOP,
      P,
    ),
    label: k.slabOf(LABEL, BASE_TOP, 0.8, P, 3, 0.2),
    labelRules: [47.6, 49.6, 51.6]
      .map((y) =>
        k.lineOnTop([LABEL.x + 4, y], [LABEL.x + LABEL.w - 4, y], LABEL_TOP, P),
      )
      .join(""),
    labelScrews: k.pointsAt(
      [
        [LABEL.x + 2.2, LABEL.y + 5, LABEL_TOP],
        [LABEL.x + LABEL.w - 2.2, LABEL.y + 5, LABEL_TOP],
      ] as Point3[],
      P,
    ),
  };
}
