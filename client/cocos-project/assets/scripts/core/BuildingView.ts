import { _decorator, Component, Color, Label } from 'cc';
import { PlaceholderShape, ShapeType } from './PlaceholderShape';
import { Interactable } from '../interaction/Interactable';
import { formatNumber } from './Format';
import { BuildingInstance } from '../data/GameState';
import { EquipmentVisual } from '../data/ConfigTypes';

const { ccclass } = _decorator;

/**
 * Renders ONE placed building on a pooled node (created by PlotRenderer). Carries the
 * building id so the HUD can resolve what the player is standing next to. The shape is
 * sized to the footprint and recolored only when the occupant changes (keyed), so it
 * never fights the Interactable highlight; the info label updates every frame.
 */
@ccclass('BuildingView')
export class BuildingView extends Component {
    buildingId = '';

    private shape: PlaceholderShape | null = null;
    private interactable: Interactable | null = null;
    private label: Label | null = null;
    private lastKey = '';

    private resolve() {
        if (!this.shape) this.shape = this.getComponent(PlaceholderShape);
        if (!this.interactable) this.interactable = this.getComponent(Interactable);
        if (!this.label) this.label = this.getComponentInChildren(Label);
    }

    /** Apply a building's data to this node. effectiveRate = land-multiplied drill output. */
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
    }

    clearBinding() {
        this.lastKey = '';
        this.buildingId = '';
        if (this.label) this.label.string = '';
    }
}
