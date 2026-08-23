<div align="center">

# dsh-lowtide

**Drop your tasks in the queue before bed. Wake up to finished work — and a half-price bill.**

**English** | [简体中文](./README.zh-CN.md)

</div>

---

![hero](./assets/screenshots/hero.png)

<p align="center"><i>Three tasks queued for review, live price status in the session header, auto-run when your window opens</i></p>

## What is this

lowtide is a plugin for [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/dsh) that does one thing well: **it separates "filing a task" from "running a task" in time.**

Whenever something crosses your mind during the day, toss it in the queue, review it, release it — then go to your meeting, go to sleep, go live your life. When the off-peak window you set arrives, it runs the batch by itself. You come back: the work is there, and so is the report.

Some hard numbers up front:

- **Four execution strategies**: single, iterative, sampling, review — from "one pass is enough" to "run five candidates and let me pick"
- **168 unit tests + 10 end-to-end specs**, CI green on a four-cell matrix (ubuntu / windows × node 22 / 24)
- **One build artifact for both desktop and web** — install once, works everywhere
- Off-peak execution lands in DeepSeek's valley pricing: **about half price**, with peak/valley spreads up to 1100% on some models

## How you'll actually use it: real scenarios

**Scenario one: ten minutes before you clock out.**
You've finished today's review. You file three tickets for tomorrow: a refactor (iterative, 3 rounds), a weekly report (single), and a design you're unsure about (sampling, 4 candidates). Approve all, shut down, leave. Tomorrow morning at your desk, you open the report: the refactor is done, the report draft is filed, and four candidate designs sit side by side — with exactly what each one cost.

**Scenario two: weekends are all-day off-peak.**
Friday night, you queue a week's worth of chores: dependency cleanup, missing tests, data scripts. Saturday and Sunday are valley price around the clock. You go out; it works from home. Monday you accept the results in the report — retry what failed, merge what's good.

**Scenario three: peak-hour inspiration, intercepted.**
10 AM, you're mid-conversation with the agent about an urgent bug, and you're tempted to add "oh, and update the docs too." The intercept card pops up: run now at peak price, or queue it for tonight at half price — the exact difference is right there. One click on "queue for off-peak", your draft survives untouched, and you go back to your bug.

**Scenario four: an always-on server (L3 full-auto).**
You have a machine running dsh 24/7. Switch to L3, and from then on you can file tasks from anywhere via the API (`POST /ds-lowtide/tasks`). It runs them on schedule and writes the report. Fully unattended — but the sandbox presets, daily budget, and file locks are all still on.

**Scenario five: deliverables that need a backstop.**
For the proposal going to a client, use the review strategy: run once, then automatically open an independent session that tears the result apart through your chosen "review focus" (say, "hunt for data-source errors"). In the morning you don't get a bare result — you get a result plus a critical review.

**Scenario six: living abroad.**
You're in San Francisco. DeepSeek's "peak" is Beijing time — for you, that's yesterday afternoon. The settings page shows those hours converted to your local clock, with one-click adoption. You set windows by your own schedule; the books always stay aligned with the official table.

## How it works

```
① Intake             ② Adjudicate         ③ Execute               ④ Accept
Whenever you have    The queue dock        When the off-peak       When you're back:
a moment: one-click  groups tasks by       window opens: five      open the report —
from the intercept   workspace; triage    preflight gates pass,    results + diff
card, or file a  →   line by line:    →   then sandboxed runs →    + actual spend
ticket (4 strategies) ✓approve ⏸defer     one batch per window     + money saved
                     ✕drop / approve-all
```

A task's life: `pending-review → queued → preflight → running → done / failed / stale / timeout`, plus `deferred` (postponed) and `dropped` (soft-deleted, restorable).

Look at step two — **adjudication**. That's the real difference between lowtide and a "fully automated script": every task must be released by your hand (or by you, once, at the L2 batch gate). The machine has no power to move itself into the run queue. Execution is automated; decisions are not. That's why we can honestly say: you can afford to be absent.

## The interface, piece by piece

### New-task modal — four strategies on one ticket

![new-task-modal](./assets/screenshots/new-task-modal.png)

Single / Iterative / Sampling / Review, side by side, each with a plain-language hint about what it's for. Rounds, priority, and run mode ride along per task — no trip back to settings. Tasks land as "pending review"; nothing bypasses you into the queue.

### Advanced options — tune every task individually

![advanced-options](./assets/screenshots/advanced-options.png)

Model, reasoning effort (follow global / off / low / high / max), priority from 0 to 9, fresh session or continue-previous, and the locked-files list. That last one deserves a sentence: anything on it gets sha256-checked before execution, and if it doesn't match what you filed, the task goes stale and refuses to run — so the file you queued against can't be silently rewritten by another task in the meantime.

### Pick any model — whatever your Harness speaks, lowtide runs

![model-picker](./assets/screenshots/model-picker.png)

Batch runs default to the official `deepseek-v4-flash`, but every task can pick its own model — anything connected to your Harness is in the dropdown, grouped by provider. Hooked up your own private provider? That works too. Non-official models have no public price table, so the ledger honestly says "price unknown"; fill in a price override in settings if you want the bookkeeping exact.

### Window editor — your schedule, on one screen

![window-editor](./assets/screenshots/window-editor.png)

Windows can be multi-segment, overnight, weekday-specific. Underneath is a live 24-hour price band: red for peak, green for off-peak, and a marker showing where you are right now. Outside UTC+8? "Adopt official peak hours" converts Beijing time to your local timezone in one click.

### Settings — every switch is here, no config files to touch

![settings](./assets/screenshots/settings.png)

When the off-peak window runs, how many tasks per batch, how long each task may take, how much concurrency across workspaces, how much money per day, how many reports to keep, which autonomy level, whether to override the price table — all graphical. The official pricing rules (including the new all-weekend valley) are explained in human language on the same page.

### Three more surfaces, woven into the daily flow

- **Price pill** (session header): busy or idle right now, how long until the next batch, how many tasks are queued — one glance tells all. Click it to edit windows.
- **Peak-hours intercept card**: type in the composer at peak and it appears — "run now" or "queue for off-peak", with the price difference spelled out. Your draft survives untouched; dismiss it for the day if it nags.
- **Execution report (the morning briefing)**: opens with how much you saved this run, pins anomalies on top, lines up sampling candidates for your pick, keeps history, and copies to Markdown in one click.

## Workspaces: the most overlooked — and most important — choice

Every task executes inside a **workspace**. That one dropdown decides three things:

1. **Which files it can touch.** Tasks run in a sandbox whose boundary is the workspace directory (`lt-standard` is workspace-write). Pick wrong, and at best it can't find the files; at worst it edits something it shouldn't.
2. **Who it queues with.** Tasks in the same workspace run **serially** (so two tasks never fight over one repo); different workspaces run **in parallel** (cap configurable, default 3). Want throughput? Spread unrelated tasks across workspaces. Want order? Keep them in one.
3. **How the queue and reports group.** Both the dock and the morning report organize by workspace — once you have real volume, this grouping saves you.

**How to choose:** the Workspace dropdown in the ticket modal offers three sources —

- **Use current workspace**: whatever workspace your current session lives in. The common case.
- **An existing workspace from the list**: each shown with its absolute path, so you always know which project it is.
- **Custom path…**: type a path by hand to point a task at a fresh directory.

If you pick "Continue previous" as the session mode, you'll choose a workspace and then a specific conversation inside it — the task resumes with that conversation's context. Perfect for "we didn't finish yesterday; pick it up tonight."

Our advice: **one project, one workspace — don't mix.** The git snapshot and file locks in preflight are workspace-scoped; mixing projects in one workspace is a good way to confuse yourself.

## Four strategies, and when to use which

| Strategy | What it does | When to reach for it | Cost |
|---|---|---|---|
| **Single** | One pass, like a normal agent task | Simple, well-defined jobs | 1× |
| **Iterative** | 2–5 rounds in one session, each reviewing and improving the last through your "iteration lens"; stops early when two rounds look alike enough (bigram similarity > 0.9) | Work that needs polishing: writing, plans, code | ~N× |
| **Sampling** | 2–5 isolated sessions each produce one complete candidate; shown side by side with costs, and **you** pick — the machine makes no aesthetic judgment | Titles, ideas, designs: you want options, not an answer | ~N× |
| **Review** | After the run, an independent session re-examines the result through your "review focus" and writes up its findings | Important deliverables, one more pass before shipping | ~2× |

## Three autonomy levels: you decide how much rope to give

| Level | Behavior | When to use it |
|---|---|---|
| **L1 per-task** | Every task needs your individual ✓ | Early days, precious repos |
| **L2 batch** (default) | Tasks wait in review; a gate card appears 30 minutes before the batch and releases everything at once; no release, no run | Daily driver |
| **L3 full-auto** | Filed tasks queue immediately and run in the sandbox at off-peak, zero confirmations (switching asks twice) | Always-on servers, full delegation |

Individual tasks can override the global level in the ticket modal — global L2, but that one trivial task can ride L3.

## Architecture: why it dares to run unattended

Let's be honest: letting an agent run batch jobs while you're away is a scary thing to do. lowtide dares because of four layers of engineering.

**Layer one: the Cordis microkernel.** dsh itself runs on the Cordis microkernel plugin ecosystem — every capability is a plugin, and plugins talk through service injection rather than direct dependency. lowtide's host half is a set of well-behaved Cordis services — routes, scheduler, state machine — each doing its own job, registered into the kernel, starting with the harness, and uninstalling cleanly. We're not a skin stapled onto dsh; we're an organ grown inside the kernel.

**Layer two: host half + browser half, one build, two faces.** The host half (Node.js) owns scheduling, execution, and the ledger; the browser half (React) owns every pixel of UI. Both ends share a single build artifact — dsh Desktop's GUI is itself web-rendered — so desktop and web **need no separate branches and behave identically**. The window you configure in Desktop is the same state file the web UI reads.

**Layer three: the platform-agnostic core, `lowtide-core`.** Window model, price tables, the billing formula, queue digest, ledger, batch-window math — all pure functions with zero dsh API dependencies, shipped as their own package with their own tests. The practical payoff: the core can be hammered by 44 pure-function unit tests, and if you ever port lowtide to another agent framework, this package lifts out intact.

**Layer four: a defense chain that trusts no input.**

- **Five preflight gates**: is the workspace still there, did git HEAD move, do locked-file sha256s match, does the window fit, is there budget left — fail any one and the task goes `stale` or auto-defers. Never a blind run.
- **Fail-closed permission presets**: `lt-readonly / lt-standard / lt-trusted`, all with approval set to never — unattended means nobody is there to click "allow", so what's permitted is decided before the run starts.
- **Atomic writes + self-healing**: the state file is written atomically and rolls back to a backup if corrupted. Clear your finished tasks — the ledger doesn't lose a cent.
- **Same-origin + loopback trust fence**: the HTTP routes only accept same-origin requests from this machine; cross-site calls are refused.

State sync rides SSE incremental push, falling back to 4-second polling — the queue moves, the UI moves with it.

## Quick Start

Prerequisites: Node `^22.19 || >=24`, pnpm `11.7`. Everything is on the public npm registry — no private registry needed.

**Step 1: install dsh (pick one)**

- Desktop: install dsh Desktop from DeepSeek's official channels (full runtime + Web UI included);
- CLI: `npm install -g @deepseek-ai/dsh`.

Then configure a working model in dsh's model settings (e.g. an official DeepSeek API key). lowtide never touches your credentials.

**Step 2: clone, build, install**

```powershell
git clone https://github.com/KelaoHu/dsh-lowtide
cd dsh-lowtide
pnpm install

# Build the core layer first (the plugin's tests resolve its output)
pnpm --filter lowtide-core bundle
# Then the plugin: host half + browser half in one pass
pnpm --filter dsh-lowtide bundle

# Install into a profile — one artifact serves desktop and web
npx @deepseek-ai/dsh@0.1.0-rc.7 plugin --profile desktop add ./packages/dsh   # Desktop
npx @deepseek-ai/dsh@0.1.0-rc.7 plugin --profile web add ./packages/dsh       # Web

# Start the dev instance (port 3080)
pnpm --filter dsh-lowtide dev
```

Open dsh afterwards: you should see the price pill in the session header and the queue dock beside the input area. If not, check the FAQ.

## Usage, at manual depth

### Three ways to file a task

1. **The intercept card** (smoothest): type at peak hours, the card appears, click "queue for off-peak" — the draft you were writing becomes the ticket, unchanged.
2. **The ticket modal** (most complete): click "New" beside the input area; prompt, strategy, rounds, priority; advanced options add model / reasoning effort / session mode / locked files.
3. **The API** (most geeky): `POST /ds-lowtide/tasks` — hook it into any automation you own.

### Daily life in the queue dock

- Grouped by workspace in three sections: **pending / finished / dropped**.
- Inline per task: ✓ approve, ⏸ defer to the next window, ✕ drop (soft delete — bring it back any time).
- Bulk: "approve all" releases everything pending; "clear finished" keeps things tidy (the books are unaffected).
- "Run now": skip the wait, launch a batch immediately. Debugging and demos live here.

### Time semantics (worth one read)

| Time | Judged in | Notes |
|---|---|---|
| Official peak hours (default) | **Beijing time** | DeepSeek bills in Beijing time; the books stay aligned. Weekends are off-peak all day |
| Custom busy/idle windows | **Your local time** | Overnight ranges, per-weekday rules, live price band preview |
| Off-peak run window | **Your local time** | Window end stops new launches; running tasks are never interrupted |

### The daily ledger

`ledger[YYYY-MM-DD] = { yuan, savedYuan }`. Spend and savings, accrued per day. The displayed price is the billed price — one formula, auditable to the digit.

## Configuration reference

`GET /ds-lowtide/config` reads; `PUT` partially updates (fields not listed here are rejected):

| Field | Type | Default | Notes |
|---|---|---|---|
| `autonomy` | `'l1'\|'l2'\|'l3'` | `l2` | Autonomy level; per-task override in the ticket modal |
| `batch.window` | `"HH:MM-HH:MM"` | `19:00-23:30` | Off-peak run window (local timezone) |
| `batch.tz` | IANA timezone | system | Run-window timezone (empty = local) |
| `batch.gateLeadMin` | minutes | `30` | Batch gate lead time |
| `batch.maxTasksPerNight` | number | `10` | Tasks per batch cap |
| `batch.maxDurationMin` | minutes | `240` | Per-task duration cap (cancel + one retry on timeout) |
| `batch.maxConcurrency` | number | `3` | Max concurrency 1–8 (serial per workspace, parallel across) |
| `batch.paused` | boolean | `false` | Pause automatic batching |
| `budgetDailyYuan` | ¥ | `0` | Daily budget (0 = unlimited) |
| `windows[]` | array | `[]` | Custom windows; empty = official peak (Beijing time) |
| `windows[].level` | `peak\|off\|custom` | — | Peak / off-peak / custom (off-peak price × multiplier) |
| `windows[].start/end` | `"HH:MM"` | — | Local clock, overnight supported |
| `windows[].days` | `1..7` array | every day | ISO weekdays (1 = Mon … 7 = Sun) |
| `windows[].tz` | IANA timezone | system | Per-window timezone |
| `windows[].multiplier` | number | `1` | Off-peak price multiplier for custom windows |
| `prices[model].{peak,off}.{input,inputCached,output}` | ¥/1M | official | Price-table overrides |

## HTTP API

Prefix `/ds-lowtide/`, behind the same-origin + loopback trust fence:

| Method | Path | Purpose |
|---|---|---|
| GET | `/state` | Aggregate state (prices/countdown/queue/latest report) |
| GET | `/events` | SSE incremental push (client falls back to 4s polling) |
| GET/PUT | `/config` | Read/write configuration |
| POST | `/tasks` | Submit a ticket |
| POST | `/tasks/:id/approve \| defer \| drop \| cancel \| retry \| restore \| delete \| choose-candidate` | Adjudication & management |
| POST | `/tasks/approve-all` | Approve everything |
| POST | `/estimate` | Estimate: peak vs off-peak |
| POST | `/batch/run-now` | Run the batch now |
| POST | `/dismiss` | No interception for the rest of today |
| GET | `/health` | Heartbeat |

## Permission presets

| preset | sandbox | approval |
|---|---|---|
| `lt-readonly` | read-only | never |
| `lt-standard` | workspace-write | never |
| `lt-trusted` | danger-full-access | never |

The intake UI doesn't offer a choice — all tasks run under `lt-standard`; the other two remain for API callers (`permissionPreset` on `POST /tasks`). Nothing runs without preflight.

## Data & state

- Everything persists in `$DSH_HOME/lowtide.json` (atomic writes, automatic rollback on corruption); with `DSH_PROFILE` set, state is isolated per profile. **One writer per file at a time** — don't run Desktop and Web simultaneously without profile isolation.
- One batch per window, overnight-safe; an empty queue produces no empty report.
- Deferral recovery: at window start, preflight-deferred tasks re-queue automatically (marked failed after ≥3); manually deferred tasks return to pending-review.

## Testing & CI

```powershell
pnpm --filter lowtide-core test    # 44 pure-function core tests
pnpm --filter dsh-lowtide test     # 124 plugin unit tests
pnpm --filter dsh-lowtide exec playwright test   # e2e (needs dsh web running on :3080)
```

Ten Playwright e2e specs run serially: two-face load smoke, CSS variable resolvability against host themes, six-surface light/dark screenshots, ticket-modal overlays, settings conversion & price band, window-editor save/read-back, cross-workspace concurrency + per-workspace serialization (real LLM), the full intake→adjudicate→run→report loop (real API), and iterative convergence / sampling pick / review notes end to end.

GitHub Actions is wired up: every push / PR runs install → build → typecheck → the full unit suite on a four-cell matrix (ubuntu + windows × node 22 / 24).

## Security notes

- Routes sit behind a Host/Origin trust fence (loopback + same-origin only); **don't expose port 3080 to the public internet** — use an SSH tunnel or an authenticated reverse proxy.
- The Windows sandbox is mitigation-grade (partial); Linux/macOS enforce fully. For unattended use, stack the file allowlist and the daily budget.
- L3 full-auto: filed tasks queue directly and run at off-peak with zero confirmation — the switch itself asks twice.
- The state file holds full task prompts and paths; treat backups accordingly.
- Found a vulnerability? Use the private channel in [SECURITY.md](./SECURITY.md).

## FAQ

**The window came and nothing ran?**
Check in order: are tasks approved → is "pause off-peak batch" ticked → was the batch gate released → is the budget exhausted → did preflight fail (task becomes `stale`, reason in the detail view).

**Why doesn't sampling auto-pick the winner?**
On purpose. The machine makes no aesthetic judgment for you — candidates and costs sit side by side, and you click "pick this one".

**I'm abroad and peak hours don't match my schedule?**
The official table bills in Beijing time. Settings shows what those hours look like locally; set custom windows for your own rhythm, or click "adopt official peak hours (converted to my timezone)".

**Estimate and actual don't match?**
Estimates use a rough input-token upper bound (no output); actuals use real usage (output and cache hits included). Both numbers are in the report.

**A task went stale?**
Preflight failed: workspace gone, git snapshot moved, a locked file changed, budget short, or the window can't fit it. Read `lastError` in details, fix, `retry`.

## Known limitations & roadmap

- Release candidate (v0.1.1): build + 168 unit tests green; e2e needs a live dsh web instance. Installed from source.
- Default batch model is `deepseek-v4-flash`; non-official models have no public price table — the ledger marks them "price unknown", fillable in settings.
- Per-task cap is 240 minutes; timeout cancels and retries once.
- Roadmap candidates: multi-window multi-batch, task dependency graphs, automatic budget split, report push (email/Webhook), price-change alerts.

## Repository layout

```
dsh-lowtide/
├── README.md                  This file
├── README.zh-CN.md            中文版
├── assets/screenshots/        README screenshots
├── LICENSE                    MIT
├── CHANGELOG.md               Version history
├── CONTRIBUTING.md            Contributing guide
├── CODE_OF_CONDUCT.md         Code of conduct
├── SECURITY.md                Security policy
├── .github/                   CI workflow + issue/PR templates
├── package.json               pnpm workspace root
└── packages/
    ├── core/                  Platform-agnostic core (lowtide-core)
    │   ├── src/               windows / pricing / model / digest / ledger / scheduler
    │   └── test/              Pure-function unit tests
    └── dsh/                   The plugin (dsh-lowtide)
        ├── src/               Host half: routes / runner / scheduler / intake / store / state-machine
        ├── client/            Browser half: components / hooks / i18n / store
        ├── test/              Unit tests + e2e (Playwright)
        ├── cordis.patch.yml   Plugin line + lt-* permission presets
        └── README.md          Package-level README
```

## A few honest words

May this Harness plugin be of the people, by the people, for the people. May the wisdom of the open-source community, and the will to collaborate, never perish from the earth.

## License & acknowledgements

MIT License (see [LICENSE](./LICENSE)).

- Built on [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/dsh) · the Cordis plugin ecosystem
- [DeepSeek pricing announcement (2026-08-13)](https://finance.eastmoney.com/a/202608133840616378.html) · [effective-date coverage (2026-08-17)](https://www.dzwww.com/news/ssnews/202608/t20260817_18025522.htm) · [weekend pricing notice](https://www.ithome.com/0/993/095.htm)
