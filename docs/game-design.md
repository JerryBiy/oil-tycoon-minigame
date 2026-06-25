# Game Design — 2.5D Multiplayer Oil Tycoon

Original 2.5D / fake-3D multiplayer oil tycoon for WeChat Mini Game. Players walk a shared map,
inspect each other's plots, upgrade increasingly impressive drills/refineries, and steal oil from
filled enemy refineries. Visual style: fake-3D map (Don't-Starve-like structure), tap-to-move.

## Core player fantasy
- Start with a small plot, one weak drill, one weak refinery.
- Walk the fake-3D land; physically walk to your refinery to collect oil into your carried pocket.
- Several players share one room and can see each other's plots and production.
- If an enemy refinery is filled, walk over and start a timed steal; the owner can interrupt by
  returning and collecting/defending first.
- Better equipment looks dramatically cooler/larger/more powerful — visual reward, not just numbers.
- Spend cash/oil on drills, refineries, land, boosts, security/protection, and prestige.

## Final gameplay loop
Join a 4–6 player room → walk & collect & sell/refine → upgrade tiers → compare plots →
steal from filled enemy refineries (owner can interrupt) → reinvest → return later for offline
production, quests, daily rewards, and leaderboards.

## Design principle
The game fails if upgrades are only numerical. Every major drill/refinery tier must be a visual
reward: new silhouette, animation, VFX, and reveal moment. See `art-direction.md`.

## Originality boundary
Original name, art, map, UI, audio, code, and economy numbers. Reproduce the genre/loop, never
another game's protected expression.
