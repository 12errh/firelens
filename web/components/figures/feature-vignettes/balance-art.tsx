import { Line, Solid } from "../../iso/react/draw";
import { iso } from "../../iso/iso-kit";
import { BenchFront, BenchTop, BenchUnder, benchOf } from "./bench";
import { BALANCE, P as BAL_P, PIVOT } from "./balance";

const base = benchOf(BAL_P);
const pivot = iso(PIVOT, BAL_P);

export function BalanceArt() {
  return (
    <>
      <BenchUnder art={base} />
      <BenchTop art={base} />
      <path className="fv-contact" d={BALANCE.shadow} />

      <Solid paths={BALANCE.foot} tone="mid" crease="faint" />
      <Line d={BALANCE.footTop} tone="mid" />
      <Solid paths={BALANCE.step} tone="mid" crease="faint" />
      <Line d={BALANCE.stepTop} tone="faint" />
      <Solid
        paths={BALANCE.column}
        tone="mid"
        crease="faint"
        inner={<Line d={BALANCE.columnSeam} tone="faint" />}
      />
      <Solid paths={BALANCE.collar} tone="lo" crease="faint" />
      <Solid paths={BALANCE.cap} tone="mid" crease="faint" />
      <Line d={BALANCE.capTop} tone="faint" />

      <path className="fv-scale" d={BALANCE.scale} />
      <Line d={BALANCE.scaleTicks} tone="lo" />
      <Line d={BALANCE.scaleEdge} tone="faint" />
      <Line d={BALANCE.scaleZero} tone="red" className="fv-scale-zero" />
      <path className="fv-scale-mark" d={BALANCE.scaleBand} />
      <Line d={BALANCE.pointer} tone="mid" className="fv-pointer" />
      <circle
        className="fv-pointer-weight"
        cx={BALANCE.pointerWeight[0]}
        cy={BALANCE.pointerWeight[1]}
        r={1.5}
      />

      <g
        className="fv-beam-group"
        style={
          {
            "--fv-pivot-x": `${pivot[0].toFixed(2)}px`,
            "--fv-pivot-y": `${pivot[1].toFixed(2)}px`,
          } as React.CSSProperties
        }
      >
        <path className="fv-beam-rod" d={BALANCE.beam} />
        <path className="fv-beam-shine" d={BALANCE.beamShine} />
        <Solid paths={BALANCE.capL} tone="lo" crease="faint" />
        <Solid paths={BALANCE.capR} tone="lo" crease="faint" />

        <Solid paths={BALANCE.pivot} tone="mid" crease="faint" />
        <Line d={BALANCE.pivotHub} tone="lo" />

        <Line d={BALANCE.wiresL} tone="mid" />
        <Line d={BALANCE.wiresR} tone="mid" />

        <Solid paths={BALANCE.panL.disc} tone="mid" crease="faint" className="fv-pan" />
        <Line d={BALANCE.panL.rim} tone="lo" />
        <Line d={BALANCE.panL.inner} tone="faint" />
        <Line d={BALANCE.panL.well} tone="lo" />

        {BALANCE.weights.map((weight, index) => (
          <g key={index}>
            <Solid paths={weight.body} tone="lo" crease="faint" className="fv-weight" />
            <Line d={weight.rim} tone="mid" />
            <Line d={weight.grip} tone="lo" />
          </g>
        ))}
        <Solid paths={BALANCE.weightKnob} tone="lo" crease="faint" className="fv-weight" />
        <Line d={BALANCE.weightKnobRim} tone="mid" />
        <Line d={BALANCE.weightKnobCap} tone="faint" />

        <Solid paths={BALANCE.panR.disc} tone="mid" crease="faint" className="fv-pan" />
        <Line d={BALANCE.panR.rim} tone="lo" />
        <Line d={BALANCE.panR.inner} tone="faint" />
        <Line d={BALANCE.panR.shine} tone="faint" />
      </g>

      <Line d={BALANCE.bubbleRing} tone="lo" />
      <Solid paths={BALANCE.bubble} tone="lo" crease="none" />
      <Line d={BALANCE.bubbleShine} tone="faint" />

      <BenchFront art={base} />
    </>
  );
}
