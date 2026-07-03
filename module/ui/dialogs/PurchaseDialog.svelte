<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../services/utilities";
import { availableCreditSticks } from "../../services/economy/subscriptionPayment";
import { commodityPrice, completePurchase, type PurchaseMode } from "../../services/economy/purchase";
import { persistRegisterTab, registerTabForItem } from "../actors/actor-components/registerTabs";
import CreditStickPicker from "../actors/actor-components/rats-race/CreditStickPicker.svelte";
import FuzzyFinder from "../common-components/FuzzyFinder.svelte";

const p = $props<{
   buyer: Actor;
   item: Item;
   seller?: Actor;
   onClose: () => void;
}>();

const buyer = untrack(() => p.buyer);
const item = untrack(() => p.item);
const seller = untrack(() => p.seller);

let price = $state(commodityPrice(item as any));
let mode = $state<PurchaseMode>(price === 0 ? "free" : "pay");
let creditorId = $state(seller?.id ?? "");
let interestPerMonth = $state(20);
let insufficientFunds = $state(false);

const sticks = $derived(
   availableCreditSticks([...((buyer as any).items ?? [])] as any[]) as unknown as Item[],
);

let creditorOptions = $state<{ value: string; label: string }[]>([]);
$effect(() => {
   const visible = (game as any).actors.filter((a: any) =>
      a.type === "character" && ((game as any).user.isGM || a.testUserPermission((game as any).user, "OBSERVER")),
   );
   // The seller is always a valid creditor for this specific transaction —
   // include them even though the buyer's client usually has no Observer
   // permission on the seller's actor, which is the common case here.
   const options = seller ? [seller, ...visible.filter((a: any) => a.id !== seller.id)] : visible;
   creditorOptions = options.map((a: any) => ({ value: a.id, label: a.name }));
});

async function registerInventoryTab() {
   const tab = registerTabForItem(item);
   if (tab) await persistRegisterTab(buyer, tab);
}

async function payWithStick(stick: Item) {
   const result = await completePurchase(buyer as any, item as any, "pay", { price, creditStick: stick as any }, seller as any);
   if (!result.ok) {
      insufficientFunds = true;
      return;
   }
   await registerInventoryTab();
   p.onClose();
}

async function confirmDebt() {
   await completePurchase(buyer as any, item as any, "debt", { price, creditorId, interestPerMonth }, seller as any);
   await registerInventoryTab();
   p.onClose();
}

async function confirmFree() {
   await completePurchase(buyer as any, item as any, "free", { price: 0 }, seller as any);
   await registerInventoryTab();
   p.onClose();
}
</script>

<h2>{item.name}</h2>

<div class="form-group">
   <label>{localize(CONFIG.SR3E.MODAL.recommendedprice)}</label>
   <div class="form-fields">
      <input type="number" min="0" bind:value={price} />
   </div>
</div>

<nav class="tabs">
   <a class="item" class:active={mode === "pay"} onclick={() => (mode = "pay")}>
      {localize(CONFIG.SR3E.MODAL.payupfront)}
   </a>
   <a class="item" class:active={mode === "debt"} onclick={() => (mode = "debt")}>
      {localize(CONFIG.SR3E.MODAL.registerdebt)}
   </a>
   <a class="item" class:active={mode === "free"} onclick={() => (mode = "free")}>
      {localize(CONFIG.SR3E.MODAL.grantfree)}
   </a>
</nav>

{#if mode === "pay"}
   {#if insufficientFunds}
      <p class="hint purchase-dialog-warning">{localize(CONFIG.SR3E.MODAL.insufficientfunds)}</p>
   {/if}
   <CreditStickPicker {sticks} onconfirm={payWithStick} oncancel={p.onClose} />
{:else if mode === "debt"}
   <div class="form-group">
      <label>{localize(CONFIG.SR3E.TRANSACTION.creditor)}</label>
      <div class="form-fields">
         <FuzzyFinder
            bind:value={creditorId}
            options={creditorOptions}
            placeholder={localize(CONFIG.SR3E.TRANSACTION.creditor)}
            nomatchtext="No matching actor"
         />
      </div>
   </div>
   <div class="form-group">
      <label>{localize(CONFIG.SR3E.TRANSACTION.interestpermonth)}</label>
      <div class="form-fields">
         <input type="number" min="0" bind:value={interestPerMonth} />
      </div>
   </div>
   <div class="form-footer">
      <button type="button" onclick={confirmDebt}>{localize(CONFIG.SR3E.MODAL.confirm)}</button>
      <button type="button" onclick={p.onClose}>{localize(CONFIG.SR3E.MODAL.cancel)}</button>
   </div>
{:else}
   <div class="form-footer">
      <button type="button" onclick={confirmFree}>{localize(CONFIG.SR3E.MODAL.confirm)}</button>
      <button type="button" onclick={p.onClose}>{localize(CONFIG.SR3E.MODAL.cancel)}</button>
   </div>
{/if}
