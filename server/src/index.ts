/**
 * Phase 0 server entry point.
 *
 * Goal for this phase is only a runnable health-check that proves the toolchain
 * and the shared-package contract compile and link. The actual WebSocket server,
 * rooms, and authoritative systems arrive in Phase 4+ (see docs/network-protocol.md).
 */

import { SERVER_TICK_HZ, DEFAULT_ROOM_CAPACITY, ServerMessageType } from '@oiltycoon/shared';
import { env } from './config/env.js';

function main(): void {
    console.log('[oil-tycoon server] health check OK');
    console.log(`  env:            ${env.nodeEnv}`);
    console.log(`  intended port:  ${env.port} (WebSocket server lands in Phase 4)`);
    console.log(`  server tick:    ${SERVER_TICK_HZ} Hz`);
    console.log(`  room capacity:  ${DEFAULT_ROOM_CAPACITY}`);
    console.log(`  shared protocol reachable, e.g. ${ServerMessageType.ROOM_SNAPSHOT}`);
    console.log('[oil-tycoon server] Phase 0 ready. Press Ctrl+C to stop.');

    // Keep the process alive so `npm run dev` (watch mode) stays running and the
    // health check behaves like a long-lived service even before the WS server exists.
    setInterval(() => {
        /* heartbeat placeholder until the room tick loop replaces it in Phase 4 */
    }, 60_000);
}

main();
