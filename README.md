# My submission

A tablet-first cooking companion. Upload a recipe (PDF or plain text), it parses into a two-column layout, and a cooking agent handles scaling, substitution, and step-by-step guidance through chat. Backend was provided; my work was the frontend.

## Design

Every decision comes from the use context in the README: one hand occupied, arm's-length viewing, variable kitchen lighting. 50px touch targets, high contrast, generous type (Lora + Nunito), split panel so recipe and chat are always visible without navigating. Terracotta (`#C1684E`) as the accent - warm and readable in both bright and dim conditions, light grey background to reduce screen glare.

## Key decisions

**Raw AG-UI over CopilotKit** - The first thing I built was a CopilotKit proxy route. I removed it. The backend exposes an AG-UI endpoint - CopilotKit's React packages sit on top of that protocol, but they also bring their own state management, creating two sources of truth for recipe state. In hindsight the README says "AG-UI endpoint", not "CopilotKit endpoint" - the compatibility note means the protocol is compatible, not that you should use the full React stack. Going raw meant writing the SSE stream directly - more code, every state transition visible and testable.

**Hidden message to seed the agent** - The backend gives the agent only a high-level summary (title, serving count, ingredient count), not the full recipe. A hidden JSON dump injected at upload time lets the agent answer detail questions and gives it a before-state for the first chat turn. Without it, asking "change to 2 servings" on a fresh upload gets back "already at 2 servings" even though the tool changed it correctly - upload and chat are separate chains and the agent's thread is otherwise empty on turn one.

## What I'd improve with more time

- **Visual design** - foundations are right but the finish is lacking; functionality took priority and it shows at first glance
- **Session persistence** - navigating away loses everything; `localStorage` for state and messages would fix that
- **Agent-controlled tabs** - no way to say "switch to steps"; a small set of UI-control tools would make it genuinely hands-free
- **Chat auto-scroll** - should pause when the user scrolls up mid-stream and resume when they return to the bottom

---

Genuinely enjoyed this one. Reading the AG-UI event stream directly, keeping agent state in sync with the UI, and debugging why the first chat message was getting the wrong answer - that kind of problem is satisfying to work through.

---

---

---

---

## Recipe Companion Challenge

Build a cooking companion. A user drops in a recipe (PDF or text), your app extracts it, shows it beautifully, and lets the user chat with an agent that can scale servings, swap ingredients, and walk them through the steps.

The backend is done. Your job is the frontend.

## Target device: a tablet in the kitchen

Design for a **tablet**, not a laptop. The cook props it on a worktop, glances at it with wet or messy hands, follows steps while cooking. This shapes most of your UX decisions:

- **Touch-first.** Big, forgiving tap targets. No hover states — assume there is no cursor.
- **Landscape is primary.** Portrait is fine as a secondary layout; mobile is nice-to-have, not the goal.
- **Readable at arm's length.** Generous type, strong contrast, plenty of whitespace. Dense desktop-style chrome is wrong here.
- **One-handed and glanceable.** The cook is holding a spatula. Long paragraphs, deep menus and tiny controls will hurt.

If you are prototyping in a browser, set the viewport to something like **1024×768** and design against that.

## What you get

A working Python backend with:

- `POST /upload` — parses a recipe file into structured data.
- `POST /copilotkit` — an AG-UI endpoint for the cooking agent (CopilotKit-compatible).
- Shared state the agent mutates via tools (`scale_recipe`, `substitute_ingredient`, `update_cooking_progress`).

Endpoints, payloads, state shape and setup: see [backend/README.md](backend/README.md).

## What to build

### Must have

- **File upload** — accept a recipe, show something useful while it parses.
- **Chat** — wired to CopilotKit, multi-turn, streaming.
- **Recipe view** — title, time, servings, difficulty, ingredients, steps. Updates live when the agent changes state.
- **Polish** — transitions, loading states, micro-interactions. Make it feel good to use.
- **Easy to run** — one README, one command, no hunting.

### Nice to have

- Graceful fallback on phone (the target is tablet, but don't actively break on smaller screens).
- Voice input — cooking with wet hands is the ideal use case.
- Real error handling — failed uploads, agent errors, network drops.

## How I'll judge it

- **Does it work?** Golden path and a couple of edge cases.
- **Is it well designed?** UI and UX decisions you can explain.
- **Is the code maintainable?** Sensible structure, not clever for its own sake.
- **Can you explain your choices?** I'll ask about tradeoffs. "I chose X over Y because…" goes a long way.
- **Did you make it yours?** Personal touches count.

Use AI assistants freely. I care about outcomes, not keystrokes. See [agents.md](agents.md).

## Get started

### 1. Get a Gemini API key

Use Gemini's free tier. Grab a key at https://aistudio.google.com/apikey (sign in, click **Create API key**, copy it).

Create `backend/.env`:

```env
LLM_MODEL=gemini-2.0-flash
GEMINI_API_KEY=your_key_here
```

Values must not be quoted — `docker-compose` passes them literally.

### 2. Run the backend

```bash
cd backend
uv sync
uv run uvicorn src.main:app --reload --port 8000
```

Or with Docker:

```bash
docker-compose up backend
```

OpenAPI at http://localhost:8000/docs.

For state model, CopilotKit wiring and the agent's tools: [backend/README.md](backend/README.md).

## Tips

- Start with the walking skeleton: upload → chat → show recipe. Then iterate.
- The agent mutates state through tools — your UI reacts to state changes, don't parse chat messages.
- Use the `threadId` from `/upload` to keep the session consistent.
- Don't over-engineer. Working and simple beats clever and half-finished.
- Commit often. I'll read the git history.

## Questions

If anything is unclear, email me at tolo.palmer@indegene.com. I'd rather answer a question than have you guess.

Good luck.
