<script>
    import { localize, openFilePicker } from "../../svelteHelpers.js";
    import StatCard from "./components/StatCard.svelte";
    import Commodity from "./components/Commodity.svelte";
    import Portability from "./components/Portability.svelte";
    import JournalViewer from "./components/JournalViewer.svelte";
    let { item = {}, config = {} } = $props();
</script>

<div class="sr3e-item-grid">
    <div class="item-sheet-component">
        <div class="sr3e-inner-background-container">
            <div class="fake-shadow"></div>
            <div class="sr3e-inner-background">
                <div class="image-mask">
                    <img
                        src={item.img}
                        role="presentation"
                        data-edit="img"
                        title={item.name}
                        alt={item.name}
                        onclick={openFilePicker(item)}
                    />
                </div>
                <input
                    class="large"
                    name="name"
                    type="text"
                    bind:value={item.name}
                    onchange={(e) => item.update({ name: e.target.value })}
                />
            </div>
        </div>
    </div>

    <Commodity
        {item}
        {config}
        gridCss="two-column"
    />

    <Portability
        {item}
        {config}
        gridCss="two-column"
    />
</div>
