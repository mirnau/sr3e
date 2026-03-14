<script lang="ts">
  import { onMount } from "svelte";
  import TimeActuatorInput from "./TimeActuatorInput.svelte";
  import { TimeService } from "../../../services/time/TimeService";

  const service = TimeService.Instance();
  let currentDate = $state(service.getDate());

  onMount(() => {
    const hookId = Hooks.on("updateWorldTime", () => {
      currentDate = service.getDate();
    });
    return () => { Hooks.off("updateWorldTime", hookId); };
  });

  const year    = $derived(currentDate.getFullYear());
  const month   = $derived(currentDate.getMonth() + 1);
  const day     = $derived(currentDate.getDate());
  const hours   = $derived(currentDate.getHours());
  const minutes = $derived(currentDate.getMinutes());
  const seconds = $derived(currentDate.getSeconds());
  const weekday   = $derived(currentDate.toLocaleDateString(undefined, { weekday: "long" }));
  const monthName = $derived(currentDate.toLocaleDateString(undefined, { month: "long" }));
</script>

<div class="time-manager">
  <div class="time-manager__display">
    <span class="time-manager__date">
      {weekday}, {day.toString().padStart(2, "0")} {monthName} {year}
    </span>
    <span class="time-manager__time">
      {hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
    </span>
  </div>
  <div class="time-manager__actuators">
    <TimeActuatorInput label="Year"    onDelta={(n) => service.advanceYears(n)} />
    <TimeActuatorInput label="Month"   onDelta={(n) => service.advanceMonths(n)} />
    <TimeActuatorInput label="Day"     onDelta={(n) => service.advanceDays(n)} />
    <TimeActuatorInput label="Hours"   onDelta={(n) => service.advanceHours(n)} />
    <TimeActuatorInput label="Minutes" onDelta={(n) => service.advanceMinutes(n)} />
    <TimeActuatorInput label="Seconds" onDelta={(n) => service.advanceSeconds(n)} />
  </div>
</div>
