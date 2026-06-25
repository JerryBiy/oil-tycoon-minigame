import { sys } from 'cc';
import { GameState } from '../data/GameState';

/**
 * Serialize/deserialize GameState to local storage.
 *
 * Platform note: storage access is isolated here. In Cocos preview this uses
 * sys.localStorage (browser). For the WeChat build later, swap the two private
 * helpers for a WeChatBridge using wx.setStorageSync/getStorageSync.
 */
export class SaveSystem {
    private readonly key = 'oiltycoon.save';

    constructor(private currentVersion: number) {}

    save(state: GameState): void {
        try {
            state.lastSaveTime = Date.now();
            this.write(this.key, JSON.stringify(state));
        } catch (e) {
            console.error('[SaveSystem] save failed', e);
        }
    }

    /** Returns a migrated GameState, or null if nothing valid is stored. */
    load(): GameState | null {
        try {
            const raw = this.read(this.key);
            if (!raw) return null;
            const parsed = JSON.parse(raw) as GameState;
            if (!parsed || typeof parsed.cash !== 'number') return null;
            return this.migrate(parsed);
        } catch (e) {
            console.error('[SaveSystem] load failed, starting fresh', e);
            return null;
        }
    }

    clear(): void {
        try {
            this.remove(this.key);
        } catch (e) {
            console.error('[SaveSystem] clear failed', e);
        }
    }

    /** Hook for future schema changes. Today it only stamps the version. */
    private migrate(state: GameState): GameState {
        if (state.version !== this.currentVersion) {
            state.version = this.currentVersion;
        }
        return state;
    }

    private write(k: string, v: string): void {
        sys.localStorage.setItem(k, v);
    }
    private read(k: string): string | null {
        return sys.localStorage.getItem(k);
    }
    private remove(k: string): void {
        sys.localStorage.removeItem(k);
    }
}
