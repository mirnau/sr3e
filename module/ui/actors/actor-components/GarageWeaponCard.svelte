<script lang="ts">
import { onDestroy, onMount, untrack } from "svelte";
import { localize } from "../../../services/utilities";
import type { IStoreManager } from "../../../utilities/IStoreManager";
import { StoreManager } from "../../../utilities/StoreManager.svelte";
import InventoryCard from "./inventory/InventoryCard.svelte";
import LabeledDropdown from "../../items/LabeledDropdown.svelte";
import { buildVehicleWeaponAttack } from "../../../services/combat/procedures/vehicleWeaponAttack";
import { maneuverScoreComparisonModifier } from "../../../services/combat/maneuverScoreModifier";
import { openComposer } from "../../../services/combat/procedures/composerService.svelte";

const p = $props<{ characterActor: Actor; weapon: Item; jackedIn: boolean; vcrLevel: number; maneuverScore: number }>();
const characterActor = untrack(() => p.characterActor);
const weapon = untrack(() => p.weapon);
const vehicle = untrack(() => (weapon as any).parent);
const storeManager: IStoreManager = StoreManager.Instance as IStoreManager;

storeManager.Subscribe(weapon);
storeManager.Subscribe(characterActor);
onDestroy(() => {
    storeManager.Unsubscribe(weapon);
    storeManager.Unsubscribe(characterActor);
});

// Same flag the Rigger Actions card writes — Manual Gunnery's Maneuver
// Score comparison (SR3 p.153) shares one opposing-score value with the
// Vehicle Skill actions rather than tracking a separate one per weapon.
const opposingScoreStore = storeManager.GetFlagStore<string>(characterActor, "garageOpposingManeuverScore", "");

const activeSkills = $derived(
    [...((characterActor as any).items ?? [])].filter((item: any) => item.type === "skill" && item.system?.skillType === "active")
);
const activeSkillOptions = $derived(activeSkills.map((skill: any) => ({ value: skill.id, label: skill.name })));

// Flag-backed on the weapon (not local $state) so the choice survives
// closing/reopening the sheet — stored per-weapon since different mounted
// weapons plausibly need different skills (e.g. Gunnery vs an exotic mount).
const selectedSkillIdStore = storeManager.GetFlagStore<string>(weapon, "garageFiringSkillId", "");

onMount(() => {
    if (!$selectedSkillIdStore && activeSkills.length > 0) selectedSkillIdStore.set(activeSkills[0].id);
});

function onRoll() {
    if (!$selectedSkillIdStore) return;
    const raw = $opposingScoreStore.trim();
    const opposingScore = raw === "" ? null : Number(raw);
    const mods = maneuverScoreComparisonModifier(p.maneuverScore, opposingScore, "gunnery");
    const setup = buildVehicleWeaponAttack(characterActor as never, weapon as never, $selectedSkillIdStore, {
        jackedIn: p.jackedIn,
        vcrLevel: p.vcrLevel,
    }, mods);
    openComposer(setup, characterActor as never);
}
</script>

<div class="garage-weapon-card">
    <!-- Vehicle-owned weapon: reload offers ammo from both the vehicle's
         own stock (actor={vehicle}) and the seated character's carried
         ammo (extraAmmoSourceActor). H/F toggles are hidden — mount status
         is set from the vehicle's own sheet, not re-toggleable from here.
         The built-in roll button is hidden too: it resolves the firing
         skill via the weapon's linkedSkillId against whichever actor is
         passed in, which can never work against a vehicle (no skill
         items) — the ad-hoc dropdown below covers firing instead. -->
    <InventoryCard
        actor={vehicle}
        item={weapon}
        hideToggles
        hideRollButton
        extraAmmoSourceActor={characterActor}
    />
    {#if activeSkills.length > 0}
        <div class="garage-vehicle-roll">
            <LabeledDropdown
                key="firingSkill"
                label={localize(CONFIG.SR3E.SKILL.skill)}
                value={$selectedSkillIdStore}
                options={activeSkillOptions}
                onUpdate={(v) => selectedSkillIdStore.set(v)}
            />
            <button
                type="button"
                class="sr3e-toolbar-button fa-solid fa-dice"
                aria-label="Roll"
                onclick={onRoll}
            ></button>
        </div>
    {/if}
</div>
