export function difficultyLabel(tn: number): string {
    if (tn <= 2) return "Easy";
    if (tn === 3) return "Moderate";
    if (tn === 4) return "Standard";
    if (tn === 5) return "Hard";
    if (tn === 6) return "Very Hard";
    if (tn === 7) return "Extreme";
    return "Legendary";
}
