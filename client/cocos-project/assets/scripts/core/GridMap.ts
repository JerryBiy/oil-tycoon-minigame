import { Cell } from '../data/GameState';
import { Footprint } from '../data/ConfigTypes';

/**
 * Pure grid<->world math. The grid is centered on the local origin (0,0) of the plot
 * container, so cell (0,0) is bottom-left and the whole grid is symmetric around center.
 */
export class GridMap {
    readonly originX: number;
    readonly originY: number;

    constructor(public gridW: number, public gridH: number, public cellSize: number) {
        this.originX = -(gridW * cellSize) / 2;
        this.originY = -(gridH * cellSize) / 2;
    }

    inBounds(x: number, y: number): boolean {
        return x >= 0 && y >= 0 && x < this.gridW && y < this.gridH;
    }

    /** Center of a single cell in local space. */
    cellCenterLocal(x: number, y: number): { x: number; y: number } {
        return { x: this.originX + (x + 0.5) * this.cellSize, y: this.originY + (y + 0.5) * this.cellSize };
    }

    /** Center of a footprint block anchored at (anchorX, anchorY). */
    footprintCenterLocal(anchorX: number, anchorY: number, fp: Footprint): { x: number; y: number } {
        return {
            x: this.originX + (anchorX + fp.width / 2) * this.cellSize,
            y: this.originY + (anchorY + fp.height / 2) * this.cellSize,
        };
    }

    /** Which cell a local-space position falls in (may be out of bounds). */
    localToCell(lx: number, ly: number): Cell {
        return {
            x: Math.floor((lx - this.originX) / this.cellSize),
            y: Math.floor((ly - this.originY) / this.cellSize),
        };
    }
}
