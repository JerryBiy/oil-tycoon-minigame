import { PlayerId, PlayerState, PlotId } from './player';
import { PlotState } from './plot';

export type StealId = string;
export type StealStatus = 'active' | 'interrupted' | 'completed' | 'cancelled';

/** A timed steal in progress, owned authoritatively by the server. */
export interface StealSession {
    stealId: StealId;
    thiefPlayerId: PlayerId;
    ownerPlayerId: PlayerId;
    targetPlotId: PlotId;
    startedAt: number;
    completesAt: number;
    status: StealStatus;
}

/** Full authoritative room state. The server is the single source of truth. */
export interface RoomState {
    roomId: string;
    serverTime: number;
    players: Record<PlayerId, PlayerState>;
    plots: Record<PlotId, PlotState>;
    activeSteals: Record<StealId, StealSession>;
}
