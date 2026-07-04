<script lang="ts">
import { onMount, untrack } from "svelte";
import { localize } from "../../../services/utilities";
import WeaponComponent from "./inventory/components/WeaponComponent.svelte";
import LabeledDropdown from "../../items/LabeledDropdown.svelte";
import { buildVehicleWeaponAttack } from "../../../services/combat/procedures/vehicleWeaponAttack";
import { openComposer } from "../../../services/combat/procedures/composerService.svelte";
import { executeProcedure } from "../../../services/combat/orchestration/executeProcedure";

const p = $props<{ characterActor: Actor; weapon: Item; jackedIn: boolean; vcrLevel: number }>();
const characterActor = untrack(() => p.characterActor);
const weapon = untrack(() => p.weapon);

const activeSkills = $derived(
    [...((characterActor as any).items ?? [])].filter((item: any) => item.type === "skill" && item.system?.skillType === "active")
);
const activeSkillOptions = $derived(activeSkills.map((skill: any) => ({ value: skill.id, label: skill.name })));

let selectedSkillId = $state<string>("");
let hasAmmo = $state(true);

onMount(() => {
    if (activeSkills.length > 0) selectedSkillId = activeSkills[0].id;
});

function onRoll() {
    if (!selectedSkillId) return;
    const setup = buildVehicleWeaponAttack(characterActor as never, weapon as never, selectedSkillId, {
        jackedIn: p.jackedIn,
        vcrLevel: p.vcrLevel,
    });
    const hasTargets = (game.user?.targets?.size ?? 0) > 0;
    if (hasTargets) {
        openComposer(setup, characterActor as never);
    } else {
        void executeProcedure(setup, characterActor as never);
    }
}
</script>

<div class="garage-weapon-card">
    <h4 class="no-margin uppercase">{(weapon as any).name}</h4>
    <WeaponComponent item={weapon} bind:hasAmmo />
    {#if activeSkills.length > 0}
        <div class="garage-vehicle-roll">
            <LabeledDropdown
                key="firingSkill"
                label={localize(CONFIG.SR3E.SKILL.skill)}
                value={selectedSkillId}
                options={activeSkillOptions}
                onUpdate={(v) => (selectedSkillId = v)}
            />
            <button type="button" disabled={!hasAmmo} onclick={onRoll}>{localize(CONFIG.SR3E.WEAPON.weapon)}</button>
        </div>
    {/if}
</div>
