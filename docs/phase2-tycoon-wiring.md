# Phase 2 — Single-Player Tycoon Loop: Scene Wiring (beginner)

Builds on the Phase 1 walking scene (`scene-001` / TestMap). The loop:
**drill → crude → refinery converts to stored fuel (capacity-capped) → walk to your refinery & Collect
into your pocket → Sell pocket for cash at the market price → Upgrade drill/refinery.** Progress
saves locally; returning later grants capped offline fuel into the refinery.

You do NOT touch PlayerController / CameraFollow / YSortDepth. You add a logic node, a HUD, and one
tag on the refinery.

## 1. Tag the refinery
Select the **Refinery** building node from Phase 1 (it already has PlaceholderShape + Obstacle +
Interactable). **Add Component → `RefineryMarker`**. (Leave the Drill node as-is.)

## 2. Add the logic node
Right-click `Canvas` → Create → Empty Node → name `GameManager`. **Add Component → `GameManager`**.
No fields to set. (It loads `assets/resources/configs/*.json` automatically.)

## 3. Build the HUD (screen-space)
Create a node `HUD` as a **direct child of `Canvas`** (a sibling of `WorldRoot`, so it stays fixed on
screen and does NOT scroll with the world). Under `HUD` create:

Labels (right-click → Create → UI Component → Label): `CashLabel`, `RefineryFuelLabel`,
`CarryingLabel`, `PriceLabel`, `CountdownLabel`, `RatesLabel`, `ToastLabel`.
(Crude is intentionally not shown — it's consumed by refining immediately and confuses players.)

Buttons (Create → UI Component → Button — each comes with a child Label): `CollectButton`,
`SellButton`, `DrillButton`, `RefineryButton`. Set the CollectButton/SellButton child label text to
"Collect" / "Sell". Lay them out roughly along the bottom; exact positions don't matter yet.

## 4. Add and wire HUDView
Select `HUD` → **Add Component → `HUDView`**. Drag nodes onto the matching Inspector fields:

| HUDView field | Drag |
|---------------|------|
| Cash Label | `CashLabel` |
| Stored Fuel Label | `RefineryFuelLabel` |
| Carried Fuel Label | `CarryingLabel` |
| Price Label | `PriceLabel` |
| Countdown Label | `CountdownLabel` |
| Rates Label | `RatesLabel` |
| Toast Label | `ToastLabel` |
| Collect Button | `CollectButton` |
| Sell Button | `SellButton` |
| Drill Button | `DrillButton` |
| Drill Button Label | `DrillButton`'s child Label |
| Refinery Button | `RefineryButton` |
| Refinery Button Label | `RefineryButton`'s child Label |
| Interaction Detector | the **Player** node (Cocos picks its InteractionDetector) |

Button clicks are wired in code — don't add Click Events in the editor. Any field left empty just
won't render.

## 5. Dev reset (temporary, remove before release)
Select the `GameManager` node → **Add Component → `DebugReset`**. While previewing, press **R** to
wipe the save and restart from a fresh game. No fields to set.

## 6. Run
Press Play. You start with cash 0, one drill, one refinery (from `buildings.json`).
