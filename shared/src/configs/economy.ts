/**
 * Config schema types shared by client and server so the authoritative economy
 * (server) and the predicted/displayed economy (client) read the same shapes.
 * Concrete values live in JSON config files, never hard-coded.
 */

export interface DrillTierConfig {
    tier: number;
    displayName: string;
    crudePerSecond: number;
    upgradeCost: number;
}

export interface RefineryTierConfig {
    tier: number;
    displayName: string;
    fuelPerSecond: number;
    storageCapacity: number;
    upgradeCost: number;
}

export interface EquipmentTiersConfig {
    drills: DrillTierConfig[];
    refineries: RefineryTierConfig[];
}

export interface PvpConfig {
    interactionRadius: number;
    minStealableOil: number;
    stealDurationSeconds: number;
    stealPercent: number;
    maxStealAmount: number;
    protectionCooldownSeconds: number;
}

export interface EconomyConfig {
    sellPricePerOil: number;
    offlineCapSeconds: number;
    offlineEfficiency: number;
}
