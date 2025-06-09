<script>
    import { openFilePicker, localize } from "../../../../svelteHelpers.js";
    import SpecializationCard from "./SpecializationCard.svelte";
    let { skill = {}, actor = {}, config = {} } = $props();

    let specializations = $state(skill.system.specializations);
    let value = $state(skill.system.activeSkill.value);

    console.log("SKILL0", value);

    function test() {
        console.log("TEST");
    }
</script>

<div class="sr3e-general-grid">
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <div class="image-mask">
                    <img
                        src={skill.img}
                        role="presentation"
                        data-edit="img"
                        title={skill.name}
                        alt={skill.name}
                        onclick={async () => openFilePicker(value)}
                    />
                </div>
                <div class="stat-grid single-column">
                    <div class="stat-card">
                        <div class="stat-card-background"></div>
                        <h1>{skill.name}</h1>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-card-background"></div>
                    <h1>{value}</h1>
                </div>
                <div class="buttons-vertcal-distribution">
                    <button
                        class="header-control icon sr3e-toolbar-button"
                        aria-label="Toggle card span"
                        onclick={test}
                    >
                        <i class="fa-solid fa-plus"></i>
                    </button>
                    <button
                        class="header-control icon sr3e-toolbar-button"
                        aria-label="Toggle card span"
                        onclick={test}
                    >
                        <i class="fa-solid fa-minus"></i>
                    </button>
                    <button
                        class="header-control icon sr3e-toolbar-button"
                        aria-label="Toggle card span"
                        onclick={test}
                    >
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <h1 class="uppercase">
                    {localize(config.skill.specializations)}
                </h1>
                {#each specializations as specialization}
                    <div class="stat-card">
                        <SpecializationCard />
                    </div>
                {/each}
            </div>
        </div>
    </div>
</div>
