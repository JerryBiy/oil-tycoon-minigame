# Test Plan

## Phase 0 acceptance (setup)
- [ ] `npm install` at the repo root completes without errors.
- [ ] `npm run dev:server` prints the health-check lines and stays running.
- [ ] `npm run typecheck` passes for `shared` and `server`.
- [ ] The Cocos project (`client/cocos-project`) opens in Cocos Creator without errors.
- [ ] First commit pushed to GitHub.

## Phase 2 single-player loop checklist (Cocos preview) — code already present
## Manual checklist (Cocos preview)
- [ ] Fresh start (no save) begins at cash 0, 1 drill, 1 refinery, no errors in console.
- [ ] Crude oil increases every second.
- [ ] Refinery converts crude into fuel; fuel stops at capacity (storage bottleneck visible).
- [ ] Sell button converts all fuel to cash at the current price; fuel resets to 0.
- [ ] Sell button is disabled when fuel is 0.
- [ ] Drill upgrade subtracts the shown cost and increases crude/s; button disabled when unaffordable.
- [ ] Refinery upgrade subtracts cost, increases fuel/s and capacity.
- [ ] Market price changes on the countdown reaching 0; countdown displays mm:ss.
- [ ] Close and reopen the preview → progress is restored (cash, levels, resources).
- [ ] After being away a while, a "Welcome back" toast grants offline fuel (capped).

## Edge cases
- [ ] Set device clock backwards → no crash, no negative resources (offline clamps to 0).
- [ ] Set device clock far forward → offline gain is capped (offlineCapSeconds), not infinite.
- [ ] Rapidly spam Sell / Upgrade → no negative cash/fuel; nothing breaks.
- [ ] Corrupt the save string in storage → game logs an error and starts fresh, no crash.
- [ ] Huge numbers → labels stay readable (K/M/B formatting).

## How to reset progress while testing
Bind a temporary button to `GameManager.instance.resetSave()`, or clear the
`oiltycoon.save` key in the browser devtools Application → Local Storage.
