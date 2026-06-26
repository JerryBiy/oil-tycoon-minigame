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
    private highlighted = false;
    private savedColor: Color | null = null;

    onEnable() {
        this.shape = this.getComponent(PlaceholderShape);
        Interactable.all.push(this);
    }

    onDisable() {
        const i = Interactable.all.indexOf(this);
        if (i >= 0) Interactable.all.splice(i, 1);
        this.setHighlighted(false);
    }

    /**
     * Highlight by capturing the CURRENT color at highlight-time and restoring it
     * exactly on un-highlight. This avoids overwriting the tier color set by BuildingView
     * (which only repaints when the building changes, never while highlighted).
     */
    setHighlighted(on: boolean) {
        if (!this.shape) return;
        if (on) {
            if (this.highlighted) return;
            this.savedColor = this.shape.fillColor.clone();
            this.highlighted = true;
            this.shape.setColor(this.highlightColor);
        } else {
            if (!this.highlighted) return;
            if (this.savedColor) this.shape.setColor(this.savedColor);
            this.highlighted = false;
            this.savedColor = null;
        }
    }
}
