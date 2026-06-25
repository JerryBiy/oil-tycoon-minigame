import { GameState } from '../data/GameState';
import { BuildingsConfig } from '../data/ConfigTypes';

/**
 * Refineries convert crude oil into fuel, limited by (a) refining speed and
 * (b) fuel storage capacity. This is the core bottleneck: strong drills + weak
 * refinery makes crude pile up; full storage stalls refining until the player sells.
 */
export class RefinerySystem {
    constructor(private buildings: BuildingsConfig) {}

    fuelPerSecond(state: GameState): number {
        const r = this.buildings.refinery;
        const b = state.buildings.refinery;
        return b.count * r.baseFuelPerSecond * Math.pow(r.levelMultiplier, b.level - 1);
    }

    fuelCapacity(state: GameState): number {
        const r = this.buildings.refinery;
        const b = state.buildings.refinery;
        return b.count * r.baseCapacity * Math.pow(r.capacityGrowth, b.level - 1);
    }

    tick(state: GameState, dt: number): void {
        const capacity = this.fuelCapacity(state);
        const room = Math.max(0, capacity - state.fuel);
        if (room <= 0) return; // storage full: refining stalls

        const wanted = this.fuelPerSecond(state) * dt;
        const converted = Math.min(wanted, state.crudeOil, room);
        if (converted <= 0) return;

        state.crudeOil -= converted;
        state.fuel += converted;
    }
}
