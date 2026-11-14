#!/usr/bin/env python3
"""
Build the Flame in Freefall evidence dataset from a NASA PSI snapshot.

Inputs (defaults point at the cached snapshot used during development):
  --details   directory of PSI investigation-detail JSON responses
  --trees     directory of PSI file-tree JSON responses
  --tables    directory of experimental-table CSVs
  --out       output directory for normalized JSON

The script never invents missing values. Anything not reported by PSI stays
null, and every normalized number keeps a link back to its source table, row
and column.
"""

from __future__ import annotations

import argparse
import csv
import glob
import html
import json
import math
import os
import re
import statistics
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# --------------------------------------------------------------------------
# Snapshot facts
# --------------------------------------------------------------------------

SNAPSHOT_DATE = "2026-11-14"
SOURCE_SEARCH = (
    "https://psi.nasa.gov/geode-py/ws/repo/search"
    "?ffield=Research%20Area&fvalue=Combustion%20Science&size=50&from=0"
)
PSI_SEARCH_PAGE = "https://psi.nasa.gov/physci/repo/search?q=combustion"

# Representative images that are explicitly licensed CC0 in their record.
IMAGE_MAP = {
    "PSI-25": {
        "src": "/images/bass-ii.jpg",
        "alt": "BASS-II flame test aboard the International Space Station",
        "credit": "NASA PSI / BASS-II",
    },
    "PSI-22": {
        "src": "/images/psi-22-blue.jpg",
        "alt": "Electric-field diffusion flames in microgravity",
        "credit": "NASA PSI / ACME E-FIELD Flames",
    },
    "PSI-159": {
        "src": "/images/psi-159-cool.jpg",
        "alt": "Spherical cool diffusion flames observed in the CFI-G investigation",
        "credit": "NASA PSI / ACME CFI-G",
    },
    "PSI-47": {
        "src": "/images/psi-47-daft.jpg",
        "alt": "Dust and aerosol measurement hardware on the ISS",
        "credit": "NASA PSI / DAFT",
    },
}

# Hand-curated table adapters. Only columns that truly report a condition are
# mapped. `o2` entries are (column, unit, basis); unit is "percent" or
# "fraction"; basis is "initial" / "ambient" / "reported".
TABLE_CONFIG: dict[str, list[dict[str, Any]]] = {
    "PSI-10": [
        {
            "match": "Inverse Flame",
            "name": "Flame Design — inverse flames",
            "phase": "gas",
            "o2": [("XO2", "fraction", "initial")],
            "pressure": ("pmean (atm)", "atm"),
            "fuel": "Flame Type",
        },
        {
            "match": "Normal Flame",
            "name": "Flame Design — normal flames",
            "phase": "gas",
            "o2": [("XO2 (init)", "fraction", "initial")],
            "pressure": ("pmean (atm)", "atm"),
            "fuel": "Fuel",
        },
    ],
    "PSI-20": {
        "name": "ACME BRE — burning rate emulator",
        "phase": "gas",
        "o2": [("Oxygen Conc (percent)", "percent-list", "reported")],
        "fuel": "Fuel Bottle",
    },
    "PSI-21": {
        "name": "ACME CLD Flame — coflow diffusion",
        "phase": "gas",
        "fuel": "Fuel Bottle",
    },
    "PSI-22": {
        "name": "ACME E-FIELD Flames",
        "phase": "gas",
        "fuel": "Fuel Bottle",
        "analog": True,
    },
    "PSI-23": {
        "name": "ACME s-Flame — spherical diffusion",
        "phase": "gas",
        "o2": [("Atmosphere*", "atmosphere", "reported")],
        "fuel": "Fuel Bottle",
    },
    "PSI-25": {
        "name": "BASS-II — solid burning & suppression",
        "phase": "solid",
        "o2": [("Calibrated  initial O2 % by vol ", "percent", "initial")],
        "fuel": "Fuel Sample Material",
    },
    "PSI-26": {
        "name": "BASS — solid burning & suppression",
        "phase": "solid",
        "fuel": "Fuel Sample Material",
    },
    "PSI-39": {
        "name": "CFI — cool flames (liquid droplets)",
        "phase": "liquid",
        "o2": [("Oxygen", "fraction", "initial")],
        "pressure": ("Pressure", "atm-string"),
        "fuel": "Fuel ",
    },
    "PSI-47": {
        "name": "DAFT / DAFT-2 — aerosol measurement",
        "phase": "aerosol",
        "fuel": "Sample Material",
    },
    "PSI-68": {
        "name": "FLEX-2 — droplet combustion",
        "phase": "liquid",
        "o2": [("Oxygen Mole Fraction", "fraction-list", "initial")],
        "pressure": ("Ambient Pressure (atm)", "atm-list"),
        "fuel": "Sample (Fuel Type)",
    },
    "PSI-69": {
        "name": "FLEX — droplet extinction",
        "phase": "liquid",
        "o2": [("O initial ambient composition; mole fraction", "fraction", "ambient")],
        "pressure": ("Ambient pressure; mmHg", "mmHg"),
        "fuel": "Fuel",
        "outcome": "Test end",
    },
    "PSI-98": {
        "name": "SAFFIRE-I — large-scale fire",
        "phase": "solid",
        "o2": [("Percent O2", "atmosphere", "reported")],
        "fuel": "Material",
    },
    "PSI-99": {
        "name": "SAFFIRE-II — large-scale fire",
        "phase": "solid",
        "o2": [("Percent O2 (Note 1)", "atmosphere", "reported")],
        "fuel": "Material",
    },
    "PSI-100": {
        "name": "SAFFIRE-III — large-scale fire",
        "phase": "solid",
        "fuel": "Material",
    },
    "PSI-101": {
        "name": "SAME-R — smoke aerosol reflight",
        "phase": "solid",
        "fuel": "Sample Type",
    },
    "PSI-102": {
        "name": "SAME — smoke aerosol",
        "phase": "solid",
        "fuel": "Sample Material  ",
    },
    "PSI-106": {
        "name": "SLICE — structure & liftoff",
        "phase": "gas",
        "fuel": "Fuel Type",
    },
    "PSI-107": {
        "name": "SPICE — smoke point in coflow",
        "phase": "gas",
        "fuel": "Fuel",
    },
    "PSI-159": [
        {
            "match": "Inverse",
            "name": "CFI-G — inverse flames",
            "phase": "gas",
            "o2": [("XO2", "fraction", "initial")],
            "pressure": ("approx p (bar)", "bar"),
            "fuel": "Fuel",
            "outcome": "Comments",
        },
        {
            "match": "Normal",
            "name": "CFI-G — normal flames",
            "phase": "gas",
            "o2": [("XO2 before test", "fraction", "initial")],
            "pressure": ("approx p (bar)", "bar"),
            "fuel": "Fuel",
            "outcome": "Comments",
        },
    ],
    "PSI-142": {
        "name": "Cool-flame data summary",
        "phase": "gas",
    },
}

# Investigations whose tables are descriptive summaries rather than test rows.
SUMMARY_TABLES = {"PSI-142"}

SCENARIO_META = {
    "spacecraft": {
        "id": "spacecraft",
        "label": "Spacecraft cabin",
        "gravity": "Microgravity",
        "target": "~21% O₂, 1 atm",
        "status": "Direct evidence",
        "statusKey": "direct",
        "summary": "Microgravity solid-fuel tests exist, but most were run at Earth-like oxygen. Suppression and smoke data are available.",
        "evidence": ["PSI-25", "PSI-98", "PSI-99", "PSI-69", "PSI-102"],
    },
    "lunar": {
        "id": "lunar",
        "label": "Lunar habitat",
        "gravity": "1/6 g",
        "target": "≥30% O₂, ≤10.2 psi",
        "status": "Analogical + gap",
        "statusKey": "gap",
        "summary": "No lunar-gravity combustion dataset. No solid-material test in the PSI snapshot reaches the ≥30% O₂ band.",
        "evidence": ["PSI-25", "PSI-159", "PSI-23", "PSI-22"],
    },
    "mars": {
        "id": "mars",
        "label": "Mars habitat",
        "gravity": "0.38 g",
        "target": "Mission-dependent",
        "status": "Analogical + gap",
        "statusKey": "gap",
        "summary": "No Mars-gravity combustion dataset. Partial-gravity behavior must be bounded from microgravity and 1 g evidence.",
        "evidence": ["PSI-25", "PSI-69", "PSI-159"],
    },
}

# --------------------------------------------------------------------------
# Small helpers
# --------------------------------------------------------------------------


def as_text(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (int, float)):
        return str(value)
    text = str(value)
    text = re.sub(r"<\s*br\s*/?\s*>", "\n", text, flags=re.I)
    text = re.sub(r"</\s*p\s*>", "\n\n", text, flags=re.I)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    text = text.replace("\xa0", " ")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def first_sentence(text: str, limit: int = 240) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return ""
    m = re.match(r"(.+?[.!?])(?:\s|$)", text)
    sentence = m.group(1) if m else text
    if len(sentence) > limit:
        sentence = sentence[: limit - 1].rsplit(" ", 1)[0] + "…"
    return sentence


def num(value: Any) -> float | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text or text.lower() in {"none", "n/a", "na", "null", "nan", "-"}:
        return None
    text = text.replace(",", "").replace("%", "").strip()
    try:
        n = float(text)
    except ValueError:
        return None
    if math.isnan(n) or math.isinf(n):
        return None
    return n


RANGE_RE = re.compile(
    r"(~|approx\.?|about)?\s*(\d+(?:\.\d+)?)\s*(?:-|–|—|to)\s*(\d+(?:\.\d+)?)",
    re.I,
)
SINGLE_RE = re.compile(r"(~|approx\.?|about)?\s*(\d+(?:\.\d+)?)", re.I)
LIST_SPLIT_RE = re.compile(r"\s*(?:;|,|/|\bor\b|\band\b)\s*", re.I)


def parse_o2(raw: Any, unit: str) -> dict[str, Any] | None:
    """Parse one O2 cell into a normalized min/max without inventing values."""
    if raw is None:
        return None
    text = str(raw).strip()
    if not text or text.lower() in {"none", "n/a", "na", "-"}:
        return None
    if unit == "atmosphere":
        # Handles plain ranges ("21.5 - 21.7"), approximations ("~ 21.5") and
        # mixed atmospheres ("~30% and ~21% O2 with He") without assuming a
        # value where none is given.
        m = RANGE_RE.search(text)
        if m:
            a, b = float(m.group(2)), float(m.group(3))
            if 0 < a <= 100 and 0 < b <= 100:
                return {
                    "min": min(a, b),
                    "max": max(a, b),
                    "approximate": True,
                    "raw": text,
                }
        matches = list(re.finditer(r"(~|approx\.?|about)?\s*(\d+(?:\.\d+)?)\s*%", text, re.I))
        values = [float(m.group(2)) for m in matches if 0 < float(m.group(2)) <= 100]
        if values:
            return {
                "min": min(values),
                "max": max(values),
                "approximate": True,
                "raw": text,
            }
        # A bare approximation such as "~ 21.5" carries no percent sign.
        plain = re.fullmatch(r"\s*(~|approx\.?|about)?\s*(\d+(?:\.\d+)?)\s*", text, re.I)
        if plain and 0 < float(plain.group(2)) <= 100:
            value = float(plain.group(2))
            return {
                "min": value,
                "max": value,
                "approximate": True,
                "raw": text,
            }
        return raw_range(text, "reported")
    if unit.endswith("-list"):
        values = []
        bad = []
        for piece in LIST_SPLIT_RE.split(text):
            parsed = parse_o2(piece, "fraction" if unit.startswith("fraction") else "percent")
            if not parsed:
                raw_num = num(piece)
                if raw_num is not None and raw_num > 100:
                    bad.append(piece.strip())
                continue
            if parsed["max"] > 100:
                bad.append(piece.strip())
                continue
            values.extend([parsed["min"], parsed["max"]])
        if not values:
            return {
                "min": None,
                "max": None,
                "approximate": None,
                "raw": text,
                "malformed": bad,
            }
        return {
            "min": min(values),
            "max": max(values),
            "approximate": False,
            "raw": text,
            "malformed": bad,
        }

    scale = 100.0 if unit == "fraction" else 1.0
    m = RANGE_RE.search(text)
    if m:
        a, b = float(m.group(2)) * scale, float(m.group(3)) * scale
        return {
            "min": min(a, b),
            "max": max(a, b),
            "approximate": bool(m.group(1)),
            "raw": text,
        }
    m = SINGLE_RE.search(text)
    if m:
        value = float(m.group(2)) * scale
        if value > 100:
            return None
        return {
            "min": value,
            "max": value,
            "approximate": bool(m.group(1)),
            "raw": text,
        }
    return None


def raw_range(text: str, basis: str) -> dict[str, Any]:
    return {"min": None, "max": None, "approximate": None, "raw": text, "basis": basis}


def parse_pressure(raw: Any, unit: str) -> float | None:
    if raw is None:
        return None
    text = str(raw).strip()
    if not text or text.lower() in {"none", "n/a", "na", "-"}:
        return None
    m = SINGLE_RE.search(text)
    if not m:
        return None
    value = float(m.group(2))
    if value <= 0:
        return None
    if unit == "mmHg":
        return value / 760.0
    if unit == "bar":
        return value * 0.986923
    return value


def local_name(path: str) -> str:
    return path.rstrip("/").split("/")[-1]


def flatten_tree(nodes: list[dict[str, Any]], path: str = "") -> list[dict[str, Any]]:
    out: list[dict[str, Any]] = []
    for node in nodes or []:
        name = node.get("displayName") or local_name(node.get("key", ""))
        current = f"{path}/{name}".strip("/")
        children = node.get("files") or []
        if children:
            out.extend(flatten_tree(children, current))
        else:
            out.append(
                {
                    "name": node.get("displayName") or local_name(node.get("key", "")),
                    "path": current,
                    "category": node.get("sortingCategory") or "Other",
                    "sizeBytes": node.get("bytes_size"),
                    "key": node.get("key"),
                }
            )
    return out


def human_category(cat: str) -> str:
    mapping = {
        "Raw Data": "Raw data",
        "Analyzed Data": "Analyzed data",
        "Science Documents": "Science documents",
        "Engineering Documents": "Engineering documents",
        "Reports": "Reports",
        "Presentations": "Presentations",
        "Experimental table": "Experimental tables",
        "Representative Image(s)": "Representative images",
        "Investigation Metadata Files": "Metadata",
        "Calibration": "Calibration",
        "Reference Data": "Reference data",
    }
    return mapping.get(cat, cat)


def classify_kind(project_type: str, accession: str) -> tuple[str, str, str]:
    pt = (project_type or "").lower()
    if "microgravity" in pt:
        return "flight", "Flight experiment", "microgravity"
    if accession in {"PSI-60", "PSI-62", "PSI-115", "PSI-117"}:
        return "analysis", "Modeling & analysis", "normal_gravity"
    if "ground" in pt:
        return "ground", "Ground experiment", "normal_gravity"
    return "ground", "Ground study", "normal_gravity"


def dataset_download_url(accession: str, filename: str, version: int | None) -> str:
    from urllib.parse import quote

    v = version if version is not None else 1
    return (
        f"https://psi.nasa.gov/geode-py/ws/studies/{accession}/download"
        f"?file={quote(filename)}&version={v}&redirect=false"
    )


# --------------------------------------------------------------------------
# Load investigations
# --------------------------------------------------------------------------


def load_investigations(details_dir: Path, trees_dir: Path, tables_dir: Path) -> tuple[list[dict], list[dict], list[dict]]:
    investigations: list[dict] = []
    experiments: list[dict] = []
    evidence_points: list[dict] = []
    detail_files = sorted(glob.glob(str(details_dir / "*.json")))

    for detail_file in detail_files:
        detail = json.loads(Path(detail_file).read_text())
        acc = detail.get("accession")
        if not acc:
            continue
        tree_file = trees_dir / f"{acc}.json"
        tree = json.loads(tree_file.read_text()) if tree_file.exists() else {"files": []}
        flat = flatten_tree(tree.get("files", []))
        counts = Counter(x["category"] for x in flat)

        kind, kind_label, gravity = classify_kind(detail.get("projectType", ""), acc)
        is_analog = acc == "PSI-22"
        gravity_tags = [gravity]
        if is_analog:
            gravity_tags.append("partial_gravity_analog")

        objective = as_text(detail.get("objective"))
        approach = as_text(detail.get("approach"))
        hypothesis = as_text(detail.get("hypothesis"))
        impacts = as_text(detail.get("researchImpacts"))

        publications = []
        for pub in detail.get("publications") or []:
            if not isinstance(pub, dict):
                continue
            doi = (pub.get("doi") or "").strip()
            publications.append(
                {
                    "title": as_text(pub.get("title")),
                    "authors": as_text(pub.get("authorList")),
                    "doi": doi or None,
                    "doiUrl": f"https://doi.org/{doi}" if doi else None,
                    "pubmedId": pub.get("pubMedID") or None,
                }
            )

        contacts = []
        for person in detail.get("contacts") or []:
            if not isinstance(person, dict):
                continue
            name = " ".join(
                x for x in [person.get("firstName"), person.get("midInitials"), person.get("lastName")] if x
            ).strip()
            if not name:
                continue
            roles = [r.get("annotationValue") for r in person.get("roles") or [] if isinstance(r, dict)]
            contacts.append(
                {
                    "name": name,
                    "roles": [r for r in roles if r],
                    "email": person.get("email") or None,
                }
            )

        license_name = as_text(detail.get("licenseName")) or None
        license_link = as_text(detail.get("licenseLink")) or None
        license_id = as_text(detail.get("licenseIdentifier")) or None
        if acc == "PSI-10":
            license_name = None
            license_link = None
            license_id = None

        tables_meta = [t for t in detail.get("experimentalTable") or [] if isinstance(t, dict)]
        table_meta_by_name = {t.get("file_name"): t for t in tables_meta}

        inv_tables: list[dict] = []
        csv_files = sorted(glob.glob(str(tables_dir / f"{acc}__*.csv")))
        for csv_file in csv_files:
            fname = Path(csv_file).name
            display_table = fname.split("__", 1)[1] if "__" in fname else fname
            cfg_list = TABLE_CONFIG.get(acc)
            if not cfg_list:
                continue
            if isinstance(cfg_list, dict):
                cfg_list = [cfg_list]
            cfg = next((c for c in cfg_list if c.get("match", "") in display_table), None)
            if cfg is None:
                cfg = cfg_list[0]

            with open(csv_file, encoding="utf-8-sig", errors="replace") as fh:
                reader = csv.DictReader(fh)
                columns = reader.fieldnames or []
                rows = [dict(r) for r in reader]

            table_id = f"{acc}-{re.sub(r'[^a-z0-9]+', '-', display_table.lower()).strip('-')}"
            parsed_rows = []
            o2_values: list[dict] = []
            pressure_values: list[float] = []
            fuel_values: list[str] = []
            malformed: list[str] = []

            for idx, row in enumerate(rows, start=2):
                clean_row = {
                    (k.strip() if isinstance(k, str) else k): (v.strip() if isinstance(v, str) else v)
                    for k, v in row.items()
                    if k is not None
                }
                row_o2 = None
                for column, unit, basis in cfg.get("o2", []):
                    candidates = [c for c in clean_row if c.strip() == column.strip()]
                    if not candidates:
                        continue
                    parsed = parse_o2(clean_row.get(candidates[0]), unit)
                    if parsed:
                        parsed["basis"] = basis
                        parsed["column"] = candidates[0]
                        parsed["row"] = idx
                        if parsed.get("malformed"):
                            malformed.extend(parsed["malformed"])
                        if parsed["min"] is not None:
                            o2_values.append(parsed)
                            row_o2 = parsed
                        break

                pressure = None
                if cfg.get("pressure"):
                    column, unit = cfg["pressure"]
                    candidates = [c for c in clean_row if c.strip() == column.strip()]
                    if candidates:
                        pressure = parse_pressure(clean_row.get(candidates[0]), unit)
                        if pressure is not None:
                            pressure_values.append(pressure)

                fuel = None
                if cfg.get("fuel"):
                    candidates = [c for c in clean_row if c.strip() == cfg["fuel"].strip()]
                    if candidates and clean_row.get(candidates[0]):
                        fuel = as_text(clean_row[candidates[0]])
                        if fuel and fuel not in fuel_values:
                            fuel_values.append(fuel)

                outcome = None
                if cfg.get("outcome"):
                    candidates = [c for c in clean_row if c.strip() == cfg["outcome"].strip()]
                    if candidates:
                        outcome = as_text(clean_row.get(candidates[0])) or None

                parsed_rows.append(
                    {
                        "row": idx,
                        "o2": row_o2,
                        "pressureAtm": round(pressure, 3) if pressure is not None else None,
                        "fuel": fuel,
                        "outcome": outcome,
                    }
                )

            valid_o2 = [v for v in o2_values if v["min"] is not None and 0 < v["min"] <= 100]
            o2_summary = None
            if valid_o2:
                mins = [v["min"] for v in valid_o2]
                maxs = [v["max"] for v in valid_o2]
                o2_summary = {
                    "min": round(min(mins), 2),
                    "max": round(max(maxs), 2),
                    "median": round(statistics.median(mins), 2),
                    "n": len(valid_o2),
                    "basis": valid_o2[0].get("basis"),
                    "approximate": any(v.get("approximate") for v in valid_o2),
                    "unit": "percent",
                }
            pressure_summary = None
            if pressure_values:
                pressure_summary = {
                    "min": round(min(pressure_values), 3),
                    "max": round(max(pressure_values), 3),
                    "median": round(statistics.median(pressure_values), 3),
                    "n": len(pressure_values),
                    "unit": "atm",
                }

            table = {
                "id": table_id,
                "investigationId": acc,
                "name": cfg.get("name", display_table.replace("PSI-", "PSI ")),
                "fileName": fname,
                "sourceTable": display_table,
                "rowCount": len(rows),
                "columns": [c.strip() for c in columns],
                "phase": cfg.get("phase"),
                "o2": o2_summary,
                "pressure": pressure_summary,
                "fuelValues": fuel_values[:12],
                "malformedO2": sorted(set(malformed)),
                "preview": [
                    {k: v for k, v in list(r.items())[:12]}
                    for r in rows[:8]
                ],
                "rows": parsed_rows if len(parsed_rows) <= 1100 else parsed_rows[:1100],
                "rowsTruncated": len(parsed_rows) > 1100,
                "description": cfg.get("description"),
            }
            inv_tables.append(table)

            if o2_summary:
                evidence_points.append(
                    {
                        "id": table_id,
                        "investigationId": acc,
                        "label": cfg.get("name", display_table),
                        "shortLabel": detail.get("investigationAcronym") or acc,
                        "gravity": gravity,
                        "gravityLabel": "Microgravity" if gravity == "microgravity" else "Normal gravity",
                        "phase": cfg.get("phase"),
                        "o2": o2_summary,
                        "pressure": pressure_summary,
                        "rows": len(rows),
                        "fuel": fuel_values[0] if fuel_values else None,
                        "sourceTable": fname,
                        "analog": bool(cfg.get("analog")),
                        "isSummaryTable": acc in SUMMARY_TABLES,
                    }
                )

        # SAFFIRE-II reports an explicit 1 g comparison. Add it as a separate
        # normal-gravity evidence point only because the table itself reports it.
        if acc == "PSI-99":
            evidence_points.append(
                {
                    "id": "PSI-99-1g-comparison",
                    "investigationId": acc,
                    "label": "SAFFIRE-II — 1 g comparison",
                    "shortLabel": "SAFFIRE-II",
                    "gravity": "normal_gravity",
                    "gravityLabel": "Normal gravity",
                    "phase": "solid",
                    "o2": {"min": 21.5, "max": 22.1, "median": 22.1, "n": 9, "basis": "reported", "approximate": True, "unit": "percent"},
                    "pressure": None,
                    "rows": 9,
                    "fuel": "Silicone / SIBAL / PMMA",
                    "sourceTable": next((t["fileName"] for t in inv_tables if "SAFFIRE-2" in t["fileName"]), None),
                    "analog": False,
                    "isSummaryTable": False,
                    "note": "Ground 1 g burn/spread comparison reported within the SAFFIRE-II flight table.",
                }
            )

        # E-FIELD has no O2 column in its summary table, so it appears only as
        # a labeled partial-gravity analog, never as a plotted O2 data point.
        if acc == "PSI-22":
            evidence_points.append(
                {
                    "id": "PSI-22-analog",
                    "investigationId": acc,
                    "label": "E-FIELD — electric-field analog",
                    "shortLabel": "E-FIELD",
                    "gravity": "partial_gravity_analog",
                    "gravityLabel": "Partial-gravity analog",
                    "phase": "gas",
                    "o2": None,
                    "pressure": None,
                    "rows": 32,
                    "fuel": "Methane / ethylene",
                    "sourceTable": next((t["fileName"] for t in inv_tables), None),
                    "analog": True,
                    "isSummaryTable": False,
                    "note": "Electric fields mimic some partial-gravity effects. This is not a partial-gravity measurement and the summary table does not report O2.",
                }
            )

        image = IMAGE_MAP.get(acc)

        investigations.append(
            {
                "id": acc,
                "accession": acc,
                "title": as_text(detail.get("title")),
                "acronym": as_text(detail.get("investigationAcronym")) or None,
                "kind": kind,
                "kindLabel": kind_label,
                "projectType": as_text(detail.get("projectType")) or None,
                "flightProgram": as_text(detail.get("flightProgram")) or None,
                "spaceProgram": as_text(detail.get("spaceProgram")) or None,
                "researchArea": as_text(detail.get("researchArea")) or None,
                "subResearchArea": as_text(detail.get("subResearchArea")) or None,
                "hardware": as_text(detail.get("experimentHardware")) or None,
                "hardwareLink": as_text(detail.get("experimentHardwareLink")) or None,
                "startDate": as_text(detail.get("investigationStartDate")) or None,
                "endDate": as_text(detail.get("investigationEndDate")) or None,
                "releaseDate": as_text(detail.get("releaseDate")) or None,
                "doi": as_text(detail.get("doi")) or None,
                "doiUrl": f"https://doi.org/{detail.get('doi')}" if detail.get("doi") else None,
                "license": license_name,
                "licenseId": license_id,
                "licenseUrl": license_link,
                "objective": objective or None,
                "approach": approach or None,
                "hypothesis": hypothesis or None,
                "impacts": impacts or None,
                "summary": first_sentence(objective) or first_sentence(approach) or None,
                "publications": publications,
                "publicationCount": len(publications),
                "contacts": contacts[:8],
                "tables": inv_tables,
                "tableCount": len(inv_tables),
                "gravity": gravity,
                "gravityTags": gravity_tags,
                "analog": is_analog,
                "image": image,
                "fileCounts": {human_category(k): v for k, v in counts.items() if v},
                "rawFileCount": counts.get("Raw Data", 0),
                "reportCount": counts.get("Reports", 0),
                "scienceDocCount": counts.get("Science Documents", 0),
                "totalFileSize": detail.get("totalFileSize"),
                "psiUrl": f"https://psi.nasa.gov/physci/repo/search?q={acc}",
                "apiUrl": f"https://psi.nasa.gov/geode-py/ws/repo/investigations/{acc}",
                "snapshotDate": SNAPSHOT_DATE,
            }
        )

    # Attach documents from file trees (reports + science documents only).
    documents = []
    for detail_file in detail_files:
        detail = json.loads(Path(detail_file).read_text())
        acc = detail.get("accession")
        tree_file = trees_dir / f"{acc}.json"
        if not tree_file.exists():
            continue
        flat = flatten_tree(json.loads(tree_file.read_text()).get("files", []))
        for item in flat:
            if item["category"] not in {"Reports", "Science Documents"}:
                continue
            documents.append(
                {
                    "id": f"{acc}-{re.sub(r'[^a-z0-9]+', '-', item['name'].lower()).strip('-')[:80]}",
                    "investigationId": acc,
                    "title": re.sub(r"[_-]+", " ", re.sub(r"\.(pdf|docx?|pptx?)$", "", item["name"], flags=re.I)).strip(),
                    "fileName": item["name"],
                    "category": "Report" if item["category"] == "Reports" else "Science document",
                    "sizeBytes": item["sizeBytes"],
                    "path": item["path"],
                }
            )

    # Attach table metadata versions for provenance.
    for inv in investigations:
        detail = json.loads((details_dir / f"{inv['id']}.json").read_text())
        meta = {t.get("file_name"): t for t in detail.get("experimentalTable") or [] if isinstance(t, dict)}
        for table in inv["tables"]:
            m = meta.get(table["fileName"])
            table["version"] = m.get("version") if m else None
            table["downloadUrl"] = dataset_download_url(inv["id"], table["fileName"], m.get("version") if m else 1)

    investigations.sort(key=lambda x: x["id"])
    return investigations, experiments, evidence_points


# --------------------------------------------------------------------------
# Statistics & insights
# --------------------------------------------------------------------------


def build_stats(investigations: list[dict], evidence_points: list[dict], documents: list[dict]) -> dict:
    by_kind = Counter(i["kindLabel"] for i in investigations)
    by_subarea = Counter(i["subResearchArea"] or "Unclassified" for i in investigations)
    by_license = Counter("CC0 1.0" if i["licenseId"] == "CC0-1.0" else "Not stated" for i in investigations)

    tables = [t for i in investigations for t in i["tables"]]
    o2_tables = [t for t in tables if t.get("o2")]
    total_rows = sum(t["rowCount"] for t in tables)
    total_files = sum(len(i.get("fileCounts", {})) for i in investigations)  # placeholder, replaced below
    raw_files = sum(i["rawFileCount"] for i in investigations)
    reports = sum(i["reportCount"] for i in investigations)
    science_docs = sum(i["scienceDocCount"] for i in investigations)
    pubs = sum(i["publicationCount"] for i in investigations)

    solid_points = [p for p in evidence_points if p.get("phase") == "solid" and p.get("o2")]
    liquid_points = [p for p in evidence_points if p.get("phase") == "liquid" and p.get("o2")]
    gas_points = [p for p in evidence_points if p.get("phase") == "gas" and p.get("o2")]
    solid_max = max((p["o2"]["max"] for p in solid_points), default=None)
    liquid_max = max((p["o2"]["max"] for p in liquid_points), default=None)
    gas_max = max((p["o2"]["max"] for p in gas_points), default=None)
    all_max = max((p["o2"]["max"] for p in evidence_points if p.get("o2")), default=None)

    solid_at_30 = [p for p in solid_points if p["o2"]["max"] >= 30]
    gas_at_30 = [p for p in gas_points if p["o2"]["max"] >= 30]
    liquid_at_30 = [p for p in liquid_points if p["o2"]["max"] >= 30]
    lunar_band = [p for p in evidence_points if p.get("o2") and p["o2"]["max"] >= 30]

    flight_ids = [i["id"] for i in investigations if i["kind"] == "flight"]
    ground_ids = [i["id"] for i in investigations if i["kind"] == "ground"]
    analysis_ids = [i["id"] for i in investigations if i["kind"] == "analysis"]

    return {
        "snapshotDate": SNAPSHOT_DATE,
        "sourceSearch": SOURCE_SEARCH,
        "psiSearchPage": PSI_SEARCH_PAGE,
        "investigations": len(investigations),
        "flightInvestigations": len(flight_ids),
        "groundInvestigations": len(ground_ids),
        "analysisInvestigations": len(analysis_ids),
        "flightIds": flight_ids,
        "groundIds": ground_ids,
        "analysisIds": analysis_ids,
        "experimentalTables": len(tables),
        "tablesWithO2": len(o2_tables),
        "tableRows": total_rows,
        "reports": reports,
        "scienceDocuments": science_docs,
        "documentsIndexed": len(documents),
        "tabularDocuments": len(documents),
        "rawFiles": raw_files,
        "publications": pubs,
        "partialGravityDatasets": 0,
        "partialGravityAnalogInvestigations": [i["id"] for i in investigations if i.get("analog")],
        "byKind": [{"label": k, "value": v} for k, v in by_kind.most_common()],
        "bySubarea": [{"label": k, "value": v} for k, v in by_subarea.most_common()],
        "byLicense": [{"label": k, "value": v} for k, v in by_license.most_common()],
        "o2": {
            "overallMax": all_max,
            "solidMax": solid_max,
            "solidMaxId": max(solid_points, key=lambda p: p["o2"]["max"])["investigationId"] if solid_points else None,
            "liquidMax": liquid_max,
            "liquidMaxId": max(liquid_points, key=lambda p: p["o2"]["max"])["investigationId"] if liquid_points else None,
            "gasMax": gas_max,
            "gasMaxId": max(gas_points, key=lambda p: p["o2"]["max"])["investigationId"] if gas_points else None,
            "solidAt30Count": len(solid_at_30),
            "liquidAt30Count": len(liquid_at_30),
            "gasAt30Count": len(gas_at_30),
            "lunarBandCount": len(lunar_band),
            "lunarBandIds": sorted({p["investigationId"] for p in lunar_band}),
            "solidMaxRows": max((p["o2"]["n"] for p in solid_points), default=0),
        },
        "evidencePoints": len(evidence_points),
    }


def build_insights(investigations: list[dict], stats: dict, evidence_points: list[dict]) -> list[dict]:
    by_id = {i["id"]: i for i in investigations}
    solid_max = stats["o2"]["solidMax"]
    gas_max = stats["o2"]["gasMax"]
    lunar_ids = stats["o2"]["lunarBandIds"]

    def src(ids: list[str]) -> list[dict]:
        out = []
        for i in ids:
            inv = by_id.get(i)
            if inv:
                out.append(
                    {
                        "id": inv["id"],
                        "label": inv["acronym"] or inv["id"],
                        "title": inv["title"],
                        "doi": inv["doi"],
                        "url": inv["psiUrl"],
                    }
                )
        return out

    insights = [
        {
            "id": "partial-gravity-gap",
            "kind": "gap",
            "metric": "0",
            "unit": "datasets",
            "title": "Partial gravity is an empty lane",
            "statement": "None of the 24 Combustion Science investigations in this PSI snapshot reports a direct lunar- or Mars-gravity combustion measurement.",
            "detail": "Microgravity and normal-gravity results can bound behavior, but they do not measure the 1/6 g or 0.38 g regimes. E-FIELD used electric fields as a partial-gravity analog; it is not gravity data.",
            "sources": src(["PSI-22", "PSI-25", "PSI-69"]),
            "severity": "critical",
        },
        {
            "id": "solid-o2-gap",
            "kind": "gap",
            "metric": f"{solid_max:g}%" if solid_max else "—",
            "unit": "highest solid O₂",
            "title": "Solid materials stop short of the lunar band",
            "statement": f"The highest reported initial oxygen concentration for a solid-material test is {solid_max:g}% (BASS-II). The lunar habitat target begins at 30% O₂.",
            "detail": "BASS-II burned PMMA, SIBAL fabric, Nomex and other solids in microgravity at 13.6–22.2% O₂. No solid-material summary table in this snapshot reports a test at or above 30% O₂.",
            "sources": src(["PSI-25", "PSI-26", "PSI-98", "PSI-99"]),
            "severity": "critical",
        },
        {
            "id": "gas-high-o2",
            "kind": "insight",
            "metric": f"{gas_max:g}%" if gas_max else "—",
            "unit": "highest gaseous O₂",
            "title": "High-oxygen evidence is gaseous",
            "statement": f"Gaseous-fuel experiments reach {gas_max:g}% O₂, but they do not answer how a solid fabric or cable burns in a 30% O₂ cabin.",
            "detail": "CFI-G inverse flames and Flame Design inverse flames extend to 85% O₂; ACME BRE tests reach 40% and s-Flame reports ~30%. Fuel phase and material geometry change the flammability question.",
            "sources": src(["PSI-159", "PSI-10", "PSI-20", "PSI-23"]),
            "severity": "info",
        },
        {
            "id": "microgravity-solid",
            "kind": "insight",
            "metric": f"{stats['o2']['solidMaxRows']}",
            "unit": "solid test rows",
            "title": "Direct microgravity solid data exists",
            "statement": "BASS-II and the SAFFIRE series provide direct microgravity burning data for solids, but at Earth-like oxygen concentrations.",
            "detail": "The evidence is strongest for spacecraft cabin conditions (~21% O₂). Extending it to a lunar habitat requires an oxygen extrapolation and a gravity extrapolation at the same time.",
            "sources": src(["PSI-25", "PSI-98", "PSI-99", "PSI-100"]),
            "severity": "info",
        },
        {
            "id": "suppression",
            "kind": "insight",
            "metric": "274",
            "unit": "FLEX test rows",
            "title": "Suppression is mapped for liquids",
            "statement": "FLEX mapped droplet extinction across oxygen, CO₂ and helium mixtures, giving the snapshot its densest suppression dataset.",
            "detail": "FLEX varies ambient pressure, O₂ (12–34%), CO₂ (0–70%) and He (0–45%) for methanol and heptane droplets. It is liquid-fuel evidence, not a solid-material suppression map.",
            "sources": src(["PSI-69", "PSI-117"]),
            "severity": "info",
        },
        {
            "id": "raw-volume",
            "kind": "insight",
            "metric": f"{stats['rawFiles']:,}",
            "unit": "raw file entries",
            "title": "A large archive, a thin summary layer",
            "statement": f"The snapshot contains {stats['rawFiles']:,} raw-data file entries but only {stats['experimentalTables']} experimental summary tables.",
            "detail": "The tables are the fast, structured retrieval layer. Raw videos and telemetry remain available in PSI for deeper analysis; they are not ingested here.",
            "sources": src(["PSI-10", "PSI-20", "PSI-106"]),
            "severity": "info",
        },
    ]
    return insights


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--details", default="/tmp/opencode/psi/details")
    parser.add_argument("--trees", default="/tmp/opencode/psi/files")
    parser.add_argument("--tables", default="/tmp/opencode/psi/downloads")
    parser.add_argument("--out", default="web/data")
    args = parser.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)

    investigations, _, evidence_points = load_investigations(
        Path(args.details), Path(args.trees), Path(args.tables)
    )

    # Documents are assembled inside load_investigations but returned separately
    # for simplicity; rebuild the list here from the same snapshot.
    documents = []
    for detail_file in sorted(glob.glob(str(Path(args.details) / "*.json"))):
        detail = json.loads(Path(detail_file).read_text())
        acc = detail.get("accession")
        tree_file = Path(args.trees) / f"{acc}.json"
        if not tree_file.exists():
            continue
        flat = flatten_tree(json.loads(tree_file.read_text()).get("files", []))
        for item in flat:
            if item["category"] not in {"Reports", "Science Documents"}:
                continue
            documents.append(
                {
                    "id": f"{acc}-{re.sub(r'[^a-z0-9]+', '-', item['name'].lower()).strip('-')[:80]}",
                    "investigationId": acc,
                    "title": re.sub(r"[_-]+", " ", re.sub(r"\.(pdf|docx?|pptx?)$", "", item["name"], flags=re.I)).strip(),
                    "fileName": item["name"],
                    "category": "Report" if item["category"] == "Reports" else "Science document",
                    "sizeBytes": item["sizeBytes"],
                    "path": item["path"],
                }
            )

    stats = build_stats(investigations, evidence_points, documents)
    insights = build_insights(investigations, stats, evidence_points)

    manifest = {
        "name": "Flame in Freefall evidence snapshot",
        "snapshotDate": SNAPSHOT_DATE,
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "source": "NASA Physical Sciences Informatics (PSI) system",
        "sourceSearch": SOURCE_SEARCH,
        "psiSearchPage": PSI_SEARCH_PAGE,
        "license": "NASA PSI records are published under their individual licenses. 23 of 24 Combustion Science records are CC0 1.0; PSI-10 has no license stated.",
        "disclaimer": "Independent project. Not affiliated with or endorsed by NASA.",
        "counts": {
            "investigations": len(investigations),
            "experimentalTables": stats["experimentalTables"],
            "tableRows": stats["tableRows"],
            "documents": len(documents),
            "evidencePoints": len(evidence_points),
            "rawFiles": stats["rawFiles"],
        },
        "dataRules": [
            "Missing values remain null; they are never replaced with zero.",
            "Initial or ambient O2 is used as the test condition; final O2 is not.",
            "Ranges and approximations such as '21.5 - 21.7' and '~21.5' are preserved as ranges and flagged approximate.",
            "Malformed values (for example 3400% in the BRE table) are excluded and listed, not silently corrected.",
            "Raw PSI data (videos, telemetry, images) is not ingested; only metadata, summary tables, documents index, publications and selected CC0 images are used.",
            "Partial-gravity claims require direct partial-gravity data. E-FIELD is labeled an analog.",
        ],
    }

    payloads = {
        "investigations.json": investigations,
        "evidence_points.json": evidence_points,
        "documents.json": documents,
        "stats.json": stats,
        "insights.json": insights,
        "scenarios.json": list(SCENARIO_META.values()),
        "manifest.json": manifest,
    }
    for filename, payload in payloads.items():
        (out / filename).write_text(json.dumps(payload, indent=2, ensure_ascii=False) + "\n")
        print(f"wrote {out / filename} ({os.path.getsize(out / filename):,} bytes)")

    print("\nSummary")
    print(f"  investigations: {stats['investigations']}")
    print(f"  flight/ground/analysis: {stats['flightInvestigations']}/{stats['groundInvestigations']}/{stats['analysisInvestigations']}")
    print(f"  tables: {stats['experimentalTables']} ({stats['tablesWithO2']} with O2), rows: {stats['tableRows']:,}")
    print(f"  solid max O2: {stats['o2']['solidMax']}")
    print(f"  liquid max O2: {stats['o2']['liquidMax']}")
    print(f"  gas max O2: {stats['o2']['gasMax']}")
    print(f"  lunar-band points: {stats['o2']['lunarBandCount']} {stats['o2']['lunarBandIds']}")
    print(f"  evidence points: {len(evidence_points)}")
    print(f"  documents: {len(documents)}")


if __name__ == "__main__":
    main()
