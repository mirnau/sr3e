function gameTime() {
    // @ts-expect-error — Foundry GameTime not in type definitions
    return game.time as { worldTime: number; advance(ms: number): Promise<void>; set(ms: number): Promise<void> };
}

export class TimeService {
    private static _instance: TimeService;

    static Instance(): TimeService {
        if (!TimeService._instance) {
            TimeService._instance = new TimeService();
        }
        return TimeService._instance;
    }

    private constructor() {}

    getDate(): Date {
        return new Date(gameTime().worldTime);
    }

    async advanceSeconds(n: number): Promise<void> {
        await gameTime().advance(n * 1_000);
    }

    async advanceMinutes(n: number): Promise<void> {
        await gameTime().advance(n * 60_000);
    }

    async advanceHours(n: number): Promise<void> {
        await gameTime().advance(n * 3_600_000);
    }

    async advanceDays(n: number): Promise<void> {
        const d = this.getDate();
        d.setDate(d.getDate() + n);
        await gameTime().set(d.getTime());
    }

    async advanceMonths(n: number): Promise<void> {
        const d = this.getDate();
        d.setMonth(d.getMonth() + n);
        await gameTime().set(d.getTime());
    }

    async advanceYears(n: number): Promise<void> {
        const d = this.getDate();
        d.setFullYear(d.getFullYear() + n);
        await gameTime().set(d.getTime());
    }
}
