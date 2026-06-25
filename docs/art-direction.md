# Art Direction — Badass Equipment Tiers

Equipment progression is a core gameplay system, not late polish. Placeholder shapes are fine early,
but **keep scale + silhouette differences from the start** so the upgrade desire can be tested.

## Tier fantasy (≥6 tiers each, detailed in Phase 3)
| Tier | Drill fantasy | Refinery fantasy | Required visual difference |
|------|---------------|------------------|----------------------------|
| 1 | Rusty starter pumpjack | Small basic tank | Tiny, slow loop, dull colors |
| 2 | Industrial dual pump | Bigger steel refinery | Larger silhouette, more pipes, faster loop |
| 3 | Deep-core drill tower | Refinery w/ smoke stacks | Tall, smoke/steam effects |
| 4 | Mega hydraulic drill | Mega refinery complex | Big footprint, glow, moving parts |
| 5 | Sci-fi plasma drill | Advanced neon refinery | Energy glow, particles, rare reveal |
| 6 | Titan/legendary platform | Fortress refinery | Dominant map presence, strongest VFX/audio |

## Every tier needs
Unique silhouette, readable at small screen size, loop animation, upgrade-reveal moment, icon/card
art, and a VFX hook (glow / smoke / sparks / oil particles / scale punch + sound event name).

## Production method
Greybox → placeholder → kitbash low-poly in Blender → render as optimized 2.5D sprites → import to
Cocos → VFX polish. Asset-size policy: do NOT put every high-tier texture in the main package — use
asset bundles / subpackages / remote loading for later-tier art (WeChat 4MB main package limit).
