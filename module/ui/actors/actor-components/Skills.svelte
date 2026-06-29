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

let { actor: _actor }: { actor: Actor } = $props();
   const actor = untrack(() => _actor);
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

let activeTab = $state<"active" | "knowledge" | "language" | "inventory" | "garage" | "effects">("active");

storeManager.Subscribe(actor);
onDestroy(() => storeManager.Unsubscribe(actor));

const activeSkills = $derived(
   [...(actor.items ?? [])]
      .filter((item: Record<string, unknown>) => {
         const sys = item.system as Record<string, unknown>;
         return item.type === "skill" && sys?.skillType === "active";
      })
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
         (a.name as string).localeCompare(b.name as string)
      )
);

const knowledgeSkills = $derived(
   [...(actor.items ?? [])]
      .filter((item: Record<string, unknown>) => {
         const sys = item.system as Record<string, unknown>;
         return item.type === "skill" && sys?.skillType === "knowledge";
      })
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
         (a.name as string).localeCompare(b.name as string)
      )
);

const languageSkills = $derived(
   [...(actor.items ?? [])]
      .filter((item: Record<string, unknown>) => {
         const sys = item.system as Record<string, unknown>;
         return item.type === "skill" && sys?.skillType === "language";
      })
      .sort((a: Record<string, unknown>, b: Record<string, unknown>) =>
         (a.name as string).localeCompare(b.name as string)
      )
);

</script>

<Foldout label="Skills">
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
      </div>
      <div class="skills-content">
         <div class="skills-content-inner">
            {#if activeTab === "active"}
               <SkillsActive {actor} skills={activeSkills} />
            {:else if activeTab === "knowledge"}
               <SkillsKnowledge {actor} skills={knowledgeSkills} />
            {:else if activeTab === "language"}
               <SkillsLanguage {actor} skills={languageSkills} />
            {:else if activeTab === "inventory"}
               <Inventory {actor} />
            {:else if activeTab === "garage"}
               <p>{localize(CONFIG.SR3E.INVENTORY.garage)}</p>
            {:else}
               <p>{localize(CONFIG.SR3E.INVENTORY.effects)}</p>
            {/if}
         </div>
      </div>
   </div>
</Foldout>
