/** Central environment/config reader. Keeps process.env access in one place. */

function intEnv(name: string, fallback: number): number {
    const raw = process.env[name];
    if (!raw) return fallback;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) ? n : fallback;
}

export const env = {
    port: intEnv('PORT', 3001),
    nodeEnv: process.env.NODE_ENV ?? 'development',
    isProduction: process.env.NODE_ENV === 'production',
};
