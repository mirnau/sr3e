export type DieResult = { result: number; active: true; exploded: boolean };

function randomFace(): number {
    return Math.floor(Math.random() * 6) + 1;
}

export function accumulate(pool: number, cap: number): DieResult[] {
    const results: DieResult[] = [];
    for (let i = 0; i < pool; i++) {
        let total = 0;
        let exploded = false;
        while (true) {
            const face = randomFace();
            total += face;
            if (face === 6 && total < cap) {
                exploded = true;
            } else {
                break;
            }
        }
        results.push({ result: total, active: true, exploded });
    }
    return results;
}
