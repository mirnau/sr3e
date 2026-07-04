<script lang="ts">
import { onDestroy, untrack } from "svelte";
import { localize } from "../../../services/utilities";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import GadgetViewer from "../../common-components/GadgetViewer.svelte";
import JournalViewer from "../../common-components/JournalViewer.svelte";
import Inventory from "../actor-components/inventory/Inventory.svelte";
import { MECHANICAL_REGISTER_TAB_FLAG, isMechanicalTab, type MechanicalTab } from "./mechanicalTabs";

const p = $props<{ actor: Actor }>();
const actor = untrack(() => p.actor);
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;
const activeTabStore = storeManager.GetFlagStore<MechanicalTab>(actor, MECHANICAL_REGISTER_TAB_FLAG, "inventory");
storeManager.Subscribe(actor);
onDestroy(() => storeManager.Unsubscribe(actor));

$effect(() => {
    if (!isMechanicalTab($activeTabStore)) $activeTabStore = "inventory";
});
</script>

<div class="skills-component">
    <div class="skills-register">
        <button
            type="button"
            class="skills-register-tab"
            class:active={$activeTabStore === "inventory"}
            onclick={() => ($activeTabStore = "inventory")}
        ><span>{localize(CONFIG.SR3E.INVENTORY.inventory)}</span></button>
        <button
            type="button"
            class="skills-register-tab"
            class:active={$activeTabStore === "upgrades"}
            onclick={() => ($activeTabStore = "upgrades")}
        ><span>{localize(CONFIG.SR3E.MECHANICAL.upgrades)}</span></button>
        <button
            type="button"
            class="skills-register-tab"
            class:active={$activeTabStore === "journal"}
            onclick={() => ($activeTabStore = "journal")}
        ><span>{localize(CONFIG.SR3E.MECHANICAL.journal)}</span></button>
    </div>
    <div class="skills-content">
        <div class="skills-content-inner">
            {#if $activeTabStore === "inventory"}
                <Inventory {actor} />
            {:else if $activeTabStore === "upgrades"}
                <GadgetViewer document={actor} />
            {:else if $activeTabStore === "journal"}
                <JournalViewer document={actor} />
            {/if}
        </div>
    </div>
</div>
