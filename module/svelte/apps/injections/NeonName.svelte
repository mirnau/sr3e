<!-- ChildComponent.svelte -->
<script>
      import {characterStore} from "../../stores/characterStore";
    export let actor; // The Actor object passed in as props
    let malfunctioningIndexes = [];
    let neonHTML;

    // Enhanced reactive declaration (Svelte 5 syntax, if applicable)
    // Using $: to declare dependencies
    $: {
        const name = $characterStore.name;
        neonHTML = getNeonHtml(name);
    }

    const randomInRange = (min, max) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

    function getNeonHtml(name) {
        malfunctioningIndexes = []; // Reset malfunctioning indexes

        if (name.length < 4) {
            malfunctioningIndexes.push(randomInRange(0, name.length - 1));
        } else {
            const malfunctionInNplaces = name.length % 4;

            for (let i = 0; i < malfunctionInNplaces; i++) {
                let index;
                do {
                    index = randomInRange(0, name.length - 1);
                } while (malfunctioningIndexes.includes(index));
                malfunctioningIndexes.push(index);
            }
        }

        // Create the HTML for the neon name with malfunctioning letters
        return [...name]
            .map(
                (char, index) =>
                    malfunctioningIndexes.includes(index)
                        ? `<div class="malfunc">${char}</div>` // Malfunctioning letter
                        : `<div>${char}</div>` // Normal letter
            )
            .join("");
    }
</script>

<div class="neon-name">
    {@html neonHTML} <!-- Render HTML dynamically -->
</div>
