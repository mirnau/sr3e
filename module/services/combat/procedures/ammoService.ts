import type { Directive } from "../damagePacket";

type AmmoSystem = {
    rounds?: number;
    maxCapacity?: number;
    type?: string;
    ammunitionClass?: string;
    isEquipped?: boolean;
    effectDirectives?: Directive[];
};

type WeaponSystem = {
    ammoId?: string;
    ammunitionClass?: string;
};

type Item = { id: string; type: string; system: Record<string, unknown> };
type Actor = { items: { get: (id: string) => Item | undefined; contents?: Item[] } };

export function getAttachedAmmo(actor: Actor, weapon: { system: Record<string, unknown> }): Item | null {
    const ws = weapon.system as WeaponSystem;
    if (!ws.ammoId) return null;
    const ammo = actor.items.get(ws.ammoId) ?? null;
    if (!ammo) return null;
    const as = ammo.system as AmmoSystem;
    return (as.rounds ?? 0) > 0 ? ammo : null;
}

export function findCompatibleAmmo(actor: Actor, weapon: { system: Record<string, unknown> }): Item[] {
    const ws = weapon.system as WeaponSystem;
    const items: Item[] = actor.items.contents ?? [...(actor.items as unknown as Iterable<Item>)];
    return items.filter(i => {
        if (i.type !== "ammunition") return false;
        const as = i.system as AmmoSystem;
        return as.ammunitionClass === ws.ammunitionClass && as.isEquipped && (as.rounds ?? 0) > 0;
    });
}

export async function consume(
    actor: Actor & { update?: (data: Record<string, unknown>) => Promise<unknown> },
    weapon: { system: Record<string, unknown>; update?: (data: Record<string, unknown>) => Promise<unknown> },
    n: number,
): Promise<void> {
    const ws = weapon.system as WeaponSystem;
    if (!ws.ammoId) return;
    const ammo = actor.items.get(ws.ammoId);
    if (!ammo) {
        await weapon.update?.({ "system.ammoId": "" });
        return;
    }
    const as = ammo.system as AmmoSystem;
    const newRounds = Math.max(0, (as.rounds ?? 0) - n);
    const ammoWithUpdate = ammo as Item & { update?: (data: Record<string, unknown>) => Promise<unknown> };
    await ammoWithUpdate.update?.({ "system.rounds": newRounds });
    if (newRounds === 0) {
        await weapon.update?.({ "system.ammoId": "" });
    }
}

export function ammoDirectives(ammo: Item): Directive[] {
    const as = ammo.system as AmmoSystem;
    const directives: Directive[] = [];

    switch (as.type) {
        case "apds":
            directives.push({ k: "armor.mult.ballistic", v: 0.5 });
            break;
        case "gel":
            directives.push({ k: "damage.type", v: "s" }, { k: "damage.powerAdd", v: -2 });
            break;
        case "tracer":
            directives.push({ k: "attack.tnAdd", v: -1 });
            break;
        case "flechette":
            directives.push({ k: "special.flechette", v: 1 });
            break;
        case "incendiary":
            directives.push({ k: "special.incendiary", v: 1 });
            break;
        case "capsule":
            directives.push({ k: "special.capsule", v: 1 });
            break;
        case "tracker":
            directives.push({ k: "special.tracker", v: 1 });
            break;
    }

    if (as.effectDirectives?.length) directives.push(...as.effectDirectives);
    return directives;
}
