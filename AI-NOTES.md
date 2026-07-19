# AI-NOTES

How I (the candidate) used an AI coding agent — Claude Code — to complete this assignment. This is a working journal of the collaboration: what I asked for (**ME**), what the agent did (**YOU**), what it got right, what it got wrong, and the decisions I owned.

## My working method

1. **Plan before code.** I made the agent read all three briefs and the design assets first, produce a phased plan, and get my sign‑off before touching a file.
2. **Skills as guardrails.** Before implementing, I had the agent distill the Angular 21 docs into reusable "skills" (under `.claude/skills/`). This keeps the generated code on modern idioms (signals, `input()`/`output()`, OnPush, new control flow, immutable NgRx) instead of drifting to older patterns.
3. **Verify everything.** Every phase ends with a build, unit tests, and a short performance/testing/scalability assessment (`phases/`). I don't accept code I can't explain.
4. **I own the decisions.** The agent proposes; I choose. Key forks were mine to call (see below).

---

## Phase 0 — Setup, exploration, and skills

"Read the three assignments and the design PNGs. Don't write code yet — give me a phased plan and the technical constraints, then let me confirm."

Read the whole `src` tree, the three instruction files, and every design image. Notable: while *reading* the NgRx feed the agent already root‑caused all five QA bugs (value bound to the severity *title* not the key; the `medium` counter filtering `'low'`; an in‑place `Array.sort()` that leaves the array reference unchanged so memoized selectors don't recompute; a failure reducer that never clears `isVulnsLoading`; and `catchError` sitting on the *outer* effect stream so it dies after one error). It also caught two constraints I'd have hit later:
- **Assets aren't served.** `angular.json` only serves `public/`, but all icons live under `src/app/assets/…`. So icons must be **inlined**, which is also what lets me recolor them by severity/group.
- **No `@angular/cdk`** was installed, and the tree code is untyped (`any` everywhere).

**Decisions I made (the agent asked, I chose):**
- **Virtual list → Angular CDK.** Production‑standard, fixed‑size; I still want to be able to explain the windowing internals, so the agent will document them.
- **D3 tree → restyle in place.** Implement the card design faithfully, keep the existing collapsible‑tree logic. Lower regression risk than a full rewrite.
- **Scope → everything:** all requirements + all three bonus parts + skills + docs + verification.
- **Git history after the fact.** I finished the implementation first, then rebuilt a clean commit history (small, logical commits) so the submission matches the README's "clean commits" requirement without rewriting the feature code between commits.

**YOU (setup) →** `npm install` (clean), added `@angular/cdk@21.2.14`, ran a **baseline production build** (`main` 329.46 kB raw / 91.88 kB transfer) to compare against later, then fetched Angular's own distilled references for the newest APIs (signal forms, `resource`, signals) so the skills match v21 exactly — instead of trusting the model's memory on APIs that changed recently.

**Skills authored:** `angular-components`, `angular-signals`, `angular-templates`, `angular-signal-forms`, `ngrx-store`, `angular-di`, `d3-angular`, `scss-dynamic-styling`, `angular-performance`, `angular-testing`.

**What the agent got right:** the bug root‑causes were correct on first read; catching the un‑served‑assets constraint saved a dead end.

**What I had to steer:** the model's first instinct on skills was to lean on its own memory; I made it fetch the official Angular signal‑forms/`resource` references first, because those APIs are new in v21 and easy to get subtly wrong.

**Verification:** `npm install` clean · baseline `npm run build` green · 10 skills created and readable. Baseline recorded for the performance comparison in later phases.

---

## Phase 1 — Vuln Feed (NgRx)

"Fix the five QA bugs. For each, tell me the root cause first — I want to be able to explain *why*, not just what changed. Then add the debounced search. Keep everything in the store; nothing in the component."

**YOU →** Delivered the five fixes with a one‑line root cause each (see `docs/interview-prep-vuln-feed.md`). Two fixes I pushed the agent to make *structural* rather than literal:
- The **medium counter** — instead of just swapping `'low'`→`'medium'`, rewrite the counts selector as a single `reduce` keyed by `vuln.severity`, so no branch can be mislabeled again.
- The **sort bug** — the agent's first instinct was to keep `state.vulns.sort()` and "just fix ordering". I made it explain *why* it failed (in‑place sort keeps the same array reference, so memoized selectors never recompute), fix it immutably, **and** re‑enable the `strictStateImmutability` runtime checks that had been switched off — those checks would have caught the mutation immediately.

**Search:** action → reducer field → memoized selector that ANDs severity + query; debounced 300 ms with `distinctUntilChanged` + `takeUntilDestroyed` at the component edge so the store isn't churned per keystroke.

**What I verified myself:** I asked for a regression test per bug. The effect one is the tell: error the first request, succeed the second, assert `[failure, success]`. Against the old outer‑`catchError` code that test emits only `[failure]` and the effect dies — exactly the reported "refresh stops working". 26 specs green, build green.

**What the agent got right:** all five root causes on first read; the single‑pass counts refactor.

**What I steered:** demanding root‑cause explanations up front changed two "make it work" edits into "make it correct and un‑repeatable" edits (immutability checks on, counts refactored).

---

## Phase 2 — Vulnerability Card + virtual list

"Build the card to match the design exactly, make it reusable, and render 1,000 of them virtually. Then add the expanded bonus. I picked CDK for the virtual list — but I want the expansion tension solved cleanly, not faked."

**YOU →** Built the reusable card (signal inputs, controlled `expanded`/`toggle`, everything `computed`), a typed `VulnCard` model with a normaliser for the messy mock data, and the CDK virtual list.

**Where I pushed back:**
- The agent's first pass wanted to expand rows **inline inside** the virtual list. I stopped it: a fixed-size CDK viewport positions rows by `index × itemSize`, so an inline-expanding row desyncs everything below it. We agreed to keep list rows fixed-height and open the expanded/bonus view in a featured detail card above the list — correct virtualisation, full bonus. I can explain the trade-off (and that `cdk-experimental` autosize is the alternative).
- **Icon id collisions.** The agent inlined the SVGs verbatim — including their internal `mask`/`clipPath` `id`s. In a list that repeats the same icon dozens of times those ids collide (all `url(#id)` refs resolve to the first match), which would silently corrupt icons. I had it strip the ids and keep only the visible paths. This is exactly the kind of thing that passes a build and a quick glance but breaks at scale.

**What I verified myself:** served the app and screenshotted both states against the design PNGs — base and expanded both match. Then I measured the DOM: **7** `<app-vuln-card>` nodes for **1,000** data items — the virtualisation is real, not cosmetic. While verifying I also hit a **deep-link bug** in the starter: the trailing-slash routes (`'vuln-cards/'`) don't match the browser-normalised URL, so a direct link fell through to the menu. Small fix, but a real one — removed the slashes.

**What the agent got right:** the normalisation boundary for the mock data; clean controlled-component API.

**What I steered:** the virtualisation/expansion trade-off and the SVG-id collision — both "looks fine until it's at scale" issues that I'd expect to be asked about.

---

## Phase 3 — D3 Collapsible Tree

"Restyle the nodes into the design cards, cascade the group colors to children, fix the width so it fills the screen and scrolls, and do the asset-combine bonus. Keep the existing collapsible logic — don't rewrite the whole D3 dance."

**YOU →** Rendered the cards with `foreignObject` HTML (so the combined-asset card can actually scroll), moved the data transform and color cascade into pure, unit-tested helpers, and kept the enter/update/exit + collapse logic.

**Three things I made the agent get right rather than "good enough":**
- **Verify with the real DOM, not just a screenshot.** My first screenshot showed all the cards piled at the origin. The agent's instinct was that the layout was broken. I had it dump the DOM instead — the `viewBox` was already 906px wide, so the *layout* was fine; the transforms were just frozen mid-animation because d3's timers don't advance under headless virtual-time. Real bug vs. measurement artifact. The fix (instant first paint, animate only toggles) is also better UX.
- **Variable-height spacing.** The combined-asset cards are 3× taller than group cards. A fixed sibling gap either wastes space or overlaps. I pushed for `d3.tree().separation()` keyed on actual card height so it's exact in one pass.
- **Don't drown the file in `any`.** The starter tree was `any` end-to-end. d3's self-referential node type fights TS, so the agent wanted to give up and `any` everything. I insisted the data + helpers stay fully typed and the `any`/`unknown` be confined to the d3 boundary.

**What I verified myself:** screenshots against both design PNGs (base + bonus), then a fully-expanded run to confirm the color cascade holds at depth 3+, the asset cards scroll at the 3× cap, and the tree grows past the viewport (1506px) with horizontal scroll. Pure helpers unit-tested; 39 specs green.

**What the agent got right:** `foreignObject` for scrollable cards; the pure transform/color helpers.

**What I steered:** DOM-over-screenshot verification, exact variable-height spacing, and keeping the types honest.

---

## Phase 4 — Verification & finalization

"Now make it fast and prove the whole thing works. The initial bundle ballooned once we added CDK and d3 — get them out of it. Then verify everything end-to-end and write up the reasoning."

**YOU →** Lazy-loaded the three feature routes (`loadComponent`) and moved the feed's NgRx slice to its route so d3/CDK/NgRx leave the initial bundle. Removed a dead `TreeChartComponent` import from the menu (it would have dragged d3 back into the eager chunk), and typed the starter's `SeverityParams`.

**What I insisted on verifying (not assuming):**
- **The lazy feature store actually works at runtime.** Moving NgRx from `app.config` to a route is the kind of change that compiles but breaks the effect (no data loads). I didn't take the green build as proof — I loaded `/vuln-feed` and confirmed data renders and the medium counter reads 12.
- **The bundle actually split.** I read the chunk table: `tree-chart` 60.82 kB (d3), `vuln-cards` 40.84 kB (CDK), `vuln-feed` 8.57 kB (NgRx), initial total **334 kB** — below the untouched starter's 366 kB, with three features built.
- **Bug #1 at the DOM level.** Rather than trust the template edit, I dumped the feed DOM and checked every `<option value>` is a lowercase key — no capitalized titles left.

**One agent mistake I caught:** while typing `SeverityParams` the agent fat-fingered `title: "High"` into `title: "H"`. Tiny, would have shipped a wrong label. Caught it on review before building.

---

## Closing reflection

The approach that worked: **plan → skills → root-cause → implement → verify, one phase at a time.** The agent is fast and its first-read bug analysis was accurate, but its default is "make it work"; the value I added was insisting on "make it *correct* and explain *why*" — which repeatedly turned a literal patch into a structural fix (immutable + runtime-checks-on, single-pass counts, feature store, stripped SVG ids). Every non-trivial claim in this repo is backed by a test or a screenshot I actually looked at. I can explain every line.

---

## Follow-up — reviewer feedback on card expansion

After wrap-up I clicked through the cards myself and hit the exact UX smell I'd let the agent talk me into: expanding one card and finding "every other item is not expandable." That was the **featured-card-above-the-list** compromise biting back — clicking a card set a detail card at the top, usually scrolled out of view, so it looked like nothing happened.

I'd accepted that compromise earlier because inline expansion "breaks fixed-size virtual scroll." That was true but it was the *wrong resolution* — I optimized for avoiding a dependency instead of for the actual UX. The right fix is CDK's **autosize** virtual-scroll strategy (`@angular/cdk-experimental`), which measures each row so cards can expand **inline, in place** while staying virtualized. I had the agent switch to it and move the expanded state into the parent as a `Set<id>` (an internal per-card flag leaks across `*cdkVirtualFor`'s recycled views).

**Verified:** pre-expanded two non-adjacent cards and screenshotted — both grow in place, others flow around them, scrolling stays correct; 39 specs still green. Lesson for myself: "technically correct given a constraint I chose" isn't the same as "right" — I should have clicked through the feature before calling it done, not just screenshotted the happy path.
