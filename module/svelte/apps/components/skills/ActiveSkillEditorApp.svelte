<script>
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
                        <h1
                            class="large"
                            contenteditable="true"
                            onkeydown={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    e.target.blur();
                                }
                            }}
                            onblur={(e) =>
                                skill.update({ name: e.target.innerText })}
                        >
                            {skill.name}
                        </h1>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
