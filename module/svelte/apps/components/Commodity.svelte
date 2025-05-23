<script>
      
</script>

    {#each magicianFields as entry}
      <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
          <div class="fake-shadow"></div>
          <div class="sr3e-inner-background">
            <h3 class="item">{entry.label}</h3>
            <StatCard
              {item}
              {entry}
              path={`system.magicianData`}
              type={entry.type}
              options={entry.options}
            />
          </div>
        </div>
      </div>
    {/each}