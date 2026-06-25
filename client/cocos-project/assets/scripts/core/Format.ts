/** Compact number formatting for idle-game UI: 1234 -> "1.23K", 5e6 -> "5.00M". */
const UNITS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi'];

export function formatNumber(value: number): string {
    if (!isFinite(value)) return '0';
    const sign = value < 0 ? '-' : '';
    let n = Math.abs(value);
    if (n < 1000) {
        return sign + (Number.isInteger(n) ? n.toString() : n.toFixed(1));
    }
    let tier = 0;
    while (n >= 1000 && tier < UNITS.length - 1) {
        n /= 1000;
        tier++;
    }
    return sign + n.toFixed(2) + UNITS[tier];
}

export function formatMoney(value: number): string {
    return '$' + formatNumber(value);
}

/** mm:ss for a countdown given seconds. */
export function formatTime(seconds: number): string {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r.toString().padStart(2, '0')}`;
}
