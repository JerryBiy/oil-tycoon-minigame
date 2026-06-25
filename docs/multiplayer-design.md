# Multiplayer & Stealing Design

## Tuning defaults (move to config; do not hard-code)
| Choice | Default | Range / note |
|--------|---------|--------------|
| Room size | 4 players | Expand to 6 only after perf + feel are stable |
| Map layout | one shared land, plots around the map | players walk between plots |
| Movement | tap-to-move | joystick acceptable; no jump/full 3D physics |
| Steal duration | 6 s | tune 4–10 s |
| Steal amount | 20–35% of refinery oil | capped by `maxStealAmount` |
| Owner counterplay | collect/defend before timer ends | |
| Protection | short cooldown after any steal attempt | security upgrades extend it |
| Fairness | create tension, don't make players quit | protect new players, cap losses |

## Steal state machine (server-authoritative)
```
IDLE
 -> START_REQUESTED
 -> VALIDATING_DISTANCE_AND_REFINERY
 -> ACTIVE_STEAL_TIMER
      -> INTERRUPTED_BY_OWNER
      -> CANCELLED_BY_THIEF
      -> COMPLETED_SUCCESSFULLY
      -> FAILED_DISCONNECT_OR_TIMEOUT
 -> APPLY_REWARD_OR_REFUND
 -> APPLY_PROTECTION_COOLDOWN
 -> IDLE
```

## Rules (enforced on the server, Phase 7)
- Only steal from another player's refinery; thief must be within `interactionRadius`.
- Refinery must hold at least `minStealableOil` and not be under protection.
- Steal takes `stealDurationSeconds`. Owner collecting/defending in range before completion fails it.
- On completion thief gets `stealPercent` of available oil, capped by `maxStealAmount`.
- After any attempt the refinery gets `protectionCooldownSeconds`.
- Rate-limit repeated steal requests.

Values live in `client/cocos-project/assets/resources/configs/pvp.json` (added in Phase 7) and are
read by the server as the authority.
