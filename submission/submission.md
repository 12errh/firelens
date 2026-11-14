# Submission copy — Flame in Freefall

Fill the bracketed team details, paste the live URL, and keep the demo deck under seven slides.

---

## Project name

**Flame in Freefall**

## High-level project summary

Flame in Freefall is an evidence workbench for NASA's microgravity combustion research. It turns 24 Physical Science Informatics (PSI) investigations, 22 experimental tables, and 109 reports and documents into one navigable view for spacecraft, lunar-base, and Mars-mission fire safety.

The core finding is a gap, not a number: PSI contains **zero partial-gravity combustion datasets**. Every tabulated test ran in microgravity or at 1 g. The workbench plots all 13 tabulated oxygen conditions by gravity level, shades the lunar habitat band at ≥30% O₂, and leaves the Moon/Mars gravity lane visibly empty. Teams can see what the archive supports, what it only approximates, and what it cannot answer — before a design decision depends on it.

An assistant answers in plain language from the same normalized evidence, with a deterministic fallback and a numeric guard that rejects any generated percentage not present in the tables.

## Link to final project

https://firelens-chi.vercel.app
Code: https://github.com/12errh/firelens

## Link to project demo

`[public deck URL — GitHub Pages / Google Drive / YouTube]`

## Detailed project description

**What it does.** The dashboard ranks investigations by relevance to fire safety in habitable environments. The investigation explorer filters all 24 records by vehicle, gravity environment, fire-safety role, and data availability. Each detail page shows the experiment's purpose, its tabulated conditions, links to reports, DOIs, license status, and the PSI source record.

**The evidence map.** The flagship view plots oxygen concentration against gravity environment. Solid, liquid, and gaseous fuels are separated. A shaded band marks the ≥30% O₂ lunar habitat target. The partial-gravity lane is deliberately empty, annotated as "0 measurements." Analog studies such as E-FIELD are labeled as analogs and are not plotted as partial-gravity data.

**How it works.** A Python ingestion script reads the verified PSI snapshot and normalizes it into static JSON: investigations, evidence points, documents, statistics, insights, and scenarios. Missing or unreported values stay `null`; no value is inferred. The Next.js frontend renders statically and is deployable on Vercel. Two retrieval lanes answer questions: structured table queries for numbers, and document retrieval for interpretation. The assistant tries the teammate RAG endpoint, then a Groq-hosted model constrained to retrieved evidence, then a deterministic answer built from the tables. Answers that quote a percentage not present in the normalized data are rejected and downgraded to the deterministic path. A read-only FastAPI mirror exposes the same snapshot for external use.

**Benefits.** The workbench shortens the path from "what did NASA learn about fire in space?" to a citable answer with provenance. It makes the limits of the archive explicit, which is essential when translating microgravity results to lunar or Martian gravity. It also gives reviewers a reproducible, versioned snapshot rather than a one-off summary.

**Tools.** Next.js 16, React, TypeScript, Tailwind CSS v4, Recharts, Python 3.12, FastAPI, Pydantic, Groq API. Data: NASA PSI public repository.

## Use of Super Intelligence (SI)

Yes. SI was used as an implementation and drafting accelerator, not as the source of the idea or the data.

- **Code:** large-language-model assistance was used to write and review frontend, ingestion, and API code. All code was executed and tested locally; numbers come from the PSI snapshot, not from the model.
- **Assistant:** the deployed assistant optionally calls Groq-hosted `openai/gpt-oss-120b`. Its output is constrained to retrieved evidence and validated by a numeric guard. When no key is present, the assistant answers deterministically without a model.
- **Text and design:** SI assisted with interface copy and layout iteration. No NASA logos, mission identifiers, or branding are used.
- **Images:** the photographs are NASA PSI source images, not SI-generated. No SI-generated imagery is included in the site or deck.

This disclosure also appears on the `/methodology` page.

## NASA data and resources

- NASA Physical Science Informatics (PSI) public repository: <https://psi.nasa.gov/physci/repo/>
- 24 PSI investigation records, including BASS-II, FLEX, CFI-G, SAFFIRE-I/II/III, SAME, E-FIELD, and BRE.
- 22 experimental summary tables and 2,870 normalized test rows.
- 109 report, paper, and document records with DOIs where available.
- PSI snapshot retrieved 14 November 2026. Metadata and tables only; raw instrument files were indexed, not downloaded.

## Other references and tools

- Next.js, React, TypeScript, Tailwind CSS, Recharts, Lucide icons, FastAPI, Pydantic, Uvicorn.
- Groq API for the optional language-model lane.
- NASA Space Apps Challenge 2026 challenge brief and judging guide.
- Document licenses follow the source records: 23 of 24 investigations are CC0 1.0; PSI-10 has no specified license and is linked to, not reproduced.
