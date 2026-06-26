# Phase 4 — Badass Equipment Visual Pipeline: Scene Wiring (beginner)

Placeholder visuals only, structured so real 2.5D art/VFX/audio drop in later. **Most of Phase 4 needs
no wiring** — the building visuals and shop labels update from config automatically. The only optional
new piece is the **Purchase Reveal** panel.

## Automatic (no wiring)
- **Tier look:** each placed building is colored by its catalog `visual.color` (colors get more vivid by
  tier) and scaled by `visual.sizeScale` for "presence" — independent of footprint, so the compact
  `drill_t3` (1x1) still reads as powerful. Tune in `equipment_catalog.json`.
- **Placement reveal VFX:** when you buy a machine it pops in (scale punch) with a brightness flash, and
  logs a placeholder sound hook `[sfx] place <vfxKey>` to the Console (real particles/audio later).
- **Shop buttons** now show the stat line automatically, e.g. `Buy Industrial Dual Pump (2x2)` /
  `+4/s base · $200`. (No re-wiring — your existing `ShopButton`s just show more.)

## Optional — Purchase Reveal panel
A pop-up that shows the machine you just bought, then fades out.
1. Under `Canvas`, create a node `PurchaseReveal` (place it somewhere visible, e.g. center-top).
2. Add child **Label**s: `Title`, `Stats`, `Hint`. (Optional: a `Preview` node with `PlaceholderShape`
   for a color swatch.)
3. Select `PurchaseReveal` → **Add Component → `PurchaseRevealPanel`** → drag `Title`/`Stats`/`Hint`
   (and optional `Preview`) into its fields. Optionally set `Hold Seconds` (default 3).

It hides itself on start (via UIOpacity) and pops up on each purchase: `NEW: <name> (Tier N)` with
stats/footprint/sell value and a best-use hint, then fades. If you skip it, buying still pops the
building in-world.

## Tuning (config only)
`equipment_catalog.json` → each item's `visual`: `color` (hex), `sizeScale` (presence, ~1.0–1.3),
`vfxKey` (named hook). `buyCost` / `sellValue` / `footprint` / `productionPerSecond` / `capacity` drive
the shop stat line and reveal panel.

## Manual test checklist
- Buy each drill/refinery → it **pops in** with a punch + brightness flash; Console logs `[sfx] place …`.
- Higher tiers look more vivid; `drill_t3` (1x1) is clearly more desirable than `drill_t1` (1x1) despite
  the same footprint — "better isn't always bigger."
- Shop button labels show the stat line (`+N/s base` for drills, `holds N oil` for refineries) + cost.
- (If wired) the Purchase Reveal panel pops `NEW: … (Tier N)` with stats + hint, then fades after ~3s.
- Selling/replacing buildings doesn't spuriously replay the punch on other buildings.
- Economy is unchanged: production, per-refinery collect/sell, placement, land unlocks, save/reload all
  still work. No console errors.
