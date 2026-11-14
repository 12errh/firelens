import { Dots, Line, Solid } from "../../iso/react/draw";
import type { Projection } from "../../iso/iso-kit";
import { baseArt } from "./base";

/**
 * The shared bench every instrument stands on: feet, plate, groove, screws,
 * a ruler and an engraved label plate. Kept in one place so the four cards
 * cannot drift apart.
 */
export const benchOf = (P: Projection) => baseArt(P);

type Bench = ReturnType<typeof baseArt>;

export function BenchUnder({ art }: { art: Bench }) {
  return (
    <g>
      <path className="iso-halo" d={art.halo} />
      {art.feet.map((foot, index) => (
        <g key={index}>
          <Solid paths={foot.pad} tone="lo" crease="faint" />
          <Solid paths={foot.neck} tone="lo" crease="faint" />
        </g>
      ))}
      <Solid paths={art.slab} tone="mid" crease="faint" />
    </g>
  );
}

export function BenchTop({ art }: { art: Bench }) {
  return (
    <g>
      <Line d={art.groove} tone="faint" />
      <Line d={art.screwRings} tone="lo" />
      <Dots points={art.screws} size={0.5} tone="mid" />
    </g>
  );
}

export function BenchFront({ art }: { art: Bench }) {
  return (
    <g>
      <Solid paths={art.ruler} tone="lo" crease="none" className="fv-ruler" />
      <Line d={art.rulerTicks.minor} tone="lo" />
      <Line d={art.rulerTicks.major} tone="mid" />
      <Line d={art.rulerZero} tone="hi" />
      <Solid paths={art.label} tone="lo" crease="none" className="fv-labelplate" />
      <Line d={art.labelRules} tone="lo" />
      <Dots points={art.labelScrews} size={0.45} tone="mid" />
    </g>
  );
}
