import { _decorator, Component, Button, Label } from 'cc';
import { GameManager } from '../core/GameManager';

const { ccclass, property, requireComponent } = _decorator;

/**
 * One button that unlocks the land segment the player is standing on. Walk to any
 * locked segment (up/down or a stronger tier strip) and press to unlock it. The label
 * and enabled state update every frame from the player's current cell.
 */
@ccclass('UnlockHereButton')
@requireComponent(Button)
export class UnlockHereButton extends Component {
    @property(Label) label: Label = null!;

    private button: Button | null = null;

    onLoad() {
        this.button = this.getComponent(Button);
    }

    onEnable() {
        this.node.on(Button.EventType.CLICK, this.onClick, this);
    }

    onDisable() {
        this.node.off(Button.EventType.CLICK, this.onClick, this);
    }

    private onClick() {
        GameManager.instance?.unlockLandAtPlayer();
    }

    update() {
        const gm = GameManager.instance;
        if (!gm || !gm.isReady) return;
        const info = gm.getUnlockHereInfo();
        if (!info) {
            if (this.label) this.label.string = 'Unlock Land\n(stand on plot)';
            if (this.button) this.button.interactable = false;
            return;
        }
        if (!info.locked) {
            if (this.label) this.label.string = `${info.zoneName} ${info.multiplier}x\n(unlocked)`;
            if (this.button) this.button.interactable = false;
            return;
        }
        if (this.label) this.label.string = `Unlock ${info.zoneName} ${info.multiplier}x\n$${info.cost}`;
        if (this.button) this.button.interactable = info.canUnlock;
    }
}
