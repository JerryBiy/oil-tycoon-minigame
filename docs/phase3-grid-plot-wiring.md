# Phase 3 (V4) — Grid Plot, Footprints & Land Layers: Scene Wiring (beginner)

Corrected model (plan V5): the plot is a **grid** (12x12, `land_layers.json`). You buy machines and
they're **placed at the cell your player is standing on**, validated against bounds / unlocked land /
overlap / single-zone. Land is split into vertical strips giving **drills** a 1x / 2x / 3x / 5x
multiplier (beginner free, stronger strips unlock with cash). Buildings are rendered at runtime by
`PlotRenderer` (grid = one Graphics overlay; only occupied buildings get pooled nodes), so there is
**no per-slot wiring** anymore.

You keep Phase 1 movement/camera (Player, WorldRoot, CameraFollow, Ground) and the GameManager node.

## 1. DELETE the temporary slot stuff
If you wired the V3 6-slot attempt, delete those nodes: `Slot0`…`Slot5` (their `SlotView` script no
longer exists) and any old `Drill`/`Refinery` building nodes. Also remove the old HUD `Slots` label and
the upgrade/collect buttons that referenced the slot model. (Keep `Wall` only if you still want a
collision test obstacle — optional.)

## 2. ADD the Plot node (grid renderer)
1. Under `WorldRoot`, create an empty node `Plot`. Set its Position to `(0,0,0)`. Make sure `Plot` is
   ordered **above `Entities`** in the hierarchy (so the grid draws behind the player/buildings) and
   **below `Ground`**.
2. Confirm `Entities` is also at Position `(0,0,0)` (it has `YSortDepth` from Phase 1; Player is its child).
3. Select `Plot` → **Add Component → `PlotRenderer`**. Drag:
   - **Player** ← the `Player` node
   - **Entities Container** ← the `Entities` node

That's the whole plot. On Play you'll see a colored grid drawn as vertical land strips — green
**Beginner (1x)** on the right (unlocked), then dim locked strips for **2x / 3x / 5x** to the left —
and the starter drill + refinery rendered on it. Walk onto cells to read the zone/multiplier in the HUD.

## 3. HUD (screen-space, under `Canvas`)
Labels: `CashLabel`, `CarryingLabel`, `PriceLabel`, `CountdownLabel`, `ProductionLabel`, `StorageLabel`,
`BuildingsLabel`, `ZoneLabel` (debug: current cell/zone/multiplier), `SelectedRefineryLabel` (debug),
`ToastLabel`.
Buttons: `CollectButton`, `SellOilButton`, `SellBuildingButton`.

Add `HUDView` to the HUD node, drag each Label/Button into its field, and drag the **Player** node into
**Interaction Detector**. Collect / Sell Building act on the building you stand next to; Sell Oil sells
your pocket.

## 4. Shop (under `Canvas`) — buy & place
Create 6 `Button`s (each has a child Label). On each: **Add Component → `ShopButton`**, set **Catalog Id**
and drag the child Label into `Label`:

| Button | Catalog Id |
|--------|-----------|
| BuyDrill1 | `drill_t1` |
| BuyDrill2 | `drill_t2` |
| BuyDrill3 | `drill_t3` |
| BuyRefinery1 | `refinery_t1` |
| BuyRefinery2 | `refinery_t2` |
| BuyRefinery3 | `refinery_t3` |

To build: **walk the player to the cell you want**, then press a Buy button → it places the footprint
anchored at the player's cell (or shows why it can't).

## 5. Land unlock (under `Canvas`)
The plot is a 12x9 rectangle of land segments. The free **Beginner** area is a small 3x3 block on the
right; every other segment is locked. Each multiplier tier is a vertical strip with **down / mid / up**
segments you unlock separately, so you can grow 1x land up/down and unlock 2x/3x/5x strips:

```
   5x      3x      2x    beginner(1x)
[up ][up ][up ][up ]
[mid][mid][mid][MID=free]
[dn ][dn ][dn ][dn ]
```

**Recommended — one contextual button.** Create one `Button`, **Add Component → `UnlockHereButton`**,
drag its child Label into the `Label` field. Then to unlock: **walk the player onto a locked segment**
(its color shows faintly; the HUD Zone line shows its tier + `[locked]`) and press the button. It shows
`Unlock <tier> <mult>x  $cost` and unlocks that exact segment. Walk up/down/left to unlock others.

(If you'd rather keep fixed buttons, the old `LandButton` still works — set its **Zone Id** to a specific
segment id, e.g. `expansion` = 2x mid, `deep` = 3x mid, `core` = 5x mid, or `beginner_up` / `expansion_down`
etc. But the single Unlock Here button covers all 11 segments with no extra wiring — delete the old 3.)

## 6. GameManager node
Keep `GameManager` (+ `DebugReset` for the R reset). No fields.

## Notes
- Buildings are created at runtime — you won't see them in the editor, only on Play.
- `cellSize` is 64; the 12x12 grid is ~768px, centered on the origin. Your `PlayerController`
  half-bounds (≈600) let you walk the whole plot.
- Footprint = visual size (2x3 looks 2x3). `drill_t3` is a strong **1x1** (compact) — proof that
  better isn't always bigger.
- Tier color comes from the catalog `visual.color`; the highlight restores it exactly on leave.
