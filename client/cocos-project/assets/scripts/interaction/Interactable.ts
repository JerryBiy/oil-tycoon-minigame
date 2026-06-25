import { _decorator, Component, Color } from 'cc';
import { PlaceholderShape } from '../core/PlaceholderShape';

const { ccclass, property } = _decorator;

/**
 * Marks a building the player can interact with (refinery/drill placeholder in
 * later phases). InteractionDetector highlights the nearest one in range.
 * Must share the player's parent ("Entities") so positions compare directly.
 */
@ccclass('Interactable')
export class Interactable extends Component {
    static all: Interactable[] = [];

    @property
    displayName = 'Building';

    @property
    highlightColor: Color = new Color(255, 230, 120, 255);

    private shape: PlaceholderShape | null = null;
    private baseColor: Color | null = null;

    onEnable() {
        this.shape = this.getComponent(PlaceholderShape);
        if (this.shape) this.baseColor = this.shape.fillColor.clone();
        Interactable.all.push(this);
    }

    onDisable() {
        const i = Interactable.all.indexOf(this);
        if (i >= 0) Interactable.all.splice(i, 1);
        this.setHighlighted(false);
    }

    setHighlighted(on: boolean) {
        if (!this.shape) return;
        if (on) {
            this.shape.setColor(this.highlightColor);
        } else if (this.baseColor) {
            this.shape.setColor(this.baseColor);
        }
    }
}
