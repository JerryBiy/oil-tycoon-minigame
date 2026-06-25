import { _decorator, Component, Node, view } from 'cc';

const { ccclass, property } = _decorator;

/**
 * Follow "camera" for a UI-space 2.5D map. Attach to the WorldRoot node (the
 * container that holds the ground + Entities). It scrolls WorldRoot so the target
 * stays centered on screen, smoothed, and clamped so the map never scrolls past
 * its edges.
 *
 * Assumes the ground/map is centered on WorldRoot's local origin and spans
 * mapWidth x mapHeight. Set those to your ground size.
 */
@ccclass('CameraFollow')
export class CameraFollow extends Component {
    @property(Node)
    target: Node = null!;

    @property({ tooltip: 'Higher = snappier follow.' })
    smoothing = 8;

    @property
    mapWidth = 1280;
    @property
    mapHeight = 1280;

    lateUpdate(dt: number) {
        if (!this.target) return;

        const vs = view.getVisibleSize();
        const halfW = vs.width / 2;
        const halfH = vs.height / 2;

        const tw = this.target.worldPosition;
        const cur = this.node.worldPosition;

        // Shift WorldRoot so the target lands at screen center.
        let desiredX = cur.x + (halfW - tw.x);
        let desiredY = cur.y + (halfH - tw.y);

        // Clamp so the map edges stay outside the screen (only if map > screen).
        const minX = vs.width - this.mapWidth / 2;
        const maxX = this.mapWidth / 2;
        const minY = vs.height - this.mapHeight / 2;
        const maxY = this.mapHeight / 2;
        if (minX <= maxX) desiredX = Math.min(Math.max(desiredX, minX), maxX);
        if (minY <= maxY) desiredY = Math.min(Math.max(desiredY, minY), maxY);

        const f = Math.min(1, dt * this.smoothing);
        this.node.setWorldPosition(
            cur.x + (desiredX - cur.x) * f,
            cur.y + (desiredY - cur.y) * f,
            cur.z,
        );
    }
}
