<script lang="ts">
    let {
        specialization = $bindable<{ name: string; value: number }>(),
        actor,
        skill,
        isCreationMode,
        ondelete,
        onchange,
        onincrement,
        ondecrement,
    }: {
        specialization: { name: string; value: number };
        actor: Actor;
        skill: Item;
        isCreationMode: boolean;
        ondelete?: (spec: { name: string; value: number }) => void;
        onchange?: () => void;
        onincrement?: (spec: { name: string; value: number }) => void;
        ondecrement?: (spec: { name: string; value: number }) => void;
    } = $props();

    // Suppress unused variable warnings — actor and skill are part of the public API
    void actor;
    void skill;

    let liveText = $state(specialization.name);

    $effect(() => {
        if (liveText !== specialization.name) {
            liveText = specialization.name;
        }
    });

    function handleInput(e: Event): void {
        const target = e.target as HTMLElement;
        liveText = target.innerText;
        specialization.name = liveText;
        onchange?.();
    }

    function handleKeyDown(e: KeyboardEvent): void {
        if (e.key === "Enter") {
            e.preventDefault();
            (e.target as HTMLElement).blur();
        }
    }

    function deleteThis(): void {
        ondelete?.(specialization);
    }

    function increment(): void {
        onincrement?.(specialization);
    }

    function decrement(): void {
        ondecrement?.(specialization);
    }
</script>

<div class="specialization-card-row">
    <div class="skill-specialization-card">
        <div class="specialization-background"></div>
        <div
            contenteditable="true"
            class="specialization-name"
            role="textbox"
            tabindex="0"
            aria-label="Specialization name"
            oninput={handleInput}
            onkeydown={handleKeyDown}
        >{specialization.name}</div>
        <h1 class="embedded-value no-margin">{specialization.value}</h1>
    </div>

    <div class="buttons-horizontal-distribution">
    <button
        type="button"
        class="header-control icon sr3e-toolbar-button"
        aria-label="Increment specialization"
        onclick={increment}
        disabled={isCreationMode}
    >
        <i class="fa-solid fa-plus"></i>
    </button>
    <button
        type="button"
        class="header-control icon sr3e-toolbar-button"
        aria-label="Decrement specialization"
        onclick={decrement}
        disabled={isCreationMode}
    >
        <i class="fa-solid fa-minus"></i>
    </button>
    <button
        type="button"
        class="header-control icon sr3e-toolbar-button"
        aria-label="Delete specialization"
        onclick={deleteThis}
    >
        <i class="fa-solid fa-trash-can"></i>
    </button>
    </div>
</div>
