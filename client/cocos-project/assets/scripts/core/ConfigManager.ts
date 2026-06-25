import { resources, JsonAsset } from 'cc';
import { BuildingsConfig, MarketConfig, GameConfig } from '../data/ConfigTypes';

/**
 * Loads JSON economy configs from assets/resources/configs/ and exposes them typed.
 * Keeping all tunable numbers here (not in code) is a hard project rule.
 */
export class ConfigManager {
    buildings!: BuildingsConfig;
    market!: MarketConfig;
    game!: GameConfig;

    async load(): Promise<void> {
        const [buildings, market, game] = await Promise.all([
            this.loadJson<BuildingsConfig>('configs/buildings'),
            this.loadJson<MarketConfig>('configs/market'),
            this.loadJson<GameConfig>('configs/game'),
        ]);
        this.buildings = buildings;
        this.market = market;
        this.game = game;
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
