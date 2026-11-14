import { Dots, Line, Solid } from "../../iso/react/draw";
import { BenchFront, BenchTop, BenchUnder, benchOf } from "./bench";
import { P as RD_P, PAGE, READER } from "./reader";
import { screenDelta } from "./layout";

const base = benchOf(RD_P);
const scanDrop = screenDelta(RD_P, [0, 0, PAGE.scanDrop])[1];
const traySlide = screenDelta(RD_P, [0, 5, 0]);

export function ReaderArt() {
  return (
    <>
      <BenchUnder art={base} />
      <BenchTop art={base} />
      <path className="fv-contact" d={READER.shadow} />

      <Solid
        paths={READER.body}
        tone="mid"
        crease="faint"
        inner={<Line d={READER.bodySeam} tone="faint" />}
      />
      <Line d={READER.topEdge} tone="mid" />
      <Line d={READER.topGroove} tone="faint" />
      <Dots points={READER.topScrews} size={0.5} tone="mid" />

      <path className="fv-bezel-well" d={READER.bezelOuter} />
      <path className="fv-bezel" d={READER.bezel} />
      <path className="fv-page-shadow" d={READER.pageShadow} />
      <path className="fv-page" d={READER.page} />
      <Line d={READER.pageEdge} tone="lo" />
      <path className="fv-page-shade" d={READER.pageShade} />
      <path className="fv-page-glare" d={PAGE.glare} />

      <g className="fv-page-ink">
        <path className="fv-page-title" d={PAGE.heading.title} />
        <path className="fv-page-subtitle" d={PAGE.heading.subtitle} />
        <Line d={PAGE.heading.byline} tone="lo" />
        <Line d={PAGE.heading.rule} tone="mid" />
        <Line d={PAGE.body} tone="mid" />
        <path className="fv-quote" d={PAGE.quote} />
        <Line d={PAGE.quoteRule} tone="red" />
        <path className="fv-cite" d={PAGE.cite} />
        <Line d={PAGE.citeRules} tone="lo" />
        <circle className="fv-cite-pin" cx={PAGE.citePin[0]} cy={PAGE.citePin[1]} r={1.15} />
        <circle className="fv-cite-dot" cx={PAGE.citeDot[0]} cy={PAGE.citeDot[1]} r={1.35} />
        <g style={{ "--fv-scan-drop": `${scanDrop.toFixed(2)}px` } as React.CSSProperties}>
          <Line d={PAGE.scan} tone="red" className="fv-scan" />
        </g>
      </g>

      <Line d={READER.sideVents} tone="faint" />
      <Dots points={READER.sideScrews} size={0.5} tone="mid" />

      <Solid paths={READER.hood} tone="mid" crease="faint" />
      <Line d={READER.hoodLip} tone="mid" />
      <Line d={READER.hoodSeam} tone="faint" />
      <Dots points={READER.hoodScrews} size={0.6} tone="mid" />
      <path className="fv-hood-lamp" d={READER.hoodLamp} />

      <path className="fv-recess" d={READER.badge} />
      <Line d={READER.badgeRules} tone="lo" />
      <Line d={READER.vents} tone="faint" />
      <Line d={READER.grille} tone="faint" />

      <path className="fv-recess" d={READER.control} />
      {READER.buttons.map((button, index) => (
        <g key={index}>
          <path className="fv-recess" d={button.well} />
          <path className="fv-button" d={button.cap} />
        </g>
      ))}
      {READER.lamps.map((lamp, index) => (
        <g key={index}>
          <path className="fv-recess" d={lamp.well} />
          <circle className={index === 0 ? "fv-lamp fv-lamp-live" : "fv-lamp"} cx={lamp.dot[0]} cy={lamp.dot[1]} r={1.25} />
        </g>
      ))}

      <g
        className="fv-tray"
        style={
          {
            "--fv-slide-x": `${traySlide[0].toFixed(2)}px`,
            "--fv-slide-y": `${traySlide[1].toFixed(2)}px`,
          } as React.CSSProperties
        }
      >
        <Solid paths={READER.trayFloor} tone="mid" crease="faint" />
        <Solid paths={READER.fiche} tone="hi" crease="none" className="fv-fiche" />
        <Line d={READER.ficheGrid} tone="faint" />
        <Solid paths={READER.ficheTab} tone="lo" crease="faint" />
        <Solid paths={READER.trayLip} tone="lo" crease="faint" />
        <path className="fv-recess" d={READER.trayNotch} />
      </g>

      <Solid paths={READER.knob} tone="mid" crease="faint" />
      <g className="fv-knob">
        <Line d={READER.knobFace} tone="mid" />
        <Line d={READER.knobGrip} tone="lo" />
        <Line d={READER.knobHub} tone="mid" />
      </g>

      <BenchFront art={base} />
    </>
  );
}
