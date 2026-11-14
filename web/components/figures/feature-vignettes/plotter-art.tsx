import { Dots, Line, Solid } from "../../iso/react/draw";
import { BenchFront, BenchTop, BenchUnder, benchOf } from "./bench";
import { P as PLOT_P, PLOTTER, PEN, CARRIAGE } from "./plotter";
import { screenDelta } from "./layout";

const base = benchOf(PLOT_P);

/* ------------------------------------------------------------- plotter */

const sweep = screenDelta(PLOT_P, [40, 0, 0]);

export function PlotterArt() {
  return (
    <>
      <BenchUnder art={base} />
      <BenchTop art={base} />
      <path className="fv-contact" d={PLOTTER.shadow} />

      <Solid paths={PLOTTER.controlBox} tone="mid" crease="faint" />

      <Solid paths={PLOTTER.platen} tone="mid" crease="faint" className="fv-platen" />
      <Line d={PLOTTER.platenEdge} tone="mid" />
      <path className="fv-sheet-shadow" d={PLOTTER.sheetShadow} />
      <Solid paths={PLOTTER.sheet} tone="lo" crease="none" className="fv-sheet" />
      <Line d={PLOTTER.sheetEdge} tone="lo" />

      <path className="fv-lunar-band" d={PLOTTER.lunarBand} />
      <path className="fv-lunar-hatch" d={PLOTTER.lunarHatch} />
      <Line d={PLOTTER.lunarEdge} tone="red" dashed />
      <Line d={PLOTTER.grid} tone="faint" />
      <Line d={PLOTTER.laneRules} tone="faint" />
      <path className="fv-empty-lane" d={PLOTTER.partialBand} />
      <Line d={PLOTTER.partialEdge} tone="red" dashed className="fv-empty-edge" />
      <Line d={PLOTTER.noneMark} tone="red" className="fv-none-mark" />
      <Line d={PLOTTER.brackets} tone="mid" />
      <Line d={PLOTTER.axis} tone="mid" />
      <Line d={PLOTTER.axisTicksMinor} tone="lo" />
      <Line d={PLOTTER.axisTicksMajor} tone="mid" />

      {PLOTTER.bars.map((bar) => (
        <g key={bar.id}>
          <path className={`fv-plot-bar fv-phase-${bar.phase}`} d={bar.d} />
          <circle
            className={`fv-plot-dot fv-phase-${bar.phase}`}
            cx={bar.dot[0]}
            cy={bar.dot[1]}
            r={1.3}
          />
        </g>
      ))}

      <Solid paths={PLOTTER.postFootL} tone="mid" crease="faint" />
      <Solid paths={PLOTTER.postFootR} tone="mid" crease="faint" />
      <Solid
        paths={PLOTTER.postL}
        tone="mid"
        crease="faint"
        inner={<Line d={PLOTTER.postSeamL} tone="faint" />}
      />
      <Solid
        paths={PLOTTER.postR}
        tone="mid"
        crease="faint"
        inner={<Line d={PLOTTER.postSeamR} tone="faint" />}
      />
      <Solid paths={PLOTTER.collarL} tone="mid" crease="faint" />
      <Solid paths={PLOTTER.collarR} tone="mid" crease="faint" />

      <Solid paths={PLOTTER.beam} tone="hi" crease="faint" />
      <Line d={PLOTTER.beamGroove} tone="faint" />
      <Dots points={PLOTTER.beamScrews} size={0.55} tone="mid" />
      <Solid paths={PLOTTER.screw} tone="lo" crease="none" />
      <Line d={PLOTTER.screwShine} tone="mid" />
      <Solid paths={PLOTTER.wheel} tone="mid" crease="faint" />
      <Line d={PLOTTER.wheelRim} tone="lo" />
      <Line d={PLOTTER.wheelSpokes} tone="lo" />
      <Solid paths={PLOTTER.wheelHub} tone="mid" crease="faint" />
      <Solid paths={PLOTTER.wheelHandle} tone="lo" crease="faint" />

      <g
        className="fv-carriage"
        style={
          {
            "--fv-dx": `${sweep[0].toFixed(2)}px`,
            "--fv-dy": `${sweep[1].toFixed(2)}px`,
          } as React.CSSProperties
        }
      >
        <Solid
          paths={CARRIAGE.body}
          tone="mid"
          crease="faint"
          inner={<Line d={CARRIAGE.bodySeam} tone="faint" />}
        />
        <Solid paths={CARRIAGE.bushing} tone="lo" crease="faint" />
        <Solid paths={CARRIAGE.bracket} tone="mid" crease="faint" />
        <Solid paths={CARRIAGE.collar} tone="lo" crease="faint" />
        <Solid paths={CARRIAGE.clamp} tone="lo" crease="faint" />
        <Solid paths={CARRIAGE.arm} tone="hi" crease="faint" />
        <Solid paths={PEN} tone="hi" crease="faint" />
        <circle className="fv-pen-led" cx={CARRIAGE.lamp[0]} cy={CARRIAGE.lamp[1]} r={1.35} />
      </g>

      <Solid paths={PLOTTER.controlPanel} tone="lo" crease="none" />
      <Line d={PLOTTER.vent} tone="faint" />
      <Line d={PLOTTER.lampRings} tone="lo" />
      <Dots points={PLOTTER.lamps} size={1.05} tone="mid" />
      {PLOTTER.buttons.map((button, index) => (
        <Solid key={index} paths={button} tone="lo" crease="faint" />
      ))}

      <BenchFront art={base} />
    </>
  );
}
