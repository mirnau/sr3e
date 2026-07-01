import { classifyWeapon } from "../orchestration/weaponClassifier";
import { buildFirearmSetup } from "./firearmSetup";
import { buildMeleeSetup } from "./meleeSetup";
import type { ProcedureSetup } from "./simpleSetups";

type AnyActor = { id: string; system: Record<string, unknown>; items: { get: (id: string) => { system: Record<string, unknown> } | undefined } };
type AnyItem = { system: Record<string, unknown> };

export function buildWeaponAttack(actor: AnyActor, item: AnyItem): ProcedureSetup {
    const ammoAvailable = resolveAmmoCount(actor, item);
    const cls = classifyWeapon(item, ammoAvailable);

    if (cls.isFirearm) {
        const attackerToken = resolveAttackerToken();
        const targetToken = resolveTargetToken();
        return buildFirearmSetup(actor as never, item as never, {
            declaredRounds: cls.declaredRounds,
            ammoAvailable,
            attackerToken,
            targetToken,
        });
    }

    if (cls.isMelee) {
        return buildMeleeSetup(actor as never, item as never);
    }

    const weaponName = (item as unknown as { name?: string }).name ?? "weapon";
    if (typeof ui !== "undefined") {
        ui.notifications?.warn(`Weapon "${weaponName}" has no fire mode set. Configure it in the weapon sheet.`);
    }
    return buildMeleeSetup(actor as never, item as never);
}

function resolveAmmoCount(actor: AnyActor, item: AnyItem): number | null {
    const ws = item.system as { ammoId?: string };
    if (!ws.ammoId) return null;
    const ammo = actor.items.get(ws.ammoId);
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
