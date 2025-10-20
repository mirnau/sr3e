<script>
   import { localize, openFilePicker } from "@services/utilities.js";
   import JournalViewer from "@sveltecomponent/JournalViewer.svelte";
   import Image from "@sveltecomponent/basic/Image.svelte";
   import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
   import ItemSheetWrapper from "@sveltecomponent/basic/ItemSheetWrapper.svelte";
   import StatCard from "@sveltecomponent/basic/DerivedAttributeCard.svelte";

   let { item, config } = $props();
</script>

<ItemSheetWrapper csslayout={"single"}>
   <ItemSheetComponent>
      <Image src={item.img} title={item.name} />
      <div class="stat-grid single-column">
         <StatCard>
            <div class="stat-card-background"></div>
            <input
               class="large"
               name="name"
               type="text"
               value={item.name}
               onchange={(e) => item.update({ name: e.target.value })}
            />
         </StatCard>
      </div>
   </ItemSheetComponent>
</ItemSheetWrapper>
