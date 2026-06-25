# Technical Plan — 2.5D Multiplayer Oil Tycoon

## Architecture (authoritative server)
```
Cocos client  -> input, rendering, local animation, prediction, interpolation, UI
shared        -> types + network protocol + config schemas (one source of truth)
Node server   -> authoritative room state, sessions, movement validation, production
                 ticks, economy, stealing timers
Database      -> persistent player/equipment/plot/currency (LocalJson in dev, swap later)
```

Server authority rule: the client never decides whether a steal succeeds, how much oil is
produced, or whether a player is close enough. The client sends **intents**; the server
**validates** and **broadcasts** results.

```
Cocos input -> NetworkService sends intent -> server validates -> server updates WorldState
            -> server broadcasts snapshot/event -> client renders the result
```

## Monorepo
| Folder | Role |
|--------|------|
| `client/cocos-project/` | The Cocos Creator project. Open this in Cocos Dashboard. Not an npm workspace. |
| `server/` | `@oiltycoon/server` — Node WS server. `npm run dev:server`. |
| `shared/` | `@oiltycoon/shared` — types, protocol, config schemas imported by both sides. |
| `docs/` | Design + technical + protocol docs. |

`npm install` at the repo root links `shared` into `server` via workspaces. `shared` exposes its
TypeScript source directly (`main: src/index.ts`) so `tsx` runs the server without a separate build.

## Build order (phases)
0 Setup ✅ → 1 Walking prototype → 2 Single-player loop → 3 Equipment tier visuals →
4 WS backend foundation → 5 Plot viewing + movement sync → 6 Server-authoritative economy →
7 Timed stealing PvP → 8 Progression/retention → 9 WeChat integration → 10 Polish/launch candidate.

Each phase is one task. Movement/feel (1) and the fun single-player loop (2) come before any
networking, so the game is proven enjoyable before multiplayer complexity is added.

## Current code
`client/cocos-project/assets/scripts/` holds the single-player systems (Production, Refinery,
MarketPrice, Upgrade, Save, OfflineEarnings, GameManager Component, HUDView Component). These are
Phase 2 material; Phase 1 (walking) is the immediate next build and does not touch them.
