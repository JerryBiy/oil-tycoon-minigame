/**
 * Minimal global pub/sub. Decouples systems (which mutate state) from UI (which renders it).
 * Pure TypeScript: shared module-level singleton, no Cocos dependency.
 */

export type GameEvent = 'stateChanged' | 'toast' | 'purchased' | 'vfx';

type Handler = (payload?: any) => void;

class EventBusImpl {
    private handlers: Map<GameEvent, Set<Handler>> = new Map();

    on(event: GameEvent, handler: Handler): void {
        let set = this.handlers.get(event);
        if (!set) {
            set = new Set();
            this.handlers.set(event, set);
        }
        set.add(handler);
    }

    off(event: GameEvent, handler: Handler): void {
        this.handlers.get(event)?.delete(handler);
    }

    emit(event: GameEvent, payload?: any): void {
        const set = this.handlers.get(event);
        if (!set) return;
        // Copy to a snapshot so handlers can safely unsubscribe during dispatch.
        for (const handler of Array.from(set)) {
            handler(payload);
        }
    }
}

export const eventBus = new EventBusImpl();
