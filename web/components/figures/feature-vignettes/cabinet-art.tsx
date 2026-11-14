import { Dots, Line, Solid } from "../../iso/react/draw";
import { BenchFront, BenchTop, BenchUnder, benchOf } from "./bench";
import { CABINET, DRAWERS, P as CAB_P, RECORDS } from "./cabinet";
import { screenDelta } from "./layout";

const base = benchOf(CAB_P);
const lift = screenDelta(CAB_P, [0, 0, 9]);

export function CabinetArt() {
  return (
    <>
      <BenchUnder art={base} />
      <BenchTop art={base} />
      <path className="fv-contact" d={CABINET.shadow} />

      <Solid paths={CABINET.plinth} tone="mid" crease="faint" />
      <Solid
        paths={CABINET.body}
        tone="mid"
        crease="faint"
        inner={<Line d={CABINET.bodySeam} tone="faint" />}
      />

      {DRAWERS.map((drawer) => (
        <g key={drawer.id}>
          <path className="fv-recess" d={drawer.recess} />
          <path className="fv-drawer-face" d={drawer.panel} />
          <Line d={drawer.panel} tone="lo" />
          <path className="fv-label" d={drawer.label} />
          <Line d={drawer.labelRules} tone="lo" />
          <Line d={drawer.pullShadow} tone="faint" />
          <path className="fv-pull" d={drawer.pull} />
          <Line d={drawer.pullCaps.join("")} tone="faint" />
          <Dots points={drawer.pullScrews} size={0.55} tone="mid" />
        </g>
      ))}

      <Solid paths={CABINET.trayFloor} tone="lo" crease="faint" className="fv-tray-floor" />
      <Line d={CABINET.trayEdge} tone="mid" />
      <path className="fv-card-shadow" d={CABINET.cardShadow} />
      <Solid paths={CABINET.backWall} tone="mid" crease="faint" />
      <Solid paths={CABINET.cheekL} tone="mid" crease="faint" />
      <Solid paths={CABINET.cheekR} tone="mid" crease="faint" />

      <path className="fv-cheek-plate" d={CABINET.plate} />
      <Line d={CABINET.plateRules} tone="lo" />
      <Dots points={CABINET.plateScrews} size={0.5} tone="mid" />

      <Solid paths={CABINET.cheekCapL} tone="lo" crease="faint" />
      <Solid paths={CABINET.cheekCapR} tone="lo" crease="faint" />
      <Dots points={CABINET.cheekScrews} size={0.6} tone="mid" />

      {RECORDS.back.map((card, index) => (
        <g key={index}>
          <Solid paths={card.body} tone="lo" crease="faint" className="fv-record" />
          <path className="fv-tab" d={card.tab} />
          <Line d={card.ink.rules.join("")} tone="mid" />
          <path className="fv-card-marker" d={card.ink.mark} />
        </g>
      ))}

      <g
        className="fv-card"
        style={
          {
            "--fv-rise": `${lift[1].toFixed(2)}px`,
          } as React.CSSProperties
        }
      >
        <Solid paths={RECORDS.front.body} tone="lo" crease="faint" className="fv-record" />
        <path className="fv-tab" d={RECORDS.front.tab} />
        <path className="fv-card-heading" d={RECORDS.front.heading} />
        <Line d={RECORDS.front.rules.join("")} tone="mid" />
        <path className="fv-card-marker" d={RECORDS.front.marker} />
        <Line d={RECORDS.front.shadow} tone="faint" />
      </g>

      <BenchFront art={base} />
    </>
  );
}
