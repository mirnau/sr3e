<script>
    let { item = {} } = $props();

    let editor = $state(null);
    let editorContainer = $state(null);
    let textValue = $state(item.system.description);

    let isOwner = $derived(item.isOwner);
    let editable = true;

    $effect(async () => {
        if (item.system?.description === undefined) {
            Log.error(
                `This editor requires that the data model has a ${item.name}.system.description field`,
                "Editor.svelte",
                { item },
            );
            return;
        }

        if (!editorContainer) return;

        if (editable) {
            const newEditor = await foundry.applications.ux.TextEditor.create({
                target: editorContainer,
                height: 300,
                save_onsubmit: false,
                buttons: true,
                owner: isOwner,
                engine: "prosemirror",
                parent: ".editor-field",
                content_css: "systems/sr3e/styles/css/chummer-dark.css",
                content_style: "html { margin: 0.5rem; }",
                save_onsavecallback: async (html) => {
                    let content = html.getContent(editorContainer);
                    await item.update(
                        { "system.description": content },
                        { render: false },
                    );
                },
            });

            editor.set(newEditor);
            editor()?.setContent(item.system.description);
        } else {
            editorContainer.innerHTML =
                foundry.applications.ux.TextEditor.enrichHTMLSync(textValue);
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
