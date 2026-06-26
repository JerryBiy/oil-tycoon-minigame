import { GameState } from '../data/GameState';
import { LandLayersConfig, LandZoneConfig, RectConfig } from '../data/ConfigTypes';

export interface UnlockResult {
    success: boolean;
    reason?: 'unknown' | 'already' | 'cash';
    cost?: number;
}

/**
 * Land zones are concentric rings (outer rect minus inner rect) and are mutually
 * exclusive, so each cell belongs to at most one zone. Only DRILLS get a zone's
 * productionMultiplier; refineries do not.
 */
export class LandLayerSystem {
    constructor(private config: LandLayersConfig) {}

    get zones(): LandZoneConfig[] {
        return this.config.zones;
    }

    private inRect(x: number, y: number, r?: RectConfig): boolean {
        return !!r && x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
    }

    zoneForCell(x: number, y: number): LandZoneConfig | null {
        for (const z of this.config.zones) {
            if (this.inRect(x, y, z.outer) && !this.inRect(x, y, z.inner)) return z;
        }
        return null;
    }

    multiplierForCell(x: number, y: number): number {
        return this.zoneForCell(x, y)?.productionMultiplier ?? 1;
    }

    defaultUnlockedZoneIds(): string[] {
        return this.config.zones.filter((z) => z.unlockedByDefault).map((z) => z.zoneId);
    }

    isCellUnlocked(state: GameState, x: number, y: number): boolean {
        const z = this.zoneForCell(x, y);
        return !!z && state.plot.unlockedZoneIds.includes(z.zoneId);
    }

    zoneById(id: string): LandZoneConfig | null {
        return this.config.zones.find((z) => z.zoneId === id) ?? null;
    }

    unlock(state: GameState, zoneId: string): UnlockResult {
        const z = this.zoneById(zoneId);
        if (!z) return { success: false, reason: 'unknown' };
        if (state.plot.unlockedZoneIds.includes(zoneId)) return { success: false, reason: 'already', cost: z.unlockCost };
        if (state.cash < z.unlockCost) return { success: false, reason: 'cash', cost: z.unlockCost };
        state.cash -= z.unlockCost;
        state.plot.unlockedZoneIds.push(zoneId);
        return { success: true, cost: z.unlockCost };
    }
}
