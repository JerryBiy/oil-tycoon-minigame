/**
 * Network protocol shared by client and server. Phase 0 defines the message
 * envelope and the full set of message *names* from the plan (§10) so both sides
 * agree on the contract early. Payloads are filled in as each phase lands
 * (JOIN_ROOM/ROOM_SNAPSHOT in Phase 4, movement in Phase 5, economy in Phase 6,
 * stealing in Phase 7).
 */

import { Vec2 } from '../types/player';
import { RoomState } from '../types/room';

export enum ClientMessageType {
    JOIN_ROOM = 'JOIN_ROOM',
    MOVE_TARGET = 'MOVE_TARGET',
    COLLECT_OWN_REFINERY = 'COLLECT_OWN_REFINERY',
    SELL_OIL = 'SELL_OIL',
    BUY_UPGRADE = 'BUY_UPGRADE',
    START_STEAL = 'START_STEAL',
    CANCEL_STEAL = 'CANCEL_STEAL',
    DEFEND_REFINERY = 'DEFEND_REFINERY',
}

export enum ServerMessageType {
    ROOM_SNAPSHOT = 'ROOM_SNAPSHOT',
    PLAYER_MOVED = 'PLAYER_MOVED',
    PLOT_STATE_CHANGED = 'PLOT_STATE_CHANGED',
    STEAL_STARTED = 'STEAL_STARTED',
    STEAL_INTERRUPTED = 'STEAL_INTERRUPTED',
    STEAL_COMPLETED = 'STEAL_COMPLETED',
    UPGRADE_PURCHASED = 'UPGRADE_PURCHASED',
    ERROR_MESSAGE = 'ERROR_MESSAGE',
}

/** Generic envelope. `seq` aids ordering/acks; `t` is the message timestamp. */
export interface NetworkMessage<TType extends string = string, TData = unknown> {
    type: TType;
    data: TData;
    seq?: number;
    t?: number;
}

// ---- Phase 0 placeholder payloads (expanded in later phases) ----

export interface JoinRoomRequest {
    displayName: string;
    sessionToken?: string;
}

export interface RoomSnapshot {
    you: string; // assigned playerId
    room: RoomState;
}

export interface MoveTargetRequest {
    target: Vec2;
}

export interface ErrorMessage {
    code: string;
    reason: string;
}

export type ClientMessage =
    | NetworkMessage<ClientMessageType.JOIN_ROOM, JoinRoomRequest>
    | NetworkMessage<ClientMessageType.MOVE_TARGET, MoveTargetRequest>;

export type ServerMessage =
    | NetworkMessage<ServerMessageType.ROOM_SNAPSHOT, RoomSnapshot>
    | NetworkMessage<ServerMessageType.ERROR_MESSAGE, ErrorMessage>;
