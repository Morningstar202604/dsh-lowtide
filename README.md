<div align="center">

# dsh-lowtide

**Hand it your tasks when you have time. Come back when you're busy — the work is already done.**

Plan at leisure · Adjudicate by human · Execute unattended · Accept on return

**English** | [简体中文](./README.zh-CN.md)

</div>

---

![hero](./assets/screenshots/hero.png)

<p align="center"><i>Three tasks queued for review, live price status in the header, automatic execution when the off-peak window opens</i></p>

## The problem it solves

Everyone who uses AI agents heavily hits the same contradiction: **your busiest hours are exactly when the most tasks show up.**

- 10 AM, you're in a meeting, and it hits you — "that refactor really should get done." You can't do it now, and by evening you'll probably have forgotten.
- In the evening you finally have time, so you fire five tasks at your agent — then spend two hours watching it work. The time you meant to rest goes to supervising.
- You'd love to let the agent run fully on its own, but you don't dare: with nobody watching, what if it edits the wrong file or blows the budget?

**lowtide cleanly separates "filing a task" from "running a task" in time:**

> Whenever you have a moment, write the task down, drop it in the queue, review and release it.
> Then go to your meeting, go to sleep, go live your life.
> When the off-peak window you set arrives, it executes the batch unattended.
> When you come back, the work is done — and an execution report is waiting for your acceptance.

This isn't "a cheaper agent" — it's a new working rhythm: **your time is for decisions, the machine's time is for execution.**

## Three core values

### ① Plan at leisure, harvest when busy (the reason it exists)

At its heart, lowtide is a **time-shifting task delegation pipeline**: intake → adjudicate → queue → scheduled execution → report acceptance. File tasks in any spare moment; they run unattended inside the windows you choose; a morning-briefing-style execution report lays out "what was done, how it went, what it cost" in one place. That is what semi-automation means here — **you don't have to be present, yet everything stays under your control.**

### ② Semi-automated, with trust intact

Execution is automated; decisions are not. Every task must pass your **human adjudication** (✓ approve / ⏸ defer / ✕ drop) before it may enter the run queue — the machine can never push a task through that gate by itself. Five preflight gates (workspace, git snapshot, file fingerprints, window, budget) run before execution; execution happens inside sandbox permission presets; afterwards, the review strategy and the morning report give you acceptance. **You can comfortably be absent.**

### ③ And the bill gets cut in half along the way

Since August 2026, DeepSeek bills by time of use: full price at weekday peak hours, about **half price** everywhere else (weekends included, all day), with peak/valley spreads up to **1100%** on some models ([announcement](https://finance.eastmoney.com/a/202608133840616378.html) · [coverage](https://www.dzwww.com/news/ssnews/202608/t20260817_18025522.htm) · [weekend update](https://www.ithome.com/0/993/095.htm)). lowtide's off-peak execution naturally lands in the cheap zone — **saving money isn't its purpose; it's the natural dividend of this time model**. The books are computed against the official price table in real time: the displayed price is the billed price, auditable to the digit.

## How it works

```
① Intake             ② Adjudicate         ③ Execute               ④ Accept
Whenever you have    The queue dock        When the off-peak       When you're back:
a moment: one-click  groups tasks by       window opens: a 30s     open the report —
from the intercept   workspace; triage    scheduler tick, five     results + diff
card, or file a  →   line by line:    →   preflight gates,    →    + actual spend
ticket (4 strategies) ✓approve ⏸defer     sandboxed runs,         + money saved
                     ✕drop / approve-all  one batch per window
```

Task lifecycle: `pending-review → queued → preflight → running → done / failed / stale / timeout`, plus `deferred` (postponed) and `dropped` (soft-deleted, restorable).

## Interface highlights

### ① New-task modal — four execution strategies, one ticket

![new-task-modal](./assets/screenshots/new-task-modal.png)

Single / Iterative / Sampling / Review — four execution strategies laid out side by side, each with a scenario-based hint, plus per-task rounds, priority, and run mode (L1/L2/L3 autonomy override). Every task executes under the "standard" sandbox permission preset and lands in review first — **no task can bypass your adjudication and slip into the queue**.

### ② Advanced options — a flagship-grade task control panel

![advanced-options](./assets/screenshots/advanced-options.png)

Model, reasoning effort (Follow global / Off / Low / High / Max), ten-level priority (0–9), fresh session or continue-previous, and a locked-files list — all in one dedicated pane. **Locked files are sha256-verified before execution; if a file changed, the task is marked stale immediately. Never a blind run.**

### ③ Any connected model — whatever your Harness speaks, lowtide runs

![model-picker](./assets/screenshots/model-picker.png)

Batch execution defaults to the official `deepseek-v4-flash`, but every task can target **any model your Harness has connected** — official Flash / Pro, custom providers, grouped by source, one click away. Non-official models have no public price table: the ledger honestly marks them "price unknown", and you can fill in a price override in settings so the books always balance.

### ④ Peak/off-peak window editor — your rhythm, made visible

![window-editor](./assets/screenshots/window-editor.png)

Multi-segment busy/idle windows, overnight ranges, per-weekday schedules — with a **live 24-hour price band** underneath: red for peak, green for off-peak, your current moment marked. "Adopt official peak hours" converts Beijing time to your local timezone in one click — first-class support for users outside UTC+8.

### ⑤ Settings page — official pricing explained, everything graphical

![settings](./assets/screenshots/settings.png)

Off-peak run window, per-batch task cap, per-task duration cap, cross-workspace concurrency, daily budget, report history cap, three autonomy levels, price-table overrides… every knob is graphical, with a complete human-readable explainer of the official pricing rules (including the all-weekend off-peak update).

### ⑥ Three more surfaces, woven into your daily flow

- **Price status pill** (session header): status dot + off-peak/peak/running, countdown to batch start when work is pending, queue badge, price breakdown on hover — **click it to edit windows directly**.
- **Peak-hours intercept card**: type in the composer during peak and it appears — "run now (peak price)" vs "queue for off-peak", with a live price comparison; your draft is fully preserved, dismissible per message.
- **Execution report (morning report)**: conclusion first — saved ¥X this run; anomalies pinned on top, sampling candidates side by side awaiting your pick, history retained, one-click Markdown copy.

## Execution strategies, in detail

| Strategy | Behavior | Best for | Cost |
|---|---|---|---|
| **Single** | One pass, equivalent to a plain harness task | Simple, well-defined jobs | 1× |
| **Iterative** | 2–5 rounds in one session; each round reviews and improves the previous through your "iteration lens"; consecutive rounds with bigram similarity > 0.9 count as converged — **stops early, never burns an extra cent** | Work that needs polishing: analysis, writing, code | ~N× |
| **Sampling** | 2–5 isolated sessions each produce one complete candidate from the same instruction; candidates shown side by side with per-candidate cost; the next day **you** pick — the machine never merges or auto-picks | Titles, ideas, candidate designs: you want "a few options", not "one answer" | ~N× |
| **Review** | After the run, an independent second session re-examines the result through your "review focus", producing structured review notes, collapsible in task details and the morning report | Important deliverables: a second pair of eyes before it ships | ~2× |

## Three autonomy levels (per-task override supported)

| Level | Semantics | Who it's for |
|---|---|---|
| **L1 per-task** | Every task needs your individual ✓ before it runs | First-time trust, risky repos |
| **L2 batch** (default) | Tasks land in pending-review; a gate card appears T-30min before the batch window and approves everything at once; **nothing runs unapproved (fail-safe)** | Most users, most days |
| **L3 full-auto** | Submission enters the queue directly and executes in the sandbox at off-peak with zero confirmations (a second confirmation guards the switch) | Always-on servers, fully hands-off setups |

## Architecture: engineered for unattended execution

lowtide is not a script — it is a complete engineering system:

- **Built on the Cordis microkernel plugin ecosystem**: the host half (Node.js services) and the browser half (React client) are built as two faces of a single artifact — **desktop and web behave identically** (the dsh Desktop GUI is itself web-rendered). One codebase, both ends.
- **Platform-agnostic core layer `lowtide-core`**: window model, official price tables, usage-to-cost conversion, queue digest, daily ledger, batch-window computation — all pure functions with zero dsh dependencies, independently packaged and tested, portable to any host.
- **Dual-channel realtime sync**: SSE incremental push with a 4-second polling fallback — queue state, countdowns, and run progress reach the screen live.
- **Atomic writes + self-healing persistence**: tasks, reports, ledger, and config all live in a state file written atomically, with automatic rollback to a backup on corruption — clearing finished tasks never loses the books.
- **Five preflight gates**: workspace existence, git HEAD snapshot, locked-file sha256, window fit, daily budget — fail any one and the task goes `stale` or auto-defers. **Never a blind run.**
- **Fail-closed permission fence**: three sandbox presets `lt-readonly / lt-standard / lt-trusted` (approval=never) keep unattended off-peak execution interruption-free with the risk caged; routes add a same-origin + loopback trust fence on top.
- **The human-adjudicated gate**: `pending-review` is the single checkpoint between human and machine. The machine can never push a task through it — in sampling mode, even "which candidate ships" is a human decision. No auto-merge, no auto-pick.

## Quick Start

Prerequisites: Node `^22.19 || >=24`, pnpm `11.7`. All dependencies (including `@deepseek-ai/*`) are on the public npm registry — no private registry required.

**Step 1: install DeepSeek Harness (dsh)** — either:

- **Desktop**: install dsh Desktop from DeepSeek's official channels (full runtime + Web UI included);
- **CLI**: `npm install -g @deepseek-ai/dsh`.

Then configure a working model in dsh's model settings (e.g. an official DeepSeek API key) — the plugin neither ships nor stores any model credentials.

**Step 2: clone, build, install**:

```powershell
git clone https://github.com/KelaoHu/dsh-lowtide
cd dsh-lowtide
pnpm install

# Build the platform-agnostic core (before plugin build & tests)
pnpm --filter lowtide-core bundle
# Build the plugin: host half + browser half, one build, two faces
pnpm --filter dsh-lowtide bundle

# Install into a dsh profile — the same artifact serves desktop and web
npx @deepseek-ai/dsh@0.1.0-rc.7 plugin --profile desktop add ./packages/dsh   # Desktop
npx @deepseek-ai/dsh@0.1.0-rc.7 plugin --profile web add ./packages/dsh       # Web

# Start the dev instance (port 3080)
pnpm --filter dsh-lowtide dev
```

> `cordis.patch.yml` is the bundle-layer patch: it inserts the plugin line and injects the three `lt-*` permission presets; `cordis.dev.yml` is an intentionally empty dev overlay (to avoid duplicate insertion).

## Usage, at operations-manual depth

### Three ways to file a task

1. **Via the intercept card** (smoothest): type in the composer during peak hours; the intercept card appears; click "queue for off-peak" — the draft you were writing becomes the ticket, unchanged.
2. **Via the ticket modal** (most complete): click "New" beside the input area; fill in prompt, strategy, rounds, priority; advanced options hold model / reasoning effort / session mode / locked files.
3. **Via the API** (most geeky): `POST /ds-lowtide/tasks` — wire it into any automation system.

### Adjudicating and managing the queue

- The queue dock groups by workspace: **pending / finished / dropped**.
- Inline actions: ✓ approve, ⏸ defer (next window), ✕ drop (soft delete, restorable any time).
- Bulk actions: "approve all" releases everything pending; "clear finished" keeps the dock tidy (the ledger is unaffected).
- "Run now": skip the wait and launch a batch immediately (for debugging/demos).

### Continue previous (session continuation)

In advanced options, a task can "continue previous": it resumes from a chosen historical conversation in a given workspace, inheriting its context — perfect for "we didn't finish that yesterday; pick it up tonight". Files in the locked-files list are sha256-verified before execution; any change marks the task stale.

### Time semantics (important)

| Time | Judged in | Notes |
|---|---|---|
| Official peak hours (default) | **Beijing time** | Billing correctness: DeepSeek bills in Beijing time and the plugin's books match exactly; weekends are off-peak all day |
| Custom busy/idle windows | **Your local time** | Overnight ranges and per-weekday rules supported; live 24h price band in settings |
| Off-peak run window (batch) | **Your local time** | Window end stops new launches without interrupting running tasks |

### The daily ledger

`ledger[YYYY-MM-DD] = { yuan, savedYuan }`: spend and savings accrue per day — **the displayed price is the billed price, one formula, auditable to the digit**.

## Configuration reference

Returned by `GET /ds-lowtide/config`; `PUT` applies partial updates (unlisted fields are rejected):

| Field | Type | Default | Notes |
|---|---|---|---|
| `autonomy` | `'l1'\|'l2'\|'l3'` | `l2` | Three autonomy levels; per-task override in the ticket modal |
| `batch.window` | `"HH:MM-HH:MM"` | `19:00-23:30` | Off-peak run window (local timezone) |
| `batch.tz` | IANA timezone | system | Run-window timezone (empty = local) |
| `batch.gateLeadMin` | minutes | `30` | Batch gate lead time |
| `batch.maxTasksPerNight` | number | `10` | Tasks per batch cap |
| `batch.maxDurationMin` | minutes | `240` | Per-task duration cap (cancel + one retry on timeout) |
| `batch.maxConcurrency` | number | `3` | Max concurrency 1–8 (serial per workspace, parallel across) |
| `batch.paused` | boolean | `false` | Pause automatic batching |
| `budgetDailyYuan` | ¥ | `0` | Daily budget (0 = unlimited) |
| `windows[]` | array | `[]` | Custom busy/idle windows; empty = official peak (Beijing time) |
| `windows[].level` | `peak\|off\|custom` | — | Peak / off-peak / custom (off-peak price × multiplier) |
| `windows[].start/end` | `"HH:MM"` | — | Local clock boundaries, overnight supported |
| `windows[].days` | `1..7` array | every day | ISO weekdays (1 = Mon … 7 = Sun) |
| `windows[].tz` | IANA timezone | system | Per-window timezone |
| `windows[].multiplier` | number | `1` | Off-peak price multiplier for custom windows |
| `prices[model].{peak,off}.{input,inputCached,output}` | ¥/1M | official | Price-table overrides |

## HTTP API

Prefix `/ds-lowtide/`, guarded by a same-origin + loopback trust fence (`sec-fetch-site` cross-site rejected):

| Method | Path | Purpose |
|---|---|---|
| GET | `/state` | Aggregate state (level/prices/countdown/queue/latest report) |
| GET | `/events` | SSE incremental push (client falls back to 4s polling) |
| GET/PUT | `/config` | Read/write configuration |
| POST | `/tasks` | Submit a ticket (strategy/rounds/reasoning/strategyHint/priority/files) |
| POST | `/tasks/:id/approve \| defer \| drop \| cancel \| retry \| restore \| delete \| choose-candidate` | Adjudication & management |
| POST | `/tasks/approve-all` | Approve everything |
| POST | `/estimate` | Estimate: peak price (current model) vs off-peak (batch model) |
| POST | `/batch/run-now` | Run the batch now (testing/manual) |
| POST | `/dismiss` | No more interception today |
| GET | `/health` | Heartbeat |

## Permission presets

Injected by `cordis.patch.yml` (unattended off-peak = sandbox + zero approvals):

| preset | sandbox | approval |
|---|---|---|
| `lt-readonly` | read-only | never |
| `lt-standard` | workspace-write | never |
| `lt-trusted` | danger-full-access | never |

The intake UI no longer offers a preset choice (all tasks run under `lt-standard`); the other two remain available for API/backend use by passing `permissionPreset` to `POST /tasks`. Nothing runs without preflight — never a blind run.

## Data & state

- Tasks, reports, ledger, and config persist in the state file `$DSH_HOME/lowtide.json` (atomic writes, automatic rollback to backup on corruption); when the process exposes `DSH_PROFILE`, state is isolated per profile at `$DSH_HOME/profiles/<profile>/lowtide.json`. **Only one instance should write a given file at a time.**
- The ledger accrues per day; report history is retained (clearing finished tasks never loses the books).
- One batch per window (overnight-safe); an empty queue produces no empty report.
- Deferral recovery: at window start, preflight-deferred tasks re-queue automatically (marked failed after ≥3); manually deferred tasks return to pending-review.

## Testing: 168 unit tests + 10 end-to-end specs

```powershell
pnpm --filter lowtide-core test    # 44 pure-function tests for the core layer
pnpm --filter dsh-lowtide test     # 124 plugin unit tests
pnpm --filter dsh-lowtide exec playwright test   # e2e (requires dsh web on :3080)
```

Ten Playwright e2e specs run serially, covering: two-face load smoke, CSS variable resolvability against host themes, six-surface light/dark screenshots, ticket-modal overlays, settings conversion & price band, window-editor save/read-back, cross-workspace concurrency + per-workspace serialization (real LLM execution), the full intake→adjudicate→run→report loop (real API), and iterative convergence / sampling pick / review notes end to end.

GitHub Actions CI is built in: every push / PR runs install → build → typecheck → the full unit suite across a four-cell matrix (ubuntu + windows × node 22 / 24).

## Security notes

- Routes carry a Host/Origin trust fence (loopback + same-origin); **do not expose port 3080 directly to the public internet** — use an SSH tunnel or an authenticated reverse proxy for remote setups.
- The Windows sandbox is "mitigation-grade" (partial); Linux/macOS enforce fully. For unattended runs, stack task-level file allowlists and the budget backstop.
- L3 full-auto: submission enters the queue directly and executes in the sandbox at off-peak with zero confirmation — the switch is guarded by a second confirmation.
- The state file contains full task prompts and paths; handle backups with care.
- Report vulnerabilities privately via [SECURITY.md](./SECURITY.md).

## FAQ

**Q: The off-peak window arrived but nothing ran.**
Check: ① are tasks ✓ approved; ② is "pause off-peak batch" ticked; ③ was the batch gate approved; ④ is the budget exhausted; ⑤ did preflight fail (task becomes `stale`, reason in the detail view).

**Q: Why doesn't sampling auto-pick the best candidate?**
By design: the machine makes no aesthetic judgment for you. The next day's report shows candidates side by side with costs; you click "pick this one".

**Q: I'm abroad and peak hours don't match my schedule.**
The official price table bills in Beijing time. Settings shows what official hours look like in your local time; define your own windows to fit your schedule, or click "adopt official peak hours (converted to my timezone)".

**Q: Estimate and actual spend differ?**
Estimates use a rough input-token upper bound (no output); actuals are computed from real usage (including output and cache hits). Both are visible in the execution report.

**Q: A task got marked stale?**
Preflight failed: workspace gone, git snapshot changed, locked files modified, budget short, or window can't fit it. See `lastError` in details, fix, then `retry`.

**Q: Will Desktop and Web conflict if both are open?**
Only one instance may write a state file at a time; isolate with `DSH_PROFILE`, or run just one.

## Known limitations & roadmap

- Currently release-candidate (v0.1.1): build + 168 unit tests green; e2e requires a live dsh web instance. Installed from source.
- Batch execution defaults to `deepseek-v4-flash`; non-official DeepSeek models have no public price table → ledger marks "price unknown", fillable in settings.
- Per-task cap inside a batch window is 240 minutes; timeout cancels and retries once.
- Roadmap candidates: multi-window multi-batch, task dependency graphs, automatic budget split, report push (email/Webhook), price-change alerts.

## Repository layout

```
dsh-lowtide/
├── README.md                  This file
├── README.zh-CN.md            中文版
├── assets/screenshots/        README screenshots
├── LICENSE                    MIT
├── CHANGELOG.md               Version history (Keep a Changelog)
├── CONTRIBUTING.md            Contributing guide
├── CODE_OF_CONDUCT.md         Code of conduct
├── SECURITY.md                Security policy & reporting
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
