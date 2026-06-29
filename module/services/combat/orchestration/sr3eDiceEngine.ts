export type DieResult = { result: number; total: number; active: true; exploded: boolean };

function randomFace(): number {
    return Math.floor(Math.random() * 6) + 1;
}

export function accumulate(pool: number, cap: number): DieResult[] {
    const results: DieResult[] = [];
    for (let i = 0; i < pool; i++) {
        let accTotal = 0;
        let lastFace = 0;
        let exploded = false;
        while (true) {
            const face = randomFace();
            accTotal += face;
            lastFace = face;
            if (face === 6 && accTotal < cap) {
                exploded = true;
            } else {
                break;
            }
        }
        results.push({ result: lastFace, total: accTotal, active: true, exploded });
    }
    return results;
}
