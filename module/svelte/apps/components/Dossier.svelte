<script>
   import { slide } from "svelte/transition";
   import { openFilePicker, localize } from "../../../services/utilities.js";
   import CardToolbar from "./CardToolbar.svelte";
   import { tick } from "svelte";
   import Image from "./basic/Image.svelte";
   import { StoreManager } from "../../svelteHelpers/StoreManager.svelte.js";

   let { actor = {}, config = {}, id = {}, span = {} } = $props();
   let storeManger = StoreManager.Subscribe(actor);

   let system = $state(actor.system);

   let actorNameStore = storeManger.GetShallowStore(actor.id, actor.name, actor.name);

   let isDetailsOpenStore = storeManger.GetStore("profile.isDetailsOpen");

   let actorName = $state($actorNameStore);
   let isDetailsOpen = $state($isDetailsOpenStore);
   let imgPath = $state("");
   let imgName = $state("");

   $effect(() => {
      const metatype = actor.items.find((i) => i.type === "metatype");
      imgPath = metatype.img;
      imgName = metatype.name;
   });

   function triggerMasonryReflow() {
      document
         .querySelector(".sheet-character-masonry-main")
         ?.dispatchEvent(new CustomEvent("masonry-reflow", { bubbles: true }));
   }

   async function handleOutroEnd() {
      await tick(); // wait for Svelte to actually remove the node
      document
         .querySelector(".sheet-character-masonry-main")
         ?.dispatchEvent(new CustomEvent("masonry-reflow", { bubbles: true }));
   }

   function toggleDetails() {
      $isDetailsOpenStore = !$isDetailsOpenStore;
   }

   function saveActorName(event) {
      $actorNameStore = event.target.value;
   }

   function multiply(value, factor) {
      return (value * factor).toFixed(2);
   }

   function cubicInOut(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
   }

   function updateStoreName(newName) {
      actorName = newName;
      actorNameStore.set(newName);
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
         <div
            in:slide={{ duration: 100, easing: cubicInOut }}
            out:slide={{ duration: 50, easing: cubicInOut }}
            onintroend={triggerMasonryReflow}
            onoutroend={handleOutroEnd}
         >
            <div>
               <input
                  type="text"
                  id="actor-name"
                  name="name"
                  value={actorName}
                  oninput={(e) => updateStoreName(e.target.value)}
                  onblur={saveActorName}
                  onkeypress={(e) => e.key === "Enter" && saveActorName(e)}
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
                  <div
                     class="editable-field"
                     contenteditable="true"
                     onblur={(e) =>
                        actor?.update?.({ "system.profile.age": Number(e.target.innerText.trim()) }, { render: false })}
                  >
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
                  <div
                     class="editable-field"
                     contenteditable="true"
                     onblur={(e) =>
                        actor?.update?.(
                           {
                              "system.profile.height": Number(e.target.innerText.trim()),
                           },
                           { render: false }
                        )}
                  >
                     {system.profile.height}
                  </div>
                  <span class="unit">cm</span>
               </div>
            </div>

            <div class="editable-row">
               <div class="label-line-wrap">
                  <div class="label">{localize(config.traits.weight)}</div>
                  <div class="dotted-line"></div>
               </div>
               <div class="value-unit">
                  <div
                     class="editable-field"
                     contenteditable="true"
                     onblur={(e) =>
                        actor?.update?.(
                           {
                              "system.profile.weight": Number(e.target.innerText.trim()),
                           },
                           { render: false }
                        )}
                  >
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
               onblur={(e) => actor?.update?.({ "system.profile.quote": e.target.innerText.trim() }, { render: false })}
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
