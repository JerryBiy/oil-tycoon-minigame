import { GameState, BuildingInstance } from '../data/GameState';
import { LandLayerSystem } from './LandLayerSystem';

/**
 * Computes drill oil production. Each drill's output is multiplied by the land-zone
 * multiplier of the cell it sits on (deep land 2x, core 3x). Refineries never receive
 * the land multiplier. The produced oil is poured straight into the tanks each frame
 * by RefinerySystem.distribute (no accumulating backlog).
 */
export class ProductionSystem {
    constructor(private land: LandLayerSystem, private globalMultiplier: number) {}

    /** Effective production of a single drill instance (base * land multiplier * global). */
    perBuilding(b: BuildingInstance): number {
        if (b.category !== 'drill') return 0;
        const mult = this.land.multiplierForCell(b.gridPosition.x, b.gridPosition.y);
        return (b.productionPerSecond ?? 0) * mult * this.globalMultiplier;
    }

    totalPerSecond(state: GameState): number {
        let sum = 0;
        for (const b of state.plot.buildings) sum += this.perBuilding(b);
        return sum;
    }
}
