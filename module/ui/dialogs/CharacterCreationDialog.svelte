<script lang="ts">
   import { CharacterCreationService } from "../../services/character-creation/CharacterCreationService";
   import {
      AGE_PHASES,
      PRIORITY_TABLES,
   } from "../../../types/character-creation";
   import type SR3EActor from "../../documents/SR3EActor";
   import ItemSheetWrapper from "../common-components/ItemSheetWrapper.svelte";
   import ItemSheetComponent from "../common-components/ItemSheetComponent.svelte";

   const { actor, onSubmit, onCancel } = $props<{
      actor: SR3EActor;
      config: typeof CONFIG.SR3E;
      onSubmit: (result: boolean) => void;
      onCancel: () => void;
   }>();

   const creationService = CharacterCreationService.Instance();

   // Transient form state
   let characterName = $state(actor.name);
   let characterAge = $state(25);
   let characterHeight = $state(175);
   let characterWeight = $state(75);
   let selectedMetatype = $state("");
   let selectedMagic = $state("");
   let selectedAttribute = $state("");
   let selectedSkill = $state("");
   let selectedResource = $state("");

   // Data from service
   const metatypeOptions = creationService.getMetatypes();
   const magicOptions = creationService.getMagics();

   // Derived state
   const canCreate = $derived(
      selectedMetatype &&
         selectedMagic &&
         selectedAttribute &&
         selectedSkill &&
         selectedResource,
   );

   const metatypeItem = $derived(
      game.items?.get(selectedMetatype) as Item | undefined,
   );

   const ageMin = 0;
   const ageMax = $derived((metatypeItem?.system as any)?.agerange?.max ?? 100);
   const lifespan = $derived(ageMax - ageMin);

   const currentPhase = $derived(() => {
      const normalizedAge = (characterAge - ageMin) / lifespan;
      const phase = AGE_PHASES.find(
         (p) => normalizedAge >= p.from && normalizedAge <= p.to,
      );
      return phase?.text ?? "";
   });

   let usedPriorities = $state<string[]>([]);

   $effect(() => {
      const arr: string[] = [];
      const meta = metatypeOptions.find(
         (o) => o.foundryitemid === selectedMetatype,
      );
      if (meta) arr.push(meta.priority);
      const magic = magicOptions.find((o) => o.foundryitemid === selectedMagic);
      if (magic) arr.push(magic.priority);
      if (selectedAttribute) arr.push(selectedAttribute);
      if (selectedSkill) arr.push(selectedSkill);
      if (selectedResource) arr.push(selectedResource);
      usedPriorities = arr;
   });

   // Event handlers
   async function handleSubmit(event: Event) {
      event.preventDefault();

      await creationService.initializeCharacter(actor, {
         metatypeId: selectedMetatype,
         magicId: selectedMagic,
         attributePriority: selectedAttribute,
         skillPriority: selectedSkill,
         resourcePriority: selectedResource,
         age: characterAge,
         height: characterHeight,
         weight: characterWeight,
      });

      onSubmit(true);
   }

   function handleRandomize() {
      const combo = creationService.generateRandomPriorities({
         metatypeOptions,
         magicOptions,
      });

      const metaOpts = metatypeOptions.filter(
         (m) => m.priority === combo.metatype,
      );
      const magicOpts = magicOptions.filter((m) => m.priority === combo.magic);

      selectedMetatype =
         metaOpts[Math.floor(Math.random() * metaOpts.length)]!.foundryitemid;
      selectedMagic =
         magicOpts[Math.floor(Math.random() * magicOpts.length)]!.foundryitemid;
      selectedAttribute = combo.attribute;
      selectedSkill = combo.skills;
      selectedResource = combo.resources;

      const item = game.items?.get(selectedMetatype);
      if (item) {
         const sys = item.system as any;
         const ageRange = sys?.agerange ?? { min: 0, max: 100, average: 50 };
         characterAge = Math.floor(
            ageRange.min + (ageRange.max - ageRange.min) * Math.random(),
         );

         const h = sys?.physical?.height ?? {
            min: 150,
            max: 200,
            average: 175,
         };
         characterHeight = Math.floor(h.min + (h.max - h.min) * Math.random());

         const w = sys?.physical?.weight ?? { min: 50, max: 100, average: 75 };
         characterWeight = Math.floor(w.min + (w.max - w.min) * Math.random());
      }
   }

   function handleClear() {
      selectedMetatype = "";
      selectedMagic = "";
      selectedAttribute = "";
      selectedSkill = "";
      selectedResource = "";
      characterAge = 25;
      characterHeight = 175;
      characterWeight = 75;
   }
</script>

<form onsubmit={handleSubmit}>
   <ItemSheetWrapper csslayout="double">
      <!-- Metatype Image and Character Name -->
      <ItemSheetComponent>
         <div class="image-mask">
            <img
               src={metatypeItem?.img ?? ""}
               role="presentation"
               title={metatypeItem?.name ?? ""}
               alt={metatypeItem?.name ?? ""}
            />
         </div>
         <input
            id="character-name"
            class="large"
            type="text"
            bind:value={characterName}
            placeholder="Enter character name"
         />
      </ItemSheetComponent>

      <!-- Physical Characteristics -->
      <ItemSheetComponent>
         <div class="creation-stats">
            <div>Age: {characterAge} ({currentPhase()})</div>
            <input
               type="range"
               min={ageMin}
               max={ageMax}
               step="1"
               bind:value={characterAge}
            />

            <div>Height: {characterHeight} cm</div>
            <input
               type="range"
               min={(metatypeItem?.system as any)?.physical?.height?.min ?? 0}
               max={(metatypeItem?.system as any)?.physical?.height?.max ?? 200}
               step="1"
               bind:value={characterHeight}
            />

            <div>Weight: {characterWeight} kg</div>
            <input
               type="range"
               min={(metatypeItem?.system as any)?.physical?.weight?.min ?? 0}
               max={(metatypeItem?.system as any)?.physical?.weight?.max ?? 200}
               step="1"
               bind:value={characterWeight}
            />
         </div>
      </ItemSheetComponent>

      <!-- Priority Selections -->
      <ItemSheetComponent>
         <div class="creation-grid">
            <div class="creation-dropdwn">
               <h3>Metatype</h3>
               <select bind:value={selectedMetatype}>
                  <option value="" disabled selected hidden>Choose an option</option>
                  {#each metatypeOptions as meta}
                     <option value={meta.foundryitemid}>
                        {meta.priority}: {meta.name}
                     </option>
                  {/each}
               </select>
            </div>

            <div class="creation-dropdwn">
               <h3>Magic Tradition</h3>
               <select bind:value={selectedMagic}>
                  <option value="" disabled selected hidden>Choose an option</option>
                  {#each magicOptions as magic}
                     <option
                        value={magic.foundryitemid}
                        disabled={usedPriorities.includes(magic.priority) &&
                           magic.foundryitemid !== selectedMagic}
                     >
                        {magic.priority}: {magic.name}
                     </option>
                  {/each}
               </select>
            </div>

            <div class="creation-dropdwn">
               <h3>Attribute Points</h3>
               <select bind:value={selectedAttribute}>
                  <option value="" disabled selected hidden>Choose an option</option>
                  {#each PRIORITY_TABLES.attributes as attr}
                     <option
                        value={attr.priority}
                        disabled={usedPriorities.includes(attr.priority) &&
                           attr.priority !== selectedAttribute}
                     >
                        {attr.priority}: {attr.points}
                     </option>
                  {/each}
               </select>
            </div>

            <div class="creation-dropdwn">
               <h3>Skill Points</h3>
               <select bind:value={selectedSkill}>
                  <option value="" disabled selected hidden>Choose an option</option>
                  {#each PRIORITY_TABLES.skills as skill}
                     <option
                        value={skill.priority}
                        disabled={usedPriorities.includes(skill.priority) &&
                           skill.priority !== selectedSkill}
                     >
                        {skill.priority}: {skill.points}
                     </option>
                  {/each}
               </select>
            </div>

            <div class="creation-dropdwn">
               <h3>Resources</h3>
               <select bind:value={selectedResource}>
                  <option value="" disabled selected hidden>Choose an option</option>
                  {#each PRIORITY_TABLES.resources as resource}
                     <option
                        value={resource.priority}
                        disabled={usedPriorities.includes(resource.priority) &&
                           resource.priority !== selectedResource}
                     >
                        {resource.priority}: {resource.points}
                     </option>
                  {/each}
               </select>
            </div>
         </div>
      </ItemSheetComponent>

      <!-- Action Buttons -->
      <ItemSheetComponent>
         <div class="character-creation-buttonpanel">
            <button type="button" onclick={handleRandomize}>
               <i class="fas fa-dice"></i>
               Randomize
            </button>

            <button type="button" onclick={handleClear}>
               <i class="fas fa-eraser"></i>
               Clear
            </button>

            <button type="button" onclick={onCancel}>
               <i class="fas fa-times"></i>
               Cancel
            </button>

            <button type="submit" disabled={!canCreate}>
               <i class="fas fa-check"></i>
               Create Character
            </button>
         </div>
      </ItemSheetComponent>
   </ItemSheetWrapper>
</form>
