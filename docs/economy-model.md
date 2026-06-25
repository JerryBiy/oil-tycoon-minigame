# Economy Model — MVP

> Phase 2 update — the loop now has a **collect** step. Drill output becomes crude; the refinery
> converts crude into **stored fuel** (capped by capacity). The player must **walk to their own
> refinery to Collect**, moving stored fuel into an **unlimited carried pocket** (`carriedFuel`).
> **Selling** sells the carried pocket at the market price; fuel still in the refinery is not
> sellable until collected. Offline production fills the refinery (capped); collection is manual on return.

All numbers live in `assets/resources/configs/`. Change them there, not in code.

## Formulas
```
crudePerSecond   = drill.count * baseCrudePerSecond * levelMultiplier^(drillLevel-1) * globalMultiplier
fuelPerSecond    = refinery.count * baseFuelPerSecond * levelMultiplier^(refineryLevel-1)
fuelCapacity     = refinery.count * baseCapacity * capacityGrowth^(refineryLevel-1)
upgradeCost      = ceil(baseCost * costGrowth^(currentLevel-1))
saleRevenue      = fuel * marketPrice
offlineSeconds   = clamp(now - lastSaveTime, 0, offlineCapSeconds)
offlineFuel      = min(crudeProduced, refineThroughput, freeStorage) * offlineEfficiency  (applied per-term)
```

## Starting values (buildings.json / market.json / game.json)
- Drill: baseCost 30, costGrowth 1.18, 1 crude/s, levelMultiplier 1.15
- Refinery: baseCost 100, costGrowth 1.20, 1 fuel/s, capacity 50, capacityGrowth 1.25
- Market: 0.8–2.6, start 1.5, refresh every 30s
- Game: startingCash 0, offline cap 8h, offline efficiency 0.4, autosave 10s

## Intended early pacing (tune toward this with prompt 7.4)
| Time | Milestone |
|------|-----------|
| 0–10 s | Fuel visibly accumulating; first sell |
| ~20–40 s | Afford first drill upgrade |
| 2–4 min | Refinery becomes the bottleneck → first refinery upgrade |
| later phases | Land slot / new building unlocks |

## Bottleneck intent
Strong drills + weak refinery → crude piles up. Strong refinery + full storage → refining stalls
until the player sells. Low price → wait, but storage pressure pushes a sale. This creates real
decisions without multiplayer.
