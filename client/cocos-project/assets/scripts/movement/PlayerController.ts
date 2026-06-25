import { _decorator, Component, Vec3, input, Input, EventTouch, UITransform, math } from 'cc';
import { Obstacle } from '../interaction/Obstacle';

const { ccclass, property } = _decorator;

/**
 * Tap-to-move player movement on the 2.5D map.
 * - Tap/click anywhere: the player walks toward that point.
 * - Movement is clamped to walkable bounds and blocked by Obstacle AABBs (with
 *   per-axis sliding so the player slips along walls instead of sticking).
 *
 * The player and all obstacles must be direct children of the same container
 * ("Entities") so their local positions share one coordinate space.
 */
@ccclass('PlayerController')
export class PlayerController extends Component {
    @property({ tooltip: 'Pixels per second.' })
    moveSpeed = 320;

    @property({ tooltip: 'Stop when within this distance of the tapped point.' })
    arriveThreshold = 4;

    @property({ tooltip: 'Player collision radius for obstacle/bounds checks.' })
    playerRadius = 24;

    @property({ tooltip: 'Walkable half-width (map spans -X..+X around the container origin).' })
    halfMapWidth = 600;
    @property({ tooltip: 'Walkable half-height (map spans -Y..+Y around the container origin).' })
    halfMapHeight = 600;

    private target = new Vec3();
    private hasTarget = false;
    private parentUT: UITransform | null = null;

    onLoad() {
        const parent = this.node.parent;
        if (parent) {
            this.parentUT = parent.getComponent(UITransform) ?? parent.addComponent(UITransform);
        }
        this.target.set(this.node.position);
        input.on(Input.EventType.TOUCH_END, this.onTouch, this);
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_END, this.onTouch, this);
    }

    private onTouch(e: EventTouch) {
        if (!this.parentUT) return;
        const ui = e.getUILocation();
        const local = this.parentUT.convertToNodeSpaceAR(new Vec3(ui.x, ui.y, 0));
        this.target.set(local.x, local.y, 0);
        this.hasTarget = true;
    }

    update(dt: number) {
        if (!this.hasTarget) return;

        const pos = this.node.position;
        const dx = this.target.x - pos.x;
        const dy = this.target.y - pos.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= this.arriveThreshold) {
            this.hasTarget = false;
            return;
        }

        const step = Math.min(this.moveSpeed * dt, dist);
        let nx = pos.x + (dx / dist) * step;
        let ny = pos.y + (dy / dist) * step;

        // Keep inside the walkable rectangle.
        nx = math.clamp(nx, -this.halfMapWidth, this.halfMapWidth);
        ny = math.clamp(ny, -this.halfMapHeight, this.halfMapHeight);

        // Per-axis obstacle resolution → slide along walls.
        if (this.blocked(nx, pos.y)) nx = pos.x;
        if (this.blocked(nx, ny)) ny = pos.y;

        this.node.setPosition(nx, ny, 0);
    }

    private blocked(x: number, y: number): boolean {
        for (const o of Obstacle.all) {
            const op = o.node.position;
            const hw = o.halfWidth + this.playerRadius;
            const hh = o.halfHeight + this.playerRadius;
            if (Math.abs(x - op.x) < hw && Math.abs(y - op.y) < hh) return true;
        }
        return false;
    }
}
