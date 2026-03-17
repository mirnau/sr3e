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
    <span class="time-manager__time">
      {hours.toString().padStart(2, "0")}:{minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
    </span>
    <span class="time-manager__date">
      {weekday}, {day.toString().padStart(2, "0")} {monthName} {year}
    </span>
  </div>
  <div class="time-manager__actuators">
    <TimeActuatorInput label="Year"    value={year}    onIncrement={() => service.advanceYears(1)}   onDecrement={() => service.advanceYears(-1)}   onSet={(n) => service.setYear(n)} />
    <TimeActuatorInput label="Month"   value={month}   onIncrement={() => service.advanceMonths(1)}  onDecrement={() => service.advanceMonths(-1)}  onSet={(n) => service.setMonth(n)} />
    <TimeActuatorInput label="Day"     value={day}     onIncrement={() => service.advanceDays(1)}    onDecrement={() => service.advanceDays(-1)}    onSet={(n) => service.setDay(n)} />
    <TimeActuatorInput label="Hours"   value={hours}   onIncrement={() => service.advanceHours(1)}   onDecrement={() => service.advanceHours(-1)}   onSet={(n) => service.setHour(n)} />
    <TimeActuatorInput label="Minutes" value={minutes} onIncrement={() => service.advanceMinutes(1)} onDecrement={() => service.advanceMinutes(-1)} onSet={(n) => service.setMinute(n)} />
    <TimeActuatorInput label="Seconds" value={seconds} onIncrement={() => service.advanceSeconds(1)} onDecrement={() => service.advanceSeconds(-1)} onSet={(n) => service.setSecond(n)} />
  </div>
</div>
