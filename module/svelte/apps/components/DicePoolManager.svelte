<script>
  import { localize } from "../../../services/utilities.js";
  import { StoreManager } from "../../svelteHelpers/StoreManager.svelte.js";

  let { config } = $props();
  let delimiter = $state("");

  const options = [
    { value: "character", label: localize(config.karmamanager.character) },
    { value: "npc", label: localize(config.karmamanager.npc) },
    // more to come...
  ];

  let filter = $state("character");
  let listboxContent = $state(null);
  let anyReady = $derived(
    listboxContent?.some((a) => a.system.karma.readyForCommit)
  );

  $effect(() => {
    let baseList = [];
    switch (filter) {
      case "character":
        baseList = game.actors.filter((a) => a.type === "character");
        break;
      case "npc":
        baseList = game.actors.filter((a) => a.type === "npc");
        break;
      default:
        baseList = game.actors;
        break;
    }

    if (delimiter?.length > 0) {
      listboxContent = baseList.filter((entry) =>
        entry.name.toLowerCase().includes(delimiter.toLowerCase())
      );
    } else {
      listboxContent = baseList;
    }
  });

  async function commitSelected() {
    for (const actor of listboxContent) {

        let StoreManager = ""

      if (actor.system.karma.readyForCommit) {
        const karma = foundry.utils.deepClone(actor.system.karma);
        const metatypeItem = actor.items.find((i) => i.type === "metatype");

        karma.lifetimeKarma += karma.pendingKarmaReward;

        if (metatypeItem?.system?.karma?.factor) {
          karma.karmaPool = Math.floor(
            karma.lifetimeKarma * metatypeItem.system.karma.factor
          );
        }

        karma.goodKarma =
          karma.lifetimeKarma - karma.spentKarma - karma.karmaPool;
        karma.pendingKarmaReward = 0;
        karma.readyForCommit = false;

        await actor.update({ "system.karma": karma }, { render: false });
      }
    }

    // After all commits, re-pull updated actor data
    listboxContent = listboxContent.map((a) => game.actors.get(a.id));
    deselectAll();
  }

  function forceRefresh() {
    const temp = listboxContent;
    listboxContent = null;
    setTimeout(() => {
      listboxContent = temp;
    }, 0);
  }

  async function deselectAll() {
    for (const actor of listboxContent) {
      actor.system.karma.readyForCommit = false;
      await actor.update(
        { "system.karma.readyForCommit": false },
        { render: false }
      );
    }
    forceRefresh();
  }

  async function selectAll() {
    for (const actor of listboxContent) {
      actor.system.karma.readyForCommit = true;
      await actor.update(
        { "system.karma.readyForCommit": true },
        { render: false }
      );
    }
    forceRefresh();
  }
</script>

<div class="sheet-component">
  <div class="sr3e-inner-background-container">
    <div class="fake-shadow"></div>
    <div class="sr3e-inner-background">
      <div class="karma-manager">
        <div class="points-container"></div>
        <div class="player-handler">
          <select
            name="typeOfCharacter"
            class="typeOfCharacter"
            bind:value={filter}
          >
            {#each options as { value, label }}
              <option {value}>{label}</option>
            {/each}
          </select>
          <input type="text" bind:value={delimiter} />

          <button onclick={selectAll}>
            {localize(config.karma.selectall)}
          </button>
          <button onclick={deselectAll}>
            {localize(config.karma.deselectall)}
          </button>
          <button onclick={commitSelected} disabled={!anyReady}>
            {localize(config.karma.commitselected)}
          </button>
        </div>
        <div class="list-box">
          {#if listboxContent?.length}
            <table class="actor-table">
              <thead>
                <tr>
                  <th>Portrait</th>
                  <th>Name</th>
                  <th>Points</th>
                  <th>{localize(config.karma.goodkarma)}</th>
                  <th>{localize(config.karma.karmapool)}</th>
                  <th>{localize(config.karma.lifetimekarma)}</th>
                  <th>{localize(config.karma.commit)}</th>
                </tr>
              </thead>
              <tbody>
                {#each listboxContent as actor}
                  <tr>
                    <td class="portrait-cell">
                      <img src={actor.img} alt="portrait" />
                    </td>
                    <td>
                      <h3>
                        {actor.name}
                      </h3>
                    </td>
                    <td>
                      <input
                        type="number"
                        id={actor.id}
                        value={actor.system.karma.pendingKarmaReward}
                        oninput={async (e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            await actor.update(
                              { "system.karma.pendingKarmaReward": val },
                              { render: false }
                            );
                          }
                        }}
                      />
                    </td>
                    <td class>
                      <h3>
                        {actor.system.karma.goodKarma}
                      </h3>
                    </td>
                    <td>
                      <h3>
                        {actor.system.karma.karmaPool}
                      </h3>
                    </td>
                    <td>
                      <h3>
                        {actor.system.karma.lifetimeKarma}
                      </h3>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        bind:checked={actor.system.karma.readyForCommit}
                        onchange={async (e) => {
                          const newValue = e.target.checked;
                          actor.system.karma.readyForCommit = newValue; // update UI immediately
                          await actor.update(
                            { "system.karma.readyForCommit": newValue },
                            { render: false }
                          );
                          forceRefresh();
                        }}
                      />
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          {:else}
            <div class="empty">No actors found</div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
