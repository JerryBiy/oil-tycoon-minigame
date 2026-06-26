import { GameState } from '../data/GameState';

export interface SellResult {
    sold: number;
    revenue: number;
}

/** Sells the player's carried oil at the current market price and credits cash. */
export class SellSystem {
    sell(state: GameState): SellResult {
        const sold = state.carriedOil;
        if (sold <= 0) return { sold: 0, revenue: 0 };
        const revenue = sold * state.marketPrice;
        state.cash += revenue;
        state.carriedOil = 0;
        return { sold, revenue };
    }
}
