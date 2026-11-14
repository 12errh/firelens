# Flame in Freefall

Live: <https://firelens-chi.vercel.app> · Code: <https://github.com/12errh/firelens>

**An evidence workbench for combustion in reduced gravity.**
Built for NASA Space Apps Challenge 2026 from the public NASA Physical Sciences Informatics (PSI) Combustion Science snapshot.

> Independent project. Not affiliated with, sponsored by, or endorsed by NASA.
> NASA logos and insignia are not used.

## The question

A lunar or Mars habitat will not burn like the International Space Station, and it will not burn like a laboratory on Earth. What does the public evidence actually support?

Flame in Freefall answers three things, and refuses to blur them:

1. **What was measured?** 24 PSI combustion investigations, 22 published summary tables, 2,870 normalized rows, 109 indexed reports and science documents.
2. **Where is the evidence strong?** Microgravity solid, liquid, and gaseous combustion — especially spacecraft-cabin fire safety.
3. **Where is it missing?** There are **0 direct partial-gravity datasets**. Microgravity results cannot be linearly extrapolated to lunar (1/6 g) or Mars (0.38 g). The interface says so instead of filling the gap.

The flagship view is the **Oxygen × Gravity evidence map**. Every normalized experimental table is plotted by reported oxygen concentration and gravity class. The lunar habitat band starts at 30% O₂; the partial-gravity lane is empty.

## What is inside

| Route | Purpose |
| --- | --- |
| `/` | Dashboard: snapshot health, central findings, evidence classes, scenario readiness |
| `/investigations` | Searchable explorer for all 24 records |
| `/investigations/[id]` | Full record: metadata, research brief, oxygen envelope, table preview, publications, provenance, contacts |
| `/evidence` | Oxygen × gravity map, filterable evidence inventory, falsifiability conditions |
| `/assistant` | Evidence-grounded assistant with sources, confidence, and limitations |
| `/methodology` | Provenance, pipeline, normalization rules, limits, licensing, AI/SI disclosure |

Key generated data lives in `web/data/`:

- `investigations.json` — 24 normalized records
- `evidence_points.json` — 14 plotted evidence points
- `documents.json` — 109 indexed documents
- `stats.json` / `insights.json` / `scenarios.json` — computed aggregates and findings
- `manifest.json` — retrieval date, counts, and machine-readable normalization rules

## Architecture

```
NASA PSI public API
        │
        ▼
ingest/build_dataset.py ──────► web/data/*.json
        │                              │
        │                              ├──► Next.js UI (Vercel)
        │                              └──► FastAPI mirror (Render, optional)
        │
        └── selected CC0 images ──────► web/public/images/
```

- **Frontend:** Next.js 16.4.6, React 19, TypeScript, Tailwind CSS v4, Recharts.
- **Backend:** FastAPI, read-only, serves the same snapshot for external clients. The web app does not need it at runtime.
- **Assistant:** deterministic evidence engine first. Optional document-RAG proxy and optional Groq drafting, both guarded.

### Assistant lanes

1. **Deterministic (always available):** rule-based intent routing over the normalized JSON. Numbers come from the same tables that power the UI.
2. **Document RAG (optional):** set `RAG_API_URL` and `RAG_API_KEY`. Used for interpretation with citations.
3. **Groq (optional):** set `GROQ_API_KEY`; the model drafts only from retrieved evidence. A **numeric guard** rejects any draft containing a percentage that is not present in the normalized tables. The deterministic answer is returned instead, with a note explaining the rejection.

## Run locally

### Frontend

```bash
cd web
npm install
cp .env.example .env      # optional keys
npm run dev               # http://localhost:3000
npm run build             # production build
```

The site works with no environment variables. Without a key, the assistant uses the deterministic lane and labels it as such.

### Backend (optional)

```bash
python3 -m venv .venv
.venv/bin/pip install -r api/requirements.txt
.venv/bin/uvicorn api.main:app --reload --port 8000
# http://localhost:8000/docs
```

Endpoints: `/api/health`, `/api/manifest`, `/api/statistics`, `/api/investigations`, `/api/investigations/{id}`, `/api/evidence`, `/api/search?q=`, `/api/compare`, `/api/insights`, `/api/scenarios`, `/api/chat`.

### Regenerate the snapshot

```bash
.venv/bin/python ingest/build_dataset.py
```

The script queries PSI, downloads metadata and experimental summary CSVs, normalizes them, and rewrites `web/data/`. Raw PSI data products (videos, telemetry) are deliberately not ingested.

## Data rules

- Missing values remain `null`; they are never replaced with zero.
- Oxygen is the **initial or ambient** test condition, not final oxygen.
- Ranges such as `21.5 – 21.7` stay ranges and are flagged approximate.
- Malformed source values (for example `3400%` in the BRE table) are excluded and listed, not silently corrected.
- Reported test conditions are not flammability limits or material certification.
- E-FIELD (PSI-22) is an electric-field analog, not a partial-gravity measurement.
- Absence in this snapshot is not proof that no such experiment exists anywhere.

## Deployment

**Vercel (frontend):** import the repository and set **Root Directory** to `web`. Framework preset: Next.js. Add environment variables only if you want the optional assistant lanes.

**Render (backend, optional):** the included `render.yaml` deploys `api/` as a Python web service. Set `ALLOWED_ORIGINS` to your Vercel production URL. Preview domains matching `https://*.vercel.app` are allowed by regex.

## Licensing and attribution

NASA PSI records keep their own licenses. In this snapshot, 23 of 24 records are CC0 1.0; PSI-10 does not state a license and is labeled accordingly. DOIs and source links are preserved on every record. Selected images are CC0 assets from PSI record galleries.

## AI / significant support disclosure

AI coding tools were used to scaffold the application, assist with the ingestion/normalization code, and draft interface copy. Every normalized value is traceable to a published PSI summary table, and the ingestion script is included for regeneration. The assistant's deterministic lane does not require a language model; optional model drafts are constrained by the numeric guard. See `/methodology` for the full disclosure.
