<script>
   let { document, config } = $props();

   let dropZone;
   let dragActive = $state(false);
   let dragHover = $state(false);

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

   async function handleDrop(event) {
      console.log("handleDrop was touched", document.gadgets.length);

      event.preventDefault();
      dragHover = false;

      const raw = event.dataTransfer.getData("text/plain");
      const droppedData = JSON.parse(raw);
      const droppedDocument = await fromUuid(droppedData.uuid);

      if (!(droppedDocument instanceof Item) || droppedDocument.type !== "gadget") {
         ui.notifications.warn("Only gadget items can be dropped here.");
         return;
      }

      await document.addGadget(droppedDocument);
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
               <th></th>
               <th>Name</th>
               <th>Actions</th>
            </tr>
         </thead>
         <tbody>
            {#each document.gadgets as gadget (gadget.id)}
               <tr>
                  <td
                     >{#if gadget.img}<img src={gadget.img} alt={gadget.name} />{/if}</td
                  >
                  <td>{gadget.name}</td>
                  <td>
                     <button onclick={() => document.openGadgetEditor(gadget.id)}>Edit</button>
                     <button onclick={() => document.removeGadget(gadget.id)}>Remove</button>
                  </td>
               </tr>
            {/each}
         </tbody>
      </table>
   </div>

   {#if dragHover}
      <div class="drag-overlay">
         <div class="drop-indicator">Drop here</div>
      </div>
   {/if}
</div>