import { PlotterArt } from "./plotter-art";
import { CabinetArt } from "./cabinet-art";
import { ReaderArt } from "./reader-art";
import { BalanceArt } from "./balance-art";
import "../../iso/iso.css";
import "./feature-vignettes.css";

function Vignette({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="iso fv-vignette">
      <svg
        viewBox="0 0 340 230"
        className="iso-svg fv-svg"
        role="img"
        aria-label={label}
      >
        {children}
      </svg>
    </div>
  );
}

export function PlotterGlyph() {
  return (
    <Vignette label="An isometric pen plotter drawing the oxygen and gravity evidence map">
      <PlotterArt />
    </Vignette>
  );
}

export function CabinetGlyph() {
  return (
    <Vignette label="An isometric card-index cabinet with an open tray of investigation records">
      <CabinetArt />
    </Vignette>
  );
}

export function ReaderGlyph() {
  return (
    <Vignette label="An isometric microfiche reader showing a cited page from a NASA report">
      <ReaderArt />
    </Vignette>
  );
}

export function BalanceGlyph() {
  return (
    <Vignette label="An isometric balance with three weights on one pan and an empty pan on the other">
      <BalanceArt />
    </Vignette>
  );
}
