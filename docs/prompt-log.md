# Prompt Log

Record each Claude Code task so future sessions have context.

## 2026-06-25 — Phase 2: single-player tycoon loop (client)
- Branch `phase-2-single-player-tycoon-loop` off updated `main` (Phase 0+1 merged & pushed).
- Loop: drill → crude → refinery converts to stored fuel (capacity-capped) → walk to own refinery
  & Collect into unlimited carried pocket → Sell pocket at market price → upgrade drill/refinery.
- GameState: added `carriedFuel`. New pure systems `CollectSystem`, `SellSystem`. New tag
  `interaction/RefineryMarker`. GameManager: replaced `sellFuel()` with `collect()` + `sell()`,
  extended HudViewModel (storedFuel/carriedFuel/canCollect). HUDView: Collect button gated by
  proximity via Phase 1 InteractionDetector + RefineryMarker; Sell sells the pocket.
- Reused Phase 1 walking/interaction unchanged. Economy stays config-driven (buildings/market/game.json).
- No backend/multiplayer/stealing/ads/art. Wiring: `docs/phase2-tycoon-wiring.md`.
- UX cleanup: removed the visible Crude label (crude kept internal to the economy); added dev-only
  `dev/DebugReset` (press R → clear save + `game.restart()`), to be removed before release.

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
