<script lang="ts">
import { untrack } from "svelte";
import { localize } from "../../../../../services/utilities";
import { canCastWithAttachedFetish, hasAttachedFetish } from "../../../../../services/spells/spellFetish";

const p = $props<{ item: Item }>();
const item = untrack(() => p.item);
const sys = item.system as Record<string, any>;
const isFetishLimited = hasAttachedFetish(item);
const hasReadyFetish = canCastWithAttachedFetish(item);
</script>

<h4 class="no-margin uppercase">
    {localize(CONFIG.SR3E.SPELL_TYPES[sys.type] ?? CONFIG.SR3E.SPELL.spell)}
    {#if sys.category}
        - {localize(CONFIG.SR3E.SPELL_CATEGORIES[sys.category] ?? sys.category)}
    {/if}
</h4>
{#if isFetishLimited}
    <h4 class="no-margin uppercase">
        {hasReadyFetish ? localize(CONFIG.SR3E.SPELL.fetishReady) : localize(CONFIG.SR3E.SPELL.fetishMissing)}
    </h4>
{/if}
<h4 class="no-margin uppercase">
    {localize(CONFIG.SR3E.FOCUS.force)}: {sys.learnedForce ?? 0}
    {#if sys.drain?.damageLevel}
        - {localize(CONFIG.SR3E.SPELL.drainDamageLevel)}: {String(sys.drain.damageLevel).toUpperCase()}
    {/if}
</h4>
