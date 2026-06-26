import { GameState, BuildingInstance } from '../data/GameState';

/**
 * Refineries store oil per-instance. Oil flows in at the drill PRODUCTION RATE: each
 * frame only the oil produced that frame (production * dt) is poured into the tanks,
 * so a freshly collected tank refills GRADUALLY (more drills => faster) instead of
 * snapping back to full. Tanks fill SEQUENTIALLY in placement order: the first tank
 * fills to capacity, then the overflow spills to the next. When every tank is full,
 * extra production is dropped — the intended "collect it or waste it" tension. There
 * is no growing backlog, which is what caused the instant 50/50 refill on collect.
 */
export class RefinerySystem {
    refineries(state: GameState): BuildingInstance[] {
        return state.plot.buildings.filter((b) => b.category === 'refinery');
    }

    totalStored(state: GameState): number {
        return this.refineries(state).reduce((s, r) => s + (r.storedOil ?? 0), 0);
    }

    totalCapacity(state: GameState): number {
        return this.refineries(state).reduce((s, r) => s + (r.capacity ?? 0), 0);
    }

    /**
     * Pour `amount` of freshly produced oil into refinery tanks, one at a time in
     * placement order. Returns the amount actually stored; any overflow (all tanks
     * full) is dropped. Used by both the per-frame tick and offline catch-up.
     */
    distribute(state: GameState, amount: number): number {
        if (amount <= 0) return 0;
        let remaining = amount;
        let stored = 0;
        for (const r of this.refineries(state)) {
            if (remaining <= 0) break;
            const room = Math.max(0, (r.capacity ?? 0) - (r.storedOil ?? 0));
            if (room <= 0) continue;
            const add = Math.min(room, remaining);
            r.storedOil = (r.storedOil ?? 0) + add;
            remaining -= add;
            stored += add;
        }
        return stored;
    }
}
