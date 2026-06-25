import { PlayerId, PlotId } from './player';

/** Drill or refinery placed on a plot. Tier drives both stats and visuals. */
export interface BuildingInstance {
    instanceId: string;
    category: 'drill' | 'refinery';
    tier: number;
}

export interface PlotState {
    plotId: PlotId;
    ownerPlayerId: PlayerId;
    buildings: BuildingInstance[];
    /** Oil currently stored in the refinery, available to collect or steal. */
    refineryStoredOil: number;
    /** Epoch ms until which the refinery is protected from stealing (0 = none). */
    protectionExpiresAt: number;
}
