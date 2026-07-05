<script lang="ts">
import { onDestroy, untrack } from "svelte";
import { localize } from "../../../services/utilities";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import Foldout from "./Foldout.svelte";
import SkillsActive from "./skills/SkillsActive.svelte";
import SkillsKnowledge from "./skills/SkillsKnowledge.svelte";
import SkillsLanguage from "./skills/SkillsLanguage.svelte";
import Inventory from "./inventory/Inventory.svelte";
import Garage from "./Garage.svelte";
import Matrix from "./Matrix.svelte";
import Grimoire from "./Grimoire.svelte";
import Augmentations from "./Augmentations.svelte";
import ActiveEffectsViewer from "../../common-components/ActiveEffectsViewer.svelte";
import RatsRace from "./rats-race/RatsRace.svelte";
import { REGISTER_TAB_FLAG, type RegisterTab, isRegisterTab, registerTabForItem } from "./registerTabs";

let { actor: _actor }: { actor: Actor } = $props();
const actor = untrack(() => _actor);
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
const activeTabStore = storeManager.GetFlagStore<RegisterTab>(actor, REGISTER_TAB_FLAG, "active");
const magic = storeManager.GetSimpleStatROStore(actor, "attributes.magic");
const isBurnedOut = storeManager.GetRWStore<boolean>(actor, "attributes.isBurnedOut");
storeManager.Subscribe(actor);
onDestroy(() => {
   Hooks.off("createItem", createHookId);
   Hooks.off("updateItem", updateHookId);
   Hooks.off("deleteItem", deleteHookId);
   storeManager.Unsubscribe(actor);
});

let skillItems = $state<any[]>([]);
let spellItems = $state<Item[]>([]);
let adeptPowerItems = $state<Item[]>([]);
let augmentationItems = $state<Item[]>([]);
let transactionItems = $state<Item[]>([]);
let magicItems = $state<Item[]>([]);
let cyberdeckItems = $state<Item[]>([]);
let matrixProgramItems = $state<Item[]>([]);

function rebuildRegisterItems() {
   const items = [...((actor as any).items ?? [])];
   skillItems = items.filter((item: Record<string, unknown>) => item.type === "skill");
   spellItems = items
      .filter((item: Item) => item.type === "spell")
      .sort((a: Item, b: Item) => (a.name ?? "").localeCompare(b.name ?? ""));
   adeptPowerItems = items
      .filter((item: Item) => item.type === "adeptpower")
      .sort((a: Item, b: Item) => (a.name ?? "").localeCompare(b.name ?? ""));
   augmentationItems = items
      .filter((item: Item) => item.type === "augmentation")
      .sort((a: Item, b: Item) => (a.name ?? "").localeCompare(b.name ?? ""));
   transactionItems = items
      .filter((item: Item) => item.type === "transaction")
      .sort((a: Item, b: Item) => (a.name ?? "").localeCompare(b.name ?? ""));
   magicItems = items.filter((item: Item) => item.type === "magic");
   cyberdeckItems = items.filter((item: Item) => item.type === "cyberdeck");
   matrixProgramItems = items
      .filter((item: Item) => item.type === "matrixprogram")
      .sort((a: Item, b: Item) => (a.name ?? "").localeCompare(b.name ?? ""));
}
rebuildRegisterItems();
const onItemChange = (item: any) => {
   if (item.parent?.id !== (actor as any).id && item.actor?.id !== (actor as any).id) return;
   rebuildRegisterItems();
};

const onItemCreate = (item: Item) => {
   onItemChange(item);
   const tab = registerTabForItem(item);
   if (tab) $activeTabStore = tab;
};

const createHookId = Hooks.on("createItem", onItemCreate);
const updateHookId = Hooks.on("updateItem", onItemChange);
const deleteHookId = Hooks.on("deleteItem", onItemChange);
function bySkillType(skillType: string) {
   return skillItems
      .filter((item: Record<string, unknown>) => (item.system as Record<string, unknown>)?.skillType === skillType)
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
         (a.name as string).localeCompare(b.name as string)
      );
}

const activeSkills = $derived(bySkillType("active"));
const knowledgeSkills = $derived(bySkillType("knowledge"));
const languageSkills = $derived(bySkillType("language"));
const isAwakened = $derived(
   $magic > 0 &&
   magicItems.length > 0 &&
   !$isBurnedOut,
);
const hasCyberdeck = $derived(cyberdeckItems.length > 0);
const hasMatrixTab = $derived(hasCyberdeck || matrixProgramItems.length > 0);
const hasAugmentationsTab = $derived(augmentationItems.length > 0);

$effect(() => {
   if (!isRegisterTab($activeTabStore)) $activeTabStore = "active";
   if (!isAwakened && $activeTabStore === "grimoire") $activeTabStore = "active";
   if (!hasMatrixTab && $activeTabStore === "matrix") $activeTabStore = "active";
   if (!hasAugmentationsTab && $activeTabStore === "augmentations") $activeTabStore = "active";
});
</script>

<Foldout label="Register">
   <div class="skills-component">
      <div class="skills-register">
         <button
            type="button"
            class="skills-register-tab"
            class:active={$activeTabStore === "active"}
            onclick={() => ($activeTabStore = "active")}
         ><span>Active</span></button>
         <button
            type="button"
            class="skills-register-tab"
            class:active={$activeTabStore === "knowledge"}
            onclick={() => ($activeTabStore = "knowledge")}
         ><span>Knowledge</span></button>
         <button
            type="button"
            class="skills-register-tab"
            class:active={$activeTabStore === "language"}
            onclick={() => ($activeTabStore = "language")}
         ><span>Language</span></button>
         {#if isAwakened}
            <button
               type="button"
               class="skills-register-tab"
               class:active={$activeTabStore === "grimoire"}
               onclick={() => ($activeTabStore = "grimoire")}
            ><span>Grimoire</span></button>
         {/if}
         <button
            type="button"
            class="skills-register-tab"
            class:active={$activeTabStore === "inventory"}
            onclick={() => ($activeTabStore = "inventory")}
         ><span>{localize(CONFIG.SR3E.INVENTORY.inventory)}</span></button>
         <button
            type="button"
            class="skills-register-tab"
            class:active={$activeTabStore === "garage"}
            onclick={() => ($activeTabStore = "garage")}
         ><span>{localize(CONFIG.SR3E.INVENTORY.garage)}</span></button>
         {#if hasMatrixTab}
            <button
               type="button"
               class="skills-register-tab"
               class:active={$activeTabStore === "matrix"}
               onclick={() => ($activeTabStore = "matrix")}
            ><span>{localize(CONFIG.SR3E.INVENTORY.matrix)}</span></button>
         {/if}
         {#if hasAugmentationsTab}
            <button
               type="button"
               class="skills-register-tab"
               class:active={$activeTabStore === "augmentations"}
               onclick={() => ($activeTabStore = "augmentations")}
            ><span>{localize(CONFIG.SR3E.INVENTORY.augmentations)}</span></button>
         {/if}
         <button
            type="button"
            class="skills-register-tab"
            class:active={$activeTabStore === "effects"}
            onclick={() => ($activeTabStore = "effects")}
         ><span>{localize(CONFIG.SR3E.INVENTORY.effects)}</span></button>
         <button
            type="button"
            class="skills-register-tab"
            class:active={$activeTabStore === "ratsrace"}
            onclick={() => ($activeTabStore = "ratsrace")}
         ><span>Rat's Race</span></button>
      </div>
      <div class="skills-content">
         <div class="skills-content-inner">
            {#if $activeTabStore === "active"}
               <SkillsActive {actor} skills={activeSkills} />
            {:else if $activeTabStore === "knowledge"}
               <SkillsKnowledge {actor} skills={knowledgeSkills} />
            {:else if $activeTabStore === "language"}
               <SkillsLanguage {actor} skills={languageSkills} />
            {:else if $activeTabStore === "grimoire" && isAwakened}
               <Grimoire {actor} items={[...spellItems, ...adeptPowerItems]} />
            {:else if $activeTabStore === "inventory"}
               <Inventory {actor} />
            {:else if $activeTabStore === "garage"}
               <Garage {actor} />
            {:else if $activeTabStore === "matrix" && hasMatrixTab}
               <Matrix {actor} cyberdecks={cyberdeckItems} programs={matrixProgramItems} />
            {:else if $activeTabStore === "augmentations" && hasAugmentationsTab}
               <Augmentations {actor} items={augmentationItems} />
            {:else if $activeTabStore === "effects"}
               <ActiveEffectsViewer document={actor} />
            {:else if $activeTabStore === "ratsrace"}
               <RatsRace {actor} transactions={transactionItems} />
            {/if}
         </div>
      </div>
   </div>
</Foldout>
