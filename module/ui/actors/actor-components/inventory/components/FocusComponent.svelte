<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../../../../services/utilities";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const sys = item.system as Record<string, any>;

const force = $derived(Number(sys.force ?? 0));
</script>

<h4 class="no-margin uppercase">
    {localize(CONFIG.SR3E.FOCUS_TYPES[sys.focusType] ?? CONFIG.SR3E.FOCUS.focus)}
</h4>
<h4 class="no-margin uppercase">
    {localize(CONFIG.SR3E.FOCUS.force)}: {force}
</h4>
<h4 class="no-margin uppercase">¥ {sys.commodity?.cost ?? 0}</h4>
