import { _decorator, Component, Color, Label, tween, Vec3 } from 'cc';
import { PlaceholderShape, ShapeType } from './PlaceholderShape';
import { Interactable } from '../interaction/Interactable';
import { eventBus } from './EventBus';
import { formatNumber } from './Format';
import { BuildingInstance } from '../data/GameState';
import { EquipmentVisual } from '../data/ConfigTypes';

const { ccclass } = _decorator;

/**
 * Per-building visual controller (Phase 4). Renders a placed building on a pooled
 * node: footprint-sized base shape colored by the catalog, a tier "presence" scale
 * (visual.sizeScale — independent of footprint, so a 1x1 can still feel powerful),
 * an info label, and VFX hooks (placement scale-punch + brightness flash, plus a
 * named vfx/sfx event for real art/audio later). Color is only repainted when the
 * occupant changes, so it never fights the Interactable highlight.
 */
@ccclass('BuildingView')
export class BuildingView extends Component {
    buildingId = '';

    private shape: PlaceholderShape | null = null;
    private interactable: Interactable | null = null;
    private label: Label | null = null;
    private lastKey = '';
    private baseScale = 1;
    private vfxKey = '';

    private resolve() {
        if (!this.shape) this.shape = this.getComponent(PlaceholderShape);
        if (!this.interactable) this.interactable = this.getComponent(Interactable);
        if (!this.label) this.label = this.getComponentInChildren(Label);
    }

    bind(b: BuildingInstance, visual: EquipmentVisual | undefined, effectiveRate: number, cellSize: number) {
        this.resolve();
        this.buildingId = b.id;

        if (this.label) {
            this.label.string = b.category === 'drill'
                ? `+${formatNumber(effectiveRate)}/s`
                : `${formatNumber(b.storedOil ?? 0)} / ${formatNumber(b.capacity ?? 0)}`;
        }

        const key = `${b.catalogId}#${b.id}#${b.footprint.width}x${b.footprint.height}`;
        if (key === this.lastKey) return;
        this.lastKey = key;

        this.baseScale = visual?.sizeScale ?? 1;
        this.vfxKey = visual?.vfxKey ?? '';

        if (this.interactable) {
            this.interactable.displayName = `${b.category === 'refinery' ? 'Refinery' : 'Drill'} T${b.tier}`;
        }
        if (this.shape) {
            this.shape.shapeType = ShapeType.RECT;
            this.shape.width = b.footprint.width * cellSize * 0.9;
            this.shape.height = b.footprint.height * cellSize * 0.9;
            if (visual) this.shape.fillColor = new Color().fromHEX(visual.color);
            this.shape.redraw();
        }
        this.node.setScale(this.baseScale, this.baseScale, 1);
    }

    /** Reveal VFX, played by PlotRenderer on the building that was just purchased. */
    playPlaceVFX() {
        const b = this.baseScale;
        this.node.setScale(b * 0.5, b * 0.5, 1);
        tween(this.node)
            .to(0.12, { scale: new Vec3(b * 1.2, b * 1.2, 1) })
            .to(0.14, { scale: new Vec3(b, b, 1) })
            .start();

        if (this.shape) {
            const orig = this.shape.fillColor.clone();
            this.shape.setColor(new Color(
                Math.min(255, orig.r + 80),
                Math.min(255, orig.g + 80),
                Math.min(255, orig.b + 80),
                255,
            ));
            this.scheduleOnce(() => {
                if (this.shape) this.shape.setColor(orig);
            }, 0.2);
        }

        // Placeholder hooks for real VFX/audio later.
        eventBus.emit('vfx', { key: this.vfxKey, action: 'place' });
        console.log(`[sfx] place ${this.vfxKey}`);
    }

    clearBinding() {
        this.lastKey = '';
        this.buildingId = '';
        if (this.label) this.label.string = '';
    }
}
