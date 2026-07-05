<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../../../../services/utilities";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const sys = item.system as Record<string, any>;
</script>

<h4 class="no-margin uppercase">
    {localize(CONFIG.SR3E.AUGMENTATION_CATEGORIES[sys.category] ?? CONFIG.SR3E.AUGMENTATION.category)}
</h4>
<h4 class="no-margin uppercase">
    {localize(CONFIG.SR3E.AUGMENTATION.essenceCost)}: {sys.essenceCost ?? 0}
</h4>
<h4 class="no-margin uppercase">¥ {sys.commodity?.cost ?? 0}</h4>
