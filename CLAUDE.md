# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start full stack (Vite on :5173 + Express on :3001 concurrently)
npm run dev:app      # Vite frontend only
npm run server       # Express backend only
npm run build        # Production build
npm run build:pages  # GitHub Pages static build (sets GITHUB_PAGES=true)
npm run lint         # ESLint
npm run preview      # Preview production build locally
```

No test suite is configured.

## Architecture

**ATLAS** — HR information and benefits calculator system for CFDT union employees.

**Stack:** React 18 + TypeScript + Vite (frontend) / Express.js (backend proxy) / Tailwind CSS + Radix UI

The backend (`server.js`) is a thin API proxy — it exists solely to protect API keys and avoid CORS issues. It proxies:
- `POST /api/completions` → Perplexity AI (sonar / sonar-pro models) for the chatbot
- `GET /api/rss` → France Info RSS feed for the news ticker

In production on Vercel the backend runs as serverless functions. For GitHub Pages deployments, the backend is absent and AI features degrade gracefully (static build strips the proxy).

**[App.tsx](src/App.tsx)** is the monolithic core (52 KB). It owns all top-level state and renders every view conditionally based on `currentDomain` / `currentView` state. Views include: home menu, chat, three calculators, FAQ, Métiers directory, and an admin panel.

### Key data layer

All content lives in `src/data/` as static TypeScript modules — no database:

| File | Content |
|------|---------|
| [temps.ts](src/data/temps.ts) | Working hours regulations |
| [formation.ts](src/data/formation.ts) | Training catalog |
| [teletravail.ts](src/data/teletravail.ts) | Remote work policies |
| [FAQdata.ts](src/data/FAQdata.ts) | FAQ Q&A pairs |
| [sommaireUnifie.ts](src/data/sommaireUnifie.ts) | Unified search index metadata |
| [rifseep-data.ts](src/data/rifseep-data.ts) | Career classification / RIFSEEP grades |
| [ifse2_primes.json](src/data/ifse2_primes.json) | Prime calculation lookup tables |

### Calculators

Three separate calculator components handle employee benefit calculations:
- `CalculateurPrimesV2` — IFSE/CIA prime calculation
- `CalculateurCIAV2` — 13th month / annual bonus
- `Calculateur13emeV2` — Secondary 13th month variant

All three rely on `rifseep-data.ts` and `ifse2_primes.json` for grade/amount lookups.

### Environment variables

```
PERPLEXITY_API_KEY=  # Required for chatbot — lives in .env.local (never committed)
```

Vite proxies `/api/*` to `localhost:3001` in dev (see `vite.config.ts`).

### Deployment targets

- **Vercel** — primary production deployment, Express runs as serverless functions
- **GitHub Pages** — static fallback via `npm run build:pages`; see `DEPLOYMENT_GUIDE.md`
