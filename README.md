# EgoFi (karma-dashboard)

A personal finance dashboard built as a Vite + React single-page app. Users pick a spending "tier" (Posh, Middle, or Broke) during onboarding, and the whole UI — layout, styling, and an AI chat advisor's persona — adapts to that tier. The app tracks a running balance, a "Financial Karma Score" that reacts to spending behavior, and a transaction log, and lets the user chat with an AI advisor that logs expenses and gives tier-flavored financial commentary.

## Key features

- **Tiered UI/UX**: Three distinct visual themes and copy styles (Posh, Middle, Broke) driven by `src/lib/tierConfig.ts`, applied across the dashboard, sidebar/nav, and cards.
- **Onboarding flow**: `src/components/Onboarding.tsx` selects the user's tier before entering the dashboard.
- **AI chat advisor**: `src/pages/Index.tsx` sends chat messages to a `/api/ai/chat` endpoint (proxied to an OpenAI-compatible chat completions API) with a system prompt that role-plays a persona matching the user's tier and can extract structured transaction data from natural-language input.
- **Automatic tier downgrade**: balances under £1,000 force the "Broke" tier and enable "Graveyard Mode".
- **Local waste auditor fallback**: `src/lib/wasteAuditor.ts` classifies transactions as "signal" (essential) or "noise" (discretionary) spending, used as a fallback when the AI API call fails.
- **Views**: Dashboard (balance, karma score, spending charts), Transactions list, Settings (with a hard reset), and an AI chat view.
- **shadcn/ui component library**: a full set of Radix-based UI primitives under `src/components/ui/`.

## Tech stack

- **Framework**: React 18 + TypeScript, built with Vite (SWC plugin)
- **Routing**: React Router
- **Data/state**: TanStack React Query, React Hook Form + Zod
- **UI**: Tailwind CSS, shadcn/ui, Radix UI primitives, lucide-react icons, Recharts, Framer Motion
- **Testing**: Vitest + Testing Library (unit), Playwright (e2e, via `lovable-agent-playwright-config`)
- **Deployment**: Vercel (`vercel.json` rewrites `/api/ai/chat` to an AI chat-completions proxy and serves the SPA for all other routes)
- Scaffolded with [Lovable](https://lovable.dev)

## Project structure

```
src/
  components/        # App-level components (Onboarding, Dashboard/AI/Transactions/Settings views)
  components/ui/      # shadcn/ui primitives (button, card, dialog, etc.)
  hooks/               # Custom hooks (use-mobile, use-toast)
  lib/                 # tierConfig (tiers, styles, seed data), wasteAuditor, utils
  pages/               # Route-level pages (Index, NotFound)
  test/                # Vitest setup and example test
  App.tsx              # Router and providers
  main.tsx             # App entry point
public/                # Static assets
playwright.config.ts   # Playwright e2e config
vitest.config.ts       # Vitest unit test config
vercel.json             # Deployment rewrites (API proxy + SPA fallback)
```

## Setup / installation

Requires Node.js and a package manager (npm or Bun — both a `package-lock.json` and `bun.lock`/`bun.lockb` are present).

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd karma-dashboard

# Install dependencies
npm install
# or: bun install

# Copy the environment template and fill in values
cp .env.example .env
```

Environment variables (`.env`):

| Variable | Description |
| --- | --- |
| `VITE_GEMINI_API_KEY` | API key sent as a bearer token to the `/api/ai/chat` endpoint used by the AI advisor chat feature. |

## Usage / running locally

```sh
npm run dev        # start the Vite dev server with hot reload
npm run build       # production build
npm run build:dev   # development-mode build
npm run preview     # preview the production build locally
npm run lint         # run ESLint
npm run test         # run Vitest unit tests once
npm run test:watch  # run Vitest in watch mode
```

The AI chat feature calls `/api/ai/chat`, which only resolves when deployed on Vercel (or another environment that honors `vercel.json`'s rewrite to the chat-completions proxy). If that request fails locally, the app falls back to the local waste auditor (`src/lib/wasteAuditor.ts`) to still surface spending insights.

For end-to-end tests:

```sh
npx playwright test
```
