# Prompt Log

Record each Claude Code task so future sessions have context.

## 2026-06-25 — Phase 1: 2.5D walking prototype (client)
- Branch `phase-1-2.5d-walking-map-prototype` off Phase 0.
- Added client components (placeholder shapes, no art): `core/PlaceholderShape`, `core/YSortDepth`,
  `movement/PlayerController` (tap-to-move + AABB collision + bounds + per-axis slide),
  `movement/CameraFollow` (UI-space world-scroll follow with edge clamp),
  `interaction/Obstacle`, `interaction/Interactable`, `interaction/InteractionDetector`.
- No economy/backend/multiplayer/stealing. Camera implemented as world-root scroll (UI space) so
  Graphics placeholders render reliably for a beginner.
- Wiring guide: `docs/phase1-walking-wiring.md`. Next: validate in Cocos, then Phase 2 (single-player loop).

## 2026-06-25 — Plan v2: switch to multiplayer monorepo + Phase 0
- New plan: 2.5D multiplayer oil tycoon (walking, shared rooms, refinery stealing, authoritative server).
- Restructured into a monorepo: `client/cocos-project/`, `server/`, `shared/`, `docs/`.
- Migrated the earlier single-player scripts into `client/cocos-project/assets/scripts/` (now Phase 2 head start).
- Phase 0 built: `shared` package (types/player|plot|room, protocol/messages, configs/economy, math/constants),
  `server` health-check entry + config/env, root npm workspaces, updated CLAUDE.md and docs
  (game-design, technical-plan, multiplayer-design, network-protocol, art-direction, test-plan).
- Next: Phase 1 (2.5D walking map prototype) — PlayerController, CameraFollow, YSort, InteractionDetector. No economy/backend yet.

## 2026-06-25 — Phase 1 MVP code scaffold (superseded by plan v2 structure)
- Implemented config-driven economy and all MVP systems in `assets/scripts/`:
  EventBus, ConfigManager, Format, GameManager (Component), GameState/ConfigTypes,
  Production/Refinery/MarketPrice/Upgrade/Save/OfflineEarnings systems, HUDView (Component).
- Added JSON configs under `assets/resources/configs/` (buildings, market, game).
- Added docs: game-design, technical-plan, economy-model, test-plan, scene-wiring.
- Deferred per plan: backend, ads, login, leaderboard, multiplayer, IAP, land/placement.
- Next manual steps: install Cocos 3.8, create project at repo root, wire MainGame.scene
  (see scene-wiring.md), press Play, run the test-plan checklist.
