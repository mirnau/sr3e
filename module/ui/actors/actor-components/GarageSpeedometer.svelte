<script lang="ts">
import { localize } from "../../../services/utilities";

const p = $props<{ currentSpeed: number; maxSpeed: number; speedRating: number; maneuverScore: number }>();

const CX = 100;
const CY = 100;
const RADIUS = 82;
const STROKE = 14;

// Gauge sweeps left-to-right through the top of the circle: value 0 sits
// at 180° (screen-left), value max sits at 0° (screen-right), tracing the
// dome the same direction a real speedometer needle would travel.
function angleForValue(value: number, max: number): number {
    const clamped = Math.max(0, Math.min(max, value || 0));
    const ratio = max > 0 ? clamped / max : 0;
    return 180 - ratio * 180;
}

function pointOnArc(angleDeg: number, radius: number): { x: number; y: number } {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: CX + radius * Math.cos(rad), y: CY - radius * Math.sin(rad) };
}

function arcPath(fromValue: number, toValue: number, max: number, radius: number): string {
    const startAngle = angleForValue(fromValue, max);
    const endAngle = angleForValue(toValue, max);
    const start = pointOnArc(startAngle, radius);
    const end = pointOnArc(endAngle, radius);
    const largeArc = Math.abs(startAngle - endAngle) > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

const safeMax = $derived(Math.max(10, p.maxSpeed || 0));
const ticks = $derived.by(() => {
    const list: { value: number; angle: number; major: boolean }[] = [];
    for (let v = 0; v <= safeMax; v += 10) {
        list.push({ value: v, angle: angleForValue(v, safeMax), major: v % 50 === 0 });
    }
    return list;
});
const trackPath = $derived(arcPath(0, safeMax, safeMax, RADIUS));
const fillPath = $derived(p.currentSpeed > 0 ? arcPath(0, p.currentSpeed, safeMax, RADIUS) : "");
const ratingAngle = $derived(angleForValue(p.speedRating, safeMax));
const ratingPoint = $derived(pointOnArc(ratingAngle, RADIUS));
</script>

<div class="garage-speedometer">
    <div class="garage-speedometer__maneuver-score">
        {localize(CONFIG.SR3E.INVENTORY.garagemaneuver)}: {p.maneuverScore}
    </div>

    <svg viewBox="0 0 200 105" class="garage-speedometer__gauge">
        <path d={trackPath} class="garage-speedometer__track" stroke-width={STROKE} fill="none" />
        {#if fillPath}
            <path d={fillPath} class="garage-speedometer__fill" stroke-width={STROKE} fill="none" />
        {/if}

        {#each ticks as tick (tick.value)}
            {@const inner = pointOnArc(tick.angle, RADIUS - STROKE / 2 - 2)}
            {@const outer = pointOnArc(tick.angle, RADIUS + STROKE / 2 + (tick.major ? 8 : 3))}
            <line
                x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                class="garage-speedometer__tick"
                class:garage-speedometer__tick--major={tick.major}
            />
            {#if tick.major}
                {@const label = pointOnArc(tick.angle, RADIUS + STROKE / 2 + 16)}
                <text x={label.x} y={label.y} class="garage-speedometer__tick-label" text-anchor="middle">{tick.value}</text>
            {/if}
        {/each}

        <circle cx={ratingPoint.x} cy={ratingPoint.y} r="5" class="garage-speedometer__rating-marker" />
    </svg>

    <div class="garage-speedometer__readout">
        <span class="garage-speedometer__current">{Math.round(p.currentSpeed || 0)}</span>
        <span class="garage-speedometer__max">/ {safeMax} km/h</span>
    </div>
</div>
