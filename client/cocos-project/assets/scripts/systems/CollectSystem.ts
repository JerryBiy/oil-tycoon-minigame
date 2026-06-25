import { GameState } from '../data/GameState';

/**
 * Moves fuel from the refinery's storage into the player's carried pocket.
 * Proximity ("must stand near the refinery") is enforced by the scene/HUD before
 * calling this; the rule here is purely the resource transfer.
 */
export class CollectSystem {
    canCollect(state: GameState): boolean {
        return state.fuel > 0;
    }

    /** Returns the amount collected. */
    collect(state: GameState): number {
        const amount = state.fuel;
        if (amount <= 0) return 0;
        state.carriedFuel += amount;
        state.fuel = 0;
        return amount;
    }
}
