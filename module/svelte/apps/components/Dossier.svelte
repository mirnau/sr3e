<script>
   import { slide } from "svelte/transition";
   import CardToolbar from "@sveltecomponent/CardToolbar.svelte";
   import Image from "@sveltecomponent/basic/Image.svelte";
   import { StoreManager, stores } from "@sveltehelpers/StoreManager.svelte.js";
   import { localize } from "@services/utilities.js";

   let { actor = {}, config = {}, id = {}, span = {} } = $props();
   let storeManager = StoreManager.Subscribe(actor);

   let system = $state(actor.system);
   let actorNameStore = storeManager.GetShallowStore(actor.id, stores.actorName, actor.name);
   let isDetailsOpenStore = storeManager.GetRWStore("profile.isDetailsOpen");

   let isDetailsOpen = $state($isDetailsOpenStore);

   let metatype = $derived(actor.items.find((i) => i.type === "metatype"));
   let imgPath = $derived(metatype?.img || "");
   let imgName = $derived(metatype?.name || "");

   function toggleDetails() {
      $isDetailsOpenStore = !$isDetailsOpenStore;
   }

   function handleActorNameChange(event) {
      $actorNameStore = event.target.value;
   }

   function multiply(value, factor) {
      return (value * factor).toFixed(2);
   }

   function cubicInOut(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) * 0.5;
   }

   function updateAge(event) {
      actor.update({ "system.profile.age": Number(event.target.innerText.trim()) }, { render: false });
   }

   function updateHeight(event) {
      actor.update({ "system.profile.height": Number(event.target.innerText.trim()) }, { render: false });
   }

   function updateWeight(event) {
      actor.update({ "system.profile.weight": Number(event.target.innerText.trim()) }, { render: false });
   }

   function updateQuote(event) {
      actor.update({ "system.profile.quote": event.target.innerText.trim() }, { render: false });
   }
</script>

<CardToolbar {id} />

<div class="dossier">
   {#if $isDetailsOpenStore}
      <Image src={imgPath} title={imgName} />
   {:else}
      <Image entity={actor} />
   {/if}

   <div class="dossier-details">
      <div
         class="details-foldout"
         role="button"
         tabindex="0"
         onclick={toggleDetails}
         onkeydown={(e) => ["Enter", " "].includes(e.key) && (e.preventDefault(), toggleDetails())}
      >
         <span><i class="fa-solid fa-magnifying-glass"></i></span>
         {localize(config.sheet.details)}
      </div>

      {#if $isDetailsOpenStore}
         <div in:slide={{ duration: 100, easing: cubicInOut }} out:slide={{ duration: 50, easing: cubicInOut }}>
            <div>
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
                  <div class="label">{localize(config.traits.age)}</div>
                  <div class="dotted-line"></div>
               </div>
               <div class="value-unit">
                  <div class="editable-field" contenteditable="true" onblur={updateAge}>
                     {system.profile.age}
                  </div>
                  <span class="unit">yrs</span>
               </div>
            </div>

            <div class="editable-row">
               <div class="label-line-wrap">
                  <div class="label">{localize(config.traits.height)}</div>
                  <div class="dotted-line"></div>
               </div>
               <div class="value-unit">
                  <div class="editable-field" contenteditable="true" onblur={updateHeight}>
                     {system.profile.height}
                  </div>
                  <span class="unit">kg</span>
               </div>
            </div>

            <div class="editable-row">
               <div class="label-line-wrap">
                  <div class="label">{localize(config.traits.weight)}</div>
                  <div class="dotted-line"></div>
               </div>
               <div class="value-unit">
                  <div class="editable-field" contenteditable="true" onblur={updateWeight}>
                     {system.profile.weight}
                  </div>
                  <span class="unit">kg</span>
               </div>
            </div>
         </div>

         <div class="flavor-edit-block last-flavor-edit-block">
            <h4>{localize(config.sheet.quote)}</h4>
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
               {system.profile.quote}
            </div>
         </div>
      {/if}
   </div>
</div>
