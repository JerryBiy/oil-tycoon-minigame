import { GameState, footprintCells } from '../data/GameState';
import { Footprint } from '../data/ConfigTypes';
import { LandLayerSystem } from './LandLayerSystem';

export type PlacementReason = 'bounds' | 'locked' | 'occupied' | 'spansZones';

export interface PlacementCheck {
    ok: boolean;
    reason?: PlacementReason;
}

/**
 * Validates a footprint placement at an anchor cell:
 *  - all cells inside the grid,
 *  - all cells unlocked,
 *  - footprint stays within a single land zone (keeps the drill multiplier unambiguous),
 *  - no cell overlaps another building.
 */
export class PlacementSystem {
    constructor(private land: LandLayerSystem) {}

    private occupiedSet(state: GameState, ignoreId?: string): Set<string> {
        const set = new Set<string>();
        for (const b of state.plot.buildings) {
            if (b.id === ignoreId) continue;
            for (const c of b.occupiedCells) set.add(`${c.x},${c.y}`);
        }
        return set;
    }

    check(state: GameState, anchorX: number, anchorY: number, footprint: Footprint): PlacementCheck {
        const cells = footprintCells(anchorX, anchorY, footprint);

        for (const c of cells) {
            if (c.x < 0 || c.y < 0 || c.x >= state.plot.gridWidth || c.y >= state.plot.gridHeight) {
                return { ok: false, reason: 'bounds' };
            }
        }
        for (const c of cells) {
            if (!this.land.isCellUnlocked(state, c.x, c.y)) return { ok: false, reason: 'locked' };
        }
        const zone0 = this.land.zoneForCell(cells[0].x, cells[0].y);
        for (const c of cells) {
            if (this.land.zoneForCell(c.x, c.y) !== zone0) return { ok: false, reason: 'spansZones' };
        }
        const occupied = this.occupiedSet(state);
        for (const c of cells) {
            if (occupied.has(`${c.x},${c.y}`)) return { ok: false, reason: 'occupied' };
        }
        return { ok: true };
    }
}
