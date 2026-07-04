import type { Directive } from "../damagePacket";

type AmmoSystem = {
    rounds?: number;
    maxCapacity?: number;
    type?: string;
    ammunitionClass?: string;
    effectDirectives?: Directive[];
};

type WeaponSystem = {
    ammoId?: string;
    ammunitionClass?: string;
    reloadMechanism?: string;
};

type Item = { id: string; name?: string; type: string; system: Record<string, unknown>; getFlag?: (scope: string, key: string) => unknown };
type Actor = { type?: string; items: { get: (id: string) => Item | undefined; contents?: Item[] } };

export function getAttachedAmmo(actor: Actor, weapon: { system: Record<string, unknown> }): Item | null {
    const ws = weapon.system as WeaponSystem;
    if (!ws.ammoId) return null;
    const ammo = actor.items.get(ws.ammoId) ?? null;
    if (!ammo) return null;
    const as = ammo.system as AmmoSystem;
    return (as.rounds ?? 0) > 0 ? ammo : null;
}

// A vehicle's cargo has no "equipped" concept — everything mounted or
// carried is available — so the isEquipped gate (meant for a character's
// personal gear) only applies to non-vehicle actors. Lets a vehicle-mounted
// weapon draw ammo from either the vehicle's own stock or the shooting
// character's carried ammo.
export function findCompatibleAmmo(actor: Actor, weapon: { system: Record<string, unknown> }): Item[] {
    const ws = weapon.system as WeaponSystem;
    const items: Item[] = actor.items.contents ?? [...(actor.items as unknown as Iterable<Item>)];
    const requireEquipped = actor.type !== "mechanical";
    return items.filter(i => {
        if (i.type !== "ammunition") return false;
        const as = i.system as AmmoSystem;
        const equippedOk = !requireEquipped || !!i.getFlag?.("sr3e", "isEquipped");
        const mechOk = !ws.reloadMechanism || !as.reloadMechanism || as.reloadMechanism === ws.reloadMechanism;
        return as.ammunitionClass === ws.ammunitionClass && mechOk && equippedOk && (as.rounds ?? 0) > 0;
    });
}

function asList<T>(value: T | T[]): T[] {
    return Array.isArray(value) ? value : [value];
}

export async function consume(
    actors: (Actor & { update?: (data: Record<string, unknown>) => Promise<unknown> }) | (Actor & { update?: (data: Record<string, unknown>) => Promise<unknown> })[],
    weapon: { system: Record<string, unknown>; update?: (data: Record<string, unknown>) => Promise<unknown> },
    n: number,
): Promise<void> {
    const ws = weapon.system as WeaponSystem;
    if (!ws.ammoId) return;
    const actorList = asList(actors);
    const owner = actorList.find(a => a.items.get(ws.ammoId!));
    const ammo = owner?.items.get(ws.ammoId);
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

export async function reloadWeapon(
    actors: Actor | Actor[],
    weapon: { name?: string; system: Record<string, unknown>; update?: (data: Record<string, unknown>) => Promise<unknown> },
): Promise<void> {
    const candidates = asList(actors).flatMap(a => findCompatibleAmmo(a, weapon));
    const options = candidates.map(c => {
        const as = c.system as AmmoSystem;
        return `<option value="${c.id}">${c.name} — ${as.rounds ?? 0}/${as.maxCapacity ?? 0} rounds</option>`;
    }).join("");
    const content = `<select name="ammoId"><option value="__UNLOADED__">— Unloaded —</option>${options}</select><p class="hint">Ammo must be equipped to appear here.</p>`;

    const chosen = await (foundry.applications.api.DialogV2 as any).prompt({
        window: { title: `Reload: ${weapon.name ?? "Weapon"}` },
        content,
        ok: { callback: (_e: Event, btn: HTMLElement) => (btn as any).form.elements.namedItem("ammoId").value },
        rejectClose: false,
    }) as string | null;

    if (!chosen) return;
    await weapon.update?.({ "system.ammoId": chosen === "__UNLOADED__" ? "" : chosen });
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
