# Project: 2.5D Multiplayer Oil Tycoon Mini Game

We are building an original 2.5D / fake-3D multiplayer oil tycoon game for Cocos Creator + TypeScript
+ WeChat Mini Game. The final game has shared rooms, visible player plots, walking, timed refinery
stealing, owner interruption, and highly desirable drill/refinery upgrade visuals.

## Monorepo layout
- `client/cocos-project/` — the Cocos Creator game (open THIS folder in Cocos Dashboard).
- `server/` — authoritative Node WebSocket game server (Claude builds most of this).
- `shared/` — TypeScript types + network protocol + config schemas used by client AND server.
- `docs/` — design/technical/multiplayer/economy/protocol/test docs. Update after each phase.

`shared` is published in-repo as `@oiltycoon/shared`; `server` is `@oiltycoon/server`. Run
`npm install` at the repo root once (npm workspaces) to link them.

## Phase status (plan V5 — road room, walled plots, grid plots, footprints, land strips)
- Phase 0 setup, Phase 1 walking, Phase 2 single-player loop: **DONE, merged to `main`, pushed.**
- **Phase 3 (V5) — grid plot placement + land strips** in progress on branch
  `phase-3-grid-plot-placement-and-land-layers`. Grid plot (12x12), buy+place building instances with
  footprints at the player's cell, land strips (beginner 1x free → 2x → 3x → 5x, drills only),
  per-refinery SEQUENTIAL fill at production rate (no backlog dump), collect/sell specific refinery,
  grid rendered data-driven (one Graphics overlay + pooled building nodes). Pending in-editor verify + commit.
- V5 defers to later phases (do NOT build in Phase 3): central road shared room, walled plots with
  enemy slow-on-cross, physical shop/sell-station/leaderboard landmarks (Phases 6–11).
- Superseded, NOT committed: V4 concentric-ring land + V3 fixed slots + level-tier stash
  (`v2-phase3-level-derived-tiers`). Respect the WeChat perf budget (see memory) every phase.
- Then: Phase 4 badass equipment visuals → 5 WS backend → 6 road room+plot sync → 7 server economy → 8 stealing+walls → …

## Hard rules (from the plan)
- Do not copy Oil Empire (or any game's) assets, UI, exact maps, names, exact upgrade values, branding, text, sounds, or code.
- Build ONE feature/phase per task. Do not implement multiple phases at once.
- Before editing, inspect existing files and explain the plan.
- Keep gameplay data config-driven (JSON), not hard-coded across files.
- Multiplayer economy and stealing MUST be server-authoritative. The client may predict and animate, but the server decides final outcomes (distance, production, steal success).
- Do not add real-money IAP or ads unless the phase asks for it.
- After each task, provide a manual test checklist.
- Use `git diff` before final response. Do not delete scenes/assets without asking.

## Commands
- Server: `npm install` (root), then `npm run dev:server`. Typecheck: `npm run typecheck`.
- Client: run scene previews from the Cocos Editor (no CLI run for gameplay).
- Claude cannot operate the Cocos editor — always give the user explicit scene-wiring steps.
