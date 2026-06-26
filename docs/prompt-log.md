# Prompt Log

Record each Claude Code task so future sessions have context.

## 2026-06-26 — Phase 4 (V5): badass equipment visual pipeline (client)
- Phase 3 committed (`feat(client): add grid placement and land layer economy`), merged to `main`, pushed.
  Branch `phase-4-badass-equipment-visual-pipeline` off main.
- Placeholder visual pipeline, no economy changes:
  - `equipment_catalog.json` visuals escalate by tier (vivid color + `sizeScale` presence 1.0→1.25; vfxKey).
  - `BuildingView` = the per-building visual controller: footprint-sized shape colored by catalog,
    `sizeScale` node scale (independent of footprint, so 1x1 `drill_t3` still reads powerful), and
    `playPlaceVFX()` (scale punch + brightness flash + `eventBus.emit('vfx')` + `[sfx]` console hook).
  - GameManager emits `'purchased' {catalogId, buildingId}` before emitState; PlotRenderer flags that
    building and triggers its reveal VFX (so only the bought one punches, not pool-reindexed neighbors).
  - `getShopInfo` enriched (tier/sellValue/statText/hint); ShopButton shows the stat line; new
    `ui/PurchaseRevealPanel` (UIOpacity-hidden, pops on purchase with name/tier/stats/footprint/hint).
  - EventBus adds `'purchased'`/`'vfx'`. Wiring/test: `docs/phase4-equipment-visuals-wiring.md` (mostly
    automatic; only optional PurchaseRevealPanel needs wiring). Pending in-editor verify before commit.

## 2026-06-26 — Plan V5 deltas folded into Phase 3 (client)
- V5 reframes the world as a road-based room with walled plots + physical shop/sell/leaderboard landmarks
  and enemy slow-on-cross walls — ALL deferred to Phases 6–11. Phase 3 stays grid placement + land, no walls/road.
- Phase-3 change: land is now vertical STRIPS with multipliers 1x/2x/3x/5x (was V4 concentric 1x/1x/2x/3x).
  `land_layers.json`: beginner (x6..11, free, unlocked) → strip_2x (x4..5) → strip_3x (x2..3) → strip_5x (x0..1).
  Starter drill/refinery moved to beginner cells (8,5)/(9,5). saveVersion → 4 (old zone ids rejected).
- Refinery flow fix (prev turn): production pours into tanks at the production rate (no growing backlog),
  sequential fill, overflow dropped — fixes the instant 50/50 refill on collect.
- Land follow-up: kept stable zone ids (`expansion/deep/core` = 2x/3x/5x) so existing buttons work; fixed
  misleading unlock toast. Then reshaped per the reference sketch: grid is a 12x9 RECTANGLE, beginner is a
  small 3x3 block (right), and each tier is a vertical strip with down/mid/up SEGMENTS (12 zones total;
  ids `<tier>` mid + `<tier>_up`/`<tier>_down`). New `ui/UnlockHereButton` + `GameManager.unlockLandAtPlayer`/
  `getUnlockHereInfo`: one button unlocks the segment the player stands on (walk up/down/left). Locked cells
  now drawn in faint tier color. Wiring/test: `docs/phase3-grid-plot-wiring.md`. Pending verify before commit.

## 2026-06-26 — Plan V4 + Phase 3 (V4, superseded by V5 strips): grid plot placement + land layers (client)
- Branch `phase-3-grid-plot-placement-and-land-layers` (off the V3 slot working tree, transformed in place).
- Model: plot is a 12x12 grid (`land_layers.json`: starter/expansion 1x, deep 2x, core 3x; cellSize 64).
  Buildings have footprints (catalog `footprint`); `drill_t3` is a strong 1x1 (better ≠ bigger).
- New: `core/GridMap`, `systems/LandLayerSystem` (ring zones = outer−inner; unlock/multiplier),
  `systems/PlacementSystem` rewritten (bounds/unlocked/single-zone/overlap), `core/PlotRenderer`
  (grid in ONE Graphics overlay; only occupied buildings as POOLED nodes under Entities → Y-sort + interact),
  `core/BuildingView` (footprint size, keyed repaint, info label), `ui/LandButton`. ProductionSystem
  multiplies each drill by its cell's land multiplier.
- Buy flow: place at player's current grid cell (PlotRenderer injects `playerCellProvider`); validated.
- Reused: Collect/Sell/SellBuilding/Refinery(sequential fill)/OfflineEarnings/Save. Deleted slot-era
  `SlotView` + `BuyEquipmentSystem`. saveVersion → 3 (old saves rejected). Footprint shown on shop buttons.
- Placeholder shapes only; no backend/multiplayer/stealing/ads/art. Wiring: `docs/phase3-grid-plot-wiring.md`.
- WeChat perf budget honored (grid=data, render only occupied, pooled nodes). Pending in-editor verify before commit.

## 2026-06-26 — Plan V3 + Phase 3 (V3, superseded by V4): equipment instances & placement (client)
- New plan V3: drills/refineries are NOT upgraded; players buy/place separate building INSTANCES;
  old machines keep working until sold; each refinery stores oil independently; collect per-refinery.
- The earlier level-derived tier Phase 3 (wrong concept) was NOT committed — stashed as
  `stash@{0}` ("v2-phase3-level-derived-tiers"). Started fresh branch `phase-3-equipment-instances-and-placement` off main.
- Refactor: GameState → `plot.buildings: BuildingInstance[]`, `carriedOil`, `crudeBacklog` (saveVersion 2;
  old saves rejected). New config `equipment_catalog.json` (3 drills + 3 refineries). ConfigManager loads catalog.
- Systems: ProductionSystem (sum of placed drills → backlog), RefinerySystem (per-instance intake/storage),
  CollectSystem (collect specific refinery id), SellSystem (carriedOil→cash), PlacementSystem (slots),
  BuyEquipmentSystem, SellBuildingSystem, OfflineEarnings rewritten. Deleted obsolete UpgradeSystem.
- GameManager rewritten: buy/sellBuilding/collectRefinery/sellOil + getBuildingInSlot/getVisual/getShopInfo.
- New components: `core/SlotView` (renders a slot's building, keyed repaint so highlight isn't overwritten),
  `ui/ShopButton`. HUDView rebuilt (cash/carried/price/production/storage/slots; collect/sellOil/sellBuilding).
- Highlight bug fixed: Interactable captures+restores the exact color at highlight time (RefineryMarker now unused).
- Placeholder shapes only; no backend/multiplayer/stealing/ads/art. Wiring: `docs/phase3-equipment-instances-wiring.md`.
- Pending in-editor verify before commit. Recommended commit: `feat(client): add equipment instances and placement loop`.
- Fix (pre-commit): refinery fill was throttled by `refinePerSecond*dt`, so extra drills only grew the
  backlog and tanks still filled at ~1/s. RefinerySystem now distributes the whole backlog (= total drill
  production) across tanks proportional to room, no intake throttle (shared `fill()` used by tick + offline).
  Collect was already per-refinery; added a `SelectedRefineryLabel` HUD debug line (nearby refinery's own
  stored/cap) so per-tank behavior is verifiable.
- Plan V4 received (grid plots + footprints + land 1x/2x/3x multipliers) — becomes the next Phase 3 refactor.
  Two pre-V4 tweaks applied to the current slot code (carry into V4): refineries now fill SEQUENTIALLY
  (one tank full, then next) instead of proportionally; each slot has a floating `infoLabel` via SlotView
  (drill = production rate, refinery = stored/capacity). WeChat perf budget noted for all future phases.

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
