# Network Protocol

Defined in `shared/src/protocol/messages.ts` so client and server share one contract.
Envelope: `{ type, data, seq?, t? }` (`NetworkMessage`).

## Client → Server
| Message | Purpose | Server validates | Phase |
|---------|---------|------------------|-------|
| JOIN_ROOM | Join matchmaking/room | session token, room capacity | 4 |
| MOVE_TARGET | Move to target position | speed, map bounds, collision, rate limit | 5 |
| COLLECT_OWN_REFINERY | Collect own refinery oil | owner, distance, available oil | 6 |
| SELL_OIL | Sell carried oil | amount, price source, carried amount | 6 |
| BUY_UPGRADE | Buy drill/refinery/land/security | cost, prerequisites, current cash | 6 |
| START_STEAL | Timed steal from enemy refinery | distance, owner, oil, cooldown, rate limit | 7 |
| CANCEL_STEAL | Cancel current steal | active session belongs to player | 7 |
| DEFEND_REFINERY | Owner interrupts active steal | owner, distance, active steal exists | 7 |

## Server → Client
| Message | Purpose | Phase |
|---------|---------|-------|
| ROOM_SNAPSHOT | Full room state on join / periodic correction | 4 |
| PLAYER_MOVED | Movement/position update | 5 |
| PLOT_STATE_CHANGED | Refinery fill, tier, owner, protection | 5/6 |
| STEAL_STARTED / STEAL_INTERRUPTED / STEAL_COMPLETED | Steal lifecycle | 7 |
| UPGRADE_PURCHASED | Equipment tier changed → play reveal | 6 |
| ERROR_MESSAGE | Rejected action with user-safe reason | 4 |

## State shapes
`RoomState`, `PlayerState`, `PlotState`, `StealSession`, `BuildingInstance` — see
`shared/src/types/`. The server owns these; clients render copies received via snapshots/events.

## Phase status
Phase 0 defines the message names/enums and the room/player/plot/steal types. Payloads for movement,
economy, and stealing are fleshed out in Phases 5–7. WS transport (`ws`) and `WeChat`/`NetworkBridge`
adapters arrive in Phases 4 and 9.
