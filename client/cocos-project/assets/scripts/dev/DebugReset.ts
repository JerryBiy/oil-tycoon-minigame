import { _decorator, Component, input, Input, EventKeyboard, KeyCode, game } from 'cc';
import { GameManager } from '../core/GameManager';

const { ccclass } = _decorator;

/**
 * DEV ONLY — remove before release.
 * Press "R" to wipe the local save and restart the preview from a fresh game.
 *
 * Attach to any always-active node (e.g. the GameManager node). resetSave() clears
 * the persisted save and resets in-memory state first, so the restart-time autosave
 * writes a fresh game rather than re-persisting old progress.
 */
@ccclass('DebugReset')
export class DebugReset extends Component {
    onEnable() {
        input.on(Input.EventType.KEY_DOWN, this.onKey, this);
    }

    onDisable() {
        input.off(Input.EventType.KEY_DOWN, this.onKey, this);
    }

    private onKey(e: EventKeyboard) {
        if (e.keyCode !== KeyCode.KEY_R) return;
        console.log('[DebugReset] reset triggered');

        // resetSave() clears the persisted save AND resets in-memory state, so any
        // teardown-time autosave can't re-persist old progress before we reload.
        GameManager.instance?.resetSave();
        console.log('[DebugReset] save cleared');

        // Full page reload reboots cleanly in browser preview and avoids the
        // game.restart() double-destroy. Fall back to game.restart() off the web.
        if (typeof window !== 'undefined' && window.location) {
            window.location.reload();
        } else {
            game.restart();
        }
    }
}
