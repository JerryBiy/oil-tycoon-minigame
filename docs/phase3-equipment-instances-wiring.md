# Phase 3 (V3) — Equipment Instances & Placement: Scene Wiring (beginner)

Corrected model: you **buy** drills/refineries from a shop and **place** them as separate machines
into limited plot **slots**. Old machines keep working until you **sell** them. Each refinery stores
oil independently; you collect from the specific refinery you stand near.

You keep the Phase 1 movement/camera (Player, WorldRoot, CameraFollow, Wall obstacle). You **rebuild
the economy parts** of the scene: replace the single Refinery/Drill nodes with slot nodes, rebuild the
HUD, and add a shop. Config: `assets/resources/configs/equipment_catalog.json` (3 drills + 3 refineries).

## 1. Remove the old Phase 2 economy nodes
Delete (or repurpose) the old `Refinery` and `Drill` building nodes and any Phase 2 upgrade buttons in
the HUD. Keep Player, Wall, WorldRoot, Ground, Entities, CameraFollow, and the `GameManager` node.

## 2. GameManager node
Keep the `GameManager` node with `GameManager`. (Optionally keep `DebugReset` on it for the R reset.)

## 3. Plot slots (under `Entities`)
Create 6 nodes `Slot0` … `Slot5`. For EACH:
- Add Component `PlaceholderShape` (RECT, ~`80x80`).
- Add Component `Interactable`.
- Add Component `SlotView` → set **Slot Id** to its number (`"0"`…`"5"`).
- Add a **child Label** node `Info` positioned just above the shape (e.g. Y ≈ +60). Drag it into
  `SlotView` → **Info Label**. (Drills show `+rate/s`, refineries show `stored / capacity`.)
- Position them spread out (e.g. a 3×2 grid) so you can walk between them.

On Play, Slot0 shows the starter drill, Slot1 the starter refinery; empty slots show a faint gray
marker. Bought machines auto-fill the next free slot.

(Slots don't need an Obstacle; the player can walk over them and interact by proximity.)

## 4. HUD (screen-space, direct child of `Canvas`)
Labels: `CashLabel`, `CarryingLabel`, `PriceLabel`, `CountdownLabel`, `ProductionLabel`,
`StorageLabel`, `SlotsLabel`, `SelectedRefineryLabel` (debug: nearby refinery's own stored/cap),
`ToastLabel`.
Buttons: `CollectButton`, `SellOilButton`, `SellBuildingButton`.

Add `HUDView` to the HUD node and drag:

| HUDView field | Drag |
|---------------|------|
| Cash / Carried Oil / Price / Countdown / Production / Storage / Slots / Toast Label | the matching Label |
| Selected Refinery Label (optional debug) | `SelectedRefineryLabel` |
| Collect Button | `CollectButton` |
| Sell Oil Button | `SellOilButton` |
| Sell Building Button | `SellBuildingButton` |
| Interaction Detector | the **Player** node |

Collect and Sell-Building act on the building you're standing next to; Sell Oil sells your pocket.

## 5. Shop (screen-space, under `Canvas` → `Shop` node)
Create 6 `Button`s (each has a child `Label`). For each: Add Component `ShopButton`, set **Catalog Id**
and drag the button's child Label into the `Label` field:

| Button | Catalog Id |
|--------|-----------|
| BuyDrill1 | `drill_t1` |
| BuyDrill2 | `drill_t2` |
| BuyDrill3 | `drill_t3` |
| BuyRefinery1 | `refinery_t1` |
| BuyRefinery2 | `refinery_t2` |
| BuyRefinery3 | `refinery_t3` |

Each shows "Buy {name} ${cost}" and disables when unaffordable or the plot is full. Button clicks are
wired in code.

## Notes
- Slots auto-place purchases into the first free slot (simple prototype placement).
- Tier visuals = catalog `visual` (color/size). Real art + reveal/VFX come in Phase 4.
- Highlight now restores the exact pre-highlight color, so walking near a machine no longer wipes its
  tier color.
