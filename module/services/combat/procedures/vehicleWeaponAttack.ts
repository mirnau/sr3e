import { beginAttack, onFirearmAttackResolved } from "./firearmFamily";
import { resolveLinkedSkill } from "./resolveLinkedSkill";
import { recoilModifier } from "../recoilTracker";
import { rangeModifier, resolveRange } from "../rangeService";
import type { ProcedureSetup } from "./simpleSetups";
import type { Modifier } from "../modifierList";

type WeaponSystem = { mode?: string; ammoId?: string };
type ActorWithItems = {
    id: string;
    system: Record<string, unknown>;
    items: { get?: (id: string) => { id: string; name?: string; type: string; system: Record<string, unknown> } | undefined };
};
type VehicleWeapon = {
    system: Record<string, unknown>;
    name?: string;
    parent?: ActorWithItems;
    update?: (d: Record<string, unknown>) => Promise<unknown>;
};

export type VehicleWeaponRigging = { jackedIn: boolean; vcrLevel: number };

// Firing skill and TN come from the seated character; ammo lookup and
// consumption target the weapon's actual owner (the vehicle) — the weapon
// lives in the vehicle's inventory, not the character's, so mutating the
// character's items here would silently no-op (or worse, clear ammoId, see
// ammoService.consume's not-found branch).
export function buildVehicleWeaponAttack(
    character: ActorWithItems,
    weapon: VehicleWeapon,
    chosenSkillId: string,
    rigging: VehicleWeaponRigging = { jackedIn: false, vcrLevel: 0 },
): ProcedureSetup {
    const vehicle = weapon.parent ?? character;
    const ws = weapon.system as WeaponSystem;
    const resolved = resolveLinkedSkill(character, chosenSkillId);
    const dice = resolved?.dice ?? 0;
    const baseTN = 4;
    const mods: Modifier[] = [];

    const ammoAvailable = resolveAmmoCount(vehicle, weapon);
    const declaredRounds = 1;
    const recoilMod = recoilModifier(vehicle.id, weapon, declaredRounds);
    if (recoilMod) mods.push(recoilMod);

    let tn = baseTN;
    const attackerToken = resolveAttackerToken();
    const targetToken = resolveTargetToken();
    if (attackerToken && targetToken) {
        const resolution = resolveRange(weapon as never, attackerToken as never, targetToken as never, 0, gridMeasure);
        const rMod = rangeModifier(resolution);
        if (rMod) mods.push(rMod);
        if (resolution.baseTN !== null) tn = resolution.baseTN;
    }
    if (rigging.jackedIn) tn = Math.max(2, tn - rigging.vcrLevel);

    const rollState = { dice, poolDice: 0, karmaDice: 0, targetNumber: tn, modifiers: mods };
    const skillName = resolved?.skill.name ?? "Gunnery";
    const title = resolved?.specName ?? skillName;
    const skillRating = Number((character.items.get?.(chosenSkillId)?.system as { activeSkill?: { value?: number } } | undefined)?.activeSkill?.value ?? 0);

    return {
        kind: "firearm",
        title,
        rollState,
        lockPriority: "advanced",
        selfPublish: true,
        poolAvailableOverrides: rigging.jackedIn ? { control: skillRating } : undefined,
        defaultingAttributeKey: resolved?.linkedAttribute ?? null,
        defaultingExcludeSkillId: resolved?.skillId ?? null,
        itemDefaultsOnRoll: false,
        defaultingPreselectedSkillId: null,
        defenseHint: { type: "attribute", key: "reaction", tnMod: 0, tnLabel: "Reaction" },
        exportFn: () => {
            const { plan, damage } = beginAttack(vehicle as never, weapon as never, {
                declaredRounds,
                ammoAvailable,
                attackerToken,
                targetToken,
                resolveAmmo: undefined,
            });
            return {
                familyKey: "firearm",
                weaponId: ws.ammoId ?? null,
                weaponName: weapon.name ?? "",
                plan,
                damage,
                tnBase: tn,
                tnMods: mods,
                next: { kind: "dodge", ui: { label: "Dodge" }, args: {} },
            };
        },
        commitFn: async () => {
            await onFirearmAttackResolved(vehicle as never, weapon as never, {
                mode: ws.mode ?? "semiauto",
                roundsFired: declaredRounds,
                attackerTNMod: 0,
                powerDelta: 0,
                levelDelta: 0,
                notes: [],
            });
        },
    };
}

function gridMeasure(a: { x: number; y: number }, b: { x: number; y: number }): { distance: number } {
    const g = typeof canvas !== "undefined" ? (canvas as any).grid : null;
    const size: number = g?.size ?? 100;
    const distPerSquare: number = g?.distance ?? 1;
    const pixels = Math.hypot(b.x - a.x, b.y - a.y);
    return { distance: (pixels / size) * distPerSquare };
}

function resolveAmmoCount(vehicle: ActorWithItems, weapon: VehicleWeapon): number | null {
    const ws = weapon.system as WeaponSystem;
    if (!ws.ammoId) return null;
    const ammo = vehicle.items.get?.(ws.ammoId);
    return (ammo?.system as { rounds?: number } | undefined)?.rounds ?? null;
}

function resolveAttackerToken(): { x?: number; y?: number } | null {
    if (typeof canvas === "undefined") return null;
    return (canvas as any).tokens?.controlled?.[0]?.document ?? null;
}

function resolveTargetToken(): { x?: number; y?: number } | null {
    if (typeof game === "undefined") return null;
    const targets = (game.user as any)?.targets;
    if (!targets || targets.size === 0) return null;
    return [...targets][0]?.document ?? null;
}
