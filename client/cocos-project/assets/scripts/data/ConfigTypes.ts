/** Typed shapes for the JSON files under assets/resources/configs/. */

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

export interface Footprint {
    width: number;
    height: number;
}

/** Placeholder visual definition for an equipment type (real art comes later). */
export interface EquipmentVisual {
    color: string;
    sizeScale: number;
    vfxKey: string;
}

/** A purchasable machine in the shop. Footprint, cost, stats, and visual tier are independent. */
export interface EquipmentCatalogItem {
    catalogId: string;
    category: 'drill' | 'refinery';
    tier: number;
    displayName: string;
    buyCost: number;
    sellValue: number;
    footprint: Footprint;
    /** drills only */
    productionPerSecond?: number;
    /** refineries only */
    capacity?: number;
    visual: EquipmentVisual;
}

export interface EquipmentCatalogConfig {
    items: EquipmentCatalogItem[];
}

export interface RectConfig {
    x: number;
    y: number;
    w: number;
    h: number;
}

/** A land zone (ring) on the plot grid: an outer rect minus an optional inner rect. */
export interface LandZoneConfig {
    zoneId: string;
    displayName: string;
    /** drill production multiplier for drills placed in this zone (1, 2, or 3). */
    productionMultiplier: number;
    unlockCost: number;
    unlockedByDefault: boolean;
    /** hex overlay color for the grid debug visual. */
    color: string;
    outer: RectConfig;
    inner?: RectConfig;
}

export interface LandLayersConfig {
    gridWidth: number;
    gridHeight: number;
    /** pixel size of one grid cell in world space. */
    cellSize: number;
    zones: LandZoneConfig[];
}
