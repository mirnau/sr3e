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
import Grimoire from "./Grimoire.svelte";
import ActiveEffectsViewer from "../../common-components/ActiveEffectsViewer.svelte";

let { actor: _actor }: { actor: Actor } = $props();
const actor = untrack(() => _actor);
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

let activeTab = $state<"active" | "knowledge" | "language" | "grimoire" | "inventory" | "garage" | "effects" | "ratsrace">("active");
const magic = storeManager.GetSimpleStatROStore(actor, "attributes.magic");

storeManager.Subscribe(actor);
onDestroy(() => {
   Hooks.off("createItem", createHookId);
   Hooks.off("updateItem", updateHookId);
   Hooks.off("deleteItem", deleteHookId);
   storeManager.Unsubscribe(actor);
});

let skillItems = $state<any[]>([]);
let spellItems = $state<Item[]>([]);

function rebuildRegisterItems() {
   skillItems = [...((actor as any).items ?? [])].filter((item: Record<string, unknown>) => item.type === "skill");
   spellItems = [...((actor as any).items ?? [])]
      .filter((item: Item) => item.type === "spell")
      .sort((a: Item, b: Item) => (a.name ?? "").localeCompare(b.name ?? ""));
}

rebuildRegisterItems();

const onItemChange = (item: any) => {
   if (item.parent?.id !== (actor as any).id) return;
   rebuildRegisterItems();
};

const createHookId = Hooks.on("createItem", onItemChange);
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
   actor.items.some((item: any) => item.type === "magic") &&
   !actor.system?.attributes?.magic?.isBurnedOut,
);

$effect(() => {
   if (!isAwakened && activeTab === "grimoire") activeTab = "active";
});
</script>

<Foldout label="Register">
   <div class="skills-component">
      <div class="skills-register">
         <button
            type="button"
            class="skills-register-tab"
            class:active={activeTab === "active"}
            onclick={() => (activeTab = "active")}
         ><span>Active</span></button>
         <button
            type="button"
            class="skills-register-tab"
            class:active={activeTab === "knowledge"}
            onclick={() => (activeTab = "knowledge")}
         ><span>Knowledge</span></button>
         <button
            type="button"
            class="skills-register-tab"
            class:active={activeTab === "language"}
            onclick={() => (activeTab = "language")}
         ><span>Language</span></button>
         {#if isAwakened}
            <button
               type="button"
               class="skills-register-tab"
               class:active={activeTab === "grimoire"}
               onclick={() => (activeTab = "grimoire")}
            ><span>Grimoire</span></button>
         {/if}
         <button
            type="button"
            class="skills-register-tab"
            class:active={activeTab === "inventory"}
            onclick={() => (activeTab = "inventory")}
         ><span>{localize(CONFIG.SR3E.INVENTORY.inventory)}</span></button>
         <button
            type="button"
            class="skills-register-tab"
            class:active={activeTab === "garage"}
            onclick={() => (activeTab = "garage")}
         ><span>{localize(CONFIG.SR3E.INVENTORY.garage)}</span></button>
         <button
            type="button"
            class="skills-register-tab"
            class:active={activeTab === "effects"}
            onclick={() => (activeTab = "effects")}
         ><span>{localize(CONFIG.SR3E.INVENTORY.effects)}</span></button>
         <button
            type="button"
            class="skills-register-tab"
            class:active={activeTab === "ratsrace"}
            onclick={() => (activeTab = "ratsrace")}
         ><span>Rat's Race</span></button>
      </div>
      <div class="skills-content">
         <div class="skills-content-inner">
            {#if activeTab === "active"}
               <SkillsActive {actor} skills={activeSkills} />
            {:else if activeTab === "knowledge"}
               <SkillsKnowledge {actor} skills={knowledgeSkills} />
            {:else if activeTab === "language"}
               <SkillsLanguage {actor} skills={languageSkills} />
            {:else if activeTab === "grimoire" && isAwakened}
               <Grimoire {actor} spells={spellItems} />
            {:else if activeTab === "inventory"}
               <Inventory {actor} />
            {:else if activeTab === "garage"}
               <p>{localize(CONFIG.SR3E.INVENTORY.garage)}</p>
            {:else if activeTab === "effects"}
               <ActiveEffectsViewer document={actor} />
            {:else if activeTab === "ratsrace"}
               <p>Rat's Race</p>
            {/if}
         </div>
      </div>
   </div>
</Foldout>
