<script>
    import { getActorStore } from "../../stores/actorStoreRegistry";

    let { actor = {} } = $props();

    let malfunctioningIndexes = [];

    const actorStore = getActorStore(actor.id, actor.name);

    let name = $derived($actorStore.name);
    let neonHTML = $derived(getNeonHtml(name));

    const randomInRange = (min, max) =>
        Math.floor(Math.random() * (max - min + 1)) + min;

    function getNeonHtml(name) {
        malfunctioningIndexes = [];

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

        return [...name]
            .map((char, index) =>
                malfunctioningIndexes.includes(index)
                    ? `<div class="neon-name-text malfunc">${char}</div>`
                    : `<div class="neon-name-text">${char}</div>`,
            )
            .join("");
    }
</script>

<div class="neon-name">
    {@html neonHTML}
</div>
