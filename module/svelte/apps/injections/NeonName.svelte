<script>
    import { getActorStore } from "../../stores/actorStoreRegistry";
    export let actor;

    let malfunctioningIndexes = [];
    let neonHTML;
    
    const actorStore = getActorStore(actor.id, actor.name);

    $: name = $actorStore.name;
    $: neonHTML = getNeonHtml(name);

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
            .map(
                (char, index) =>
                    malfunctioningIndexes.includes(index)
                        ? `<div class="malfunc">${char}</div>`
                        : `<div>${char}</div>`
            )
            .join("");
    }
</script>

<div class="neon-name">
    {@html neonHTML}
</div>
