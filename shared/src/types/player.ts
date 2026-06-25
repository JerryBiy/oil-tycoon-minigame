/** Authoritative per-player state held by the server room. */

export type PlayerId = string;
export type PlotId = string;

export interface Vec2 {
    x: number;
    y: number;
}

export interface PlayerState {
    playerId: PlayerId;
    displayName: string;
    position: Vec2;
    plotId: PlotId;
    cash: number;
    /** Oil the player is physically carrying (collected from a refinery, not yet sold). */
    carriedOil: number;
    connected: boolean;
}
