<script>
    import TimeActuatorInput from "./TimeActuatorInput.svelte";
    import TimeService from "../../../services/TimeService.js";
    import { onMount } from "svelte";
    import { localize } from "../../../services/utilities.js";

    let { config = {} } = $props();

    let currentDate = $state(new Date(game.time.worldTime));

    onMount(() => {
        const handler = () => {
            currentDate = new Date(game.time.worldTime);
        };
        Hooks.on("updateWorldTime", handler);

        return () => Hooks.off("updateWorldTime", handler);
    });

    const year = $derived(currentDate.getFullYear());
    const month = $derived(currentDate.getMonth());
    const day = $derived(currentDate.getDate());
    const hours = $derived(currentDate.getHours());
    const minutes = $derived(currentDate.getMinutes());
    const seconds = $derived(currentDate.getSeconds());

    const weekdayAsString = $derived(
        currentDate.toLocaleDateString(undefined, { weekday: "long" }),
    );

    const monthAsString = $derived(
        currentDate.toLocaleDateString(undefined, { month: "long" }),
    );
  
</script>

<div class="sheet-component">
    <div class="sr3e-inner-background-container">
        <div class="fake-shadow"></div>
        <div class="sr3e-inner-background">
            <div class="counter-bar">
                <h1 class="text-display">
                    <div>{weekdayAsString}</div>
                    <div>{day.toString().padStart(2, "0")}</div>  - 
                    <div>{monthAsString}</div>
                    <div>{year}</div> - 
                    <div class="clock">{hours.toString().padStart(2, "0")}</div>
                    :
                    <div class="clock">{minutes.toString().padStart(2, "0")}</div>
                    :
                    <div class="clock" >{seconds.toString().padStart(2, "0")}</div>
                </h1>

                <div class="time-editor">
                    <TimeActuatorInput
                        label={localize(config.time.year)}
                        onDelta={(n) => {
                            TimeService.updateYears(n);
                        }}
                    />
                    <TimeActuatorInput
                        label={localize(config.time.month)}
                        onDelta={(n) => {
                            TimeService.updateMonths(n);
                        }}
                    />
                    <TimeActuatorInput
                        label={localize(config.time.day)}
                        onDelta={(n) => {
                            TimeService.updateDays(n);
                        }}
                    />
                    <TimeActuatorInput
                        label={localize(config.time.hours)}
                        onDelta={(n) => {
                            TimeService.updateHours(n);
                        }}
                    />
                    <TimeActuatorInput
                        label={localize(config.time.minutes)}
                        onDelta={(n) => {
                            TimeService.updateMinutes(n);
                        }}
                    />
                    <TimeActuatorInput
                        label={localize(config.time.seconds)}
                        onDelta={(n) => {
                            TimeService.updateSeconds(n);
                        }}
                    />
                </div>
            </div>
        </div>
    </div>
</div>