import { GameState } from '../data/GameState';
import { MarketConfig } from '../data/ConfigTypes';

/**
 * Fuel sale price drifts to a new random value every refreshSeconds.
 * The player chooses to sell now or wait for a higher price.
 */
export class MarketPriceSystem {
    constructor(private market: MarketConfig) {}

    /** Seconds until the current price expires (>= 0). */
    countdownSeconds(state: GameState, now: number): number {
        return Math.max(0, (state.marketPriceExpiresAt - now) / 1000);
    }

    /** Ensure a valid price exists (used on first run / after load). */
    ensureInitialized(state: GameState, now: number): void {
        if (state.marketPrice <= 0 || state.marketPriceExpiresAt <= 0) {
            state.marketPrice = this.market.startPrice;
            state.marketPriceExpiresAt = now + this.market.refreshSeconds * 1000;
        }
    }

    tick(state: GameState, now: number): boolean {
        if (now < state.marketPriceExpiresAt) return false;
        state.marketPrice = this.roll();
        state.marketPriceExpiresAt = now + this.market.refreshSeconds * 1000;
        return true;
    }

    private roll(): number {
        const { minPrice, maxPrice } = this.market;
        const raw = minPrice + Math.random() * (maxPrice - minPrice);
        return Math.round(raw * 100) / 100;
    }
}
