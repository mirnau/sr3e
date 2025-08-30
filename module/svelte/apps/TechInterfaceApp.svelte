<script>
  import { localize, kvOptions } from "@services/utilities.js";
  import Image from "@sveltecomponent/basic/Image.svelte";
  import ItemSheetComponent from "@sveltecomponent/basic/ItemSheetComponent.svelte";
  import ItemSheetWrapper from "@sveltecomponent/basic/ItemSheetWrapper.svelte";
  import StatCard from "@sveltecomponent/basic/StatCard.svelte";
  import JournalViewer from "@sveltecomponent/JournalViewer.svelte";
  import ActiveEffectsViewer from "@sveltecomponent/ActiveEffects/ActiveEffectsViewer.svelte";
  import GadgetViewer from "@sveltecomponent/GadgetViewer.svelte";
  import Commodity from "@sveltecomponent/Commodity.svelte";
  import Portability from "@sveltecomponent/Portability.svelte";
  import { StoreManager } from "@sveltehelpers/StoreManager.svelte";
  import { onDestroy } from "svelte";

  let { item = {}, config = {} } = $props();
  const system = $state(item.system);

  // Store wiring (reactivity for subtype and arrays)
  const storeManager = StoreManager.Subscribe(item);
  onDestroy(() => StoreManager.Unsubscribe(item));
  const subtypeStore = storeManager.GetRWStore("subtype");

  const subtypeEntry = $derived({
    item,
    key: "subtype",
    label: localize(config.techinterface?.subtype ?? "sr3e.techinterface.subtype"),
    value: $subtypeStore,
    path: "system",
    type: "select",
    options: kvOptions(config.techinterfaceSubtypes)
  });

  // make/model removed; use item.name only

  const isCyberdeck = $derived($subtypeStore === "cyberdeck");
  const isCyberterminal = $derived($subtypeStore === "cyberterminal");
  const isRCDeck = $derived($subtypeStore === "rcdeck");

  // Matrix fields (Cyberdeck / Cyberterminal)
  const matrixCoreEntries = $derived([
    {
      item,
      key: "matrix.mpcp",
      label: localize(config.techinterface?.mpcp ?? "sr3e.techinterface.mpcp"),
      value: system.matrix?.mpcp ?? 0,
      path: "system",
      type: "number"
    },
    {
      item,
      key: "matrix.hardening",
      label: localize(config.techinterface?.hardening ?? "sr3e.techinterface.hardening"),
      value: system.matrix?.hardening ?? 0,
      path: "system",
      type: "number"
    },
    {
      item,
      key: "matrix.activeMp",
      label: localize(config.techinterface?.activeMp ?? "sr3e.techinterface.activeMp"),
      value: system.matrix?.activeMp ?? 0,
      path: "system",
      type: "number"
    },
    {
      item,
      key: "matrix.storageMp",
      label: localize(config.techinterface?.storageMp ?? "sr3e.techinterface.storageMp"),
      value: system.matrix?.storageMp ?? 0,
      path: "system",
      type: "number"
    },
    {
      item,
      key: "matrix.ioMpPerCT",
      label: localize(config.techinterface?.ioMpPerCT ?? "sr3e.techinterface.ioMpPerCT"),
      value: system.matrix?.ioMpPerCT ?? 0,
      path: "system",
      type: "number"
    }
  ]);

  const personaEntries = $derived([
    {
      item,
      key: "matrix.bod",
      label: localize(config.techinterface?.bod ?? "sr3e.techinterface.bod"),
      value: system.matrix?.bod ?? 0,
      path: "system",
      type: "number"
    },
    {
      item,
      key: "matrix.evasion",
      label: localize(config.techinterface?.evasion ?? "sr3e.techinterface.evasion"),
      value: system.matrix?.evasion ?? 0,
      path: "system",
      type: "number"
    },
    {
      item,
      key: "matrix.masking",
      label: localize(config.techinterface?.masking ?? "sr3e.techinterface.masking"),
      value: system.matrix?.masking ?? 0,
      path: "system",
      type: "number"
    },
    {
      item,
      key: "matrix.sensor",
      label: localize(config.techinterface?.sensor ?? "sr3e.techinterface.sensor"),
      value: system.matrix?.sensor ?? 0,
      path: "system",
      type: "number"
    }
  ]);

  const responseIncreaseEntry = $derived({
    item,
    key: "matrix.responseIncrease",
    label: localize(config.techinterface?.responseIncrease ?? "sr3e.techinterface.responseIncrease"),
    value: system.matrix?.responseIncrease ?? 0,
    path: "system",
    type: "number"
  });

  // Rigger deck fields
  const riggerEntries = $derived([
    {
      item,
      key: "rigger.rating",
      label: localize(config.techinterface?.rating ?? "sr3e.techinterface.rating"),
      value: system.rigger?.rating ?? 0,
      path: "system",
      type: "number"
    },
    {
      item,
      key: "rigger.fluxRating",
      label: localize(config.techinterface?.fluxRating ?? "sr3e.techinterface.fluxRating"),
      value: system.rigger?.fluxRating ?? 0,
      path: "system",
      type: "number"
    }
  ]);

  // Stores for arrays
  const programsStore = storeManager.GetRWStore("loaded.programs");
  const subscribersStore = storeManager.GetRWStore("rigger.subscribers");
  const riggerModesStore = storeManager.GetRWStore("loaded.riggerModes");

  // Single-select rigger mode (store as single-element array)
  const riggerModeEntry = $derived({
    item,
    key: "riggerMode",
    label: localize(config.techinterface?.riggerModes ?? "sr3e.techinterface.riggerModes"),
    value: ($riggerModesStore?.[0] ?? ""),
    path: "system.loaded",
    type: "select",
    options: kvOptions(config.riggerModes)
  });

  function setRiggerMode(v) {
    $riggerModesStore = v ? [v] : [];
  }

  function addProgram() {
    $programsStore.push({ uuid: "", kind: "operational", tag: "", rating: 0, active: true });
    $programsStore = [...$programsStore];
  }

  function deleteProgram(i) {
    $programsStore = $programsStore.filter((_, idx) => idx !== i);
  }

  function addSubscriber() {
    $subscribersStore.push("");
    $subscribersStore = [...$subscribersStore];
  }

  function deleteSubscriber(i) {
    $subscribersStore = $subscribersStore.filter((_, idx) => idx !== i);
  }

  function toggleRiggerMode(mode, checked) {
    const set = new Set($riggerModesStore ?? []);
    if (checked) set.add(mode);
    else set.delete(mode);
    $riggerModesStore = Array.from(set);
  }
</script>

<ItemSheetWrapper csslayout={"double"}>
  <ItemSheetComponent>
    <Image entity={item} />
    <div class="stat-grid single-column"> 
      <div class="stat-card">
        <div class="stat-card-background"></div>
        <input class="large" name="name" type="text" value={item.name} onchange={(e) => item.update({ name: e.target.value })} />
      </div>
      <StatCard {...subtypeEntry} />
      <!-- make/model removed from UI -->
    </div>
  </ItemSheetComponent>

  {#if isCyberdeck || isCyberterminal}
    <ItemSheetComponent>
      <h3>{localize(config.techinterface?.matrix ?? "sr3e.techinterface.matrix")}</h3>
      <div class="stat-grid two-column">
        {#each matrixCoreEntries as entry}
          <StatCard {...entry} />
        {/each}
        {#if !isCyberterminal}
          <StatCard {...responseIncreaseEntry} />
        {/if}
      </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
      <h3>{localize(config.techinterface?.persona ?? "sr3e.techinterface.persona")}</h3>
      <div class="stat-grid two-column">
        {#each personaEntries as entry}
          <StatCard {...entry} />
        {/each}
      </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
      <h3>{localize(config.techinterface?.programs ?? "sr3e.techinterface.programs")}</h3>
      <div class="stat-grid single-column">
        <div class="stat-card">
          <div class="stat-card-background"></div>
          <div class="buttons-horizontal-distribution">
            <button type="button" class="header-control icon sr3e-toolbar-button" aria-label="Add Program" onclick={addProgram}>
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>

        {#each $programsStore as program, i}
          <div class="stat-card">
            <div class="stat-card-background"></div>
            <div class="stat-grid two-column">
              <!-- UUID hidden from UI; managed internally -->
              <div>
                <h4 class="no-margin uppercase">{localize(config.techinterface?.programKind ?? "sr3e.techinterface.programKind")}</h4>
                <select bind:value={$programsStore[i].kind} onchange={() => ($programsStore = [...$programsStore])}>
                  {#each kvOptions(config.programKinds) as opt}
                    <option value={opt.value}>{opt.label}</option>
                  {/each}
                </select>
              </div>
              <div>
                <h4 class="no-margin uppercase">{localize(config.techinterface?.programTag ?? "sr3e.techinterface.programTag")}</h4>
                <input type="text" bind:value={$programsStore[i].tag} onchange={() => ($programsStore = [...$programsStore])} />
              </div>
              <div>
                <h4 class="no-margin uppercase">{localize(config.techinterface?.programRating ?? "sr3e.techinterface.programRating")}</h4>
                <input type="number" bind:value={$programsStore[i].rating} onchange={() => ($programsStore = [...$programsStore])} />
              </div>
              <div>
                <h4 class="no-margin uppercase">{localize(config.techinterface?.programActive ?? "sr3e.techinterface.programActive")}</h4>
                <input type="checkbox" bind:checked={$programsStore[i].active} onchange={() => ($programsStore = [...$programsStore])} />
              </div>
              <div class="buttons-horizontal-distribution">
                <button type="button" class="header-control icon sr3e-toolbar-button" aria-label="Delete Program" onclick={() => deleteProgram(i)}>
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </ItemSheetComponent>
  {/if}

  {#if isRCDeck}
    <ItemSheetComponent>
      <h3>{localize(config.techinterface?.rigger ?? "sr3e.techinterface.rigger")}</h3>
      <div class="stat-grid two-column">
        {#each riggerEntries as entry}
          <StatCard {...entry} />
        {/each}
      </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
      <h3>{localize(config.techinterface?.subscribers ?? "sr3e.techinterface.subscribers")}</h3>
      <div class="stat-grid single-column">
        <div class="stat-card">
          <div class="stat-card-background"></div>
          <div class="buttons-horizontal-distribution">
            <button type="button" class="header-control icon sr3e-toolbar-button" aria-label="Add Subscriber" onclick={addSubscriber}>
              <i class="fa-solid fa-plus"></i>
            </button>
          </div>
        </div>
        {#each $subscribersStore as sub, i}
          <div class="stat-card">
            <div class="stat-card-background"></div>
            <div class="stat-grid two-column">
              <div>
                <h4 class="no-margin uppercase">{localize(config.techinterface?.subscriberId ?? "sr3e.techinterface.subscriberId")}</h4>
                <input type="text" bind:value={$subscribersStore[i]} onchange={() => ($subscribersStore = [...$subscribersStore])} />
              </div>
              <div class="buttons-horizontal-distribution">
                <button type="button" class="header-control icon sr3e-toolbar-button" aria-label="Delete Subscriber" onclick={() => deleteSubscriber(i)}>
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </ItemSheetComponent>

    <ItemSheetComponent>
      <h3>{localize(config.techinterface?.riggerModes ?? "sr3e.techinterface.riggerModes")}</h3>
      <div class="stat-grid single-column">
        <StatCard {...riggerModeEntry} onUpdate={setRiggerMode} />
      </div>
    </ItemSheetComponent>
  {/if}

  <ItemSheetComponent>
    <div>
      <h3>{localize(config.gadget.gadget)}</h3>
    </div>
    <GadgetViewer document={item} {config} isSlim={true} />
  </ItemSheetComponent>

  <ItemSheetComponent>
    <h3>{localize(config.activeeffects?.activeeffects ?? "sr3e.activeeffects.activeeffects")}</h3>
    <ActiveEffectsViewer document={item} {config} isSlim={true} />
  </ItemSheetComponent>

  <Commodity {item} {config} gridCss="two-column" />
  <Portability {item} {config} gridCss="two-column" />

  <JournalViewer document={item} {config} />
</ItemSheetWrapper>
