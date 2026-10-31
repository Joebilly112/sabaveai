# sabave.ai

A predictive, weather-triggered marketing module for Orbyte. It watches the haze forecast for each Malaysian micro and small business, and two days before the air turns unhealthy it prepares an on-brand campaign the owner can approve in minutes.

> Nobody buys an umbrella after they’re soaked. Yet that’s how small shops face the haze: they react once the tables are empty. sabave.ai predicts it.

## Team Information

| Field | Details |
|---|---|
| Team Name | Nabil The Goat |
| Team Domain | Domain 2 (Alpha Red Solutions · Orbyte Smart SME Challenge) |
| SDG Track (1–17) | SDG 8: Decent Work and Economic Growth (8.2, 8.3) · SDG 13: Climate Action (13.1) |
| Team Leader | Nabil Hilmi Tsaqifi |
| University | Monash University Malaysia |
| Number of Members | 1 |

## Links

| Resource | Link |
|---|---|
| Live Demo (final) | https://sabave.web.app |
| GitHub Repository | https://github.com/Joebilly112/sabaveai |
| Final Pitch Deck | `submission/SDC2026_NabilTheGoat_PitchDeck.pptx` |
| Preliminary Demo Video | https://youtu.be/Fa1BEJwJaj8 |
| RunPod Endpoint | Not used (no GPU workload) |

## Overview

### Problem

When haze arrives, walk-in customers disappear the same day. Eateries in Kuala Lumpur and Shah Alam reported **20–35% sales drops** during the October 2026 haze (Malay Mail, 25 Oct 2026), and the haze is estimated to cost Malaysia **up to RM1 billion of GDP a month** (MARC Ratings, via The Vibes, 18 Oct 2026) or RM20–50 million a day (The Star, 14 Oct 2026). Research shows restaurant visits fall the day pollution rises and keep falling for a week (Sun, 2025), and spending moves closer to home and online.

Most owners react too late, or not at all, because one weather promotion costs about **90 minutes** of their time: spot the forecast, pick an offer, design a poster, write captions in BM and English, then post. Big chains have marketing teams. A kopitiam has the owner.

### Solution

sabave.ai turns the forecast into a ready campaign before the haze hits:

1. **Forecast:** checks the PM2.5 forecast for the outlet’s location (Open-Meteo / Copernicus CAMS).
2. **Trigger:** opens an alert when a forecast day reaches Unhealthy (PM2.5 > 55 µg/m³).
3. **Rules decide:** deterministic rules read the business’s Brand Kit and propose campaign options, each with a reason and a budget (for example, no delivery campaign for a shop that doesn’t deliver).
4. **AI writes:** DeepSeek writes Bahasa Malaysia and English captions only, checked against a never-say list, with a template fallback.
5. **Owner approves:** staff can draft; only the Owner can approve or reject, enforced on the server. Every step is written to the activity log.

### Key Features

- **Predictive haze trigger:** live Open-Meteo PM2.5 forecasts per location through a pluggable signal engine, with an offline fallback and a Simulate button for demos.
- **Onboarding that builds the Brand Kit:** an 8-step wizard for business details, menu items with photos and prices, delivery, channels, budget cap, tone, never-say list and team roles.
- **Explainable options:** every suggested campaign says why it fits this business and how much to spend.
- **Bilingual AI copy:** strict-JSON captions in BM and English, validated, retried once, and replaced by template copy if the model fails.
- **Server-side approval:** Staff and Owner roles, budget cap re-check and never-say re-check before anything publishes; rejections require a reason.
- **Activity log:** who, what, when and why for every step, readable in the app.
- **Demo-ready accounts:** demo owners (kopitiam, laundromat, boutique) open a pre-filled onboarding; new sign-ups start empty so judges can create their own business; “Reset my demo” clears only that account.
- **Public site:** Home, Solutions (cited haze evidence and business-type examples) and Pricing.

### Measured Impact (final prototype)

| Metric | Phase 1 baseline | Target | Final prototype |
|---|---|---|---|
| Alert → published | ~90 min of owner time | ≤10 min | 20.5 s system time + owner review (scripted run, activity-log timestamps) |
| Owner actions | 7 manual steps | ≤4 | 4 (alert, select option, submit, approve) |
| Lead time before haze | 0 days (reacts after) | ≥2 days | 1 day in the simulated scenario; live forecast covers 5 days |
| Banned wording published | unchecked | 0 | 0 (blocked by rules and server re-check) |

Next step: a pilot with 3–5 Klang Valley F&B outlets to measure revenue protected.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript 5.9, Vite 7, Tailwind CSS 4, shadcn/ui (Radix), wouter, TanStack Query |
| Backend | Node.js 22, Express 5 (TypeScript), pino logging |
| API contract | OpenAPI spec with Orval-generated React client and Zod schemas |
| Data | In-memory store (synthetic seed data optional via `SABAVE_AUTOSEED`); Drizzle/PostgreSQL schema scaffolded for persistence |
| AI | DeepSeek API (`deepseek-v4-pro`, OpenAI-compatible), server-side only; no GPU needed |
| Weather data | Open-Meteo Air Quality API (Copernicus CAMS PM2.5) |
| Hosting | Firebase Hosting (web app) + Firebase Cloud Functions 2nd gen (Express API, `/api/**` rewrite) |
| Development | Replit (Phase 1), Cursor (Phase 2) |

## Project Structure

```
.
├── artifacts/
│   ├── api-server/              # Express API (runs locally or as the Firebase function "api")
│   │   └── src/
│   │       ├── lib/             # activityLog, approvalService, brandAnalyzer, campaignRules,
│   │       │                    # copyGenerator, llm (DeepSeek), metaConnector, neverSay,
│   │       │                    # store, triggerEngine, websiteReader, stage tests
│   │       ├── routes/          # brand, businesses, drafts, forecast, health, trigger
│   │       ├── signals/         # hazeSignal, signal registry
│   │       ├── app.ts
│   │       └── index.ts         # API entry point
│   ├── sabave-ai/               # React + Vite web app (site, onboarding, dashboard, Brand Kit, Activity Log)
│   └── mockup-sandbox/          # UI component sandbox (not part of the app)
├── data/
│   ├── businesses.json          # Synthetic SME businesses and demo presets
│   └── offlineForecast.json     # Fallback forecast when the weather API is unreachable
├── lib/
│   ├── api-spec/                # openapi.yaml + Orval config
│   ├── api-client-react/        # Generated React API client
│   ├── api-zod/                 # Generated Zod schemas
│   └── db/                      # Drizzle scaffold (not used by the prototype yet)
├── submission/                  # Required submission documents
├── firebase.json                # Hosting config and /api rewrite
├── LICENSE                      # Apache License 2.0
├── package.json                 # pnpm workspace root
└── README.md
```

## Architecture

```
User (Owner / Staff) ──► React web app ── Firebase Hosting (sabave.web.app)
                              │  /api/** rewrite
                              ▼
                     Express API ── Firebase Cloud Function "api" (Node 22)
                       ├─► Weather signal engine ──► Open-Meteo Air Quality API (fallback: offline forecast)
                       ├─► Trigger engine ──► alert when a day reaches Unhealthy
                       ├─► Campaign rules (deterministic, from the Brand Kit)
                       ├─► Copy generator / Brand analyzer ──► DeepSeek API (fallback: templates)
                       ├─► Approval service (Owner-only, budget cap, never-say check)
                       ├─► Social connector ──► Meta (simulated)
                       └─► Activity log ──► shown in the app
```

## How to Run

### Option 1: Use the live demo

Open https://sabave.web.app, sign up with any new account to onboard your own business, or use the demo accounts provided to the judges. Demo credentials are not stored in this public repository.

### Option 2: Run locally

```bash
# 1. Clone the repository
git clone https://github.com/Joebilly112/sabaveai.git
cd sabaveai

# 2. Install dependencies (pnpm workspace)
pnpm install

# 3. Configure environment variables in a .env file at the repo root (gitignored)
#    DEEPSEEK_API_KEY=your_key_here
#    DEEPSEEK_MODEL=deepseek-v4-pro        # optional
#    SABAVE_AUTOSEED=false                 # optional: true pre-loads all sample shops

# 4. Run the API server and the web app (two terminals)
pnpm --filter ./artifacts/api-server run dev
pnpm --filter ./artifacts/sabave-ai run dev
```

Without a DeepSeek key, the app still runs end to end and writes captions from templates.

**Demo path:** log in as the kopitiam owner → Next through the pre-filled onboarding → Simulate haze → pick the delivery option → as Staff, edit and submit → as Owner, reject one draft with a reason and approve another → open the Activity Log → switch to the laundromat account to see different options from the same engine.

### Deploying to Firebase

The web app is built to `artifacts/sabave-ai/dist/public` and served by Firebase Hosting; `firebase.json` rewrites `/api/**` to the Cloud Function `api`, which runs the Express server. The DeepSeek key is set as a server-side environment secret on the function, never in the repository or the browser.

## Run Tests

```bash
pnpm -r --if-present run test
```

Four Node test-runner suites (`artifacts/api-server/src/lib/stage2–5.test.ts`) cover alert thresholds, budget rules, no delivery option for non-delivery shops, never-say blocking, Owner-only approval (staff approval returns 403 and is logged), approval re-checks, AI fallback, input validation and safe website fetching.

## How We Use Replit (Required)

- **Phase 1 (preliminary):** the prototype was built in Replit with Replit Agent, from our written build prompt, in staged steps tested before each commit. It was deployed with Replit Deployments, with the DeepSeek key in Replit Secrets.
- **Phase 2 (finals):** following the organisers’ announcement that Replit could not be used for the finals, development moved to Cursor and hosting moved to Firebase (https://sabave.web.app). The codebase is unchanged in structure.

📄 Proof of use (Phase 1): `submission/SDC2026_NabilTheGoat_Replit_POU.pdf`

## How We Use RunPod (Required)

Not used. sabave.ai has no GPU workload: AI inference goes through the hosted DeepSeek API, so RunPod was not required. This is declared in the Technical & Tools Declaration.

## Challenges & Learnings

- Our first idea, a haze prediction dashboard, added reading work without removing any task. Reframing the forecast as a **trigger** for ready-made campaigns made it useful: from reactive to predictive.
- Every external dependency (weather API, LLM, Meta) needed a fallback so the demo journey never breaks.
- Limiting AI to the one step where it adds value (writing copy) made the system easier to explain, test and trust.
- Replit becoming unavailable mid-competition forced a move to Cursor and Firebase; keeping the API stateless behind a single `/api` rewrite made the migration quick.

## Future Improvements

- [ ] Pilot with 3–5 Klang Valley F&B outlets, measuring revenue protected
- [ ] Managed database (Firestore or PostgreSQL via the Drizzle schema) and scheduled forecast checks
- [ ] Real Meta Graph API and WhatsApp Business publishing
- [ ] Rain, heat and flood signals; Chinese and Tamil copy
- [ ] Campaign performance tracking

## Team

| Name | Role | GitHub |
|---|---|---|
| Nabil Hilmi Tsaqifi | Team Lead / Full-stack | Joebilly112 |

## Submission Checklist

- [x] Team name, domain (Domain 2) and SDG tracks filled in
- [x] Live demo link added (https://sabave.web.app)
- [x] Final pitch deck exported as PDF in `submission/`
- [x] Final project report completed (`submission/SDC2026_NabilTheGoat_Final.pdf`)
- [x] Technical & Tools Declaration updated (`submission/SDC2026_NabilTheGoat_TechDeclaration.pdf`)
- [x] Replit use (Phase 1) and the move to Cursor and Firebase (Phase 2) declared
- [x] RunPod not used (no GPU workload), declared
- [x] "How to Run" steps verified
- [x] No API keys, passwords or secrets committed to the repository

## License

This project is licensed under the Apache License 2.0.
