/** Protocol- and simulation-level constants shared by client and server. */

/** Authoritative server simulation rate. */
export const SERVER_TICK_HZ = 10;
export const SERVER_TICK_MS = 1000 / SERVER_TICK_HZ;

/** How often the server broadcasts a full room snapshot for correction. */
export const SNAPSHOT_INTERVAL_MS = 1000;

/** Default room capacity (plan: start at 4, expand to 6 later). */
export const DEFAULT_ROOM_CAPACITY = 4;
export const MAX_ROOM_CAPACITY = 6;
