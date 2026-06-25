import { _decorator, Component } from 'cc';
import { PlaceholderShape } from '../core/PlaceholderShape';

const { ccclass, property } = _decorator;

/**
 * Marks a node as blocking. PlayerController checks these as AABBs. Half-extents
 * default to the node's PlaceholderShape size, or can be overridden.
 * Obstacles must share the player's parent ("Entities") so positions compare directly.
 */
@ccclass('Obstacle')
export class Obstacle extends Component {
    static all: Obstacle[] = [];

    @property({ tooltip: 'Override half-extents; if 0, taken from PlaceholderShape.' })
    halfWidth = 0;
    @property
    halfHeight = 0;

    onEnable() {
        if (this.halfWidth <= 0 || this.halfHeight <= 0) {
            const shape = this.getComponent(PlaceholderShape);
            if (shape) {
                this.halfWidth = shape.halfWidth;
                this.halfHeight = shape.halfHeight;
            }
        }
        Obstacle.all.push(this);
    }

    onDisable() {
        const i = Obstacle.all.indexOf(this);
        if (i >= 0) Obstacle.all.splice(i, 1);
    }
}
