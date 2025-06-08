<script>
    import { openFilePicker, localize } from "../../../../svelteHelpers.js";
    let { skill = {}, actor = {}, config = {} } = $props();
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
                        onclick={async () => openFilePicker(skill)}
                    />
                </div>
                <div class="stat-grid single-column">
                    <div class="stat-card">
                        <div class="stat-card-background"></div>
                        <input
                            class="large"
                            name="name"
                            type="text"
                            value={skill.name}
                            onchange={(e) =>
                                skill.update({ name: e.target.value })}
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
