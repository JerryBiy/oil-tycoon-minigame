import { _decorator, Component, Graphics, Color, UITransform, Enum } from 'cc';

const { ccclass, property, requireComponent, executeInEditMode } = _decorator;

export enum ShapeType {
    RECT,
    CIRCLE,
}
Enum(ShapeType);

/**
 * Draws a flat colored rect or circle via Graphics so Phase 1 needs no art assets.
 * Also sizes the node's UITransform to match, so collision/Y-sort and the editor
 * bounding box line up with what you see. Runs in edit mode for easy placement.
 */
@ccclass('PlaceholderShape')
@requireComponent(Graphics)
@executeInEditMode(true)
export class PlaceholderShape extends Component {
    @property({ type: Enum(ShapeType) })
    shapeType: ShapeType = ShapeType.RECT;

    @property width = 64;
    @property height = 64;
    @property radius = 32;
    @property
    fillColor: Color = new Color(180, 180, 180, 255);

    onLoad() {
        this.redraw();
    }

    onEnable() {
        this.redraw();
    }

    /** Re-render the shape and resize the UITransform to match. */
    redraw() {
        const tr = this.getComponent(UITransform) ?? this.addComponent(UITransform)!;
        tr.setAnchorPoint(0.5, 0.5);
        if (this.shapeType === ShapeType.CIRCLE) {
            tr.setContentSize(this.radius * 2, this.radius * 2);
        } else {
            tr.setContentSize(this.width, this.height);
        }

        const g = this.getComponent(Graphics)!;
        g.clear();
        g.fillColor = this.fillColor.clone();
        if (this.shapeType === ShapeType.CIRCLE) {
            g.circle(0, 0, this.radius);
        } else {
            g.rect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        g.fill();
    }

    /** Used by Interactable to flash a highlight near the player. */
    setColor(color: Color) {
        this.fillColor = color.clone();
        this.redraw();
    }

    /** Half-extents for AABB collision/detection in the parent's local space. */
    get halfWidth(): number {
        return this.shapeType === ShapeType.CIRCLE ? this.radius : this.width / 2;
    }
    get halfHeight(): number {
        return this.shapeType === ShapeType.CIRCLE ? this.radius : this.height / 2;
    }
}
