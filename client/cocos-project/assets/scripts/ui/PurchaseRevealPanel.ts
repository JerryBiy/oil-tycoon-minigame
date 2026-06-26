import { _decorator, Component, Label, Color, UIOpacity, tween, Vec3 } from 'cc';
import { eventBus } from '../core/EventBus';
import { GameManager } from '../core/GameManager';
import { PlaceholderShape } from '../core/PlaceholderShape';

const { ccclass, property } = _decorator;

/**
 * "Badass" purchase reveal (Phase 4). When the player buys a machine, this panel pops
 * up showing the new machine's name, tier, stats, footprint, sell value, and a best-use
 * hint, then fades out. Hidden via UIOpacity (not node.active) so the component keeps
 * its event subscription. All fields optional — wire what you like.
 */
@ccclass('PurchaseRevealPanel')
export class PurchaseRevealPanel extends Component {
    @property(Label) titleLabel: Label = null!;
    @property(Label) statsLabel: Label = null!;
    @property(Label) hintLabel: Label = null!;
    @property({ type: PlaceholderShape, tooltip: 'Optional color swatch of the new machine.' })
    previewShape: PlaceholderShape = null!;

    @property({ tooltip: 'Seconds the reveal stays on screen.' })
    holdSeconds = 3;

    private opacity: UIOpacity | null = null;
    private onPurchased = (p: { catalogId?: string }) => this.show(p?.catalogId);

    onLoad() {
        this.opacity = this.getComponent(UIOpacity) ?? this.addComponent(UIOpacity);
    }

    onEnable() {
        eventBus.on('purchased', this.onPurchased);
        if (this.opacity) this.opacity.opacity = 0;
    }

    onDisable() {
        eventBus.off('purchased', this.onPurchased);
    }

    private show(catalogId?: string) {
        const gm = GameManager.instance;
        if (!gm || !catalogId) return;
        const info = gm.getShopInfo(catalogId);
        if (!info) return;

        if (this.titleLabel) this.titleLabel.string = `NEW: ${info.displayName}  (Tier ${info.tier})`;
        if (this.statsLabel) this.statsLabel.string = `${info.statText} · footprint ${info.footprint} · sell $${info.sellValue}`;
        if (this.hintLabel) this.hintLabel.string = info.hint;
        if (this.previewShape) {
            const v = gm.getVisual(catalogId);
            if (v) {
                this.previewShape.fillColor = new Color().fromHEX(v.color);
                this.previewShape.redraw();
            }
        }

        if (this.opacity) this.opacity.opacity = 255;
        tween(this.node)
            .set({ scale: new Vec3(0.85, 0.85, 1) })
            .to(0.12, { scale: new Vec3(1.05, 1.05, 1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) })
            .start();

        this.unscheduleAllCallbacks();
        this.scheduleOnce(() => {
            if (this.opacity) this.opacity.opacity = 0;
        }, this.holdSeconds);
    }
}
