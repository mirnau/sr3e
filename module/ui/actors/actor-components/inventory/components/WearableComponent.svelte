<script lang="ts">
import { localize } from "../../../../../services/utilities";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const sys = item.system as Record<string, any>;
</script>

<h4 class="no-margin uppercase">¥ {sys.commodity?.cost ?? 0}</h4>
<h4 class="no-margin uppercase">
    {localize(CONFIG.SR3E.WEARABLE.impact)}: {sys.impact ?? 0}
</h4>
<h4 class="no-margin uppercase">
    {localize(CONFIG.SR3E.WEARABLE.ballistic)}: {sys.ballistic ?? 0}
</h4>
