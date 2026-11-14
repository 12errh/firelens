#!/usr/bin/env python3
"""
Render the Oxygen x Gravity evidence map as a standalone SVG.

The deck needs a crisp, self-contained version of the flagship visual. It is
generated from the same normalized JSON the site reads, so the deck can never
show something the site does not.

Usage:
  python ingest/render_evidence_map.py --out deck/evidence-map.svg
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any

PHASE_COLOR = {
    "solid": "#B45309",
    "liquid": "#0E7490",
    "gas": "#6D28D9",
}

LANES = [
    {
        "id": "partial",
        "label": "Partial gravity",
        "sub": "Moon 1/6 g · Mars 0.38 g",
        "y": 104,
        "phase": None,
        "empty": True,
    },
    {
        "id": "micro-solid",
        "label": "Microgravity",
        "sub": "Solid materials",
        "y": 202,
        "phase": "solid",
        "empty": False,
    },
    {
        "id": "micro-liquid",
        "label": "Microgravity",
        "sub": "Liquid fuels",
        "y": 272,
        "phase": "liquid",
        "empty": False,
    },
    {
        "id": "micro-gas",
        "label": "Microgravity",
        "sub": "Gaseous fuels",
        "y": 342,
        "phase": "gas",
        "empty": False,
    },
    {
        "id": "normal-solid",
        "label": "Normal gravity",
        "sub": "Solid materials · 1 g",
        "y": 412,
        "phase": "solid",
        "empty": False,
    },
]

WIDTH = 1080
HEIGHT = 476
PLOT_LEFT = 214
PLOT_RIGHT = 1004
PLOT_TOP = 55
PLOT_BOTTOM = 426

INK = "#181814"
MUTED = "#5F5F57"
FAINT = "#8B8A80"
FLAME = "#C2410C"
CANVAS = "#F7F7F4"


def x_of(value: float) -> float:
    return PLOT_LEFT + (value / 100) * (PLOT_RIGHT - PLOT_LEFT)


def esc(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def lane_points(points: list[dict[str, Any]], lane: dict[str, Any]) -> list[dict[str, Any]]:
    if not lane["phase"]:
        return []
    if lane["id"] == "normal-solid":
        return [
            p
            for p in points
            if p["gravity"] == "normal_gravity" and p["phase"] == "solid"
        ]
    return [
        p for p in points if p["gravity"] == "microgravity" and p["phase"] == lane["phase"]
    ]


def render(points: list[dict[str, Any]]) -> str:
    out: list[str] = []
    add = out.append

    add(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {WIDTH} {HEIGHT}" '
        f'width="{WIDTH}" height="{HEIGHT}" font-family="IBM Plex Sans, system-ui, sans-serif">'
    )
    add("<defs>")
    add(
        '<pattern id="lunar-hatch" width="7" height="7" patternUnits="userSpaceOnUse" '
        'patternTransform="rotate(45)">'
        f'<line x1="0" y1="0" x2="0" y2="7" stroke="{FLAME}" stroke-width="1" opacity="0.16"/>'
        "</pattern>"
    )
    add("</defs>")

    add(f'<rect x="0" y="0" width="{WIDTH}" height="{HEIGHT}" fill="{CANVAS}"/>')

    # Lunar habitat band.
    add(
        f'<rect x="{x_of(30):.1f}" y="{PLOT_TOP}" width="{x_of(100) - x_of(30):.1f}" '
        f'height="{PLOT_BOTTOM - PLOT_TOP}" fill="url(#lunar-hatch)"/>'
    )
    add(
        f'<rect x="{x_of(30):.1f}" y="{PLOT_TOP}" width="{x_of(100) - x_of(30):.1f}" '
        f'height="{PLOT_BOTTOM - PLOT_TOP}" fill="{FLAME}" opacity="0.035"/>'
    )
    add(
        f'<line x1="{x_of(30):.1f}" y1="{PLOT_TOP - 6}" x2="{x_of(30):.1f}" y2="{PLOT_BOTTOM}" '
        f'stroke="{FLAME}" stroke-width="1" stroke-dasharray="3 4" opacity="0.75"/>'
    )
    add(
        f'<text x="{x_of(30) + 8:.1f}" y="{PLOT_TOP - 12}" fill="{FLAME}" '
        f'font-family="IBM Plex Mono, ui-monospace, monospace" font-size="11">'
        "Lunar habitat target ≥30% O₂</text>"
    )
    add(
        f'<text x="{PLOT_RIGHT}" y="{PLOT_TOP - 12}" text-anchor="end" fill="{FAINT}" '
        f'font-family="IBM Plex Mono, ui-monospace, monospace" font-size="10">'
        "Spacesuit 100% O₂</text>"
    )

    for tick in (0, 10, 20, 30, 40, 60, 80, 100):
        color = FLAME if tick == 30 else INK
        opacity = 0.4 if tick == 30 else 0.09
        dash = ' stroke-dasharray="3 4"' if tick == 30 else ""
        add(
            f'<line x1="{x_of(tick):.1f}" y1="{PLOT_TOP}" x2="{x_of(tick):.1f}" y2="{PLOT_BOTTOM}" '
            f'stroke="{color}" stroke-width="1" opacity="{opacity}"{dash}/>'
        )
        add(
            f'<text x="{x_of(tick):.1f}" y="{PLOT_BOTTOM + 22}" text-anchor="middle" '
            f'fill="{FLAME if tick == 30 else FAINT}" '
            f'font-family="IBM Plex Mono, ui-monospace, monospace" font-size="11">{tick}</text>'
        )

    for lane in LANES:
        lane_data = lane_points(points, lane)
        add(
            f'<text x="0" y="{lane["y"] - 3}" fill="{INK}" font-size="12.5" '
            f'font-weight="500">{esc(lane["label"])}</text>'
        )
        add(
            f'<text x="0" y="{lane["y"] + 12}" fill="{FAINT}" font-size="11.5">'
            f'{esc(lane["sub"])}</text>'
        )

        if lane["empty"]:
            add(
                f'<rect x="{PLOT_LEFT}" y="{lane["y"] - 22}" width="{PLOT_RIGHT - PLOT_LEFT}" '
                f'height="44" fill="{FLAME}" fill-opacity="0.04" stroke="{FLAME}" '
                'stroke-opacity="0.32" stroke-dasharray="4 5"/>'
            )
            add(
                f'<text x="{(PLOT_LEFT + PLOT_RIGHT) / 2:.1f}" y="{lane["y"] - 2}" '
                f'text-anchor="middle" fill="{FLAME}" font-size="12" font-weight="500">'
                "No direct partial-gravity dataset</text>"
            )
            add(
                f'<text x="{(PLOT_LEFT + PLOT_RIGHT) / 2:.1f}" y="{lane["y"] + 13}" '
                f'text-anchor="middle" fill="{FAINT}" font-size="11.5">'
                "0 direct datasets · E-FIELD is an analog</text>"
            )
            continue

        add(
            f'<line x1="{PLOT_LEFT}" y1="{lane["y"]}" x2="{PLOT_RIGHT}" y2="{lane["y"]}" '
            f'stroke="{INK}" stroke-opacity="0.12" stroke-dasharray="2 5"/>'
        )

        offsets = []
        for index in range(len(lane_data)):
            spread = min(10, 30 / len(lane_data)) if lane_data else 0
            offsets.append((index - (len(lane_data) - 1) / 2) * spread)

        for point, offset in zip(lane_data, offsets):
            y = lane["y"] + offset
            color = PHASE_COLOR.get(point.get("phase") or "gas", MUTED)
            low = x_of(point["o2"]["min"])
            high = x_of(point["o2"]["max"])
            add(
                f'<rect x="{low:.1f}" y="{y - 4:.1f}" width="{max(high - low, 2.5):.1f}" '
                f'height="8" rx="3" fill="{color}" opacity="0.85"/>'
            )
            add(f'<circle cx="{low:.1f}" cy="{y:.1f}" r="2.8" fill="{color}"/>')
            add(
                f'<circle cx="{high:.1f}" cy="{y:.1f}" r="2.8" fill="{color}" '
                f'stroke="{CANVAS}" stroke-width="1"/>'
            )

        if lane_data:
            highest = max(p["o2"]["max"] for p in lane_data)
            add(
                f'<text x="{PLOT_RIGHT + 12}" y="{lane["y"] - 2}" fill="{MUTED}" '
                f'font-family="IBM Plex Mono, ui-monospace, monospace" font-size="10.5">'
                f'{len(lane_data)} dataset{"s" if len(lane_data) != 1 else ""}</text>'
            )
            add(
                f'<text x="{PLOT_RIGHT + 12}" y="{lane["y"] + 11}" fill="{FAINT}" '
                f'font-family="IBM Plex Mono, ui-monospace, monospace" font-size="10.5">'
                f"max {highest:.1f}%</text>"
            )

    add(
        f'<text x="{(PLOT_LEFT + PLOT_RIGHT) / 2:.1f}" y="{HEIGHT - 10}" text-anchor="middle" '
        f'fill="{FAINT}" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="10.5">'
        "Oxygen concentration, % by volume (reported test condition)</text>"
    )
    add("</svg>")
    return "\n".join(out)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="web/data/evidence_points.json")
    parser.add_argument("--out", default="deck/assets/evidence-map.svg")
    args = parser.parse_args()

    points = json.loads(Path(args.data).read_text())
    plotted = [p for p in points if p.get("o2") and p.get("gravity") != "partial_gravity_analog"]
    svg = render(plotted)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(svg, encoding="utf-8")
    print(f"[map] {len(plotted)} plotted points -> {out_path} ({len(svg)} bytes)")


if __name__ == "__main__":
    main()
