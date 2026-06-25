/** Typed shapes for the JSON files under assets/resources/configs/. */

export interface DrillConfig {
    id: string;
    displayName: string;
    baseCost: number;
    costGrowth: number;
    baseCrudePerSecond: number;
    levelMultiplier: number;
    maxLevel: number;
}

export interface RefineryConfig {
    id: string;
    displayName: string;
    baseCost: number;
    costGrowth: number;
    baseFuelPerSecond: number;
    levelMultiplier: number;
    baseCapacity: number;
    capacityGrowth: number;
    maxLevel: number;
}

export interface BuildingsConfig {
    drill: DrillConfig;
    refinery: RefineryConfig;
}

export interface MarketConfig {
    minPrice: number;
    maxPrice: number;
    startPrice: number;
    refreshSeconds: number;
}

export interface GameConfig {
    startingCash: number;
    globalProductionMultiplier: number;
    offlineCapSeconds: number;
    offlineEfficiency: number;
    autosaveIntervalSeconds: number;
    saveVersion: number;
}
