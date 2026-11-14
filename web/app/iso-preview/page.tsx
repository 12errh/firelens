import { CombustionBenchFigure } from "@/components/figures/combustion-bench/figure";

export default function IsoPreviewPage() {
  return (
    <div className="mx-auto max-w-[900px] px-6 py-16">
      <div className="rounded-lg border border-line bg-panel p-8">
        <CombustionBenchFigure />
      </div>
    </div>
  );
}
