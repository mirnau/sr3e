export default class TimeService {
    static unit = {
        seconds: "Seconds",
        minutes: "Minutes",
        hours: "Hours",
        days: "Days",
        months: "Months",
        years: "Years",
    };

    static update(ms) {
        game.time.advance(ms);
    }

    static updateSeconds(n = 1) {
        this.update(n * 1000);
    }

    static updateMinutes(n = 1) {
        this.update(n * 60 * 1000);
    }

    static updateHours(n = 1) {
        this.update(n * 60 * 60 * 1000);
    }

    static updateDays(n = 1) {
        const date = new Date(game.time.worldTime);
        date.setDate(date.getDate() + n);
        game.time.set(date.getTime());
    }

    static updateMonths(n = 1) {
        const date = new Date(game.time.worldTime);
        date.setMonth(date.getMonth() + n);
        game.time.set(date.getTime());
    }

    static updateYears(n = 1) {
        const date = new Date(game.time.worldTime);
        date.setFullYear(date.getFullYear() + n);
        game.time.set(date.getTime());
    }

    static dateToGameTime(date) {
        if (!(date instanceof Date)) throw new Error("Expected Date instance");
        return date.getTime();
    }

    static gameTimeToDate(ms) {
        if (typeof ms !== "number") throw new Error("Expected number");
        return new Date(ms);
    }
}
