import { _decorator, Component, Button, Label } from 'cc';
import { eventBus } from '../core/EventBus';
import { GameManager } from '../core/GameManager';

const { ccclass, property, requireComponent } = _decorator;

/**
 * A single land-unlock button bound to one land zone. Put one on each unlock Button and
 * set Zone Id (e.g. "expansion" / "deep" / "core"). Shows name + cost (or "Unlocked"),
 * enables when affordable and not yet unlocked, and unlocks on click.
 */
@ccclass('LandButton')
@requireComponent(Button)
export class LandButton extends Component {
    @property({ tooltip: 'Land zone id to unlock, e.g. expansion / deep / core.' })
    zoneId = 'expansion';

    @property(Label) label: Label = null!;

    private button: Button | null = null;
    private onState = () => this.render();

    onLoad() {
        this.button = this.getComponent(Button);
    }

    onEnable() {
        eventBus.on('stateChanged', this.onState);
        this.node.on(Button.EventType.CLICK, this.onClick, this);
        this.render();
    }

    onDisable() {
        eventBus.off('stateChanged', this.onState);
        this.node.off(Button.EventType.CLICK, this.onClick, this);
    }

    private onClick() {
        GameManager.instance?.unlockLand(this.zoneId);
    }

    private render() {
        const gm = GameManager.instance;
        if (!gm || !gm.isReady) return;
        const info = gm.getLandInfo(this.zoneId);
        if (!info) return;
        if (this.label) {
            this.label.string = info.unlocked ? `${info.displayName}\nUnlocked` : `Unlock ${info.displayName}\n$${info.unlockCost}`;
        }
        if (this.button) this.button.interactable = info.canUnlock;
    }
}
