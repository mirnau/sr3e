<script>
   let { item, config } = $props();
</script>

<div class="asset-card">
   <div class="asset-background-layer"></div>
   <div class="image-mask">
      <img src={item.img} role="presentation" alt={item.name} />
   </div>
   <div class="asset-card-column">
      <div class="asset-card-row">
         <h2 class="no-margin uppercase">{item.name}</h2>
      </div>
      <div class="asset-card-row">
         <button
            class="header-control icon sr3e-toolbar-button fa-solid fa-dice"
            aria-label="Roll"
            onclick={() => console.log("Roll")}
         ></button>
         <button
            class="header-control icon sr3e-toolbar-button fa-solid fa-pencil"
            aria-label="Edit"
            onclick={() => {
               const realItem = item.item;
               if (realItem?.sheet) realItem.sheet.render(true);
               else ui.notifications.warn("Unable to open item sheet.");
            }}
         ></button>

         <button
            class="header-control icon sr3e-toolbar-button fa-solid fa-trash-can"
            aria-label="Roll"
            onclick={() => console.log("Roll")}
         ></button>
      </div>
   </div>
</div>
