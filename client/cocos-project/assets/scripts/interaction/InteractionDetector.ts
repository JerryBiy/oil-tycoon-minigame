import { _decorator, Component } from 'cc';
import { Interactable } from './Interactable';

const { ccclass, property } = _decorator;

/**
 * Attach to the Player. Finds the nearest Interactable within range, highlights it,
 * and logs enter/leave. Later phases hook this to a "Collect"/"Steal" prompt.
 */
@ccclass('InteractionDetector')
export class InteractionDetector extends Component {
    @property
    interactionRadius = 90;

    private current: Interactable | null = null;

    /** Exposed so later phases can read the focused building. */
    get focused(): Interactable | null {
        return this.current;
    }

    update() {
        const pos = this.node.position;
        let nearest: Interactable | null = null;
        let best = this.interactionRadius;

        for (const it of Interactable.all) {
            const ip = it.node.position;
            const d = Math.hypot(ip.x - pos.x, ip.y - pos.y);
            if (d <= best) {
                best = d;
                nearest = it;
            }
        }

        if (nearest !== this.current) {
            this.current?.setHighlighted(false);
            nearest?.setHighlighted(true);
            this.current = nearest;
            console.log(nearest ? `[Interaction] near: ${nearest.displayName}` : '[Interaction] none');
        }
    }
}
