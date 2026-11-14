import * as React from "react";
import { Dots, Line, Solid } from "../../iso/react/draw";
import {
  BASE_ART,
  BOTTLE_ART,
  CABLE_SCREEN,
  CAMERA_ART,
  CHAMBER_ART,
  DIAL_ART,
  HOSE_SCREEN,
  KNOB_ART,
  RECORDER_ART,
  STRUCTURE_ART,
} from "./geometry";
import { CombustionLive } from "./live";

const BASE = (
  <g key="base">
    <path className="iso-halo" d={BASE_ART.halo} />
    {BASE_ART.feet.map((foot, index) => (
      <g key={index}>
        <Solid paths={foot.pad} tone="lo" crease="faint" />
        <Solid paths={foot.neck} tone="lo" crease="faint" />
      </g>
    ))}
    <Solid paths={BASE_ART.slab} tone="lo" crease="faint" />
    <Line d={BASE_ART.groove} tone="faint" />
    <Line d={BASE_ART.screwRings} tone="lo" />
    <Dots points={BASE_ART.screws} size={0.5} tone="mid" />
    <Solid paths={BASE_ART.ruler} tone="lo" crease="none" />
    <Line d={BASE_ART.rulerTicks.minor} tone="lo" />
    <Line d={BASE_ART.rulerTicks.major} tone="mid" />
    <Line d={BASE_ART.rulerZero} tone="hi" />
    <Solid paths={BASE_ART.label} tone="lo" crease="none" />
    <Line d={BASE_ART.labelRule} tone="lo" />
    <Dots points={BASE_ART.labelScrews} size={0.45} tone="mid" />
  </g>
);

const STRUCTURE = (
  <g key="structure">
    <Solid paths={STRUCTURE_ART.postL.foot} tone="mid" crease="faint" />
    <Solid paths={STRUCTURE_ART.postR.foot} tone="mid" crease="faint" />
    <Solid paths={STRUCTURE_ART.postL.column} tone="mid" crease="none" />
    <Solid paths={STRUCTURE_ART.postR.column} tone="mid" crease="none" />
    <Line d={STRUCTURE_ART.postL.seam} tone="faint" />
    <Line d={STRUCTURE_ART.postR.seam} tone="faint" />
    <Solid paths={STRUCTURE_ART.postL.collar} tone="mid" crease="faint" />
    <Solid paths={STRUCTURE_ART.postR.collar} tone="mid" crease="faint" />
    <Solid paths={STRUCTURE_ART.rail} tone="mid" crease="faint" />
    <Line d={STRUCTURE_ART.railEdge} tone="faint" />
    <Solid paths={STRUCTURE_ART.stop} tone="mid" crease="faint" />
    <Dots points={STRUCTURE_ART.stopScrews} size={0.45} tone="mid" />
    <Solid paths={STRUCTURE_ART.clip} tone="mid" crease="faint" />
    <Solid paths={STRUCTURE_ART.clipScrew} tone="mid" crease="faint" />
    <Line d={STRUCTURE_ART.clipRing} tone="lo" />
  </g>
);

const CAMERA = (
  <g key="camera" data-part="camera">
    <Solid paths={CAMERA_ART.bushingA} tone="mid" crease="faint" />
    <Solid paths={CAMERA_ART.bushingB} tone="mid" crease="faint" />
    <Solid paths={CAMERA_ART.saddle} tone="mid" crease="faint" />
    <Solid paths={CAMERA_ART.bracket} tone="mid" crease="faint" />
    <Solid paths={CAMERA_ART.brace} tone="mid" crease="faint" />
    <Solid paths={CAMERA_ART.braceB} tone="mid" crease="faint" />
    <Solid paths={CAMERA_ART.body} tone="mid" crease="faint" inner={<Line d={CAMERA_ART.bodySeam} tone="faint" />} />
    <Dots points={CAMERA_ART.bodyScrews} size={0.45} tone="mid" />
    <Solid paths={CAMERA_ART.barrel} tone="hi" crease="faint" />
    <Solid paths={CAMERA_ART.hood} tone="hi" crease="faint" />
    <Solid paths={CAMERA_ART.glass} tone="lo" crease="none" flat />
    <Solid paths={CAMERA_ART.socket} tone="mid" crease="faint" />
  </g>
);

const BOTTLE = (
  <g key="bottle" data-part="bottle">
    <Solid paths={BOTTLE_ART.cradle} tone="lo" crease="faint" />
    <Solid paths={BOTTLE_ART.cradleArmA} tone="mid" crease="faint" />
    <Solid paths={BOTTLE_ART.cradleArmB} tone="mid" crease="faint" />
    <Solid paths={BOTTLE_ART.body} tone="hi" crease="faint" inner={<Line d={BOTTLE_ART.seam} tone="faint" />} />
    <Solid paths={BOTTLE_ART.valve} tone="mid" crease="faint" />
    <Solid paths={BOTTLE_ART.gauge} tone="hi" crease="faint" />
    <Solid paths={BOTTLE_ART.valveCap} tone="mid" crease="faint" />
    <Line d={BOTTLE_ART.valveKnurl} tone="lo" />
    <Solid paths={BOTTLE_ART.outlet} tone="mid" crease="faint" />
  </g>
);

const CHAMBER_BACK = (
  <g key="chamber-back">
    <Solid paths={CHAMBER_ART.pedestalFoot} tone="mid" crease="faint" />
    <Line d={CHAMBER_ART.pedestalFootRing} tone="lo" />
    <Solid paths={CHAMBER_ART.pedestalColumn} tone="mid" crease="none" />
    <Line d={CHAMBER_ART.pedestalSeam} tone="faint" />
    <Solid paths={CHAMBER_ART.pedestalTop} tone="mid" crease="faint" />
    <Solid paths={CHAMBER_ART.flange} tone="mid" crease="faint" />
    <Dots points={CHAMBER_ART.flangeDots as [number, number][]} size={0.45} tone="mid" />
    <Solid paths={CHAMBER_ART.sampleColumn} tone="mid" crease="none" />
    <Solid paths={CHAMBER_ART.sampleCup} tone="hi" crease="faint" />
    <Line d={CHAMBER_ART.retainer} tone="mid" />
    <Solid paths={CHAMBER_ART.sample} tone="lo" crease="none" flat />
    <path className="cb-glass-fill" d={CHAMBER_ART.bell.fill} />
    <path className="cb-glass-shine" d={CHAMBER_ART.bellShine} />
  </g>
);

const CHAMBER_FRONT = (
  <g key="chamber-front">
    {CHAMBER_ART.bell.shades.map((d, index) =>
      d ? <path key={index} className="cb-glass-shade" data-shade={index} d={d} /> : null,
    )}
    <path className="cb-glass-top" d={CHAMBER_ART.bell.top} />
    <path className="iso-line iso-edge cb-glass-edge" data-tone="hi" d={CHAMBER_ART.bell.outline} />
    <Line d={CHAMBER_ART.bellHoopA} tone="mid" />
    <Line d={CHAMBER_ART.bellHoopB} tone="mid" />
    <Line d={CHAMBER_ART.bellCap} tone="lo" />
    <Solid paths={CHAMBER_ART.inletBoss} tone="mid" crease="faint" />
    <Line d={CHAMBER_ART.inletCollar} tone="mid" />
    <Solid paths={CHAMBER_ART.ventBoss} tone="mid" crease="faint" />
    <Solid paths={CHAMBER_ART.ventCap} tone="mid" crease="faint" />
  </g>
);

const HOSE = (
  <g key="hose" className="iso-wire" data-tone="hi">
    <path className="iso-line cb-hose" data-tone="hi" d={HOSE_SCREEN.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("")} />
    <circle className="iso-wire-end" cx={HOSE_SCREEN[0]![0]} cy={HOSE_SCREEN[0]![1]} r={1.3} />
    <circle className="iso-wire-end" cx={HOSE_SCREEN[HOSE_SCREEN.length - 1]![0]} cy={HOSE_SCREEN[HOSE_SCREEN.length - 1]![1]} r={1.3} />
  </g>
);

const RECORDER = (
  <g key="recorder">
    <Solid paths={RECORDER_ART.box} tone="mid" crease="faint" inner={<Line d={RECORDER_ART.seam} tone="faint" />} />
    <Solid paths={RECORDER_ART.panel} tone="hi" crease="none" />
    <Line d={RECORDER_ART.lampRings} tone="lo" />
    <Dots points={RECORDER_ART.lamps} size={0.55} tone="hi" />
    <Line d={RECORDER_ART.ticks.minor} tone="lo" />
    <Line d={RECORDER_ART.ticks.major} tone="mid" />
    <Solid paths={RECORDER_ART.socket} tone="mid" crease="faint" />
  </g>
);

const CABLE = (
  <g key="cable" className="iso-wire" data-tone="mid">
    <path className="iso-line cb-cable" data-tone="mid" d={CABLE_SCREEN.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("")} />
    <circle className="iso-wire-end" cx={CABLE_SCREEN[0]![0]} cy={CABLE_SCREEN[0]![1]} r={1.2} />
    <circle className="iso-wire-end" cx={CABLE_SCREEN[CABLE_SCREEN.length - 1]![0]} cy={CABLE_SCREEN[CABLE_SCREEN.length - 1]![1]} r={1.2} />
  </g>
);

const CONTROLS = (
  <g key="controls">
    <Solid paths={KNOB_ART.pad} tone="lo" crease="faint" />
    <Solid paths={KNOB_ART.plate} tone="mid" crease="faint" />
    <Line d={KNOB_ART.ticks.minor} tone="lo" />
    <Line d={KNOB_ART.ticks.major} tone="mid" />
    <Line d={KNOB_ART.zero} tone="hi" />
    <Solid paths={KNOB_ART.boss} tone="mid" crease="faint" />
    <g data-part="knob">
      <Solid paths={KNOB_ART.knob} tone="hi" crease="faint" />
      <Line d={KNOB_ART.knurl} tone="lo" />
      <Line d={KNOB_ART.knobRing} tone="faint" />
    </g>
    <Solid paths={DIAL_ART.foot} tone="lo" crease="faint" />
    <Solid paths={DIAL_ART.stem} tone="mid" crease="none" />
    <Line d={DIAL_ART.stemRing} tone="lo" />
    <g data-part="dial">
      <Solid paths={DIAL_ART.body} tone="hi" crease="faint" />
      <Line d={DIAL_ART.bezel} tone="lo" />
      <path className="iso-line" data-tone="faint" d={DIAL_ART.faceCircle} />
      <Line d={DIAL_ART.minor} tone="lo" />
      <Line d={DIAL_ART.major} tone="mid" />
      <path className="cb-habitat" d={DIAL_ART.habitat} />
      <circle className="cb-hub" cx={DIAL_ART.hub[0]} cy={DIAL_ART.hub[1]} r={1.9} />
    </g>
  </g>
);

export function CombustionArt() {
  return (
    <CombustionLive
      label="A benchtop microgravity combustion bench: a gravity knob and a quarter-circle scale, an oxygen dial, a glass combustion chamber with a flame inside, a camera on a rail and a gas cylinder in its cradle."
      base={BASE}
      structure={STRUCTURE}
      camera={CAMERA}
      bottle={BOTTLE}
      chamberBack={CHAMBER_BACK}
      chamberFront={CHAMBER_FRONT}
      hose={HOSE}
      recorder={RECORDER}
      cable={CABLE}
      controls={CONTROLS}
    />
  );
}
