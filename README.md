# 2.5D Multiplayer Oil Tycoon Mini Game

An original 2.5D / fake-3D **multiplayer** oil tycoon for **WeChat Mini Game**. Players walk a shared
map, inspect each other's plots, upgrade increasingly impressive drills/refineries, and steal oil
from filled enemy refineries — with the owner able to interrupt. Built with **Cocos Creator 3.8 +
TypeScript** on the client and a **server-authoritative Node WebSocket** backend.

All assets, names, UI, map, audio, and economy numbers are original.

## Monorepo layout
```
client/cocos-project/   # Cocos Creator game — open THIS folder in Cocos Dashboard
  assets/scripts/       # core, data, systems, ui (+ movement/interaction/multiplayer/platform later)
  assets/resources/configs/   # JSON economy config (all tunable numbers)
server/                 # @oiltycoon/server — authoritative Node WebSocket server
shared/                 # @oiltycoon/shared — types, network protocol, config schemas
docs/                   # design, technical, multiplayer, network-protocol, art, test
package.json            # npm workspaces (shared + server)
CLAUDE.md               # AI development rules
```

## Status — Phase 0 (setup) complete
Monorepo, shared protocol/types skeleton, runnable server health-check, and docs are in place. The
single-player tycoon scripts under `client/cocos-project/assets/scripts/` are the head start for
Phase 2. **Phase 1 (2.5D walking prototype)** is the next build.

Phases: 0 setup ✅ · 1 walking · 2 single-player loop · 3 equipment visuals · 4 WS backend ·
5 plot/movement sync · 6 authoritative economy · 7 stealing PvP · 8 retention · 9 WeChat · 10 polish.

## Getting started
```bash
npm install            # at repo root — links shared into server (workspaces)
npm run dev:server     # runs the Phase 0 health-check server
npm run typecheck      # typechecks shared + server
```
Then install Cocos Creator 3.8 and open `client/cocos-project` (see docs/scene-wiring.md once a scene exists).

See [CLAUDE.md](CLAUDE.md) for development rules and [docs/](docs/) for full design.
