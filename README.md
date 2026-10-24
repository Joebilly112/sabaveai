# sabave.ai

A weather-triggered marketing automation module for Orbyte that turns haze and storm forecasts into on-brand, owner-approved campaigns for Malaysian micro and small businesses.

## Team Information

| Field | Details |
|---|---|
| Team Name | Nabil The Goat |
| Team Domain | Domain 2 |
| SDG Track (1–17) | SDG 8: Decent Work and Economic Growth |
| Team Leader | Nabil Hilmi Tsaqifi |
| University | Monash University Malaysia |
| Number of Members | 1 |

## Links

| Resource | Link |
|---|---|
| GitHub Repository | https://github.com/Joebilly112/sabaveai/ |
| Live Demo | https://sabaveai-weather-marketing.replit.app |
| RunPod Endpoint | Not used (no GPU workload) |
| Slide Deck | https://docs.google.com/presentation/d/1hqXOWd7N1-U9MBRl3c70iPwmOtfqQ0awOMJJik0z9oA/edit?usp=sharing |
| Demo Video | [YouTube link] |

## Overview

### Problem

Malaysian MSMEs produce 39.5% of GDP and 48.7% of jobs (DOSM, 2024), yet most run their marketing by hand. When haze or heavy rain hits, walk-in customers stay home and revenue falls; the October 2026 haze is estimated to cost Malaysia RM20–50 million a day (The Star, 14 Oct 2026). SME owners we spoke to said they mostly “just accept it”, because turning a forecast into a campaign takes hours they don’t have, while bigger competitors react days earlier.

### Solution

sabave.ai watches weather forecasts for each business’s location. When haze or a storm is forecast, deterministic rules prepare 2–3 explainable campaign options using the business’s Brand Kit. AI (DeepSeek LLM) is used only where it adds value: writing Bahasa Malaysia and English captions in the brand’s voice and summarising brand style, with a template fallback. Staff edit the draft, only the Owner can approve it within a budget cap, the campaign is published through a social connector (simulated), and every step is recorded in an activity log.

### Key Features

- **Weather trigger:** live Open-Meteo PM2.5 haze forecasts per business location through a pluggable signal engine, plus a “Simulate” button for demos.
- **Brand Kit:** logo, past poster, website voice, ethos and tone, real products and prices, channels, language, budget cap and a “never say” list.
- **Explainable options:** rules suggest 2–3 campaigns, each with a reason and a suggested budget.
- **AI copywriting:** DeepSeek writes bilingual captions as strict JSON, checked against the never-say list and a health-claim filter, with a template fallback.
- **Human approval:** Staff and Owner roles enforced on the server, with a budget cap.
- **Reusable connector and audit log:** a swappable social connector (mock Meta) and an append-only activity log.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express (TypeScript), pino logging |
| API contract | OpenAPI spec with Orval-generated React client and Zod schemas |
| Database | In-memory store seeded from synthetic JSON (Drizzle scaffold included for future persistence) |
| AI / Compute | DeepSeek API (latest Pro model, OpenAI-compatible); no GPU needed |
| Hosting / Dev | Replit |

## Project Structure

```
.
├── artifacts/
│   ├── api-server/              # Express API server
│   │   └── src/
│   │       ├── lib/             # activityLog, approvalService, brandAnalyzer, campaignRules,
│   │       │                    # copyGenerator, llm (DeepSeek), metaConnector, neverSay,
│   │       │                    # store, triggerEngine, websiteReader, stage tests
│   │       ├── routes/          # brand, businesses, drafts, forecast, health, trigger
│   │       ├── signals/         # hazeSignal, signal registry
│   │       ├── app.ts
│   │       └── index.ts         # API entry point
│   ├── sabave-ai/               # React + Vite web app (dashboard, Brand Kit, Activity Log)
│   └── mockup-sandbox/          # Replit UI component sandbox
├── data/
│   ├── businesses.json          # Synthetic SME businesses with Brand Kits
│   └── offlineForecast.json     # Fallback forecast when the weather API is unreachable
├── lib/
│   ├── api-spec/                # openapi.yaml + Orval config
│   ├── api-client-react/        # Generated React API client
│   ├── api-zod/                 # Generated Zod schemas
│   └── db/                      # Drizzle scaffold (not used by the prototype)
├── scripts/                     # Workspace scripts
├── submission/                  # Required submission documents
├── LICENSE                      # Apache License 2.0
├── package.json                 # pnpm workspace root
└── README.md
```

## Architecture

```
User (Staff / Owner) ──► React web app (Replit)
                              │  generated API client
                              ▼
                     Express API server (Replit)
                       ├─► Weather signal engine ──► Open-Meteo Air Quality API
                       ├─► Trigger engine ──► Campaign rules (deterministic)
                       ├─► Copy generator / Brand analyzer ──► DeepSeek API (fallback: templates)
                       ├─► Approval service (roles, budget cap, never-say check)
                       ├─► Social connector ──► Meta (mocked)
                       └─► Activity log ──► response shown to the user
```

## How to Run

### Option 1 — Run on Replit (Recommended)

1. Open the Replit project, or import this repository via **Create Repl → Import from GitHub**.
2. Open the **Secrets** tab (🔒) and add:
   - `DEEPSEEK_API_KEY`
   - `DEEPSEEK_MODEL` (optional; otherwise the latest Pro model is picked automatically)
3. Click **Run**. Replit starts the API server and the web app. Without a key, captions fall back to templates.

### Option 2 — Run Locally

```bash
# 1. Clone the repository
git clone https://github.com/Joebilly112/sabaveai.git
cd sabaveai

# 2. Install dependencies (this workspace uses pnpm)
pnpm install

# 3. Configure environment variables
export DEEPSEEK_API_KEY=your_key_here

# 4. Run the API server and the web app (two terminals)
pnpm --filter ./artifacts/api-server run dev
pnpm --filter ./artifacts/sabave-ai run dev
```

**Demo path:** select Kopitiam Selera Pagi → Simulate haze → Prepare campaign → as Aisyah (Staff) edit and submit → switch to Mr. Tan (Owner) → Approve & publish → open the Activity Log.

## Run Tests

```bash
pnpm -r --if-present run test
```

Stage tests live in `artifacts/api-server/src/lib/stage*.test.ts`.

## How We Use Replit (Required)

- **Development:** built in Replit, using Replit Agent to generate code from our written build prompt, in staged steps that were tested before each commit.
- **Hosting:** the app is deployed with Replit Deployments at the Live Demo link above.
- **Secrets:** the DeepSeek API key is stored in Replit Secrets, used only by the API server, and never committed to the code.

📄 Proof of use: `submission/SDC2026_NabilTheGoat_Replit_POU.pdf`

## How We Use RunPod (Required)

Not used. sabave.ai has no GPU workload: AI inference is done through the hosted DeepSeek API, so per the rules RunPod was not required. This is declared in the Technical & Tools Declaration.

## Challenges & Learnings

- Our first idea, a haze prediction dashboard, added reading work without removing any task. Reframing the forecast as a **trigger** for ready-made campaigns made it genuinely useful.
- Every external dependency (weather API, LLM, Meta) needed a fallback so the demo journey never breaks.
- Limiting AI to the one step where it adds value (writing copy) made the system easier to explain and control.

## Future Improvements

- [ ] Real Meta Graph API connector, plus WhatsApp Business and TikTok
- [ ] Rain/thunderstorm and heatwave signals, with scheduled automatic forecast checks
- [ ] Persistent database for Brand Kits, drafts and logs
- [ ] Campaign performance tracking

## Team

| Name | Role | GitHub |
|---|---|---|
| Nabil Hilmi Tsaqifi | Team Lead / Full-stack / AI | Joebilly112 |

## Submission Checklist

- [x] Team name, domain (Domain 2) and SDG track filled in
- [X] Slide deck link added
- [x] Demo video link added
- [x] Replit used, with proof of use in `submission/`
- [x] RunPod not used (no GPU workload), declared in the Technical & Tools Declaration
- [x] Preliminary submission completed (`SDC2026_NabilTheGoat_Preliminary.pdf`)
- [x] Technology declaration completed (`SDC2026_NabilTheGoat_TechDeclaration.pdf`)
- [x] Submission files renamed with your team name
- [x] "How to Run" steps verified
- [x] No API keys or secrets committed to the repository

## License

This project is licensed under the Apache License 2.0.
