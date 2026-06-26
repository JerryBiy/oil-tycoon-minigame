import { resources, JsonAsset } from 'cc';
import { MarketConfig, GameConfig, EquipmentCatalogConfig, LandLayersConfig } from '../data/ConfigTypes';

/**
 * Loads JSON economy configs from assets/resources/configs/ and exposes them typed.
 * Keeping all tunable numbers here (not in code) is a hard project rule.
 */
export class ConfigManager {
    market!: MarketConfig;
    game!: GameConfig;
    catalog!: EquipmentCatalogConfig;
    land!: LandLayersConfig;

    async load(): Promise<void> {
        const [market, game, catalog, land] = await Promise.all([
            this.loadJson<MarketConfig>('configs/market'),
            this.loadJson<GameConfig>('configs/game'),
            this.loadJson<EquipmentCatalogConfig>('configs/equipment_catalog'),
            this.loadJson<LandLayersConfig>('configs/land_layers'),
        ]);
        this.market = market;
        this.game = game;
        this.catalog = catalog;
        this.land = land;
    }

    private loadJson<T>(path: string): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            resources.load(path, JsonAsset, (err, asset) => {
                if (err || !asset) {
                    reject(err ?? new Error(`Config not found: ${path}`));
                    return;
                }
                resolve(asset.json as T);
            });
        });
    }
}
