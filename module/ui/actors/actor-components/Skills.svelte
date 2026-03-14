<script lang="ts">
import { onDestroy } from "svelte";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import SkillsActive from "./skills/SkillsActive.svelte";
import SkillsKnowledge from "./skills/SkillsKnowledge.svelte";
import SkillsLanguage from "./skills/SkillsLanguage.svelte";

let { actor }: { actor: Actor } = $props();
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

let activeTab = $state<"active" | "knowledge" | "language">("active");

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

<h1>Skills</h1>
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
   </div>
   <div class="skills-content">
      <div class="skills-content-inner">
         {#if activeTab === "active"}
            <SkillsActive {actor} skills={activeSkills} />
         {:else if activeTab === "knowledge"}
            <SkillsKnowledge {actor} skills={knowledgeSkills} />
         {:else}
            <SkillsLanguage {actor} skills={languageSkills} />
         {/if}
      </div>
   </div>
</div>
