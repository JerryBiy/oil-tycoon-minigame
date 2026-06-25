/**
 * Plain, serializable game state. No Cocos imports so it can be saved/loaded as JSON
 * and unit-reasoned about in isolation.
 */

export interface BuildingState {
    level: number;
    count: number;
}

export interface LifetimeStats {
    fuelSold: number;
    cashEarned: number;
    upgradesPurchased: number;
}

export interface GameState {
    version: number;
    cash: number;
    crudeOil: number;
    /** Fuel held in the refinery's storage (capacity-capped). Collected by walking to it. */
    fuel: number;
    /** Fuel carried in the player's pocket after collecting (unlimited). Sold for cash. */
    carriedFuel: number;
    marketPrice: number;
    /** epoch ms when the current market price expires and a new one is rolled. */
    marketPriceExpiresAt: number;
    buildings: {
        drill: BuildingState;
        refinery: BuildingState;
    };
    unlockedLandSlots: number;
    completedTutorialSteps: string[];
    /** epoch ms of the last save, used for offline earnings. */
    lastSaveTime: number;
    lifetimeStats: LifetimeStats;
}

export function createNewGameState(version: number, startingCash: number): GameState {
    return {
        version,
        cash: startingCash,
        crudeOil: 0,
        fuel: 0,
        carriedFuel: 0,
        marketPrice: 1,
        marketPriceExpiresAt: 0,
        buildings: {
            drill: { level: 1, count: 1 },
            refinery: { level: 1, count: 1 },
        },
        unlockedLandSlots: 1,
        completedTutorialSteps: [],
        lastSaveTime: Date.now(),
        lifetimeStats: { fuelSold: 0, cashEarned: 0, upgradesPurchased: 0 },
    };
}
