import { GameState } from '../data/GameState';

/**
 * Collects oil from ONE specific refinery instance into the player's carried pocket.
 * Proximity ("near that refinery") is enforced by the scene/HUD before calling this.
 */
export class CollectSystem {
    /** Returns the amount collected from the given refinery instance. */
    collect(state: GameState, buildingId: string): number {
        const r = state.plot.buildings.find((b) => b.id === buildingId && b.category === 'refinery');
        const amount = r?.storedOil ?? 0;
        if (!r || amount <= 0) return 0;
        state.carriedOil += amount;
        r.storedOil = 0;
        return amount;
    }
}
