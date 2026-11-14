import { CombustionArt } from "./art";
import { REST_READOUT } from "./model";
import "@/components/iso/iso.css";
import "./combustion-bench.css";

/**
 * A benchtop microgravity combustion bench. The gravity knob sweeps a
 * quarter-circle scale, the dial reads the oxygen, and the flame inside the
 * chamber morphs from a tall teardrop to a free sphere as gravity falls.
 */
export function CombustionBenchFigure({ className }: { className?: string }) {
  return (
    <div className={"iso combustion-bench" + (className ? ` ${className}` : "")} data-theme="light">
      <div className="iso-plate cb-plate">
        <CombustionArt />
        <div className="cb-readout" data-readout="" aria-live="polite">
          {REST_READOUT}
        </div>
      </div>
    </div>
  );
}
