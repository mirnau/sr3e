<script lang="ts">
import { onDestroy, untrack } from "svelte";
import { slide } from "svelte/transition";
import { localize, pickImagePath } from "../../../services/utilities";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import type SR3EActor from "../../../documents/SR3EActor";

let { actor: _actor, config = CONFIG.SR3E }: { actor: SR3EActor; config?: any } = $props();
const actor = untrack(() => _actor);
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

let metatype = $state<Item | null>(null);

storeManager.Subscribe(actor);

const actorNameStore = storeManager.GetShallowStore<string>(actor, "actorName", actor.name);
const isDetailsOpenStore = storeManager.GetRWStore<boolean>(actor, "profile.isDetailsOpen");

onDestroy(() => {
   Hooks.off("createItem", createHookId);
   Hooks.off("updateItem", updateHookId);
   Hooks.off("deleteItem", deleteHookId);
   storeManager.Unsubscribe(actor);
});

function rebuildMetatype(): void {
   metatype = [...((actor as any).items ?? [])].find((item: Item) => item.type === "metatype") ?? null;
}

function onItemChange(item: any): void {
   if (item.parent?.id !== (actor as any).id && item.actor?.id !== (actor as any).id) return;
   rebuildMetatype();
}

rebuildMetatype();

const createHookId = Hooks.on("createItem", onItemChange);
const updateHookId = Hooks.on("updateItem", onItemChange);
const deleteHookId = Hooks.on("deleteItem", onItemChange);

function toggleDetails() {
   isDetailsOpenStore.update((val) => !val);
}

function handleActorNameChange(event: Event) {
   const target = event.target as HTMLInputElement;
   actorNameStore.set(target.value);
}

function cubicInOut(t: number): number {
   return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) * 0.5;
}

function updateAge(event: Event) {
   const target = event.target as HTMLElement;
   actor?.update({ "system.profile.age": Number(target.innerText.trim()) }, { render: false });
}

function updateHeight(event: Event) {
   const target = event.target as HTMLElement;
   actor?.update({ "system.profile.height": Number(target.innerText.trim()) }, { render: false });
}

function updateWeight(event: Event) {
   const target = event.target as HTMLElement;
   actor?.update({ "system.profile.weight": Number(target.innerText.trim()) }, { render: false });
}

function updateQuote(event: Event) {
   const target = event.target as HTMLElement;
   actor?.update({ "system.profile.quote": target.innerText.trim() }, { render: false });
}

async function editImage(): Promise<void> {
   if (!actor) return;
   const path = await pickImagePath(actor.img as string);
   await actor.update({ img: path });
}

const profile = $derived(config.PROFILE);
</script>

<div class="profile">
   <div class="profile-img-btn" onclick={editImage} title="Click to change image" role="button" tabindex="0"
      onkeydown={(e) => e.key === "Enter" && editImage()}>
      <img
         src={$isDetailsOpenStore ? (metatype?.img || actor.img) : actor.img}
         alt={$isDetailsOpenStore ? (metatype?.name || actor.name) : actor.name}
         class="profile-img"
      />
   </div>

   <div
      class="details-foldout"
      role="button"
      tabindex="0"
      onclick={toggleDetails}
      onkeydown={(e) => ["Enter", " "].includes(e.key) && (e.preventDefault(), toggleDetails())}
   >
      <span><i class="fa-solid fa-magnifying-glass"></i></span>
      {localize(profile.isDetailsOpen)}
   </div>

   {#if $isDetailsOpenStore}
      <div in:slide={{ duration: 100, easing: cubicInOut }} out:slide={{ duration: 50, easing: cubicInOut }}>
         <div class="input-frame">
            <input
               type="text"
               id="actor-name"
               name="name"
               value={$actorNameStore}
               oninput={handleActorNameChange}
               onblur={handleActorNameChange}
               onkeypress={(e) => e.key === "Enter" && handleActorNameChange(e)}
            />
         </div>
      </div>

      <div class="flavor-edit-block">
         <div class="editable-row">
            <div class="label-line-wrap">
               <div class="label">{localize(profile.age)}</div>
               <div class="dotted-line"></div>
            </div>
            <div class="value-unit">
               <div class="editable-field" contenteditable="true" onblur={updateAge}>
                  {actor.system?.profile?.age || 0}
               </div>
               <span class="unit">yrs</span>
            </div>
         </div>

         <div class="editable-row">
            <div class="label-line-wrap">
               <div class="label">{localize(profile.height)}</div>
               <div class="dotted-line"></div>
            </div>
            <div class="value-unit">
               <div class="editable-field" contenteditable="true" onblur={updateHeight}>
                  {actor.system?.profile?.height || 0}
               </div>
               <span class="unit">cm</span>
            </div>
         </div>

         <div class="editable-row">
            <div class="label-line-wrap">
               <div class="label">{localize(profile.weight)}</div>
               <div class="dotted-line"></div>
            </div>
            <div class="value-unit">
               <div class="editable-field" contenteditable="true" onblur={updateWeight}>
                  {actor.system?.profile?.weight || 0}
               </div>
               <span class="unit">kg</span>
            </div>
         </div>
      </div>

      <div class="flavor-edit-block last-flavor-edit-block">
         <h4>{localize(profile.quote)}</h4>
         <div class="input-frame">
            <div
               class="editable-field quote"
               role="presentation"
               contenteditable="true"
               onblur={updateQuote}
               onkeypress={(e) => {
                  if (e.key === "Enter") {
                     e.preventDefault();
                     e.currentTarget.blur();
                  }
               }}
            >
               {actor.system?.profile?.quote || ""}
            </div>
         </div>
      </div>
   {/if}
</div>
