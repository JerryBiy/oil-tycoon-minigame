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

## Phase status
- **Phase 0 (setup) — DONE.** Monorepo, shared types/protocol skeleton, runnable server health-check, docs, CLAUDE.md.
- Single-player tycoon code from the earlier plan already lives in `client/cocos-project/assets/scripts/`
  (core/data/systems/ui). It is the head start for **Phase 2 (single-player tycoon loop)** and will be
  adapted there (add walk-to-collect, separate CollectSystem/SellSystem, economy.json).
- Next up: **Phase 1 (2.5D walking map prototype)** — movement, camera, Y-sort, interaction. No economy/backend/multiplayer in Phase 1.

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
