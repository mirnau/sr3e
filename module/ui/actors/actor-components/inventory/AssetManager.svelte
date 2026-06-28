<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../../../services/utilities";
import Foldout from "../Foldout.svelte";
import Inventory from "./Inventory.svelte";

const p = $props<{ actor: Actor }>();
const actor = untrack(() => p.actor);

let activeTab = $state<"inventory" | "garage" | "effects">("inventory");
</script>

<Foldout label={localize(CONFIG.SR3E.INVENTORY.inventory)}>
    <div class="skills-component">
        <div class="skills-register">
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
                {#if activeTab === "inventory"}
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
