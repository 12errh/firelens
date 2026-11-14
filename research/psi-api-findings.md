# NASA PSI — Verified API & Data Findings

**Verified:** 14 Nov 2026, ~11:30 PKT  
**Purpose:** Ground the Flame Intelligence build in what NASA PSI actually exposes. These are observed facts from the live repository, not assumptions.

---

## 1. The public API works

The PSI 2.0 frontend is an Angular app backed by a public read-only API.

### Search

```http
GET https://psi.nasa.gov/geode-py/ws/repo/search
```

Useful parameters:

| Param | Meaning | Example |
|---|---|---|
| `term` | Free-text search | `combustion` |
| `ffield` / `fvalue` | Facet filter (repeatable) | `Research Area` / `Combustion Science` |
| `source` | Data source | `psi` |
| `type` | Record type | `investigation` |
| `from` / `size` | Pagination | `0` / `50` |
| `sort` / `order` | Sort | `Public Release Date` / `desc` |

Verified query for the challenge:

```http
GET https://psi.nasa.gov/geode-py/ws/repo/search?ffield=Research%20Area&fvalue=Combustion%20Science&size=50&from=0
```

Result: **24 combustion-science investigations**.

A free-text `term=combustion` query returns 26 hits, including records outside the Combustion Science research area. Use the facet filter for the canonical set.

### Investigation detail

```http
GET https://psi.nasa.gov/geode-py/ws/repo/investigations/{accession}
```

Example: `PSI-22` (ACME E-FIELD Flames).

Returns structured fields including:

- `accession`, `title`, `investigationAcronym`
- `doi`, `licenseName`, `licenseLink`
- `objective`, `approach`, `hypothesis`, `researchImpacts`
- `researchArea`, `subResearchArea`, `projectType`
- `flightProgram`, `experimentHardware`, `experimentHardwareLink`
- `investigationStartDate`, `investigationEndDate`, `releaseDate`
- `publications[]` (title, authors, DOI, PubMed ID)
- `experimentalTable[]`, `images[]`, `modified[]`
- `totalFileSize` (bytes; includes raw data — do **not** present this as a document-corpus size)
- `version`, `public`, `restricted`

### File tree

```http
POST https://psi.nasa.gov/geode-py/ws/files/v2
Content-Type: application/json

{"folder":"PSI-22/","fileType":"study","studyId":"PSI-22","version":7,"obfuscationcode":""}
```

Returns the full folder/file hierarchy with S3 keys, sizes, categories, and visibility.

### File download

```http
GET https://psi.nasa.gov/geode-py/ws/studies/{accession}/download?file={filename}&version={version}&redirect=false
```

The response is a **presigned S3 URL as plain text**. A second GET to that URL returns the actual file. An ingestion script must resolve this redirect.

### Representative image

```http
GET https://psi.nasa.gov/geode-py/ws/investigations/{accession}/image
```

---

## 2. What the 24 investigations contain

Counts from the live file trees, summed across the 24 Combustion Science records:

| Category | File entries |
|---|---:|
| Raw Data | 65,629 |
| Analyzed Data | 244 |
| Engineering Documents | 185 |
| Calibration | 183 |
| Presentations | 99 |
| Science Documents | 80 |
| Reference Data | 59 |
| Reports | 29 |
| Investigation Metadata Files | 24 |
| Experimental tables | 22 |
| Representative Images | 13 |

**Do not ingest raw data.** The raw folders are petabytes (examples: ACME Flame Design ~2.18 TB, ACME CFI-G ~2.09 TB, ACME CLD ~2.01 TB, FLEX-2 ~1.22 TB, E-FIELD ~0.95 TB). The useful corpus for this challenge is:

- metadata for all 24 investigations,
- 22 experimental-table CSVs,
- 29 reports + 80 science documents + selected engineering/readme documents,
- publications and DOIs,
- representative images where licensing allows.

### Field coverage

| Field | Present |
|---|---:|
| DOI | 24 / 24 |
| Objective | 24 / 24 |
| Approach | 24 / 24 |
| Hypothesis | 24 / 24 |
| Research impacts | 24 / 24 |
| Publications | 23 / 24 |
| Experiment hardware | 19 / 24 |
| Investigation acronym | 19 / 24 |
| Experimental table (metadata field) | 20 / 24 |
| Actual experimental-table CSV | 22 / 24 |

### Licensing

- 23 / 24 records: **CC0 1.0 Universal**.
- `PSI-10` (ACME / Flame Design): no license name returned in the detail payload. Treat as "license not stated; verify before redistribution."

### The canonical investigation set

| Accession | Acronym | Focus |
|---|---|---|
| PSI-26 | BASS | Solid-fuel burning and suppression |
| PSI-25 | BASS-II | Solid-fuel burning and suppression, follow-on |
| PSI-98 | SAFFIRE-I | Spacecraft fire safety demonstration |
| PSI-99 | SAFFIRE-II | Spacecraft fire safety demonstration |
| PSI-100 | SAFFIRE-III | Spacecraft fire safety demonstration |
| PSI-69 | FLEX | Droplet combustion, inert-gas suppression |
| PSI-68 | FLEX-2 | Droplet combustion, soot, suppression |
| PSI-102 | SAME | Smoke and aerosol measurement |
| PSI-101 | SAME-R | SAME reflight |
| PSI-47 | DAFT / DAFT-2 | Dust and aerosol measurement |
| PSI-39 | CFI | Cool flames, droplet combustion |
| PSI-159 | ACME CFI-G | Cool flames with gases, high O₂ |
| PSI-22 | ACME E-FIELD Flames | Electric-field effects; partial-gravity analog |
| PSI-20 | ACME BRE | Burning Rate Emulator; material flammability |
| PSI-21 | ACME CLD Flame | Coflow laminar diffusion flames |
| PSI-23 | ACME s-Flame | Spherical diffusion flames |
| PSI-10 | ACME / Flame Design | Soot and flame design |
| PSI-106 | SLICE | Structure and liftoff in combustion |
| PSI-107 | SPICE | Smoke point in coflow |
| PSI-142 | — | Cool-flame transitions (modeling/analysis) |
| PSI-62 | — | Flame-spread modeling |
| PSI-60 | — | SPICE data analysis |
| PSI-115 | — | SAME data utilization |
| PSI-117 | — | Cool-flame dynamics modeling |

Some records are modeling/analysis investigations, not new microgravity experiments. The UI must distinguish **flight experiment**, **ground/reduced-gravity experiment**, and **modeling/analysis**.

---

## 3. The experimental tables are the differentiator

The 22 CSVs are small (hundreds of bytes to ~40 KB) and contain real test conditions and outcomes. Examples:

### BASS-II (PSI-25)

129 rows. Columns include:

- `Fuel Sample Material` — PMMA film/rod/sphere, SIBAL fabric, Nomex, candle wax, etc.
- `Calibrated initial O2 % by vol` / `Calibrated final O2 % by vol`
- `Initial CO2 % by vol` / `Final CO2 % by vol`
- `Initial CO (ppm)` / `Final CO (ppm)`
- `Fan display`, `Air display`, `Flow restrictor`
- `Radiometer gain`, `Total Frames Shot`

Observed initial O₂ range: **13.6–22.2%**. This is below the ~30%+ lunar habitat target. The final-O₂ column reaches 40.4% in at least one row, which is likely a transient/sensor artifact; do not treat it as a test condition without validation.

### FLEX (PSI-69)

274 rows. Columns include:

- `Fuel` — methanol (157 rows), heptane (117 rows)
- `Ambient pressure; mmHg`
- `O initial ambient composition; mole fraction`
- `N initial ambient composition; mole fraction`
- `CO initial ambient composition; mole fraction`
- `He initial ambient composition; mole fraction`
- `Droplet initial diameter; mm`
- `Visible flame extinction diameter; mm`
- `Burning rate; mm`, `Burn time; s`

Observed ranges: O₂ **0.12–0.34** mole fraction; CO₂ **0–0.70**; He **0–0.45**; pressure up to ~2,320 mmHg. Some pressure values are 0 and should be treated as missing/failed tests, not vacuum conditions.

### ACME CFI-G (PSI-159)

Two tables:

- `CFI-G_Inverse Flames.csv` — 1,015 rows; `XO2` **0.12–0.85**; gaseous fuel; inverse flame.
- `CFI-G_Normal Flames.csv` — 179 rows; `XO2 before test` **0.18–0.40**.

This is the highest-O₂ combustion evidence in the set, but it is **gaseous fuel**, not solid material. It informs high-O₂ flammability without directly answering “will this fabric burn in a 30% O₂ lunar habitat?”

### SAFFIRE-I/II/III (PSI-98/99/100)

- SAFFIRE-I: SIBAL fabric, ~21.5–21.7% O₂, 20 cm/s airflow, 420 s concurrent burn / 70 s opposed.
- SAFFIRE-II: silicone, SIBAL, PMMA; ~21.5–22.1% O₂; includes µg vs 1g burn/spread comparisons.
- SAFFIRE-III: SIBAL fabric, 30 cm/s airflow; the summary table omits O₂.

The O₂ values are strings like `21.5 - 21.7` and `~ 21.5`; the parser must handle ranges and approximations.

### ACME BRE (PSI-20)

18 rows. `Oxygen Conc (percent)` is a **string list** such as `21; 26.5; 40`, plus malformed entries like `3400%` / `2100%`. It must be split and cleaned. Notes say chamber pressure varied but is not in the summary table. This is gaseous-fuel data (ethylene/methane) and is a **material-flammability analog**, not a solid-fuel test.

### SAME / SAME-R (PSI-102/101)

- SAME: Teflon, Kapton, silicone rubber, lampwick, dibutyl phthalate; airflow 5–10 cm/s; weight-loss rate; aging duration. Some rows say “same conditions as 1–4” and leave fields blank — the parser needs inheritance logic.
- SAME-R: 109 rows; Kapton etc.; inlet velocity 8.1 cm/s; `Rt/R0`, duration, aging/mixing times. This supports detection/aerosol analysis.

### Other tables

- SPICE (PSI-107): 469 rows; fuel, nozzle, fuel rate, air rate.
- Flame Design (PSI-10): normal and inverse flames; `XO2` up to ~0.85 in inverse cases.
- SLICE (PSI-106): 12 rows; fuel type only in the summary table.
- CFI (PSI-39): 87 rows; pressure, oxygen, nitrogen, helium, fiber, fuel.
- DAFT (PSI-47): 2 rows; hardware/sample/location only.
- FLEX-2 (PSI-68): 8 rows; fuel, initial droplet diameter, ambient mixture, O₂ mole fraction, pressure, temperature, flow velocity.

---

## 4. Scientific boundaries the product must respect

From the official challenge page:

- There is **currently no partial-gravity combustion data in PSI**.
- Microgravity and normal-gravity results can **bound** intermediate gravity behavior, but they do not directly measure it.
- E-FIELD Flames mimicked partial-gravity effects via electric fields — this is an **analog**, not lunar/Mars gravity data.
- LUCI and FM2 are future sources; they are not in the current PSI snapshot.
- Rockets and propellants are explicitly out of scope for the available PSI research.
- The lunar base/rover atmosphere is expected to be **≥30% O₂ at ≤10.2 psi**; spacesuits use 100% O₂ at 4.3 psi. This makes materials more flammable than on Earth.

Product implication: every scenario ranking and assistant answer must label evidence as **direct**, **analogical**, or **gap**. Never present a microgravity result as a lunar-gravity prediction.

---

## 5. Data-quality rules for ingestion

1. Preserve raw values and provenance (file, row, column) alongside normalized values.
2. Never invent a missing value; use `null` and surface “Not reported.”
3. Parse ranges and approximations (`21.5 - 21.7`, `~ 21.5`) into `{min, max, approximate}`.
4. Treat `0` pressure as missing when the context implies a pressurized test; document the rule.
5. Do not use final-O₂ values as test conditions; use initial/ambient O₂.
6. Split multi-value cells (`21; 26.5; 40`) into test conditions; keep the original string.
7. Distinguish flight experiments from ground tests and modeling/analysis.
8. Preserve DOIs and license/attribution; 23/24 are CC0, one is unspecified.
9. Do not display `totalFileSize` as “dataset size” without noting it includes raw data.
10. Record the snapshot date and source URLs in a manifest.

---

## 6. Product implications

- A real-data dashboard is feasible **without waiting for the RAG system**.
- The strongest flagship visual is an **Oxygen × Gravity Evidence Map**:
  - X-axis: O₂ concentration,
  - Y-axis: gravity environment (microgravity, normal gravity, partial gravity),
  - points colored by fuel phase (solid/liquid/gas),
  - shaded lunar habitat band at ≥30% O₂,
  - empty partial-gravity band annotated as an evidence gap.
- The strongest scientific insight is: **no solid-material tests at ≥30% O₂ in PSI**; the closest evidence is gaseous BRE/CFI-G at 40–85% O₂ and solid BASS/BASS-II at ≤22.2% O₂.
- The comparison module can use real conditions (fuel, geometry, O₂, pressure, airflow, suppressant, hardware) rather than mock values.
- The assistant should use **two retrieval lanes**: structured queries over the normalized tables (counts/ranges) and document RAG for interpretation. This prevents invented numbers.
- The UI must distinguish “not reported” from “zero” and “no evidence” from “evidence of no effect.”

---

## 7. Source links

- PSI search: https://psi.nasa.gov/physci/repo/search?q=combustion
- PSI API root used above: https://psi.nasa.gov/geode-py/ws/repo/search
- Challenge: https://www.spaceappschallenge.org/2026/challenges/flame-in-freefall/
- NASA Combustion Science: https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/
- Researcher’s Guide: https://www.nasa.gov/missions/station/a-researchers-guide-to-combustion-science/
- PSI tutorial: https://assets.science.nasa.gov/content/dam/science/bps/bps-general/bps-data_osdr_psi/Complete_PSI_Database_Guide.pdf

---

*Independent project. Not affiliated with or endorsed by NASA. NASA PSI data is used under its published terms; retain DOI and attribution.*
