import { GameState } from '../data/GameState';

export interface SellBuildingResult {
    success: boolean;
    refund: number;
    /** any oil that was stored in a sold refinery is returned to the carried pocket. */
    recoveredOil: number;
}

/**
 * Sells/removes a placed building instance, freeing its slot and granting sellValue.
 * Oil still stored in a sold refinery is moved to the player's pocket (not lost).
 */
export class SellBuildingSystem {
    sell(state: GameState, buildingId: string): SellBuildingResult {
        const idx = state.plot.buildings.findIndex((b) => b.id === buildingId);
        if (idx < 0) return { success: false, refund: 0, recoveredOil: 0 };

        const b = state.plot.buildings[idx];
        const recoveredOil = b.storedOil ?? 0;
        if (recoveredOil > 0) state.carriedOil += recoveredOil;

        state.plot.buildings.splice(idx, 1);
        state.cash += b.sellValue;
        return { success: true, refund: b.sellValue, recoveredOil };
    }
}
