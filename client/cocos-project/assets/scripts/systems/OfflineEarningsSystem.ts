import { GameState } from '../data/GameState';
import { GameConfig } from '../data/ConfigTypes';
import { ProductionSystem } from './ProductionSystem';
import { RefinerySystem } from './RefinerySystem';

export interface OfflineReport {
    seconds: number;
    oilStored: number;
}

/**
 * Grants production accrued while away, at reduced efficiency and capped to a max
 * duration: the away-time production is poured into the tanks (sequentially, bounded
 * by capacity); overflow is dropped. Clock moving backwards is clamped to 0.
 */
export class OfflineEarningsSystem {
    constructor(
        private game: GameConfig,
        private production: ProductionSystem,
        private refinery: RefinerySystem,
    ) {}

    apply(state: GameState, now: number): OfflineReport {
        const elapsed = (now - state.lastSaveTime) / 1000;
        const seconds = Math.max(0, Math.min(elapsed, this.game.offlineCapSeconds));
        if (seconds <= 0) return { seconds: 0, oilStored: 0 };

        const eff = this.game.offlineEfficiency;
        const produced = this.production.totalPerSecond(state) * seconds * eff;
        const oilStored = this.refinery.distribute(state, produced);
        return { seconds, oilStored };
    }
}
