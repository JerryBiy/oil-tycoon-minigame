import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

/**
 * Fake-3D depth sorting. Attach to the container node ("Entities") whose direct
 * children are the player and buildings. Each frame, children lower on the map
 * (smaller world Y) are drawn on top, so the player correctly passes in front of
 * or behind buildings.
 */
@ccclass('YSortDepth')
export class YSortDepth extends Component {
    lateUpdate() {
        const children = this.node.children.slice();
        // Higher Y = further "back" = drawn first (lower sibling index).
        children.sort((a, b) => b.position.y - a.position.y);
        for (let i = 0; i < children.length; i++) {
            children[i].setSiblingIndex(i);
        }
    }
}
