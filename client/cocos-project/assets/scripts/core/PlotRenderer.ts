import { _decorator, Component, Node, Graphics, Color, Label, UITransform } from 'cc';
import { eventBus } from './EventBus';
import { GameManager } from './GameManager';
import { GridMap } from './GridMap';
import { PlaceholderShape } from './PlaceholderShape';
import { Interactable } from '../interaction/Interactable';
import { BuildingView } from './BuildingView';
import { Cell } from '../data/GameState';

const { ccclass, property } = _decorator;

/**
 * Renders the grid plot for the local player, WeChat-friendly:
 *  - The grid/land zones are DATA, drawn as filled cells in a SINGLE Graphics node
 *    (not one node per cell), redrawn only when unlocked zones change.
 *  - Only occupied buildings get a node; nodes are POOLED and reused.
 *
 * Place this on a "Plot" node that sits at local (0,0) under WorldRoot, ordered BEFORE
 * the Entities node so the grid renders behind the player/buildings. Building nodes are
 * created under the Entities node (Entities Container) so they Y-sort with the player.
 */
@ccclass('PlotRenderer')
export class PlotRenderer extends Component {
    @property({ type: Node, tooltip: 'The Player node (to compute the current grid cell).' })
    player: Node = null!;

    @property({ type: Node, tooltip: 'The Entities node (YSortDepth) — buildings are created here.' })
    entitiesContainer: Node = null!;

    private gridGfx: Graphics | null = null;
    private gridMap: GridMap | null = null;
    private views: BuildingView[] = [];
    private lastGridKey = '';

    private onState = () => this.render();

    onLoad() {
        // One Graphics node for the whole grid overlay (behind buildings).
        const gridNode = new Node('GridOverlay');
        gridNode.parent = this.node;
        gridNode.addComponent(UITransform);
        this.gridGfx = gridNode.addComponent(Graphics);
    }

    start() {
        eventBus.on('stateChanged', this.onState);
        const gm = GameManager.instance;
        if (gm) gm.playerCellProvider = () => this.playerCell();
        this.render();
    }

    onDisable() {
        eventBus.off('stateChanged', this.onState);
    }

    private ensureGridMap(gm: GameManager): boolean {
        if (this.gridMap) return true;
        if (!gm.isReady) return false;
        const lc = gm.getLandConfig();
        this.gridMap = new GridMap(lc.gridWidth, lc.gridHeight, lc.cellSize);
        return true;
    }

    private render() {
        const gm = GameManager.instance;
        if (!gm || !gm.isReady) return;
        if (!this.ensureGridMap(gm)) return;

        const key = gm.unlockedZoneKey();
        if (key !== this.lastGridKey) {
            this.lastGridKey = key;
            this.drawGrid(gm);
        }
        this.syncBuildings(gm);
    }

    private drawGrid(gm: GameManager) {
        const g = this.gridGfx;
        const map = this.gridMap;
        if (!g || !map) return;
        g.clear();
        const cs = map.cellSize;
        for (let y = 0; y < map.gridH; y++) {
            for (let x = 0; x < map.gridW; x++) {
                const z = gm.zoneForCell(x, y);
                if (!z) continue;
                const c = map.cellCenterLocal(x, y);
                // Unlocked cells use the full tier color; locked cells show the same tier
                // color faintly so you can still see which strip is 2x / 3x / 5x.
                const col = new Color().fromHEX(z.color);
                col.a = gm.isCellUnlocked(x, y) ? 255 : 70;
                g.fillColor = col;
                g.rect(c.x - cs / 2 + 1, c.y - cs / 2 + 1, cs - 2, cs - 2);
                g.fill();
            }
        }
    }

    private syncBuildings(gm: GameManager) {
        const map = this.gridMap!;
        const buildings = gm.getBuildings();
        for (let i = 0; i < buildings.length; i++) {
            const view = this.getOrCreateView(i);
            const b = buildings[i];
            const center = map.footprintCenterLocal(b.gridPosition.x, b.gridPosition.y, b.footprint);
            view.node.setPosition(center.x, center.y, 0);
            if (!view.node.active) view.node.active = true;
            view.bind(b, gm.getVisual(b.catalogId), gm.getEffectiveProduction(b), map.cellSize);
        }
        for (let i = buildings.length; i < this.views.length; i++) {
            if (this.views[i].node.active) {
                this.views[i].node.active = false;
                this.views[i].clearBinding();
            }
        }
    }

    private getOrCreateView(i: number): BuildingView {
        if (this.views[i]) return this.views[i];

        const node = new Node('Building');
        node.parent = this.entitiesContainer;
        node.addComponent(PlaceholderShape); // auto-adds Graphics + UITransform
        node.addComponent(Interactable);
        const view = node.addComponent(BuildingView);

        const labelNode = new Node('Info');
        labelNode.parent = node;
        labelNode.addComponent(UITransform);
        const label = labelNode.addComponent(Label);
        label.fontSize = 18;
        label.lineHeight = 20;
        label.color = new Color(255, 255, 255, 255);
        labelNode.setPosition(0, 56, 0);

        this.views[i] = view;
        return view;
    }

    /** The player's current grid cell, or null if off the plot. */
    private playerCell(): Cell | null {
        const gm = GameManager.instance;
        if (!this.player || !gm) return null;
        if (!this.ensureGridMap(gm) || !this.gridMap) return null;
        const p = this.player.position;
        const cell = this.gridMap.localToCell(p.x, p.y);
        return this.gridMap.inBounds(cell.x, cell.y) ? cell : null;
    }
}
