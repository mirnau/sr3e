<script>
    import { onMount } from "svelte";
    import Log from "../../../../Log";

    export let document = {};
    export let owner = {};
    export let editable = {};

    let editor;
    let editorContainer;
    let textValue = document.system.description;

    onMount(async () => {
        if (
            !document.system?.description &&
            document.system?.description !== ""
        ) {
            Log.error(
                `This editor requires that the data model has a ${document.name}.system.description field`,
                "Editor.svelte",
                { document },
            );
            return;
        }

        if (editable) {
            editor = await TextEditor.create({
                target: editorContainer,
                height: 300,
                save_onsubmit: false,
                buttons: true,
                owner: owner,
                parent: ".editor-field",
                content_css: 'systems/sr3e/styles/css/chummer-dark.css',
                 content_style: 'html { margin: 0.5rem; }',
                save_onsavecallback: async (html) => {
                    let content = html.getContent(editorContainer);
                    await document.update(
                        { "system.description": content },
                        { render: false },
                    );
                },
            });
            editor.setContent(document.system.description);
        } else {
            editorContainer.innerHTML = TextEditor.enrichHTML(textValue, {
                async: false,
            });
        }

        Log.success(
            "Editor initialized successfully",
            "Editor.svelte",
            editorContainer,
        );
    });
</script>

<div class="editor-field">
    {#if editable}
        <div bind:this={editorContainer} class="editor"></div>
    {:else}
        <div bind:this={editorContainer} class="editor-readonly"></div>
    {/if}
</div>