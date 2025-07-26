<script>
   let { document, config } = $props();

   let dropZone;
   let dragActive = $state(false);
   let dragHover = $state(false);
   const isReady = $derived(document?.effects instanceof foundry.utils.Collection);


   function handleDragStart(event) {
      dragActive = true;
      const data = { type: document.type, uuid: document.uuid };
      event.dataTransfer.setData("text/plain", JSON.stringify(data));
      event.dataTransfer.effectAllowed = "move";
   }

   function handleDragEnd() {
      dragActive = false;
      dragHover = false;
   }

   function handleDragOver(event) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
   }

   function handleDragEnter(event) {
      event.preventDefault();
      dragHover = true;
   }

   function handleDragLeave(event) {
      if (!dropZone.contains(event.relatedTarget)) {
         dragHover = false;
      }
   }

   async function addEffect(droppedItem) {
      const commodity = droppedItem.system.commodity;
      const type = droppedItem.system.type;

      const effectsToAdd = droppedItem.effects.contents.map((effect) => {
         const data = effect.toObject();

         return {
            ...data,
            _id: foundry.utils.randomID(),
            flags: {
               ...data.flags,
               sr3e: {
                  ...data.flags?.sr3e,
                  type,
                  source: "manual",
                  commodity, // ← straight from the dropped item
               },
            },
         };
      });

      await document.createEmbeddedDocuments("ActiveEffect", effectsToAdd, { render: false });
   }

   async function handleDrop(event) {
      event.preventDefault();
      dragHover = false;

      const raw = event.dataTransfer.getData("text/plain");
      if (!raw) return;

      const droppedData = JSON.parse(raw);
      const droppedItem = await fromUuid(droppedData.uuid);

      if (!(droppedItem instanceof Item)) return;
      if (droppedItem.type !== "gadget") return;

      await addEffect(droppedItem);
      await document.prepareData();
   }

   const dropZoneClass = `drop-zone ${dragActive ? "drag-active" : ""} ${dragHover ? "drag-hover" : ""}`;
</script>

<div
   bind:this={dropZone}
   role="region"
   aria-label="Gadget drop target"
   class={dropZoneClass}
   ondragstart={handleDragStart}
   ondragend={handleDragEnd}
   ondragover={handleDragOver}
   ondragenter={handleDragEnter}
   ondragleave={handleDragLeave}
   ondrop={handleDrop}
>
   <div class="content">
      <table>
         <thead>
            <tr>
               <th><button onclick={() => document.openGadgetEditor(gadget.id)}>Edit</button></th>
               <th>Name</th>
               <th>Actions</th>
            </tr>
         </thead>
         <tbody>
            {#if isReady }
               {#each document.effects.contents.filter((e) => e.flags?.sr3e?.type === "weaponmod") as weaponmod (weaponmod.id)}
                  <tr>
                     <td
                        >{#if weaponmod.img}<img src={weaponmod.img} alt={weaponmod.name} />{/if}</td
                     >
                     <td>{weaponmod.name}</td>
                     <td>
                        <button onclick={() => document.openGadgetEditor(weaponmod.id)}>Edit</button>
                        <button onclick={() => document.removeGadget(weaponmod.id)}>Remove</button>
                     </td>
                  </tr>
               {/each}
            {/if}
         </tbody>
      </table>
   </div>

   {#if dragHover}
      <div class="drag-overlay">
         <div class="drop-indicator">Drop here</div>
      </div>
   {/if}
</div>
