<script lang="ts">
import { onDestroy } from "svelte";
import type { IStoreManager } from "../../../../utilities/IStoreManager";
import { StoreManager } from "../../../../utilities/StoreManager.svelte";
import SkillEditorApp from "../../../../sheets/items/SkillEditorApp";

interface Props {
   actor: Actor;
   item: Item;
   category: "active" | "knowledge" | "language";
}

let { actor, item, category }: Props = $props();

const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

type Specialization = { name: string; value: number };

const skillKey = `${category}Skill`;

storeManager.Subscribe(item);
storeManager.Subscribe(actor);

const valueStore = storeManager.GetRWStore<number>(item, `${skillKey}.value`);
const specializationsStore = storeManager.GetRWStore<Specialization[]>(item, `${skillKey}.specializations`);
const readWriteStore = category === "language"
   ? storeManager.GetRWStore<number>(item, "languageSkill.readwrite.value")
   : null;
const isShoppingState = storeManager.GetFlagStore<boolean>(actor, "isShoppingState", false);
const isCharacterCreation = storeManager.GetFlagStore<boolean>(actor, "isCharacterCreation", false);

onDestroy(() => {
   storeManager.Unsubscribe(item);
   storeManager.Unsubscribe(actor);
});

function openSkillEditor(): void {
   SkillEditorApp.launch(actor, item, category);
}
function rollSkill(e: MouseEvent | KeyboardEvent): void {
   e.preventDefault();
}

function rollSpec(e: MouseEvent | KeyboardEvent, _spec: Specialization): void {
   e.preventDefault();
}

function capitalize(s: string): string {
   return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
}

const linkedAttrName =
   category === "active"
      ? capitalize((item.system as Record<string, any>)?.activeSkill?.linkedAttribute ?? "")
      : "Intelligence";
</script>

<div class="skill-card-container" data-item-id={item.id}>
   {#if $isShoppingState || $isCharacterCreation}
      <i
         class="header-control icon fa-solid fa-pen-to-square pulsing-green-cart"
         tabindex="0"
         role="button"
         aria-label="Edit skill"
         onclick={openSkillEditor}
         onkeydown={(e) => e.key === "Enter" && openSkillEditor()}
      ></i>
      <div class="skill-card">
         <div class="skill-background-layer"></div>
         <h6 class="no-margin skill-name" title={item.name}>{item.name}</h6>
         <h5 class="no-margin">({linkedAttrName})</h5>
         <div class="skill-main-container">
            <h1 class="skill-value">{$valueStore}</h1>
         </div>
         {#if $specializationsStore.length > 0}
            <div class="specialization-container">
               {#each $specializationsStore as spec}
                  <div class="skill-specialization-card">
                     <div class="specialization-background"></div>
                     <div class="specialization-name">{spec.name}</div>
                     <h1 class="embedded-value">{spec.value}</h1>
                  </div>
               {/each}
            </div>
         {/if}
      </div>
   {:else}
      <div class="skill-card">
         <div class="skill-background-layer"></div>
         <h6 class="no-margin skill-name" title={item.name}>{item.name}</h6>
         <h5 class="no-margin">({linkedAttrName})</h5>
         <div
            class="skill-main-container button"
            role="button"
            tabindex="0"
            onclick={(e) => rollSkill(e)}
            onkeydown={(e) => (e.key === "Enter" || e.key === " ") && rollSkill(e)}
         >
            <h1 class="skill-value">{$valueStore}</h1>
         </div>

         {#if category === "language" && readWriteStore && $readWriteStore > 0}
            <div class="specialization-container">
               <div
                  class="skill-specialization-card button"
                  role="button"
                  tabindex="0"
                  onclick={(e) => rollSkill(e)}
                  onkeydown={(e) => (e.key === "Enter" || e.key === " ") && rollSkill(e)}
               >
                  <div class="specialization-background"></div>
                  <div class="specialization-name">Read/Write</div>
                  <h1 class="embedded-value">{$readWriteStore}</h1>
               </div>
            </div>
         {/if}

         {#if $specializationsStore.length > 0}
            <div class="specialization-container">
               {#each $specializationsStore as spec}
                  <div
                     class="skill-specialization-card button"
                     role="button"
                     tabindex="0"
                     onclick={(e) => rollSpec(e, spec)}
                     onkeydown={(e) => (e.key === "Enter" || e.key === " ") && rollSpec(e, spec)}
                  >
                     <div class="specialization-background"></div>
                     <div class="specialization-name">{spec.name}</div>
                     <h1 class="embedded-value">{spec.value}</h1>
                  </div>
               {/each}
            </div>
         {/if}
      </div>
   {/if}
</div>
