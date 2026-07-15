<script lang="ts">
   import { CharacterCreationService } from "../../services/character-creation/CharacterCreationService";
   import {
      AGE_PHASES,
      PRIORITY_TABLES,
   } from "../../../types/character-creation";
   import { untrack } from "svelte";
   import SheetCard from "../common-components/SheetCard.svelte";
   import PackeryGrid from "../common-components/PackeryGrid.svelte";
   import LabeledDropdown from "../items/LabeledDropdown.svelte";
   import LabeledBoolean from "../items/LabeledBoolean.svelte";
   import { pickImagePath } from "../../services/utilities";
   import AttributeRandomizerComponent from "./AttributeRandomizerComponent.svelte";
   import type { AttributeValues } from "../../services/character-creation/AttributeRandomizerService";
   import SkillCategoryChecklist from "./SkillCategoryChecklist.svelte";
   import type { SkillSelection } from "../../services/character-creation/SkillRandomizerService";

   const { actorName: _actorName, onSubmit, onCancel } = $props<{
      actorName: string;
      config: typeof CONFIG.SR3E;
      onSubmit: (result: any) => void;
      onCancel: () => void;
   }>();

   const actorName = untrack(() => _actorName);
   const creationService = CharacterCreationService.Instance();
   let characterName = $state(actorName);
   let characterAge = $state(25);
   let characterHeight = $state(175);
   let characterWeight = $state(75);
   let selectedMetatype = $state("");
   let selectedMagic = $state("");
   let selectedAttribute = $state("");
   let selectedSkill = $state("");
   let selectedResource = $state("");
   let extendedRandomization = $state(false);
   let burnUnusedPoints = $state(false);
   let generatedAttributes = $state<AttributeValues | null>(null);
   let activeSkillSelections = $state<SkillSelection[]>([]);
   let knowledgeSkillSelections = $state<SkillSelection[]>([]);
   let languageSkillSelections = $state<SkillSelection[]>([]);
   let skillsResetKey = $state(0);
   const skillSelections = $derived([
      ...activeSkillSelections,
      ...knowledgeSkillSelections,
      ...languageSkillSelections,
   ]);
   const metatypeOptions = creationService.getMetatypes();
   const magicOptions = creationService.getMagics();
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
   const defaultCharacterIcon = "systems/sr3e/textures/svgrepo/person-circle-svgrepo-com.svg";
   const metatypeImage = $derived(metatypeItem?.img || defaultCharacterIcon);
   const metatypeName = $derived(metatypeItem?.name || "");

   let customImage = $state("");
   const characterImage = $derived(customImage || metatypeImage);

   async function handleImageClick() {
      customImage = await pickImagePath(characterImage);
   }

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

   $effect(() => {
      selectedMetatype;
      selectedAttribute;
      generatedAttributes = null;
   });
   function handleSubmit(event: Event) {
      event.preventDefault();
      onSubmit({
         name: characterName,
         img: characterImage,
         metatypeId: selectedMetatype,
         magicId: selectedMagic,
         attributePriority: selectedAttribute,
         skillPriority: selectedSkill,
         resourcePriority: selectedResource,
         age: characterAge,
         height: characterHeight,
         weight: characterWeight,
         generatedAttributes: generatedAttributes ?? undefined,
         skillSelections: skillSelections.length > 0 ? skillSelections : undefined,
         burnUnusedPoints: extendedRandomization && burnUnusedPoints ? true : undefined,
      });
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
      if (metaOpts.length === 0 || magicOpts.length === 0) {
         return;
      }

      selectedMetatype =
         metaOpts[Math.floor(Math.random() * metaOpts.length)].foundryitemid;
      selectedMagic =
         magicOpts[Math.floor(Math.random() * magicOpts.length)].foundryitemid;
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
      customImage = "";
      selectedMetatype = "";
      selectedMagic = "";
      selectedAttribute = "";
      selectedSkill = "";
      selectedResource = "";
      characterAge = 25;
      characterHeight = 175;
      characterWeight = 75;
      clearSkillSelections();
      generatedAttributes = null;
      burnUnusedPoints = false;
   }

   // Skills are randomized against final attribute values, so clearing attributes
   // invalidates any skill roll — cascade the clear and hide the skill sections again.
   function clearSkillSelections() {
      activeSkillSelections = [];
      knowledgeSkillSelections = [];
      languageSkillSelections = [];
      skillsResetKey++;
   }

   function handleExtendedRandomizationChange(enabled: boolean) {
      extendedRandomization = enabled;
      if (!enabled) {
         clearSkillSelections();
         generatedAttributes = null;
         burnUnusedPoints = false;
      }
   }
</script>

<form onsubmit={handleSubmit}>
   <PackeryGrid>
      <SheetCard>
         <div class="image-mask">
            <img
               src={characterImage}
               role="presentation"
               data-edit="img"
               title={metatypeName}
               alt={metatypeName}
               onclick={handleImageClick}
            />
         </div>
         <div class="large-input-wrapper">
            <div class="large-input-background"></div>
            <input
               class="large"
               type="text"
               bind:value={characterName}
               placeholder="Enter character name"
            />
         </div>
      </SheetCard>
      <SheetCard>
         <div class="stat-grid single-column">
            <div class="stat-card stat-field-card labeled-slider">
               <div class="stat-card-background"></div>
               <div class="title-container">
                  <h4 class="no-margin uppercase">Age: {characterAge} ({currentPhase()})</h4>
               </div>
               <div class="slider-wrapper">
                  <div class="slider-track"></div>
                  <input
                     type="range"
                     min={ageMin}
                     max={ageMax}
                     step="1"
                     bind:value={characterAge}
                  />
               </div>
            </div>

            <div class="stat-card stat-field-card labeled-slider">
               <div class="stat-card-background"></div>
               <div class="title-container">
                  <h4 class="no-margin uppercase">Height: {characterHeight} cm</h4>
               </div>
               <div class="slider-wrapper">
                  <div class="slider-track"></div>
                  <input
                     type="range"
                     min={(metatypeItem?.system as any)?.physical?.height?.min ?? 0}
                     max={(metatypeItem?.system as any)?.physical?.height?.max ?? 200}
                     step="1"
                     bind:value={characterHeight}
                  />
               </div>
            </div>

            <div class="stat-card stat-field-card labeled-slider">
               <div class="stat-card-background"></div>
               <div class="title-container">
                  <h4 class="no-margin uppercase">Weight: {characterWeight} kg</h4>
               </div>
               <div class="slider-wrapper">
                  <div class="slider-track"></div>
                  <input
                     type="range"
                     min={(metatypeItem?.system as any)?.physical?.weight?.min ?? 0}
                     max={(metatypeItem?.system as any)?.physical?.weight?.max ?? 200}
                     step="1"
                     bind:value={characterWeight}
                  />
               </div>
            </div>
         </div>
      </SheetCard>
      <SheetCard>
         <div class="title-container">
            <h4 class="no-margin uppercase">Priority</h4>
         </div>
         <div class="stat-grid single-column">
            <LabeledDropdown
               key="metatype"
               label="Metatype"
               value={selectedMetatype}
               options={metatypeOptions.map((meta) => ({
                  value: meta.foundryitemid,
                  label: `${meta.priority}: ${meta.name}`,
               }))}
               onUpdate={(val) => (selectedMetatype = val)}
            />

            <div class="stat-card stat-field-card labeled-field-card">
               <div class="stat-card-background"></div>
               <div class="title-container">
                  <h4 class="no-margin uppercase">Magic Tradition</h4>
               </div>
               <div class="select-wrapper">
                  <div class="select-background"></div>
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
            </div>

            <div class="stat-card stat-field-card labeled-field-card">
               <div class="stat-card-background"></div>
               <div class="title-container">
                  <h4 class="no-margin uppercase">Attribute Points</h4>
               </div>
               <div class="select-wrapper">
                  <div class="select-background"></div>
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
            </div>

            <div class="stat-card stat-field-card labeled-field-card">
               <div class="stat-card-background"></div>
               <div class="title-container">
                  <h4 class="no-margin uppercase">Skill Points</h4>
               </div>
               <div class="select-wrapper">
                  <div class="select-background"></div>
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
            </div>

            <div class="stat-card stat-field-card labeled-field-card">
               <div class="stat-card-background"></div>
               <div class="title-container">
                  <h4 class="no-margin uppercase">Resources</h4>
               </div>
               <div class="select-wrapper">
                  <div class="select-background"></div>
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

            <LabeledBoolean
               key="extendedRandomization"
               label="Extended Randomization"
               value={extendedRandomization}
               onUpdate={handleExtendedRandomizationChange}
            />

            {#if extendedRandomization}
               <LabeledBoolean
                  key="burnUnusedPoints"
                  label="Burn Unused Points"
                  value={burnUnusedPoints}
                  onUpdate={(val) => (burnUnusedPoints = val)}
               />
            {/if}

            <div class="character-creation-buttonpanel">
               <button type="button" onclick={handleRandomize}>
                  <i class="fas fa-dice"></i>
                  Randomize
               </button>

               <button type="button" onclick={handleClear}>
                  <i class="fas fa-eraser"></i>
                  Clear
               </button>
            </div>
         </div>
      </SheetCard>
      {#if extendedRandomization}
         <SheetCard>
            <div class="title-container">
               <h4 class="no-margin uppercase">Attributes</h4>
            </div>
            <AttributeRandomizerComponent
               metatypeId={selectedMetatype}
               attributePriority={selectedAttribute}
               bind:generatedAttributes
               onRandomize={clearSkillSelections}
               onClear={clearSkillSelections}
            />
         </SheetCard>
         {#if generatedAttributes}
            <SheetCard>
               {#key skillsResetKey}
                  <SkillCategoryChecklist
                     category="active"
                     label="Active"
                     magicId={selectedMagic}
                     skillPriority={selectedSkill}
                     {generatedAttributes}
                     bind:skillSelections={activeSkillSelections}
                  />
               {/key}
            </SheetCard>
            <SheetCard>
               {#key skillsResetKey}
                  <SkillCategoryChecklist
                     category="knowledge"
                     label="Knowledge"
                     magicId={selectedMagic}
                     skillPriority={selectedSkill}
                     {generatedAttributes}
                     bind:skillSelections={knowledgeSkillSelections}
                  />
               {/key}
            </SheetCard>
            <SheetCard>
               {#key skillsResetKey}
                  <SkillCategoryChecklist
                     category="language"
                     label="Language"
                     magicId={selectedMagic}
                     skillPriority={selectedSkill}
                     {generatedAttributes}
                     bind:skillSelections={languageSkillSelections}
                  />
               {/key}
            </SheetCard>
         {/if}
      {/if}
      <SheetCard>
         <div class="character-creation-buttonpanel">
            <button type="button" onclick={onCancel}>
               <i class="fas fa-times"></i>
               Cancel
            </button>

            <button type="submit" class="submit" disabled={!canCreate}>
               <i class="fas fa-check"></i>
               Create Character
            </button>
         </div>
      </SheetCard>
   </PackeryGrid>
</form>
