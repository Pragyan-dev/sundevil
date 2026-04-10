# SunDevilConnect

SunDevilConnect is a first-gen student support demo for ASU. The project is built around one idea: students often know help exists, but still delay reaching out because the process feels vague, intimidating, or emotionally costly. This app tries to reduce that friction before things become catastrophic.

Instead of only listing resources, the product combines:

- a plain-language resource finder
- a first-week narrative simulation
- a 3D/2D campus explorer
- a scholarship coach
- a faculty/advisor support dashboard
- AI-assisted chat, question generation, email drafting, and optional voice playback

The current repo is a working demo, not a production student-information system.

## What the app includes

### Student-facing experiences

- `/finder`
  - quick triage flow that recommends ASU resources based on concern, year, and prior experience
- `/rewards`
  - a full-screen rewards view with missions, badges, and local pitchfork redemption
- `/simulate`
  - the main first-week story game
  - includes advising, tutoring, office hours, MyASU, budgeting, DARS, and resource-discovery moments
- `/campus`
  - exploratory campus route
  - desktop gets a third-person 3D Tempe campus with interiors
  - mobile and unsupported browsers fall back to the 2D version
- `/chat`
  - “SunDevil Guide” chat UI backed by OpenRouter
- `/scholarships`
  - scholarship search and tracking workspace

### Staff-facing demo

- `/dashboard`
  - role selector for faculty and advisor views
- `/dashboard/faculty`
  - course-scoped student overview
- `/dashboard/advisor`
  - cross-course advising overview
- `/dashboard/messages`
  - shared thread view

The dashboard is intentionally modeled as a support-coordination layer, not a surveillance console. It uses role-specific views plus async flagging and shared notes.

## Product framing

This demo is grounded in Challenge 4: students often do not reach out early, even when support exists.

The project addresses that in three layers:

1. Make help-seeking concrete
   - the finder, walkthroughs, and campus explorer show where to go and what to expect
2. Normalize asking for help
   - the first-week story simulates common confusion points and reduces shame around tutoring, advising, and office hours
3. Support earlier human intervention
   - the faculty/advisor dashboard surfaces support signals and enables outreach or advisor review before a crisis escalates

## Tech stack

- Next.js 16.2.2 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- three.js + react-three-fiber + drei + rapier for the campus experience
- JSON-backed local data under `data/`
- local browser storage for demo persistence where appropriate

Project notes:

- `next dev --webpack` and `next build --webpack` are used explicitly
- `reactCompiler` is enabled in `next.config.ts`
- `reactStrictMode` is disabled in dev for stability with the current 3D scene behavior

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Optional environment variables

```bash
touch .env
```

Only add variables for the optional AI and voice features you want to use locally.

### 3. Start the app

```bash
npm run dev
```

Open:

- `http://localhost:3000`
- production host: `https://sundevil.vercel.app`

## Environment variables

All AI and voice features are optional for local development. Most of the app works without them.

### OpenRouter

Used by:

- `/chat`
- `/api/questions`
- `/api/faculty-email`
- `/api/advisor-email`

Variables:

```bash
APP_URL=https://sundevil.vercel.app
OPENROUTER_API_KEY=
OPENROUTER_MODEL=qwen/qwen3.6-plus:free
```

`APP_URL` is used by server-side AI routes to identify the app origin when calling upstream services. In production it should be set to `https://sundevil.vercel.app`. For local development you can override it with your local app origin if needed.

Behavior without `OPENROUTER_API_KEY`:

- chat will not work
- AI-generated questions and dashboard email drafts return a clear fallback/error response
- the non-AI parts of the app still work

### ElevenLabs

Used by:

- `/api/tts`
- story voice playback

Variables:

```bash
ELEVENLABS_API_KEY=
ELEVENLABS_MODEL_ID=eleven_flash_v2_5
ELEVENLABS_DEFAULT_VOICE_ID=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_VOICE_YOU=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_VOICE_PROF_CHEN=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_VOICE_ADVISOR_RIVERA=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_VOICE_MARCUS=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_VOICE_JORDAN=21m00Tcm4TlvDq8ikWAM
ELEVENLABS_VOICE_COUNSELOR_PARK=21m00Tcm4TlvDq8ikWAM
```

Behavior without `ELEVENLABS_API_KEY`:

- voice playback and TTS endpoints will not work
- the rest of the app still works

## Scripts

```bash
npm run dev      # start local dev server with webpack
npm run build    # production build
npm run start    # start the production server
npm run lint     # eslint
npm test         # node test runner for current tests
npm run scrape   # scrape/update ASU resource data
```

## Routes

### Primary pages

- `/`
  - landing page
- `/finder`
  - guided resource finder
- `/rewards`
  - full-screen rewards carousel with local redemption tracking
- `/flow/[resource]`
  - flow-style experience pages per resource
- `/simulate`
  - main story route
- `/simulate/advising`
- `/simulate/first-day`
- `/simulate/office-hours`
- `/simulate/tutoring`
  - focused simulation entry points
- `/campus`
  - standalone campus experience
- `/chat`
  - SunDevil Guide
- `/chat/embed`
  - compact embedded chat surface used by the MyASU SPARKY overlay
- `/myasu`
  - MyASU-inspired page
- `/scholarships`
  - scholarship coach list
- `/scholarships/[id]`
  - scholarship detail workspace

### Dashboard pages

- `/dashboard`
  - role selector
- `/dashboard/faculty`
- `/dashboard/faculty/student/[id]`
- `/dashboard/advisor`
- `/dashboard/advisor/student/[id]`
- `/dashboard/messages`

### API routes

- `/api/chat`
- `/api/questions`
- `/api/tts`
- `/api/faculty-email`
- `/api/advisor-email`
- `/api/flag`
- `/api/flag/resolve`
- `/api/check-in`

## Persistence model

This repo uses browser storage for demo behavior rather than a database.

- scholarship tracker and drafts
  - `localStorage`
- dashboard demo state
  - `localStorage`
- resource discovery / first-week progress
  - `localStorage`
- campus-to-story handoff state
  - `sessionStorage`

This means:

- the app is easy to run locally
- demo state is browser-specific
- there is no shared multi-user backend persistence yet

## Data model and content

Most app behavior is authored through local JSON and TS definition files under `data/`.

Important files:

- `data/asu_resources.json`
  - core resource metadata
- `data/finder_logic.json`
  - finder decision logic
- `data/walkthroughs/*.json`
  - advising, tutoring, counseling, financial aid, and related walkthroughs
- `data/simulation_scripts.json`
  - narrative simulation content
- `data/campus-map.json`
  - campus map layout, buildings, quests, and NPC metadata
- `data/campus-world.ts`
  - 3D world transforms, interiors, props, and campus scene config
- `data/dashboard-data.json`
  - seeded faculty/advisor/student demo data
- `data/asu_scholarships.json`
  - scholarship dataset

## Project structure

```text
app/
  api/                  API routes for chat, AI drafting, TTS, flagging, check-ins
  campus/               campus route shell
  dashboard/            faculty/advisor pages
  finder/               resource finder page
  scholarships/         scholarship coach pages
  simulate/             story routes

components/
  campus/               2D + 3D campus renderers, HUD, avatar, interactions
  dashboard/            advisor/faculty UI and local demo-state provider
  simulation/           week sim and resource discovery
  sketch/               shared visual/game systems and mini-games

data/
  JSON content and world definitions

lib/
  data loading, shared types, helpers, dashboard logic, story/session helpers

tests/
  current node-based tests
```

## Current implementation details

### Campus explorer

- desktop uses the 3D campus scene
- mobile/coarse-pointer devices fall back to the 2D campus map
- the outdoor scene is procedural and code-driven
- interiors support dialog, walkthrough, and mini-game entry points
- the player avatar and key NPCs are currently procedural campus avatars, not imported character models

### Dashboard

- seeded from `data/dashboard-data.json`
- wrapped in `DashboardDemoProvider`
- persists demo changes in browser storage
- includes async faculty flagging for advisor review, shared notes, and message threads

### Scholarships

- currently the only route with explicit test coverage in `tests/`
- uses local tracker/draft persistence
- focuses on ranking and organizing curated ASU scholarship opportunities

## Testing and validation

Run:

```bash
npm run lint
npm run build
npm test
```

Current automated test coverage is limited and centered on scholarship-coach core logic. Most of the campus, simulation, and dashboard experiences are currently validated through lint/build plus browser checks.

## Known caveats

- the app is a demo and uses local browser persistence instead of a database
- dashboard messaging/flags are not backed by auth or institutional data systems
- the 3D campus is desktop-first and intentionally falls back on smaller/coarse-pointer devices
- there are still a couple of existing lint warnings for `<img>` usage in older campus components

## Why this exists

SunDevilConnect is meant to show a stronger version of student support than “here’s a website, good luck.”

The repo is trying to make campus systems feel:

- earlier
- clearer
- more human
- less embarrassing to use for the first time

If you are demoing the project, the strongest sequence is:

1. start with `/simulate`
2. show `/campus`
3. show `/dashboard`
4. finish with `/scholarships` or `/chat`
