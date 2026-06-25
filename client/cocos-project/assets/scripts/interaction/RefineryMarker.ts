import { _decorator, Component } from 'cc';

const { ccclass } = _decorator;

/**
 * Tags a building node as the player's own refinery. Add it alongside Interactable
 * on the Refinery node. The HUD enables the Collect button only when the player's
 * InteractionDetector is focused on a node carrying this marker.
 */
@ccclass('RefineryMarker')
export class RefineryMarker extends Component {}
