<script>
    import { flags } from "../../../../services/commonConsts.js";
    import { getActorStore, stores } from "../../../stores/actorStores.js";
    import { createEventDispatcher } from "svelte";

    let { specialization = $bindable(), actor = {}, skill = {} } = $props();
    const dispatch = createEventDispatcher();

    let isCharacterCreation = $state(
        actor.getFlag(flags.sr3e, flags.actor.isCharacterCreation) ?? false,
    );

    let liveText = specialization.name;

    let baseValue = getActorStore(
        actor.id,
        skill.id,
        skill.system.activeSkill.value,
    );


    $effect(() => {
        if (isCharacterCreation) {
            if (specialization.value === 0) {
                specialization.value = $baseValue + 1;
                $baseValue -= 1;
                dispatch("arrayChanged");
            }
        }
    });

    $effect(() => {
        if (liveText !== specialization.name) {
            liveText = specialization.name;
        }
    });

    function handleInput(e) {
        liveText = e.target.innerText;
        specialization.name = liveText;
        dispatch("arrayChanged");
    }

    function handleKeyDown(e) {
        if (e.key === "Enter") {
            e.preventDefault();
            e.target.blur(); // INFO: exits editing
        }
    }

    function increment() {
        console.log("increment Entered");
    }

    function decrement() {
        console.log("decrement Entered");
    }

    function deleteThis() {
        if (isCharacterCreation) {
            if (specialization.value === $baseValue + 2) {
                specialization.value = 0;
                $baseValue += 1;
                dispatch("arrayChanged");
            }
        }

        dispatch("delete", { specialization });
    }
</script>

<div class="skill-specialization-card">
    <div class="specialization-background"></div>

    <div
        class="editable-name"
        contenteditable
        role="textbox"
        aria-multiline="false"
        tabindex="0"
        bind:innerText={liveText}
        oninput={handleInput}
        onkeydown={handleKeyDown}
        spellcheck="false"
    ></div>

    <h1 class="specialization-value">{specialization.value}</h1>
</div>

<div class="buttons-vertical-distribution">
    <button
        class="header-control icon sr3e-toolbar-button"
        aria-label="Increment"
        onclick={increment}
        disabled={isCharacterCreation}
    >
        <i class="fa-solid fa-plus"></i>
    </button>
    <button
        class="header-control icon sr3e-toolbar-button"
        aria-label="Decrement"
        onclick={decrement}
        disabled={isCharacterCreation}
    >
        <i class="fa-solid fa-minus"></i>
    </button>

    <button
        class="header-control icon sr3e-toolbar-button"
        aria-label="Delete"
        onclick={deleteThis}
    >
        <i class="fa-solid fa-trash-can"></i>
    </button>
</div>
