<script lang="ts">
import { onDestroy, untrack } from "svelte";
import { localize } from "../../../services/utilities";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import type SR3EActor from "../../../documents/SR3EActor";
import AttributeCard from "./AttributeCard.svelte";
import Foldout from "./Foldout.svelte";

let { actor: _actor }: { actor: SR3EActor } = $props();
   const actor = untrack(() => _actor);
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

let attributes = $derived(actor?.system?.attributes || {});
let attributeKeys = $derived(Object.keys(attributes).slice(0, 7));

const localization = $derived(CONFIG.SR3E.ATTRIBUTES);

storeManager.Subscribe(actor);

const intelligence = storeManager.GetSimpleStatROStore(actor, "attributes.intelligence");
const quickness = storeManager.GetSimpleStatROStore(actor, "attributes.quickness");
const reaction = storeManager.GetSimpleStatROStore(actor, "attributes.reaction");
const magic = storeManager.GetSimpleStatROStore(actor, "attributes.magic");
const isBurnedOut = storeManager.GetRWStore<boolean>(actor, "attributes.isBurnedOut");

let magicItem = $state<Item | null>(null);

const isAwakened = $derived($magic > 0 && magicItem !== null && !$isBurnedOut);

onDestroy(() => {
   Hooks.off("createItem", createHookId);
   Hooks.off("updateItem", updateHookId);
   Hooks.off("deleteItem", deleteHookId);
   storeManager.Unsubscribe(actor);
});

function rebuildMagicItem(): void {
   magicItem = [...((actor as any).items ?? [])].find((item: Item) => item.type === "magic") ?? null;
}

function belongsToActor(item: any): boolean {
   const actorId = (actor as any).id;
   return item.parent?.id === actorId || item.actor?.id === actorId;
}

function onItemChange(item: any): void {
   if (!belongsToActor(item)) return;
   rebuildMagicItem();
}

rebuildMagicItem();

const createHookId = Hooks.on("createItem", onItemChange);
const updateHookId = Hooks.on("updateItem", onItemChange);
const deleteHookId = Hooks.on("deleteItem", onItemChange);

$effect(() => {
   const intelSum = $intelligence;
   const quickSum = $quickness;
   const reactionVal = Math.floor((intelSum + quickSum) * 0.5);
   const reactionValueStore = storeManager.GetRWStore<number>(actor, "attributes.reaction.value");
   reactionValueStore.set(reactionVal);
});

</script>

<Foldout label={localize(localization?.attributes)}>
   <div class="attribute-grid">
      {#each attributeKeys as key}
         <AttributeCard
            {actor}
            attributeKey={key}
            label={localize(localization[key as keyof typeof localization])}
         />
      {/each}

      {#if isAwakened}
         <AttributeCard
            {actor}
            attributeKey="magic"
            label={localize(localization?.magic)}
         />
      {/if}
   </div>
</Foldout>
