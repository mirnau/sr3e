<script lang="ts">
import { onDestroy, untrack } from "svelte";
import { localize } from "../../../services/utilities";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import type SR3EActor from "../../../documents/SR3EActor";
import StatCard from "./StatCard.svelte";
import { buildDicePoolSetup } from "../../../services/combat/procedures/simpleSetups";
import { executeProcedure } from "../../../services/combat/orchestration/executeProcedure";
import { getComposerState, openComposer } from "../../../services/combat/procedures/composerService.svelte";
import Foldout from "./Foldout.svelte";

const p = $props<{ actor: SR3EActor }>();
const actor = untrack(() => p.actor);
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

const composerState = getComposerState((actor as any).id);

const localization = $derived(CONFIG.SR3E.DICE_POOLS);

storeManager.Subscribe(actor);

const intelligence = storeManager.GetSimpleStatROStore(actor, "attributes.intelligence");
const willpower = storeManager.GetSimpleStatROStore(actor, "attributes.willpower");
const charisma = storeManager.GetSimpleStatROStore(actor, "attributes.charisma");
const quickness = storeManager.GetSimpleStatROStore(actor, "attributes.quickness");
const reaction = storeManager.GetSimpleStatROStore(actor, "attributes.reaction");
const magic = storeManager.GetSimpleStatROStore(actor, "attributes.magic");

const combatValueMod = storeManager.GetSimpleStatROStore(actor, "dicePools.combat");
const combatSpent = storeManager.GetRWStore<number>(actor, "dicePools.combat.spent");
const combatValue = storeManager.GetRWStore<number>(actor, "dicePools.combat.value");

const controlValueMod = storeManager.GetSimpleStatROStore(actor, "dicePools.control");
const controlSpent = storeManager.GetRWStore<number>(actor, "dicePools.control.spent");
const controlValue = storeManager.GetRWStore<number>(actor, "dicePools.control.value");

const hackingValueMod = storeManager.GetSimpleStatROStore(actor, "dicePools.hacking");
const hackingSpent = storeManager.GetRWStore<number>(actor, "dicePools.hacking.spent");
const hackingValue = storeManager.GetRWStore<number>(actor, "dicePools.hacking.value");

const astralValueMod = storeManager.GetSimpleStatROStore(actor, "dicePools.astral");
const astralSpent = storeManager.GetRWStore<number>(actor, "dicePools.astral.spent");
const astralValue = storeManager.GetRWStore<number>(actor, "dicePools.astral.value");

const spellValueMod = storeManager.GetSimpleStatROStore(actor, "dicePools.spell");
const spellSpent = storeManager.GetRWStore<number>(actor, "dicePools.spell.spent");
const spellValue = storeManager.GetRWStore<number>(actor, "dicePools.spell.value");

const combatAvail = $derived(Math.max(0, $combatValueMod - $combatSpent));
const controlAvail = $derived(Math.max(0, $controlValueMod - $controlSpent));
const hackingAvail = $derived(Math.max(0, $hackingValueMod - $hackingSpent));
const astralAvail = $derived(Math.max(0, $astralValueMod - $astralSpent));
const spellAvail = $derived(Math.max(0, $spellValueMod - $spellSpent));

let hasMatrixInterface = $state(false);
let hasRiggerInterface = $state(false);

const isShoppingState = storeManager.GetFlagStore<boolean>(actor, "isShoppingState", false);
const attributePreview = storeManager.GetShallowStore<any>(actor, "shoppingAttributePreview", { active: false, values: {} });

const isAwakened = $derived(
    $magic > 0 &&
    actor.items.some((item: any) => item.type === "magic") &&
    !actor.system?.attributes?.magic?.isBurnedOut,
);

onDestroy(() => storeManager.Unsubscribe(actor));

function selectPool(key: string, available: number): void {
    if (composerState.selectedPoolKey === key) {
        composerState.selectedPoolKey = null;
        composerState.poolAvailable = 0;
    } else {
        composerState.selectedPoolKey = key;
        composerState.poolAvailable = available;
    }
}

function onPoolCardClick(e: MouseEvent, poolKey: string, title: string, available: number): void {
    if (composerState?.isOpen) {
        selectPool(poolKey, available);
        return;
    }
    const setup = buildDicePoolSetup(actor, poolKey, title);
    if (e.shiftKey) {
        openComposer(setup, actor);
    } else {
        void executeProcedure(setup, actor as never);
    }
}

function poolClass(key: string): string {
    if (!composerState?.isOpen) return "attribute-value button";
    if (composerState.selectedPoolKey === key) return "attribute-value button pool-active";
    return "attribute-value button pool-pick-me";
}

$effect(() => {
    const preview = (key: string, fallback: number) =>
        $isShoppingState ? ($attributePreview?.values?.[key] ?? fallback) : fallback;

    const int = preview("intelligence", $intelligence);
    const qck = preview("quickness", $quickness);
    const wil = preview("willpower", $willpower);
    const cha = preview("charisma", $charisma);
    const mag = preview("magic", $magic);

    controlValue.set(Math.floor((int + qck) * 0.5));
    combatValue.set(Math.floor((int + qck + wil) * 0.5));
    astralValue.set(Math.floor((int + cha + wil) * 0.5));
    spellValue.set(Math.floor((int + mag + wil) / 3));
});

$effect(() => {
    const deck = actor.items.find(
        (it: any) =>
            it?.type === "techinterface" &&
            (it.system?.subtype === "cyberdeck" || it.system?.subtype === "cyberterminal") &&
            it.getFlag?.("sr3e", "isEquipped"),
    );
    hasMatrixInterface = !!deck;
    hackingValue.set(
        deck ? Math.floor(($intelligence + Number(deck.system?.matrix?.mpcp ?? 0)) / 3) : 0,
    );
});

$effect(() => {
    const rcDeck = actor.items.find(
        (it: any) =>
            it?.type === "techinterface" &&
            it.system?.subtype === "rcdeck" &&
            it.getFlag?.("sr3e", "isEquipped"),
    );
    hasRiggerInterface = !!rcDeck;
    controlValue.set(
        rcDeck ? $reaction + Number(actor.getFlag?.("sr3e", "vcrRating") ?? 0) * 2 : 0,
    );
});
</script>

<Foldout label={localize(localization.dicePools)}>
    <div class="stat-card-grid">
        <StatCard label={localize(localization?.combat)} onclick={(e) => onPoolCardClick(e, "combat", localize(localization?.combat), combatAvail)}>
            <span class={poolClass("combat")}>{combatAvail}</span>
        </StatCard>

        {#if hasRiggerInterface}
            <StatCard label={localize(localization?.control)} onclick={(e) => onPoolCardClick(e, "control", localize(localization?.control), controlAvail)}>
                <span class={poolClass("control")}>{controlAvail}</span>
            </StatCard>
        {/if}

        {#if hasMatrixInterface}
            <StatCard label={localize(localization?.hacking)} onclick={(e) => onPoolCardClick(e, "hacking", localize(localization?.hacking), hackingAvail)}>
                <span class={poolClass("hacking")}>{hackingAvail}</span>
            </StatCard>
        {/if}

        {#if isAwakened}
            <StatCard label={localize(localization?.astral)} onclick={(e) => onPoolCardClick(e, "astral", localize(localization?.astral), astralAvail)}>
                <span class={poolClass("astral")}>{astralAvail}</span>
            </StatCard>
            <StatCard label={localize(localization?.spell)} onclick={(e) => onPoolCardClick(e, "spell", localize(localization?.spell), spellAvail)}>
                <span class={poolClass("spell")}>{spellAvail}</span>
            </StatCard>
        {/if}
    </div>
</Foldout>
