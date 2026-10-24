# PROJECT BRIEF — Team R1 · "Firelens"
**NASA Space Apps Challenge 2026 · Lahore Local Event · Challenge: Flame in Freefall**

---

## 1. What is this event? (30-second version)

NASA Space Apps is a global hackathon. Everyone in the world builds on the same weekend. We pick one official NASA challenge and build a working digital solution for it in 2 days. Then: Lahore judges the projects → best ones become Global Nominees → NASA experts pick Global Finalists (Dec) → **10 Global Winners announced January 2027**. Everyone who submits gets an official NASA certificate on their profile.

## 2. Important dates — do not miss these

| Date | What happens | Our action |
|---|---|---|
| Now | Registration open (free) | Register on spaceappschallenge.org + [Lahore Google Form](https://forms.gle/4SBrQUEx7DMcnULG8) + join [WhatsApp group](https://chat.whatsapp.com/HuTSpR3wSkJBxB0bebJRbU) |
| **Oct 28** | Official challenge statements + full data resources published | All read the challenge page together |
| Nov 3 | "Space Apps Connect" opens (community platform: teams, SMEs, announcements) | Join it |
| Nov 13 | Submission Guide + Judging & Awards Guide released; free partner offers (Google/Microsoft/Miro/GoDaddy) | Read guides; create final project infra |
| **Nov 14–15** | THE HACKATHON — the only days we are allowed to build | Build Firelens |
| **Nov 15, 11:59 PM PKT** | Hard submission deadline via our team page | Submit early that evening |
| Dec 2026 | Global Nominees / Finalists announced | — |
| Jan 2027 | 10 Global Winners announced | — |

**Rule #1 before anything else: we cannot work on the project before Nov 14 (no coding, no designing the real product, no data prep for it). Reading, planning, and practicing on unrelated apps = allowed. This rule is from NASA's official rules.**

## 3. Our challenge — "Flame in Freefall" (plain English)

- On Earth, flames flicker upward because hot air rises. In zero gravity, nothing rises: flames become **round**, spread strangely, and can even keep burning **invisibly** at low temperature — the famous "cool flames" discovered on the ISS in 2012. A fire inside a crew spacecraft is one of the deadliest scenarios possible.
- NASA has run decades of fire experiments in space (BASS, FLEX, ACME, Saffire, SAME…). The knowledge is real, but it is scattered across hundreds of old reports and datasets that nobody can quickly search or compare.
- **Our official challenge:** build an **interactive, AI-powered ("Super Intelligence / SI") dashboard** that **summarizes, ranks, and interprets** that experimental data into fire-safety insights for Moon/Mars missions.
- Difficulty: Advanced and Intermediate tracks. Judge lens: scientific honesty + a livable product.

## 4. What we are building — "Firelens"
**One-line pitch: Firelens turns NASA's messy fire-science archive into a smart dashboard with an AI chat that answers astronaut fire-safety questions — and shows the source of every claim.**

The product has exactly 6 screens:
1. **Home** — hook: flame morphing from teardrop (Earth) to sphere (space); why fire in space is deadly
2. **Explorer** — ~25–30 experiment cards (BASS, FLEX, ACME, Saffire, SAME) with filters (fuel, agent, year, mission)
3. **Rank** — two tables: best suppression agents in microgravity; most dangerous spacecraft materials
4. **Timeline** — 1963 → 2026 scroll of experiment datasets; 2012 cool-flame discovery highlighted
5. **Mission Brief** — "If you fly to Moon/Mars: carry THIS extinguisher, avoid THESE materials" — from data
6. **SI Chat** — ask anything; the AI answers using only the provided context, with clickable citations `[BASS-II · p.12]`

Scope boundaries (deliberate): no logins/accounts, no 3D, no mobile app, no machine-learning training of our own. BASS + FLEX + ACME + Saffire done well > everything done half.

## 5. How we build it (architecture in one look)

```
Data (memory):  experiments + text chunks stored in Supabase Postgres
                embeddings via sentence-transformers (runs locally, free, no quota)
AI (voice):     RAG chat → vector search in Supabase → Groq API (llama, free tier)
                answers are streamed + citations auto-rendered
Fallbacks:      env-switch to Gemini / OpenRouter / local Ollama (if venue wifi dies)
Frontend:       Next.js + Tailwind + shadcn/ui + lucide + framer-motion + recharts
Hosting:        Vercel (UI, free) + Supabase (free tier covers us ~20x over)
Cost:           $0 total. No paid API needed for this scope.
License:        Apache 2.0, public GitHub repo (rule: NASA requires open source)
```

## 6. Build plan across the 2 days (milestones, no roles — we divide lanes together before Day 1)

**Day 1 (Nov 14):**
- Morning: read Oct 28 statement + their resource list → freeze data sources → create Supabase project + schema → seed first real experiment cards
- Midday: frontend skeleton live with the 6 pages (dummy data) — a demo-able ugly version exists by evening, non-negotiable
- Evening: real data wired; first working "ask → answer with citation" call
- Night: Timeline + Rank content; break early enough to sleep

**Day 2 (Nov 15):**
- Midnight–morning: Mission Brief + chat polish + guardrails (never invent, always cite)
- Forenoon: README, repo cleanup, Apache 2.0 license, keep-alive cron for Supabase
- Afternoon: 90-second demo video (screen + voice), 3 takes max
- Evening: fill the submission form (summary, demo video URL, project URL, SI-usage description, NASA data links, references) → **submit before 23:59 PKT**

## 7. Rules of the game (the short list that keeps us eligible)

- Team: 2 people is valid (min 1, max 6). Both members must be registered and on team page R1, event = Lahore.
- Build window: only Nov 14–15. Prep before ≠ project work.
- Everything open source + every source cited — even free ones. NASA strips nominations for missing citations.
- We MUST document how we used AI tools in the submission ("Use of SI" field is mandatory).
- No faces of under-18s in the video/submission.
- Free event — if anyone asks money for any Space Apps step in Lahore, report it to info@spaceappschallenge.org (official instruction).
- Code of conduct: discrimination/harassment → contact Local Lead or conduct@spaceappschallenge.org.

## 8. Venue & presence (pending confirmation)

Lahore is an **in-person** event. Venue is "To Be Disclosed" and schedule is not yet published; Local Lead will announce it.
- Plan A (recommended): both at venue for kickoff + Day 2 demo/judging moments; overnight work then home.
- Plan B: coding from home is allowed technically (project is built on our laptops either way) — but confirm with Local Lead whether venue presence is required for judging demo.
- Anywhere-plan applies: **be online and reachable on Nov 14 from 00:00 PKT.**

## 9. Immediate to-dos (this week, before Oct 28)

1. Both register on spaceappschallenge.org → choose Local Event: **Lahore**
2. Both fill the Lahore Google Form + join WhatsApp + follow Instagram
3. Owner creates Team **R1** on the site; second member joins; select challenge **Flame in Freefall**
4. Decide + message Local Lead (Hassaan Bin Zaki — hassaanbinzaki@hotmail.com) our team name & availability
5. Oct 28: all members read the official statement + resource links (our internal sync)

## 10. How we'll be judged (keep this in mind while building)

Local judges score: **Impact · Creativity · Validity · Relevance · Presentation.**
Path: Lahore judging → Global Nominees → Global Finalists → 10 Global Awards
(Galactic Impact · Best Use of Science/Data/Technology · Best Mission Concept · Most Inspirational · Storytelling · Global Connection · Art & Technology · Local Impact) → Global Winners January 2027. Historically Global Winners are invited to a NASA Winners Celebration (travel self-funded).

Firelens maps cleanly onto these: Validity = verified handwriting-free citations; Best Use of Data = PSI/NTRS made searchable; Galactic Impact = Artemis/Mars crew safety; Presentation = the flame-morph + streaming chat.

## 11. One paragraph we should all be able to say

> We're Team R1 from Lahore. Firelens is an interactive, AI-powered dashboard for the Flame in Freefall challenge: it organizes NASA's decades of microgravity combustion experiments (BASS, FLEX, ACME, Saffire, SAME) into experiment cards, ranked fire-safety comparisons, a research timeline, and an SI chat that answers questions with verified citations from the raw NASA data — built with NASA open data over the hackathon weekend, fully open source.

## 12. Contacts & links

- Global site: https://www.spaceappschallenge.org/ · 2026 hub: /2026/ · Challenge: /2026/challenges/flame-in-freefall/
- Lahore event page: https://www.spaceappschallenge.org/2026/local-events/lahore/ (Local Lead: Hassaan Bin Zaki, hassaanbinzaki@hotmail.com)
- Lahore Instagram: @nasaspaceappslahore · WhatsApp community + Google registration form (links in section 2)
- Data: PSI https://psi.nasa.gov/physci/repo · Reports https://ntrs.nasa.gov · Projects https://taskbook.nasaprs.com
- Participant Terms: /legal/ · FAQ: /participant-faq

*Detailed internal docs (architecture SQL, design system, LLM plan, free-tier report) exist in R1 private files — ask the team owner for them when we start building.*
