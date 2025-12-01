<script lang="ts">
   import Image from "../basic/Image.svelte";
   import ItemSheetComponent from "../basic/ItemSheetComponent.svelte";
   import ComboSearch from "../basic/ComboSearch.svelte";
   import { flags } from "@services/commonConsts.js";
   import { localize } from "@services/utilities.js";
   import { StoreManager } from "@sveltehelpers/StoreManager.svelte.js";
   import { onDestroy, onMount } from "svelte";
   import CharacterModel from "../../../../models/actor/CharacterModel.js";

   let { document, activeEffect, config, updateEffectsState } = $props();
   let disabled = $state(activeEffect.disabled);
   let duration = $state({ ...activeEffect.duration, value: 0 });
   let changes = $state([...activeEffect.changes]);
   let propertyOptions = $state([]);
   let name = $state(activeEffect.name);
   let originIsItem = $state(false);
   let origin = $state({});
   let target = $state("self");
   let isTransferable = $state(false);

   let storeManager = StoreManager.Subscribe(document);

   let nameStore = storeManager.GetShallowStore(document.id, `${activeEffect.id}:name`, activeEffect.name);
   let durationStore = storeManager.GetShallowStore(document.id, `${activeEffect.id}:duration`, activeEffect.duration);
   let disabledStore = storeManager.GetShallowStore(document.id, `${activeEffect.id}:disabled`, activeEffect.disabled);
   let targetStore = storeManager.GetShallowStore(document.id, `${activeEffect.id}:target`, target);

   onMount(async () => {
      origin = await foundry.utils.fromUuid(activeEffect.origin);
      originIsItem = origin instanceof Item;

      const storedName = $nameStore;
      const storedDuration = $durationStore;
      const storedDisabled = $disabledStore;

      const flagTarget = getProperty(activeEffect, `flags.${flags.sr3e}.target`);
      if (flagTarget) {
         target = flagTarget;
         $targetStore = target;
      }

      const baseDuration =
         JSON.stringify(storedDuration) !== JSON.stringify(activeEffect.duration)
            ? storedDuration
            : activeEffect.duration;

      duration = {
         ...baseDuration,
         value: baseDuration[baseDuration.type] ?? 0,
      };

      if (storedName !== activeEffect.name) name = storedName;
      if (storedDisabled !== activeEffect.disabled) disabled = storedDisabled;

      $nameStore = name;
      $disabledStore = disabled;
      $durationStore = duration;
   });

   onDestroy(() => {
      commitChanges();
      StoreManager.Unsubscribe(document);
   });

   function setDurationField(field, val) {
      duration = { ...duration, [field]: field === "value" ? +val : val };
      $durationStore = duration;
   }

   $effect(() => {
      $disabledStore = disabled;
   });

   $effect(() => {
      $nameStore = name;
   });

   $effect(() => {
      $targetStore = target;
   });

   let allowedPatterns = [];

   $effect(async () => {
      if (!origin?.toObject) return;

      let rawPaths = [];

      switch (target) {
         case "self": {
            allowedPatterns = ["system"];
            isTransferable = false;
            rawPaths = Object.keys(foundry.utils.flattenObject({ system: origin.toObject().system }));
            break;
         }
         case "character": {
            allowedPatterns = ["system.attributes", "system.dicePools", "system.movement", "system.karma"];
            isTransferable = true;
            const model = new CharacterModel({}, { parent: null });
            const raw = model.toObject();
            rawPaths = Object.keys(foundry.utils.flattenObject({ system: raw }));
            break;
         }
         case "vehicle": {
            throw new Error("Target 'vehicle' not yet supported in ActiveEffectsEditorApp.");
         }
         default: {
            DEBUG && LOG.warn(`Unhandled target type: ${target}`, [__FILE__, __LINE__]);
         }
      }

      const newOptions = rawPaths
         .filter((path) => allowedPatterns.some((p) => path.startsWith(p)) && path.endsWith(".mod"))
         .map((path) => ({
            value: path,
            label: getLocalizedPath(path),
         }))
         .sort((a, b) => a.label.localeCompare(b.label));

      if (JSON.stringify(newOptions) !== JSON.stringify(propertyOptions)) {
         propertyOptions = newOptions;
      }
   });

   function getLocalizedPath(path) {
      if (!path.startsWith("system.") || !path.endsWith(".mod")) return path;

      const configPath = path.replace(/^system\./, "").replace(/\.mod$/, "");
      const segments = configPath.split(".");

      const localizedSegments = segments.map((segment) => {
         const configValue = getProperty(config, `${segments[0]}.${segment}`);
         return configValue ? localize(configValue) : segment.charAt(0).toUpperCase() + segment.slice(1);
      });

      return localizedSegments.join(" > ");
   }

   function extractValue(value) {
      return value && typeof value === "object" && "value" in value ? value.value : value;
   }

   async function commitChanges() {
      const key = duration.type;
      const expandedDuration = {
         type: key,
         rounds: key === "rounds" ? duration.value : undefined,
         seconds: key === "seconds" ? duration.value : undefined,
         turns: key === "turns" ? duration.value : undefined,
         startTime: duration.startTime,
         startRound: duration.startRound,
         startTurn: duration.startTurn,
         combat: duration.combat,
      };

      await activeEffect.update(
         {
            name: extractValue(name),
            transfer: isTransferable,
            disabled,
            duration: expandedDuration,
            changes: [...changes],
            flags: {
               ...(activeEffect.flags ?? {}),
               [flags.sr3e]: {
                  ...(activeEffect.flags?.[flags.sr3e] ?? {}),
                  target,
               },
            },
         },
         { render: false }
      );
   }

   function addChange() {
      changes = [...changes, { key: "", mode: 1, value: "", priority: 0 }];
      commitChanges();
   }

   function updateChange(index, field, value) {
      const extractedValue = extractValue(value);
      changes = changes.map((c, i) => (i === index ? { ...c, [field]: extractedValue } : c));
      commitChanges();
   }

   function deleteChange(index) {
      changes.splice(index, 1);
      changes = [...changes];
      commitChanges();
   }
</script>

<div class="effects-editor">
   <ItemSheetComponent>
      <h3>{localize(config.effects.effectscomposer)}</h3>
      <div class="stat-grid single-column">
         <Image src={activeEffect.img} title={extractValue(name)} entity={activeEffect} />

         <div class="stat-card">
            <div class="stat-card-background"></div>
            <h4>{localize(config.effects.name)}:</h4>
            <input type="text" bind:value={name} onblur={commitChanges} />
         </div>

         <div class="stat-card">
            <div class="stat-card-background"></div>
            <h4>{localize(config.effects.target)}:</h4>
            <select bind:value={target} onchange={commitChanges}>
               <option value="self">self</option>
               <option value="item" disabled>item</option>
               <option value="character">character</option>
               <option value="vehicle" disabled>vehicle</option>
            </select>
         </div>

         <div class="stat-card">
            <div class="stat-card-background"></div>
            <h4>{localize(config.effects.disabled)}:</h4>
            <input type="checkbox" bind:checked={disabled} onchange={commitChanges} />
         </div>

         <div class="stat-card">
            <div class="stat-card-background"></div>
            <h4>{localize(config.effects.durationType)}:</h4>
            <select bind:value={duration.type} onchange={(e) => setDurationField("type", e.target.value)}>
               <option value="none">{localize(config.effects.permanent)}</option>
               <option value="turns">{localize(config.time.turns)}</option>
               <option value="rounds">{localize(config.time.rounds)}</option>
               <option value="seconds">{localize(config.time.seconds)}</option>
               <option value="minutes">{localize(config.time.minutes)}</option>
               <option value="hours">{localize(config.time.hours)}</option>
               <option value="days">{localize(config.time.days)}</option>
            </select>
         </div>

         {#if duration.type !== "none"}
            <div class="stat-card">
               <div class="stat-card-background"></div>
               <h4>{localize(config.effects.durationValue)}:</h4>
               <input
                  type="number"
                  bind:value={duration.value}
                  oninput={(e) => setDurationField("value", e.target.value)}
                  onblur={commitChanges}
               />
            </div>
         {/if}
      </div>
   </ItemSheetComponent>

   <ItemSheetComponent>
      <h1>{localize(config.effects.changesHeader)}</h1>
      <button onclick={addChange}>{localize(config.effects.addChange)}</button>

      <div class="table-wrapper">
         <table>
            <thead>
               <tr>
                  <th>{localize(config.effects.attributeKey)}</th>
                  <th>{localize(config.effects.changeMode)}</th>
                  <th>{localize(config.effects.value)}</th>
                  <th>{localize(config.effects.priority)}</th>
                  <th>{localize(config.effects.actions)}</th>
               </tr>
            </thead>
            <tbody>
               {#each changes as change, i}
                  <tr>
                     <td>
                        <div class="stat-card">
                           <div class="stat-card-background"></div>
                           <ComboSearch
                              options={propertyOptions}
                              placeholder={localize(config.effects.selectProperty)}
                              nomatchplaceholder={localize(config.effects.noMatch)}
                              bind:value={changes[i].key}
                              onselect={(e) => updateChange(i, "key", e.detail.value)}
                              css="table"
                           />
                        </div>
                     </td>
                     <td>
                        <div class="stat-card">
                           <div class="stat-card-background"></div>
                           <select
                              bind:value={change.mode}
                              onchange={(e) => updateChange(i, "mode", parseInt(e.target.value))}
                           >
                              {#each Object.entries(CONST.ACTIVE_EFFECT_MODES).filter(([label]) => label !== "CUSTOM" && label !== "MULTIPLY") as [label, val]}
                                 <option value={val}>{label}</option>
                              {/each}
                           </select>
                        </div>
                     </td>
                     <td>
                        <div class="stat-card">
                           <div class="stat-card-background"></div>
                           <input
                              type="text"
                              value={change.value}
                              oninput={(e) => updateChange(i, "value", e.target.value)}
                           />
                        </div>
                     </td>
                     <td>
                        <div class="stat-card">
                           <div class="stat-card-background"></div>
                           <input
                              type="number"
                              value={change.priority}
                              oninput={(e) => updateChange(i, "priority", +e.target.value)}
                           />
                        </div>
                     </td>
                     <td>
                        <button onclick={() => deleteChange(i)}>🗑</button>
                     </td>
                  </tr>
               {/each}
            </tbody>
         </table>
      </div>
   </ItemSheetComponent>
</div>
