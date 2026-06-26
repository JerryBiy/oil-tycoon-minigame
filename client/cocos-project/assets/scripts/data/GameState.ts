/**
 * Plain, serializable game state — Version 4 grid-plot model.
 *
 * The plot is a grid of cells. Players buy machines and place them as building
 * instances with a footprint (occupying multiple cells). Land zones gate which
 * cells are buildable and give drills a production multiplier. Old machines keep
 * contributing until sold; selling frees their cells.
 */

import { EquipmentCatalogItem, Footprint } from './ConfigTypes';

export interface Cell {
    x: number;
    y: number;
}

export interface BuildingInstance {
    id: string;
    catalogId: string;
    category: 'drill' | 'refinery';
    tier: number;
    /** anchor (bottom-left) cell of the footprint. */
    gridPosition: Cell;
    footprint: Footprint;
    /** every cell this building occupies (derived from gridPosition + footprint). */
    occupiedCells: Cell[];
    productionPerSecond?: number;
    capacity?: number;
    /** refineries only: oil stored in this specific tank. */
    storedOil?: number;
    sellValue: number;
}

export interface PlotState {
    plotId: string;
    gridWidth: number;
    gridHeight: number;
    unlockedZoneIds: string[];
    buildings: BuildingInstance[];
}

export interface GameState {
    version: number;
    cash: number;
    carriedOil: number;
    crudeBacklog: number;
    marketPrice: number;
    marketPriceExpiresAt: number;
    plot: PlotState;
    lastSaveTime: number;
}

export function createNewGameState(
    version: number,
    startingCash: number,
    gridWidth: number,
    gridHeight: number,
    unlockedZoneIds: string[],
): GameState {
    return {
        version,
        cash: startingCash,
        carriedOil: 0,
        crudeBacklog: 0,
        marketPrice: 1,
        marketPriceExpiresAt: 0,
        plot: { plotId: 'plot_local', gridWidth, gridHeight, unlockedZoneIds: unlockedZoneIds.slice(), buildings: [] },
        lastSaveTime: Date.now(),
    };
}

let instanceCounter = 0;

export function footprintCells(anchorX: number, anchorY: number, footprint: Footprint): Cell[] {
    const cells: Cell[] = [];
    for (let dy = 0; dy < footprint.height; dy++) {
        for (let dx = 0; dx < footprint.width; dx++) {
            cells.push({ x: anchorX + dx, y: anchorY + dy });
        }
    }
    return cells;
}

/** Build a placed BuildingInstance from a catalog item at a grid anchor cell. */
export function createBuildingInstance(item: EquipmentCatalogItem, anchorX: number, anchorY: number): BuildingInstance {
    instanceCounter += 1;
    return {
        id: `${item.catalogId}-${anchorX}_${anchorY}-${instanceCounter}`,
        catalogId: item.catalogId,
        category: item.category,
        tier: item.tier,
        gridPosition: { x: anchorX, y: anchorY },
        footprint: { width: item.footprint.width, height: item.footprint.height },
        occupiedCells: footprintCells(anchorX, anchorY, item.footprint),
        productionPerSecond: item.productionPerSecond,
        capacity: item.capacity,
        storedOil: item.category === 'refinery' ? 0 : undefined,
        sellValue: item.sellValue,
    };
}
