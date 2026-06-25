/** Public surface of the shared package. Import via '@oiltycoon/shared'.
 *  Explicit re-exports (not `export *`) so named bindings resolve reliably
 *  through tsx/esbuild and Node ESM. */

// --- runtime values ---
export { ClientMessageType, ServerMessageType } from './protocol/messages';
export {
    SERVER_TICK_HZ,
    SERVER_TICK_MS,
    SNAPSHOT_INTERVAL_MS,
    DEFAULT_ROOM_CAPACITY,
    MAX_ROOM_CAPACITY,
} from './math/constants';

// --- types ---
export type { PlayerId, PlotId, Vec2, PlayerState } from './types/player';
export type { BuildingInstance, PlotState } from './types/plot';
export type { StealId, StealStatus, StealSession, RoomState } from './types/room';
export type {
    NetworkMessage,
    JoinRoomRequest,
    RoomSnapshot,
    MoveTargetRequest,
    ErrorMessage,
    ClientMessage,
    ServerMessage,
} from './protocol/messages';
export type {
    DrillTierConfig,
    RefineryTierConfig,
    EquipmentTiersConfig,
    PvpConfig,
    EconomyConfig,
} from './configs/economy';
