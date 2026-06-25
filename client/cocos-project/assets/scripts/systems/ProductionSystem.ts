import { GameState } from '../data/GameState';
import { BuildingsConfig } from '../data/ConfigTypes';

/**
 * Drills extract crude oil into the (unlimited) crude pool.
 * crudePerSecond = count * baseCrudePerSecond * levelMultiplier^(level-1) * globalMultiplier
 */
export class ProductionSystem {
    constructor(private buildings: BuildingsConfig, private globalMultiplier: number) {}

    crudePerSecond(state: GameState): number {
        const d = this.buildings.drill;
        const b = state.buildings.drill;
        return b.count * d.baseCrudePerSecond * Math.pow(d.levelMultiplier, b.level - 1) * this.globalMultiplier;
    }

    tick(state: GameState, dt: number): void {
        state.crudeOil += this.crudePerSecond(state) * dt;
    }
}
