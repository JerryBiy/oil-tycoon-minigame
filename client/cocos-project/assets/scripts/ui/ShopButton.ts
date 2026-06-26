import { _decorator, Component, Button, Label } from 'cc';
import { eventBus } from '../core/EventBus';
import { GameManager } from '../core/GameManager';

const { ccclass, property, requireComponent } = _decorator;

/**
 * A single shop buy button bound to one catalog item. Put one on each buy Button and
 * set Catalog Id (e.g. "drill_t2"). It updates its label (name + footprint + cost) and
 * enabled state (affordable) from game state, and buys-and-places on click (placement
 * happens at the player's current grid cell, validated by GameManager).
 */
@ccclass('ShopButton')
@requireComponent(Button)
export class ShopButton extends Component {
    @property({ tooltip: 'Catalog id to buy, e.g. drill_t1 / refinery_t2.' })
    catalogId = 'drill_t1';

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
        GameManager.instance?.buyEquipment(this.catalogId);
    }

    private render() {
        const gm = GameManager.instance;
        if (!gm || !gm.isReady) return;
        const info = gm.getShopInfo(this.catalogId);
        if (!info) return;
        if (this.label) this.label.string = `Buy ${info.displayName} (${info.footprint})\n$${info.buyCost}`;
        if (this.button) this.button.interactable = info.canBuy;
    }
}
