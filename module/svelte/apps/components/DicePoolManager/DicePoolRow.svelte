<script>
   import { onDestroy, onMount } from "svelte";
   import { localize } from "../../../../services/utilities.js";
   import { StoreManager } from "../../../svelteHelpers/StoreManager.svelte.js";

   let { actor, config, OnCommitStatusChange, onmount } = $props();
   const isMagician = actor.items.some((i) => i.type === "metatype") && actor.system.attributes.magic.isBurnedOut;

   let attributes = actor.system.attributes;

   onMount(() => {
      if (onmount) {
         onmount({
            CommitSelected,
            Select,
            Deselect,
            get readyForCommit() {
               return $readyForCommit;
            },
         });
      }
   });

   let storeManager = StoreManager.Subscribe(actor);
   onDestroy(() => {
      StoreManager.Unsubscribe(actor);
   });

   let intelligenceStore = storeManager.GetCompositeStore("attributes.intelligence", ["mod", "value", "meta"]);
   let quicknessStore = storeManager.GetCompositeStore("attributes.quickness", ["mod", "value", "meta"]);
   let willpowerStore = storeManager.GetCompositeStore("attributes.willpower", ["mod", "value", "meta"]);
   let charismaStore = storeManager.GetCompositeStore("attributes.charisma", ["mod", "value", "meta"]);

   let karmaPoolCeilingStore = storeManager.GetStore("karma.karmaPoolCeiling");
   let karmaPoolStore = storeManager.GetStore("karma.karmaPool");
   let combatPoolStore = storeManager.GetStore("dicePools.combat.value");
   let astralPoolStore = storeManager.GetStore("dicePools.astral.value");
   let hackingPoolStore = storeManager.GetStore("dicePools.hacking.value");
   let controlPoolStore = storeManager.GetStore("dicePools.control.value");
   let spellPoolStore = storeManager.GetStore("dicePools.spell.value");
   let readyForCommit = storeManager.GetFlagStore(actor.id, "sr3e.actor.poolcommit");

   async function CommitSelected() {
      if ($readyForCommit) {
         actor.RefreshKarmaPool();
         actor.RefreshCombatPool();
         actor.RefreshHackingPool();

         if (isMagician) {
            actor.RefreshAstralPool();
            actor.RefreshSpellPool();
         }

         OnCommitStatusChange();
         $readyForCommit = false;
      }
   }

   $effect(() => {
      let _ = $readyForCommit;
      OnCommitStatusChange();
   });

   function Select() {
      $readyForCommit = true;
      OnCommitStatusChange();
   }

   function Deselect() {
      $readyForCommit = false;
      OnCommitStatusChange();
   }
</script>

<tr>
   <td class="portrait-cell">
      <img src={actor.img} alt="portrait" />
   </td>

   <td>
      <h3>{actor.name}</h3>
   </td>

   <td>
      <h3>{$karmaPoolStore} / {$karmaPoolCeilingStore}</h3>
      <button aria-label={localize(config.storytellerscreen.refreshkarmapool)} onclick={() => actor.RefreshKarmaPool()}>
         {localize(config.storytellerscreen.refresh)} <i class="fa-solid fa-dharmachakra"></i>
      </button>
   </td>

   <td>
      <h3>
         {$combatPoolStore} / {Math.floor(($quicknessStore.sum + $intelligenceStore.sum + $willpowerStore.sum) * 0.5)}
      </h3>
      <button
         aria-label={localize(config.storytellerscreen.refreshcombatpool)}
         onclick={() => actor.RefreshCombatPool()}
      >
         {localize(config.storytellerscreen.refresh)} <i class="fa-solid fa-person-rifle"></i>
      </button>
   </td>

   <td>
      <h3>{$astralPoolStore} / {Math.floor(($intelligenceStore.sum + $willpowerStore.sum) * 0.5)}</h3>
      <button
         aria-label={localize(config.storytellerscreen.refreshastralpool)}
         onclick={() => actor.RefreshAstralPool()}
      >
         {localize(config.storytellerscreen.refresh)} <i class="fa-solid fa-star"></i>
      </button>
   </td>

   <td>
      <h3>{$spellPoolStore} / {Math.floor(($intelligenceStore.sum + $willpowerStore.sum) * 0.5)}</h3>
      <button aria-label={localize(config.storytellerscreen.refreshspellpool)} onclick={() => actor.RefreshSpellPool()}>
         {localize(config.storytellerscreen.refresh)}<i class="fa-solid fa-wand-sparkles"></i>
      </button>
   </td>

   <td>
      <h3>{$controlPoolStore} / {"TODO"}</h3>
      <button
         aria-label={localize(config.storytellerscreen.refreshcontrolpool)}
         onclick={() => actor.RefreshControlPool()}
      >
         {localize(config.storytellerscreen.refresh)} <i class="fa-solid fa-robot"></i>
      </button>
   </td>

   <td>
      <h3>{$hackingPoolStore} / {"TODO"}</h3>
      <button
         aria-label={localize(config.storytellerscreen.refreshhackingpool)}
         onclick={() => actor.RefreshHackingPool()}
      >
         {localize(config.storytellerscreen.refresh)} <i class="fa-solid fa-computer"></i>
      </button>
   </td>

   <td>
      <input
         type="checkbox"
         checked={$readyForCommit}
         onchange={(e) => {
            $readyForCommit = e.target.checked;
         }}
      />
   </td>
</tr>
