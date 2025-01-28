<script>
    export let actor; // The Actor object passed in as props
    let malfunctioningIndexes = [];

    // Create a reactive variable that tracks actor.name
    $: actorName = actor.name;

    const randomInRange = (min, max) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

    // Recompute neonHTML whenever actorName changes
    $: neonHTML = getNeonHtml(actorName);

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
