# Phase 1 — 2.5D Walking Prototype: Scene Wiring (beginner)

Goal: tap-to-move player on a fake-3D map, with camera follow, depth sorting, collision, and a
building-proximity highlight. Placeholder shapes are drawn in code — **no art assets needed.**

Components (all under `assets/scripts/`): `PlayerController`, `CameraFollow`, `YSortDepth`,
`InteractionDetector`, `Obstacle`, `Interactable`, `PlaceholderShape`.

## Target hierarchy
```
Canvas
└─ WorldRoot            (empty node)            ← add CameraFollow
   ├─ Ground            (PlaceholderShape RECT) ← visual only, behind everything
   └─ Entities          (empty node)            ← add YSortDepth
      ├─ Player          (PlaceholderShape CIRCLE) ← add PlayerController + InteractionDetector
      ├─ Refinery        (PlaceholderShape RECT)   ← add Obstacle + Interactable
      ├─ Drill           (PlaceholderShape RECT)   ← add Obstacle + Interactable
      └─ Wall            (PlaceholderShape RECT)   ← add Obstacle only
```
Order matters: **Ground before Entities** so the map renders behind the characters.

## Steps
1. **Scene**: in Assets, right-click `assets/scenes` → Create → Scene → name `TestMap`. Double-click to open. (Or just use the existing `scene.scene`.)
2. **WorldRoot**: right-click `Canvas` → Create → Empty Node → name `WorldRoot`. Set its Position to `(0,0,0)`.
3. **Ground**: right-click `WorldRoot` → Create → Empty Node → `Ground`. Add Component → `PlaceholderShape`.
   Set: shapeType = RECT, width `1280`, height `1280`, fillColor a dark green. Position `(0,0,0)`.
   (Adding PlaceholderShape auto-adds Graphics + UITransform — you should see a filled square.)
4. **Entities**: right-click `WorldRoot` → Create → Empty Node → `Entities`. Add Component → `YSortDepth`. Position `(0,0,0)`.
5. **Player**: right-click `Entities` → Create → Empty Node → `Player`. Add Component → `PlaceholderShape`
   (shapeType = CIRCLE, radius `24`, a bright blue). Then Add Component → `PlayerController` and `InteractionDetector`. Position `(0,0,0)`.
6. **Refinery / Drill**: under `Entities` create two nodes. Each: `PlaceholderShape` (RECT ~`100x100`, gray) +
   `Obstacle` + `Interactable`. On Interactable set Display Name (e.g. "Refinery", "Drill"). Position them apart, e.g. `(220,120,0)` and `(-260,-160,0)`.
7. **Wall**: under `Entities` create `Wall`: `PlaceholderShape` (RECT ~`320x40`) + `Obstacle` only. Position `(0,300,0)`.
8. **Wire CameraFollow**: select `WorldRoot`. On its `CameraFollow`, drag the `Player` node into **Target**.
   Set `mapWidth`/`mapHeight` to `1280` (match the Ground). Leave smoothing `8`.
9. **Bounds**: select `Player`. On `PlayerController` set `halfMapWidth`/`halfMapHeight` to `600`
   (a bit inside the 640 ground half-size so the player stays on the map).

## Run & verify (press Play)
- Tap/click on the ground → player walks there smoothly and stops.
- Walk into the Wall or a building → player is blocked and slides along the edge; never overlaps.
- Walk so the player passes above then below a building → it correctly renders behind / in front (Y-sort).
- Camera keeps the player centered and stops scrolling at the map edges (no empty space beyond the ground).
- Walk near Refinery/Drill → it highlights (turns yellow) and the Console logs `near: Refinery`; leaving un-highlights and logs `none`.

## Notes
- If you change a PlaceholderShape's size/color in the Inspector and it doesn't redraw, toggle the
  component off/on or reopen the scene (it redraws on enable).
- All movement/collision/interaction nodes must stay direct children of `Entities` so their local
  coordinates share one space.
