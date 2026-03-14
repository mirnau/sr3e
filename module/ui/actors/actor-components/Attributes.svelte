<script lang="ts">
import { onDestroy } from "svelte";
import { localize } from "../../../services/utilities";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import type SR3EActor from "../../../documents/SR3EActor";
import AttributeCard from "./AttributeCard.svelte";

let { actor }: { actor: SR3EActor } = $props();
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

let attributes = $derived(actor?.system?.attributes || {});
let attributeKeys = $derived(Object.keys(attributes).slice(0, 7));

const localization = $derived(CONFIG.SR3E.ATTRIBUTES);

function createAttributeSumStore(attrPath: string) {
   const valueStore = storeManager.GetRWStore<number>(actor, `${attrPath}.value`);
   const modifierStore = storeManager.GetRWStore<number>(actor, `${attrPath}.modifier`);
   return storeManager.GetSumROStore([valueStore, modifierStore]);
}

storeManager.Subscribe(actor);

const intelligence = createAttributeSumStore("attributes.intelligence");
const quickness = createAttributeSumStore("attributes.quickness");
const reaction = createAttributeSumStore("attributes.reaction");

const isAwakened = $derived(
   actor.items.some((item: any) => item.type === "magic") &&
      !actor.system?.attributes?.magic?.isBurnedOut
);

onDestroy(() => storeManager.Unsubscribe(actor));

$effect(() => {
   const intelSum = $intelligence;
   const quickSum = $quickness;
   const reactionVal = Math.floor((intelSum + quickSum) * 0.5);
   const reactionValueStore = storeManager.GetRWStore<number>(actor, "attributes.reaction.value");
   reactionValueStore.set(reactionVal);
});

</script>

<h1>{localize(localization?.attributes)}</h1>
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
