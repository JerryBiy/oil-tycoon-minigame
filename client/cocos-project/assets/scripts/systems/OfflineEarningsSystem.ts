import { GameState } from '../data/GameState';
import { GameConfig } from '../data/ConfigTypes';
import { ProductionSystem } from './ProductionSystem';
import { RefinerySystem } from './RefinerySystem';

export interface OfflineReport {
    seconds: number;
    crudeGained: number;
    fuelGained: number;
}

/**
 * Grants production accrued while the player was away, at reduced efficiency and
 * capped to a maximum duration. Clock moving backwards is clamped to 0 so the
 * game never crashes or grants negative resources.
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
        if (seconds <= 0) return { seconds: 0, crudeGained: 0, fuelGained: 0 };

        const eff = this.game.offlineEfficiency;
        const crudeProduced = this.production.crudePerSecond(state) * seconds * eff;

        // Refine offline crude into fuel, bounded by refining throughput and free storage.
        const room = Math.max(0, this.refinery.fuelCapacity(state) - state.fuel);
        const refineThroughput = this.refinery.fuelPerSecond(state) * seconds * eff;
        const fuelGained = Math.min(crudeProduced, refineThroughput, room);
        const crudeGained = crudeProduced - fuelGained;

        state.fuel += fuelGained;
        state.crudeOil += crudeGained;

        return { seconds, crudeGained, fuelGained };
    }
}
