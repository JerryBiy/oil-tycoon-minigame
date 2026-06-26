import { _decorator, Component, Label, Button } from 'cc';
import { eventBus } from '../core/EventBus';
import { GameManager, HudViewModel } from '../core/GameManager';
import { formatNumber, formatMoney, formatTime } from '../core/Format';
import { InteractionDetector } from '../interaction/InteractionDetector';
import { BuildingView } from '../core/BuildingView';
import { BuildingInstance } from '../data/GameState';

const { ccclass, property } = _decorator;

/**
 * Renders the top-bar HUD and routes action buttons to GameManager.
 *  - Collect / Sell-Building act on the building the player is standing near
 *    (resolved via the Phase 1 InteractionDetector + the focused node's BuildingView).
 *  - Sell Oil sells the carried pocket at the market price.
 * Button clicks are wired in code; just drag node references in the Inspector.
 */
@ccclass('HUDView')
export class HUDView extends Component {
    @property(Label) cashLabel: Label = null!;
    @property(Label) carriedOilLabel: Label = null!;
    @property(Label) priceLabel: Label = null!;
    @property(Label) countdownLabel: Label = null!;
    @property(Label) productionLabel: Label = null!;
    @property(Label) storageLabel: Label = null!;
    @property(Label) buildingsLabel: Label = null!;
    /** Debug: the land cell/zone/multiplier the player is currently standing on. */
    @property(Label) zoneLabel: Label = null!;
    /** Debug: the stored/capacity of the building the player is standing near. */
    @property(Label) selectedRefineryLabel: Label = null!;
    @property(Label) toastLabel: Label = null!;

    @property(Button) collectButton: Button = null!;
    @property(Button) sellOilButton: Button = null!;
    @property(Button) sellBuildingButton: Button = null!;

    @property({ type: InteractionDetector, tooltip: "Drag the Player's InteractionDetector here." })
    interactionDetector: InteractionDetector = null!;

    private onState = (vm: HudViewModel) => this.render(vm);
    private onToast = (msg: string) => this.showToast(msg);

    onLoad() {
        eventBus.on('stateChanged', this.onState);
        eventBus.on('toast', this.onToast);

        this.collectButton?.node.on(Button.EventType.CLICK, this.handleCollect, this);
        this.sellOilButton?.node.on(Button.EventType.CLICK, this.handleSellOil, this);
        this.sellBuildingButton?.node.on(Button.EventType.CLICK, this.handleSellBuilding, this);

        if (this.toastLabel) this.toastLabel.string = '';
    }

    onDestroy() {
        eventBus.off('stateChanged', this.onState);
        eventBus.off('toast', this.onToast);
        this.collectButton?.node?.off(Button.EventType.CLICK, this.handleCollect, this);
        this.sellOilButton?.node?.off(Button.EventType.CLICK, this.handleSellOil, this);
        this.sellBuildingButton?.node?.off(Button.EventType.CLICK, this.handleSellBuilding, this);
    }

    update() {
        const b = this.focusedBuilding();
        if (this.collectButton) {
            this.collectButton.interactable = !!b && b.category === 'refinery' && (b.storedOil ?? 0) > 0;
        }
        if (this.sellBuildingButton) {
            this.sellBuildingButton.interactable = !!b;
        }
        if (this.selectedRefineryLabel) {
            if (b && b.category === 'refinery') {
                this.selectedRefineryLabel.string =
                    `Near Refinery: ${formatNumber(b.storedOil ?? 0)} / ${formatNumber(b.capacity ?? 0)}`;
            } else if (b) {
                this.selectedRefineryLabel.string = `Near ${b.category} T${b.tier}`;
            } else {
                this.selectedRefineryLabel.string = '';
            }
        }
        if (this.zoneLabel) {
            const cell = GameManager.instance?.getPlayerCellInfo() ?? null;
            this.zoneLabel.string = cell
                ? `Cell (${cell.x},${cell.y}) — ${cell.zoneName} ${cell.multiplier}x${cell.unlocked ? '' : ' [locked]'}`
                : 'Off plot';
        }
    }

    /** The building instance the player is currently focused on, if any. */
    private focusedBuilding(): BuildingInstance | null {
        const focused = this.interactionDetector?.focused;
        if (!focused) return null;
        const view = focused.getComponent(BuildingView);
        if (!view || !view.buildingId) return null;
        return GameManager.instance?.getBuilding(view.buildingId) ?? null;
    }

    private handleCollect() {
        const b = this.focusedBuilding();
        if (b && b.category === 'refinery') GameManager.instance?.collectRefinery(b.id);
    }
    private handleSellOil() {
        GameManager.instance?.sellOil();
    }
    private handleSellBuilding() {
        const b = this.focusedBuilding();
        if (b) GameManager.instance?.sellBuilding(b.id);
    }

    private render(vm: HudViewModel) {
        if (this.cashLabel) this.cashLabel.string = formatMoney(vm.cash);
        if (this.carriedOilLabel) this.carriedOilLabel.string = `Carrying: ${formatNumber(vm.carriedOil)}`;
        if (this.priceLabel) this.priceLabel.string = `Price: $${vm.marketPrice.toFixed(2)}`;
        if (this.countdownLabel) this.countdownLabel.string = formatTime(vm.priceCountdown);
        if (this.productionLabel) this.productionLabel.string = `+${formatNumber(vm.totalProductionPerSec)} oil/s`;
        if (this.storageLabel) {
            this.storageLabel.string = `Refineries: ${formatNumber(vm.totalStored)} / ${formatNumber(vm.totalCapacity)}`;
        }
        if (this.buildingsLabel) this.buildingsLabel.string = `Buildings: ${vm.buildingCount}`;

        if (this.sellOilButton) this.sellOilButton.interactable = vm.canSellOil;
        // collect / sell-building handled in update() (depend on player proximity).
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
