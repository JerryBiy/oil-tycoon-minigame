import { _decorator, Component, Label, Button } from 'cc';
import { eventBus } from '../core/EventBus';
import { GameManager, HudViewModel } from '../core/GameManager';
import { formatNumber, formatMoney, formatTime } from '../core/Format';

const { ccclass, property } = _decorator;

/**
 * Renders game state and routes button taps to GameManager. Buttons are wired in
 * code (onLoad), so in the editor you only drag node references into the Inspector
 * fields below — no need to set up click events manually.
 *
 * Every field is optional: leave any you don't create yet empty and the HUD still runs.
 */
@ccclass('HUDView')
export class HUDView extends Component {
    @property(Label) cashLabel: Label = null!;
    @property(Label) crudeLabel: Label = null!;
    @property(Label) fuelLabel: Label = null!;
    @property(Label) priceLabel: Label = null!;
    @property(Label) countdownLabel: Label = null!;
    @property(Label) ratesLabel: Label = null!;
    @property(Label) toastLabel: Label = null!;

    @property(Button) sellButton: Button = null!;
    @property(Button) drillButton: Button = null!;
    @property(Label) drillButtonLabel: Label = null!;
    @property(Button) refineryButton: Button = null!;
    @property(Label) refineryButtonLabel: Label = null!;

    private onState = (vm: HudViewModel) => this.render(vm);
    private onToast = (msg: string) => this.showToast(msg);

    onLoad() {
        eventBus.on('stateChanged', this.onState);
        eventBus.on('toast', this.onToast);

        this.sellButton?.node.on(Button.EventType.CLICK, this.handleSell, this);
        this.drillButton?.node.on(Button.EventType.CLICK, this.handleDrill, this);
        this.refineryButton?.node.on(Button.EventType.CLICK, this.handleRefinery, this);

        if (this.toastLabel) this.toastLabel.string = '';
    }

    onDestroy() {
        eventBus.off('stateChanged', this.onState);
        eventBus.off('toast', this.onToast);
        this.sellButton?.node.off(Button.EventType.CLICK, this.handleSell, this);
        this.drillButton?.node.off(Button.EventType.CLICK, this.handleDrill, this);
        this.refineryButton?.node.off(Button.EventType.CLICK, this.handleRefinery, this);
    }

    private handleSell() {
        GameManager.instance?.sellFuel();
    }
    private handleDrill() {
        GameManager.instance?.upgrade('drill');
    }
    private handleRefinery() {
        GameManager.instance?.upgrade('refinery');
    }

    private render(vm: HudViewModel) {
        if (this.cashLabel) this.cashLabel.string = formatMoney(vm.cash);
        if (this.crudeLabel) this.crudeLabel.string = `Crude: ${formatNumber(vm.crudeOil)}`;
        if (this.fuelLabel) this.fuelLabel.string = `Fuel: ${formatNumber(vm.fuel)} / ${formatNumber(vm.fuelCapacity)}`;
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
