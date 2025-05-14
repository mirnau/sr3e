<script>
    let { doc, initialContent } = $props();

    console.log(doc, "doc");
    console.log(initialContent, "initialContent");

</script>

<section class="astyle">
    {@html initialContent}
</section>

<style>
    .astyle {
        padding: 10px;
        background: purple;
        border: 1px solid blue;
        border-radius: 5px;
    }
</style>
