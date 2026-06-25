import { GameState } from '../data/GameState';
import { BuildingsConfig } from '../data/ConfigTypes';

export type UpgradeKind = 'drill' | 'refinery';

export interface UpgradeResult {
    success: boolean;
    reason?: 'insufficientCash' | 'maxLevel';
}

/**
 * upgradeCost = baseCost * costGrowth^(currentLevel - 1)
 * Cost is computed only here so the curve lives in one place.
 */
export class UpgradeSystem {
    constructor(private buildings: BuildingsConfig) {}

    private cfg(kind: UpgradeKind) {
        return kind === 'drill' ? this.buildings.drill : this.buildings.refinery;
    }

    cost(state: GameState, kind: UpgradeKind): number {
        const cfg = this.cfg(kind);
        const level = state.buildings[kind].level;
        return Math.ceil(cfg.baseCost * Math.pow(cfg.costGrowth, level - 1));
    }

    isMaxed(state: GameState, kind: UpgradeKind): boolean {
        return state.buildings[kind].level >= this.cfg(kind).maxLevel;
    }

    canAfford(state: GameState, kind: UpgradeKind): boolean {
        return !this.isMaxed(state, kind) && state.cash >= this.cost(state, kind);
    }

    upgrade(state: GameState, kind: UpgradeKind): UpgradeResult {
        if (this.isMaxed(state, kind)) return { success: false, reason: 'maxLevel' };
        const price = this.cost(state, kind);
        if (state.cash < price) return { success: false, reason: 'insufficientCash' };

        state.cash -= price;
        state.buildings[kind].level += 1;
        state.lifetimeStats.upgradesPurchased += 1;
        return { success: true };
    }
}
