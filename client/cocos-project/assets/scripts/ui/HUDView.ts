import { _decorator, Component, Label, Button } from 'cc';
import { eventBus } from '../core/EventBus';
import { GameManager, HudViewModel } from '../core/GameManager';
import { formatNumber, formatMoney, formatTime } from '../core/Format';
import { InteractionDetector } from '../interaction/InteractionDetector';
import { RefineryMarker } from '../interaction/RefineryMarker';

const { ccclass, property } = _decorator;

/**
 * Renders game state and routes button taps to GameManager. Buttons are wired in
 * code (onLoad), so in the editor you only drag node references into the Inspector
 * fields below — no need to set up click events manually.
 *
 * The Collect button is enabled only while the player stands near their own
 * refinery (detected via the Phase 1 InteractionDetector + RefineryMarker).
 *
 * Every field is optional: leave any you don't create yet empty and the HUD still runs.
 */
@ccclass('HUDView')
export class HUDView extends Component {
    @property(Label) cashLabel: Label = null!;
    @property(Label) storedFuelLabel: Label = null!;
    @property(Label) carriedFuelLabel: Label = null!;
    @property(Label) priceLabel: Label = null!;
    @property(Label) countdownLabel: Label = null!;
    @property(Label) ratesLabel: Label = null!;
    @property(Label) toastLabel: Label = null!;

    @property(Button) collectButton: Button = null!;
    @property(Button) sellButton: Button = null!;
    @property(Button) drillButton: Button = null!;
    @property(Label) drillButtonLabel: Label = null!;
    @property(Button) refineryButton: Button = null!;
    @property(Label) refineryButtonLabel: Label = null!;

    @property({ type: InteractionDetector, tooltip: "Drag the Player's InteractionDetector here." })
    interactionDetector: InteractionDetector = null!;

    private lastVm: HudViewModel | null = null;
    private onState = (vm: HudViewModel) => this.render(vm);
    private onToast = (msg: string) => this.showToast(msg);

    onLoad() {
        eventBus.on('stateChanged', this.onState);
        eventBus.on('toast', this.onToast);

        this.collectButton?.node.on(Button.EventType.CLICK, this.handleCollect, this);
        this.sellButton?.node.on(Button.EventType.CLICK, this.handleSell, this);
        this.drillButton?.node.on(Button.EventType.CLICK, this.handleDrill, this);
        this.refineryButton?.node.on(Button.EventType.CLICK, this.handleRefinery, this);

        if (this.toastLabel) this.toastLabel.string = '';
    }

    onDestroy() {
        eventBus.off('stateChanged', this.onState);
        eventBus.off('toast', this.onToast);
        this.collectButton?.node?.off(Button.EventType.CLICK, this.handleCollect, this);
        this.sellButton?.node?.off(Button.EventType.CLICK, this.handleSell, this);
        this.drillButton?.node?.off(Button.EventType.CLICK, this.handleDrill, this);
        this.refineryButton?.node?.off(Button.EventType.CLICK, this.handleRefinery, this);
    }

    update() {
        // Proximity changes every frame (player walking), independent of state events.
        if (this.collectButton) {
            this.collectButton.interactable = this.isNearRefinery() && (this.lastVm?.canCollect ?? false);
        }
    }

    private isNearRefinery(): boolean {
        const focused = this.interactionDetector?.focused;
        return !!focused && !!focused.getComponent(RefineryMarker);
    }

    private handleCollect() {
        if (this.isNearRefinery()) GameManager.instance?.collect();
    }
    private handleSell() {
        GameManager.instance?.sell();
    }
    private handleDrill() {
        GameManager.instance?.upgrade('drill');
    }
    private handleRefinery() {
        GameManager.instance?.upgrade('refinery');
    }

    private render(vm: HudViewModel) {
        this.lastVm = vm;
        if (this.cashLabel) this.cashLabel.string = formatMoney(vm.cash);
        // Crude is intentionally not shown — it's consumed by refining immediately and confuses players.
        if (this.storedFuelLabel) {
            this.storedFuelLabel.string = `Refinery: ${formatNumber(vm.storedFuel)} / ${formatNumber(vm.fuelCapacity)}`;
        }
        if (this.carriedFuelLabel) this.carriedFuelLabel.string = `Carrying: ${formatNumber(vm.carriedFuel)}`;
        if (this.priceLabel) this.priceLabel.string = `Price: $${vm.marketPrice.toFixed(2)}`;
        if (this.countdownLabel) this.countdownLabel.string = formatTime(vm.priceCountdown);
        if (this.ratesLabel) {
            this.ratesLabel.string = `+${formatNumber(vm.crudePerSec)} crude/s   +${formatNumber(vm.fuelPerSec)} fuel/s`;
        }

        if (this.drillButtonLabel) {
            this.drillButtonLabel.string = vm.drillMaxed
                ? `Drill MAX (Lv${vm.drillLevel})`
                : `Upgrade Drill Lv${vm.drillLevel} - ${formatMoney(vm.drillCost)}`;
        }
        if (this.refineryButtonLabel) {
            this.refineryButtonLabel.string = vm.refineryMaxed
                ? `Refinery MAX (Lv${vm.refineryLevel})`
                : `Upgrade Refinery Lv${vm.refineryLevel} - ${formatMoney(vm.refineryCost)}`;
        }

        if (this.sellButton) this.sellButton.interactable = vm.canSell;
        if (this.drillButton) this.drillButton.interactable = vm.canAffordDrill;
        if (this.refineryButton) this.refineryButton.interactable = vm.canAffordRefinery;
        // collectButton handled in update() since it depends on player proximity.
    }

    private showToast(msg: string) {
        if (!this.toastLabel) {
            console.log('[Toast]', msg);
            return;
        }
        this.toastLabel.string = msg;
        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            if (this.toastLabel) this.toastLabel.string = '';
        }, 2);
    }
}
