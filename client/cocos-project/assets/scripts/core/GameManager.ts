import { _decorator, Component, game, Game } from 'cc';
import { eventBus } from './EventBus';
import { ConfigManager } from './ConfigManager';
import { GameState, BuildingInstance, Cell, createNewGameState, createBuildingInstance } from '../data/GameState';
import { EquipmentCatalogItem, EquipmentVisual, LandLayersConfig, LandZoneConfig } from '../data/ConfigTypes';
import { ProductionSystem } from '../systems/ProductionSystem';
import { RefinerySystem } from '../systems/RefinerySystem';
import { MarketPriceSystem } from '../systems/MarketPriceSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { OfflineEarningsSystem } from '../systems/OfflineEarningsSystem';
import { CollectSystem } from '../systems/CollectSystem';
import { SellSystem } from '../systems/SellSystem';
import { LandLayerSystem } from '../systems/LandLayerSystem';
import { PlacementSystem, PlacementReason } from '../systems/PlacementSystem';
import { SellBuildingSystem } from '../systems/SellBuildingSystem';

const { ccclass } = _decorator;

/** Top-bar / HUD view model (per-frame). Per-building/shop/land info is queried directly. */
export interface HudViewModel {
    cash: number;
    carriedOil: number;
    marketPrice: number;
    priceCountdown: number;
    totalProductionPerSec: number;
    totalStored: number;
    totalCapacity: number;
    buildingCount: number;
    canSellOil: boolean;
}

export interface ShopInfo {
    catalogId: string;
    displayName: string;
    buyCost: number;
    footprint: string;
    canBuy: boolean;
}

export interface LandInfo {
    zoneId: string;
    displayName: string;
    unlockCost: number;
    unlocked: boolean;
    canUnlock: boolean;
}

export interface PlayerCellInfo {
    x: number;
    y: number;
    zoneName: string;
    multiplier: number;
    unlocked: boolean;
}

/** Info for the "Unlock Here" button about the land segment under the player. */
export interface UnlockHereInfo {
    zoneName: string;
    multiplier: number;
    cost: number;
    locked: boolean;
    canUnlock: boolean;
}

/**
 * Single Cocos Component driving the local grid-plot economy. Players buy machines
 * and place them (at the player's current grid cell) onto a grid plot with land
 * zones; drills get a land multiplier, refineries store oil per-instance. A scene
 * PlotRenderer injects `playerCellProvider` so buy/placement knows where to build.
 */
@ccclass('GameManager')
export class GameManager extends Component {
    static instance: GameManager | null = null;

    /** Set by PlotRenderer: returns the player's current grid cell, or null if off-plot. */
    playerCellProvider: (() => Cell | null) | null = null;

    private config = new ConfigManager();
    private state!: GameState;

    private production!: ProductionSystem;
    private refinery!: RefinerySystem;
    private market!: MarketPriceSystem;
    private save!: SaveSystem;
    private offline!: OfflineEarningsSystem;
    private land!: LandLayerSystem;
    private placement!: PlacementSystem;
    private collector = new CollectSystem();
    private seller = new SellSystem();
    private buildingSeller = new SellBuildingSystem();

    private catalogMap = new Map<string, EquipmentCatalogItem>();
    private ready = false;
    private emitAccumulator = 0;
    private saveAccumulator = 0;

    onLoad() {
        GameManager.instance = this;
    }

    get isReady(): boolean {
        return this.ready;
    }

    async start() {
        try {
            await this.config.load();
        } catch (e) {
            console.error('[GameManager] failed to load configs', e);
            eventBus.emit('toast', 'Failed to load game config.');
            return;
        }

        for (const item of this.config.catalog.items) this.catalogMap.set(item.catalogId, item);

        this.land = new LandLayerSystem(this.config.land);
        this.production = new ProductionSystem(this.land, this.config.game.globalProductionMultiplier);
        this.refinery = new RefinerySystem();
        this.market = new MarketPriceSystem(this.config.market);
        this.save = new SaveSystem(this.config.game.saveVersion);
        this.offline = new OfflineEarningsSystem(this.config.game, this.production, this.refinery);
        this.placement = new PlacementSystem(this.land);

        const now = Date.now();
        this.state = this.save.load() ?? this.newGame();
        this.state.crudeBacklog = 0; // legacy field, no longer accumulated (drain any stale value)
        this.market.ensureInitialized(this.state, now);

        const report = this.offline.apply(this.state, now);
        if (report.seconds > 5 && report.oilStored > 0) {
            const mins = Math.round(report.seconds / 60);
            eventBus.emit('toast', `Welcome back! Refineries filled +${report.oilStored.toFixed(0)} oil over ~${mins} min.`);
        }

        game.on(Game.EVENT_HIDE, this.flushSave, this);

        this.ready = true;
        this.emitState();
    }

    onDestroy() {
        if (this.ready) this.flushSave();
        game.off(Game.EVENT_HIDE, this.flushSave, this);
        if (GameManager.instance === this) GameManager.instance = null;
    }

    update(dt: number) {
        if (!this.ready) return;
        const now = Date.now();

        // Pour only this frame's production into the tanks (gradual fill, no backlog dump).
        const produced = this.production.totalPerSecond(this.state) * dt;
        this.refinery.distribute(this.state, produced);
        const priceChanged = this.market.tick(this.state, now);

        this.emitAccumulator += dt;
        if (priceChanged || this.emitAccumulator >= 0.1) {
            this.emitAccumulator = 0;
            this.emitState();
        }

        this.saveAccumulator += dt;
        if (this.saveAccumulator >= this.config.game.autosaveIntervalSeconds) {
            this.saveAccumulator = 0;
            this.flushSave();
        }
    }

    // ---- Player actions ----

    /** Buy a machine and place it at the player's current grid cell (validated). */
    buyEquipment(catalogId: string): void {
        if (!this.ready) return;
        const item = this.catalogMap.get(catalogId);
        if (!item) return;

        const cell = this.playerCellProvider?.() ?? null;
        if (!cell) {
            eventBus.emit('toast', 'Stand on your plot to build');
            return;
        }
        if (this.state.cash < item.buyCost) {
            eventBus.emit('toast', 'Not enough cash');
            return;
        }
        const check = this.placement.check(this.state, cell.x, cell.y, item.footprint);
        if (!check.ok) {
            eventBus.emit('toast', this.placementMessage(check.reason));
            return;
        }
        this.state.plot.buildings.push(createBuildingInstance(item, cell.x, cell.y));
        this.state.cash -= item.buyCost;
        eventBus.emit('toast', `Placed ${item.displayName} at (${cell.x},${cell.y})`);
        this.emitState();
    }

    /** Unlock the land segment the player is currently standing on. */
    unlockLandAtPlayer(): void {
        if (!this.ready) return;
        const cell = this.playerCellProvider?.() ?? null;
        if (!cell) {
            eventBus.emit('toast', 'Stand on your plot to unlock land');
            return;
        }
        const zone = this.land.zoneForCell(cell.x, cell.y);
        if (!zone) {
            eventBus.emit('toast', 'No land here');
            return;
        }
        this.unlockLand(zone.zoneId);
    }

    unlockLand(zoneId: string): void {
        if (!this.ready) return;
        const result = this.land.unlock(this.state, zoneId);
        if (!result.success) {
            const msg = result.reason === 'already'
                ? 'Already unlocked'
                : result.reason === 'unknown'
                    ? `Unknown land zone "${zoneId}"`
                    : `Not enough cash (need $${result.cost ?? 0})`;
            eventBus.emit('toast', msg);
            return;
        }
        const zone = this.land.zoneById(zoneId);
        eventBus.emit('toast', `Unlocked ${zone?.displayName ?? zoneId}`);
        this.emitState();
    }

    sellBuilding(buildingId: string): void {
        if (!this.ready) return;
        const result = this.buildingSeller.sell(this.state, buildingId);
        if (!result.success) return;
        const extra = result.recoveredOil > 0 ? ` (+${result.recoveredOil.toFixed(0)} oil)` : '';
        eventBus.emit('toast', `Sold building for $${result.refund.toFixed(0)}${extra}`);
        this.emitState();
    }

    collectRefinery(buildingId: string): void {
        if (!this.ready) return;
        const amount = this.collector.collect(this.state, buildingId);
        if (amount <= 0) return;
        eventBus.emit('toast', `Collected ${amount.toFixed(0)} oil`);
        this.emitState();
    }

    sellOil(): void {
        if (!this.ready) return;
        const result = this.seller.sell(this.state);
        if (result.sold <= 0) return;
        eventBus.emit('toast', `Sold ${result.sold.toFixed(0)} oil for $${result.revenue.toFixed(0)}`);
        this.emitState();
    }

    resetSave(): void {
        this.save.clear();
        this.state = this.newGame();
        this.market.ensureInitialized(this.state, Date.now());
        this.emitState();
    }

    // ---- Read-only accessors for scene components ----

    getBuildings(): BuildingInstance[] {
        return this.state.plot.buildings;
    }

    getBuilding(id: string): BuildingInstance | null {
        return this.state.plot.buildings.find((b) => b.id === id) ?? null;
    }

    getVisual(catalogId: string): EquipmentVisual | undefined {
        return this.catalogMap.get(catalogId)?.visual;
    }

    /** Effective oil/s for a placed drill (base * land multiplier * global). */
    getEffectiveProduction(b: BuildingInstance): number {
        return this.production.perBuilding(b);
    }

    getLandConfig(): LandLayersConfig {
        return this.config.land;
    }

    zoneForCell(x: number, y: number): LandZoneConfig | null {
        return this.land.zoneForCell(x, y);
    }

    isCellUnlocked(x: number, y: number): boolean {
        return this.land.isCellUnlocked(this.state, x, y);
    }

    /** Stable key that changes when the set of unlocked zones changes (for grid redraw). */
    unlockedZoneKey(): string {
        return this.state.plot.unlockedZoneIds.slice().sort().join(',');
    }

    getShopInfo(catalogId: string): ShopInfo | null {
        const item = this.catalogMap.get(catalogId);
        if (!item) return null;
        return {
            catalogId,
            displayName: item.displayName,
            buyCost: item.buyCost,
            footprint: `${item.footprint.width}x${item.footprint.height}`,
            canBuy: this.state.cash >= item.buyCost,
        };
    }

    getLandInfo(zoneId: string): LandInfo | null {
        const z = this.land.zoneById(zoneId);
        if (!z) return null;
        const unlocked = this.state.plot.unlockedZoneIds.includes(zoneId);
        return {
            zoneId,
            displayName: z.displayName,
            unlockCost: z.unlockCost,
            unlocked,
            canUnlock: !unlocked && this.state.cash >= z.unlockCost,
        };
    }

    getUnlockHereInfo(): UnlockHereInfo | null {
        const cell = this.playerCellProvider?.() ?? null;
        if (!cell) return null;
        const z = this.land.zoneForCell(cell.x, cell.y);
        if (!z) return null;
        const unlocked = this.state.plot.unlockedZoneIds.includes(z.zoneId);
        return {
            zoneName: z.displayName,
            multiplier: z.productionMultiplier,
            cost: z.unlockCost,
            locked: !unlocked,
            canUnlock: !unlocked && this.state.cash >= z.unlockCost,
        };
    }

    getPlayerCellInfo(): PlayerCellInfo | null {
        const cell = this.playerCellProvider?.() ?? null;
        if (!cell) return null;
        const z = this.land.zoneForCell(cell.x, cell.y);
        return {
            x: cell.x,
            y: cell.y,
            zoneName: z ? z.displayName : '(no land)',
            multiplier: z ? z.productionMultiplier : 0,
            unlocked: z ? this.state.plot.unlockedZoneIds.includes(z.zoneId) : false,
        };
    }

    // ---- Internal ----

    private placementMessage(reason?: PlacementReason): string {
        switch (reason) {
            case 'bounds': return 'Out of bounds';
            case 'locked': return 'Locked land — unlock it first';
            case 'occupied': return 'Cells already occupied';
            case 'spansZones': return 'Footprint spans two land zones';
            default: return 'Cannot place here';
        }
    }

    private newGame(): GameState {
        const lc = this.config.land;
        const s = createNewGameState(
            this.config.game.saveVersion,
            this.config.game.startingCash,
            lc.gridWidth,
            lc.gridHeight,
            this.land.defaultUnlockedZoneIds(),
        );
        // Place a starter drill and refinery in the (unlocked) beginner land area.
        const drill = this.catalogMap.get('drill_t1');
        const refinery = this.catalogMap.get('refinery_t1');
        if (drill) s.plot.buildings.push(createBuildingInstance(drill, 9, 4));
        if (refinery) s.plot.buildings.push(createBuildingInstance(refinery, 10, 4));
        return s;
    }

    private flushSave(): void {
        if (this.ready) this.save.save(this.state);
    }

    private emitState(): void {
        eventBus.emit('stateChanged', this.buildViewModel());
    }

    private buildViewModel(): HudViewModel {
        const s = this.state;
        return {
            cash: s.cash,
            carriedOil: s.carriedOil,
            marketPrice: s.marketPrice,
            priceCountdown: this.market.countdownSeconds(s, Date.now()),
            totalProductionPerSec: this.production.totalPerSecond(s),
            totalStored: this.refinery.totalStored(s),
            totalCapacity: this.refinery.totalCapacity(s),
            buildingCount: s.plot.buildings.length,
            canSellOil: s.carriedOil > 0,
        };
    }
}
