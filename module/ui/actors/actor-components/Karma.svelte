<script lang="ts">
import { onDestroy, untrack } from "svelte";
import { derived } from "svelte/store";
import type { Readable } from "svelte/store";
import { localize } from "../../../services/utilities";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import { KarmaPoolBurnService } from "../../../services/karma/KarmaPoolBurnService";
import StatCard from "./StatCard.svelte";
import Foldout from "./Foldout.svelte";

let { actor: _actor }: { actor: Actor } = $props();
   const actor = untrack(() => _actor);
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

const localization = $derived(CONFIG.SR3E.KARMA);
const modal = $derived(CONFIG.SR3E.MODAL);

storeManager.Subscribe(actor);

const karmaPool = storeManager.GetSimpleStatROStore(actor, "karma.karmaPool");
const karmaPoolValue = storeManager.GetRWStore<number>(actor, "karma.karmaPool.value");
const goodKarmaStore = storeManager.GetRWStore<number>(actor, "karma.goodKarma");
const isShoppingState = storeManager.GetFlagStore<boolean>(actor, "isShoppingState", false);
const shoppingKarmaSession = storeManager.GetShallowStore<any>(actor, "shoppingKarmaSession", { active: false, stagedSpent: 0, attrSnapshot: {} });
const skillKarmaRegistry = storeManager.GetShallowStore<Record<string, { stagedSpent: number }>>(actor, "skillKarmaRegistry", {});

const goodKarmaDisplay: Readable<number> = derived(
   [isShoppingState, shoppingKarmaSession, skillKarmaRegistry, goodKarmaStore],
   ([$shopping, $session, $registry, $good]) => {
      if (!$shopping) return $good ?? 0;
      const attrSpend = $session?.active ? ($session.stagedSpent ?? 0) : 0;
      const skillSpend = Object.values($registry ?? {}).reduce((sum, s) => sum + s.stagedSpent, 0);
      return ($good ?? 0) - attrSpend - skillSpend;
   }
);

async function handleBurnKarmaPool() {
   const confirmed = await foundry.applications.api.DialogV2.confirm({
      window: { title: localize(localization?.burnKarmaPool) },
      content: `<p>${localize(localization?.burnKarmaPoolConfirm)}</p>`,
      yes: { label: localize(modal?.confirm) },
      no: { label: localize(modal?.decline) },
   });
   if (confirmed) KarmaPoolBurnService.Instance().burn(actor);
}

onDestroy(() => storeManager.Unsubscribe(actor));
</script>

{#if actor}
   <Foldout label={localize(localization.karma)}>
      <div class="stat-card-grid">
         <StatCard label={localize(localization.karmaPool)} onclick={($karmaPoolValue ?? 0) > 0 ? () => { void handleBurnKarmaPool(); } : undefined}>
            <span class="attribute-value">{$karmaPool ?? 0}</span>
         </StatCard>
         <StatCard label={localize(localization.goodKarma)}>
            <span class="attribute-value">{$goodKarmaDisplay ?? 0}</span>
         </StatCard>
      </div>
   </Foldout>
{:else}
   <p>Provide an actor to initialize Karma.</p>
{/if}
