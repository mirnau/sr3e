export function currentPeriod(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
}

export function monthsBetween(from: string, to: string): number {
    if (!from) return 0;
    const [fromYear, fromMonth] = parsePeriod(from);
    const [toYear, toMonth] = parsePeriod(to);
    return Math.max(0, (toYear - fromYear) * 12 + (toMonth - fromMonth));
}

export function daysUntilMonthEnd(date: Date): number {
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const msPerDay = 24 * 60 * 60 * 1000;
    return Math.ceil((monthEnd.getTime() - date.getTime()) / msPerDay);
}

function parsePeriod(period: string): [number, number] {
    const parts = period.split("-").map(Number);
    return [parts[0] ?? 0, parts[1] ?? 0];
}
