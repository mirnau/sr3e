<script>
   import { onMount, onDestroy } from "svelte";
   import { localize, openFilePicker } from "@services/utilities.js";
   import ActorDataService from "@services/ActorDataService.js";
   import ComboSearch from "@sveltecomponent/basic/ComboSearch.svelte";
   import JournalViewer from "@sveltecomponent/JournalViewer.svelte";
   import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
   import Image from "@sveltecomponent/basic/Image.svelte";
   import StatCard from "@sveltecomponent/basic/DerivedAttributeCard.svelte";
   import ItemSheetWrapper from "@sveltecomponent/basic/ItemSheetWrapper.svelte";

   let { item, config } = $props();

   let formattedAmount = $state(`${item.system.amount} ¥`);

   let creditorOptions = $state([]);
   let selectedId = $state(item.system.creditorId ?? "");
   let interest = $state("");
   let delimiter = $state("");

   // Format display string
   $effect(() => {
      formattedAmount = `${formatNumber(item.system.amount)} ¥`;
   });

   // Build options from game actors
   $effect(() => {
      const actors = game.actors.filter((actor) => game.user.isGM || actor.testUserPermission(game.user, "OBSERVER"));

      const filtered =
         delimiter.trim().length > 0
            ? actors.filter((a) => a.name.toLowerCase().includes(delimiter.toLowerCase()))
            : actors;

      creditorOptions = filtered.map((a) => ({
         value: a.id,
         label: a.name,
      }));
   });

   function handleSelection(event) {
      const id = event.detail.value;
      selectedId = id;
      item.update({ "system.creditorId": id });
   }

   function formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
   }

   function handleInput(e) {
      const inputValue = e.target.value.trim();
      const raw = inputValue.replace(/[^\d]/g, "");
      const parsed = parseInt(raw, 10) || 0;
      item.system.amount = parsed;
      e.target.value = `${formatNumber(parsed)} ¥`;
   }

   function handleKeyDown(e) {
      if (
         [8, 9, 27, 13, 46].includes(e.keyCode) ||
         (e.ctrlKey && [65, 67, 86, 88].includes(e.keyCode)) ||
         (e.keyCode >= 35 && e.keyCode <= 39)
      )
         return;

      if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
         e.preventDefault();
      }
   }

   function handleFocus(e) {
      e.target.select();
   }

   function handleBlur(e) {
      const raw = e.target.value.replace(/[^\d]/g, "");
      const parsed = parseInt(raw, 10) || 0;
      item.system.amount = parsed;
      item.update({ "system.amount": parsed }, { render: false });
      e.target.value = `${formatNumber(parsed)} ¥`;
   }
</script>

<ItemSheetWrapper csslayout={"single"}>
   <ItemSheetComponent>
      <Image entity={item} />

      <div class="stat-grid single-column">
         <div class="stat-card">
            <div class="stat-card-background"></div>
            <input
               class="large"
               name="name"
               type="text"
               value={item.name}
               onchange={(e) => item.update({ name: e.target.value })}
            />
         </div>

         <!-- Nuyen Amount Input -->
         <StatCard>
            <input
               name="amount"
               type="text"
               value={formattedAmount}
               oninput={handleInput}
               onkeydown={handleKeyDown}
               onfocus={handleFocus}
               onblur={handleBlur}
            />
         </StatCard>
         <StatCard>
            <select
               name="type"
               bind:value={item.system.type}
               onchange={(e) => item.update({ "system.type": e.target.value })}
            >
               <option value="" disabled>{localize(config.transaction.select)}</option>
               <option value="income">{localize(config.transaction.income)}</option>
               <option value="asset">{localize(config.transaction.asset)}</option>
               <option value="debt">{localize(config.transaction.debt)}</option>
               <option value="expense">{localize(config.transaction.expense)}</option>
            </select>
         </StatCard>
         <StatCard>
            <input type="text" bind:value={interest} placeholder="0.00%" />
         </StatCard>
         <div class="stat-grid two-column">
            <StatCard label={config.transaction.recurrent}>
               <input type="checkbox" bind:value={item.isRecurrent} />
            </StatCard>
            <StatCard label={config.transaction.creditstick}>
               <input type="checkbox" bind:value={item.isCreditStick} />
            </StatCard>
         </div>
      </div>
   </ItemSheetComponent>
   {#if item.system.type !== "asset"}
      <ItemSheetComponent>
         <div class="stat-grid single-column">
            <div class="stat-card">
               <div class="stat-card-background"></div>
               <h3>Creditor</h3>
            </div>

            <ComboSearch
               options={creditorOptions}
               placeholder={localize(config.combosearch.search)}
               nomatchplaceholder={localize(config.combosearch.noresult)}
               bind:value={selectedId}
               on:select={handleSelection}
            />
         </div>
      </ItemSheetComponent>
   {/if}
   <JournalViewer document={item} {config} />
</ItemSheetWrapper>
