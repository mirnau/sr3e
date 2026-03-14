<script lang="ts">
   interface Point {
      value: number;
      text: string;
   }

   const { points = [], containerCSS = "" } = $props<{ points: Point[]; containerCSS?: string }>();
</script>

<div class={containerCSS}>
   {#each points as point, i}
      <div class="point-container" style="top: {i * 8}rem">
         <span class="points-value">{point.value}</span>
         <div>{point.text}</div>
      </div>
   {/each}
</div>
