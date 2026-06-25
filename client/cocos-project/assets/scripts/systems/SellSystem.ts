import { GameState } from '../data/GameState';

export interface SellResult {
    sold: number;
    revenue: number;
}

/**
 * Sells the player's carried fuel at the current market price and credits cash.
 * Carried fuel is the only thing sellable — fuel still in the refinery must be
 * collected first by walking to it.
 */
export class SellSystem {
    sell(state: GameState): SellResult {
        const sold = state.carriedFuel;
        if (sold <= 0) return { sold: 0, revenue: 0 };

        const revenue = sold * state.marketPrice;
        state.cash += revenue;
        state.carriedFuel = 0;
        state.lifetimeStats.fuelSold += sold;
        state.lifetimeStats.cashEarned += revenue;
        return { sold, revenue };
    }
}
