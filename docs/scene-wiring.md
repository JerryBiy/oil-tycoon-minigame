# Scene Wiring Guide (beginner, step by step)

> Note (plan v2): this guide covers wiring the **single-player tycoon loop** (now Phase 2). It is
> still valid once you build the economy scene, but the immediate next build is **Phase 1 (walking
> prototype)**, which has its own wiring. Paths are now under `client/cocos-project/`.

The code is done. These are the editor steps **only you** can do in Cocos Creator. Target scene:
`client/cocos-project/assets/scenes/MainGame.scene`. The whole loop runs from two components:
`GameManager` and `HUDView`.

## 0. One-time
- Open the project in Cocos Creator 3.8. Wait for the bottom "Assets" panel to finish importing
  (it generates `.meta` files for the new scripts). Confirm there are no red errors in the Console.

## 1. Create the scene
1. In **Assets**, right-click `assets/scenes` (create the `scenes` folder if missing) → **Create → Scene** → name it `MainGame`.
2. Double-click `MainGame` to open it. It already has a `Canvas` node.

## 2. Add the logic node
1. Right-click `Canvas` → **Create → Empty Node**, name it `GameManager`.
2. Select it → in **Inspector** click **Add Component** → search `GameManager` → add it. (No fields to set.)

## 3. Build the HUD (under Canvas)
Create these as **UI → Label** and **UI → Button** nodes (right-click Canvas → Create → UI Component).
Position them roughly; exact layout can wait.

Labels: `CashLabel`, `CrudeLabel`, `FuelLabel`, `PriceLabel`, `CountdownLabel`, `RatesLabel`, `ToastLabel`.
Buttons: `SellButton`, `DrillButton`, `RefineryButton`.

Tip: a Button comes with a child `Label` node. For `DrillButton`/`RefineryButton`, that child label
is what you'll drag into the "...ButtonLabel" fields below (so the button text shows level + cost).
Give `SellButton`'s label the text "Sell Fuel".

## 4. Add and wire HUDView
1. Select `Canvas` (or an empty `HUD` node) → **Add Component** → `HUDView`.
2. Drag each scene node onto the matching Inspector field:

| HUDView field | Drag this node |
|---------------|----------------|
| Cash Label | `CashLabel` |
| Crude Label | `CrudeLabel` |
| Fuel Label | `FuelLabel` |
| Price Label | `PriceLabel` |
| Countdown Label | `CountdownLabel` |
| Rates Label | `RatesLabel` |
| Toast Label | `ToastLabel` |
| Sell Button | `SellButton` |
| Drill Button | `DrillButton` |
| Drill Button Label | `DrillButton`'s child Label |
| Refinery Button | `RefineryButton` |
| Refinery Button Label | `RefineryButton`'s child Label |

You do **not** need to set Button "Click Events" in the editor — HUDView wires them in code.
Any field left empty is fine; that element just won't render.

## 5. Run
1. Set `MainGame` as the start scene (Project → Project Settings if needed) or just keep it open.
2. Press **Play** (top toolbar). In the preview you should see fuel rising and cash on Sell.
3. Use the checklist in `docs/test-plan.md`.

## Reset progress while testing
Browser devtools → Application → Local Storage → delete the `oiltycoon.save` key, then reload.
