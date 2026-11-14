# Deployment

The app is a monorepo: the site lives in `web/`, the optional read-only API in `api/`.
Nothing requires the API to be online — the site ships with a normalized snapshot in
`web/data/` and answers every question without a key.

## 1. Vercel — the site (required)

1. Open <https://vercel.com/new> and import `12errh/firelens`.
2. Set **Root Directory** to `web`.
3. Framework preset: **Next.js**. Build command and output are detected automatically.
4. Add environment variables (Production and Preview):

   | Name | Value |
   | --- | --- |
   | `GROQ_API_KEY` | your Groq key (same value as the GitHub secret) |
   | `GROQ_MODEL` | `openai/gpt-oss-120b` |
   | `RAG_API_URL` | optional, only if the teammate's RAG service is live |
   | `RAG_API_KEY` | optional |

5. Deploy. The site is fully functional without `GROQ_*`; the assistant falls back to
   deterministic evidence answers.

> GitHub Actions secrets are not inherited by Vercel or Render. They are stored in the
> repo for CI/automation; each host needs its own copy under Project → Settings →
> Environment Variables.

### CLI alternative

```bash
cd web
npx vercel link
npx vercel env add GROQ_API_KEY production
npx vercel env add GROQ_MODEL production
npx vercel --prod
```

## 2. API mirror

### Vercel (no billing required)

The `firelens-api` project deploys `api/` with the FastAPI preset. Build command:

```
pip install -r requirements.txt && cp -r ../web/data ./data
```

Set `ALLOWED_ORIGINS=https://firelens-chi.vercel.app`.

### Render (requires payment verification)

Render returns `402 Payment information is required` for new services on this account.
If a card is added, the steps below still apply.

1. Open <https://dashboard.render.com/blueprints> and connect `12errh/firelens`.
2. Render reads `render.yaml` and creates `flame-in-freefall-api`.
3. Set `ALLOWED_ORIGINS` to the Vercel production URL, for example
   `https://firelens.vercel.app`. Multiple origins can be comma-separated.
4. Deploy. Health check: `https://<service>.onrender.com/api/health`.

Endpoints: `/api/manifest`, `/api/statistics`, `/api/investigations`,
`/api/investigations/{id}`, `/api/evidence`, `/api/search?q=`, `/api/compare?a=&b=`,
`/api/insights`, `/api/scenarios`, `POST /api/chat`.

## 3. Post-deploy verification

Production URL: <https://firelens-chi.vercel.app>

- [ ] `/` returns the dashboard and the oxygen × gravity map renders.
- [ ] `/investigations/PSI-25` loads directly (static params).
- [ ] `/assistant` answers "What is the highest oxygen concentration?" (Groq or fallback).
- [ ] `/methodology` shows provenance, limits, and the AI disclosure.
- [ ] Paste the Vercel URL into the submission form, plus the GitHub repo.

## Security notes

- `web/.env`, `api/.env`, and every `.env*` are ignored; only `.env.example` is tracked.
- The snapshot contains public NASA PSI metadata and tables (CC0 unless noted).
- `POST /api/chat` is rate-limited to 20 requests/minute per instance.
