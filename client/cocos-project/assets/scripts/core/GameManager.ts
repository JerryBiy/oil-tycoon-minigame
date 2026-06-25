import { _decorator, Component, game, Game } from 'cc';
import { eventBus } from './EventBus';
import { ConfigManager } from './ConfigManager';
import { GameState, createNewGameState } from '../data/GameState';
import { ProductionSystem } from '../systems/ProductionSystem';
import { RefinerySystem } from '../systems/RefinerySystem';
import { MarketPriceSystem } from '../systems/MarketPriceSystem';
import { UpgradeSystem, UpgradeKind } from '../systems/UpgradeSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { OfflineEarningsSystem } from '../systems/OfflineEarningsSystem';

const { ccclass } = _decorator;

/** Everything the HUD needs to render in one frame. */
export interface HudViewModel {
    cash: number;
    crudeOil: number;
    fuel: number;
    fuelCapacity: number;
    marketPrice: number;
    priceCountdown: number;
    crudePerSec: number;
    fuelPerSec: number;
    drillLevel: number;
    drillCost: number;
    drillMaxed: boolean;
    refineryLevel: number;
    refineryCost: number;
    refineryMaxed: boolean;
    canAffordDrill: boolean;
    canAffordRefinery: boolean;
    canSell: boolean;
}

/**
 * The single Cocos Component that drives gameplay logic. Add it to one node in
 * MainGame.scene. It loads config, restores the save, runs the per-frame update
 * loop, autosaves, and exposes player actions (sell/upgrade) for the HUD to call
 * via GameManager.instance.
 */
@ccclass('GameManager')
export class GameManager extends Component {
    static instance: GameManager | null = null;

    private config = new ConfigManager();
    private state!: GameState;

    private production!: ProductionSystem;
    private refinery!: RefinerySystem;
    private market!: MarketPriceSystem;
    private upgrades!: UpgradeSystem;
    private save!: SaveSystem;
    private offline!: OfflineEarningsSystem;

    private ready = false;
    private emitAccumulator = 0;
    private saveAccumulator = 0;

    onLoad() {
        GameManager.instance = this;
    }

    async start() {
        try {
            await this.config.load();
        } catch (e) {
            console.error('[GameManager] failed to load configs', e);
            eventBus.emit('toast', 'Failed to load game config.');
            return;
        }

        const cfg = this.config;
        this.production = new ProductionSystem(cfg.buildings, cfg.game.globalProductionMultiplier);
        this.refinery = new RefinerySystem(cfg.buildings);
        this.market = new MarketPriceSystem(cfg.market);
        this.upgrades = new UpgradeSystem(cfg.buildings);
        this.save = new SaveSystem(cfg.game.saveVersion);
        this.offline = new OfflineEarningsSystem(cfg.game, this.production, this.refinery);

        const now = Date.now();
        this.state = this.save.load() ?? createNewGameState(cfg.game.saveVersion, cfg.game.startingCash);
        this.market.ensureInitialized(this.state, now);

        const report = this.offline.apply(this.state, now);
        if (report.seconds > 5) {
            const mins = Math.round(report.seconds / 60);
            eventBus.emit('toast', `Welcome back! +${report.fuelGained.toFixed(0)} fuel earned over ~${mins} min.`);
        }

        // Save on app background/exit so progress and lastSaveTime are fresh for offline calc.
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

        this.production.tick(this.state, dt);
        this.refinery.tick(this.state, dt);
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

    // ---- Player actions (called by HUDView) ----

    sellFuel(): void {
        if (!this.ready || this.state.fuel <= 0) return;
        const revenue = this.state.fuel * this.state.marketPrice;
        this.state.cash += revenue;
        this.state.lifetimeStats.fuelSold += this.state.fuel;
        this.state.lifetimeStats.cashEarned += revenue;
        this.state.fuel = 0;
        eventBus.emit('toast', `Sold for $${revenue.toFixed(0)}`);
        this.emitState();
    }

    upgrade(kind: UpgradeKind): void {
        if (!this.ready) return;
        const result = this.upgrades.upgrade(this.state, kind);
        if (!result.success) {
            eventBus.emit('toast', result.reason === 'maxLevel' ? 'Max level reached' : 'Not enough cash');
            return;
        }
        eventBus.emit('toast', `${kind === 'drill' ? 'Drill' : 'Refinery'} upgraded!`);
        this.emitState();
    }

    /** Dev helper: wipe the save (bind to a debug button if desired). */
    resetSave(): void {
        this.save.clear();
        this.state = createNewGameState(this.config.game.saveVersion, this.config.game.startingCash);
        this.market.ensureInitialized(this.state, Date.now());
        this.emitState();
    }

    // ---- Internal ----

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
            crudeOil: s.crudeOil,
            fuel: s.fuel,
            fuelCapacity: this.refinery.fuelCapacity(s),
            marketPrice: s.marketPrice,
            priceCountdown: this.market.countdownSeconds(s, Date.now()),
            crudePerSec: this.production.crudePerSecond(s),
            fuelPerSec: this.refinery.fuelPerSecond(s),
            drillLevel: s.buildings.drill.level,
            drillCost: this.upgrades.cost(s, 'drill'),
            drillMaxed: this.upgrades.isMaxed(s, 'drill'),
            refineryLevel: s.buildings.refinery.level,
            refineryCost: this.upgrades.cost(s, 'refinery'),
            refineryMaxed: this.upgrades.isMaxed(s, 'refinery'),
            canAffordDrill: this.upgrades.canAfford(s, 'drill'),
            canAffordRefinery: this.upgrades.canAfford(s, 'refinery'),
            canSell: s.fuel > 0,
        };
    }
}
