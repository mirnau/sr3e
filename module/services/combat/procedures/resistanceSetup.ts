import { buildResistance, resolveResistance } from "../resistanceEngine";
import { countSuccesses } from "../engine/contestCoordinator";
import type { ResistancePrep } from "../engine/types";
import type { ProcedureSetup } from "./simpleSetups";
import type { RollSnapshot } from "../engine/types";
import type { Modifier } from "../modifierList";

type AttributeMap = Record<string, { value?: number; total?: number }>;
type Defender = {
    system: Record<string, unknown>;
    items?: { contents?: unknown[] };
    update?: (data: Record<string, unknown>) => Promise<unknown>;
};

function bodyDice(defender: Defender): number {
    const attrs = (defender.system as { attributes?: AttributeMap }).attributes ?? {};
    const b = attrs.body;
    return Math.max(1, b?.total ?? b?.value ?? 1);
}

function toResistanceBuildInput(prep: ResistancePrep, defender: Defender) {
    return buildResistance(
        defender as Parameters<typeof buildResistance>[0],
        {
            power: prep.tnBase,
            damageType: `${prep.stagedStepBeforeResist}${prep.trackKey === "stun" ? "s" : "p"}`,
            levelDelta: 0,
            attackTNAdd: 0,
            resistTNAdd: 0,
            armorUse: "ballistic" as const,
            armorMult: { ballistic: 1, impact: 1 },
            notes: [],
        },
        0,
    );
}

export function buildResistanceSetup(defender: Defender, prep: ResistancePrep): ProcedureSetup {
    const dice = bodyDice(defender);

    const lockedMods: Modifier[] = prep.tnMods.map(m => ({ ...m, source: "armor" }));
    const rollState = {
        dice,
        poolDice: 0,
        karmaDice: 0,
        targetNumber: prep.tnBase,
        modifiers: lockedMods,
    };

    return {
        kind: "resistance",
        title: "Resist Damage",
        rollState,
        lockPriority: "advanced",
        selfPublish: false,
        defenseHint: { type: "attribute", key: "body", tnMod: 0, tnLabel: "Body" },
        exportFn: () => ({
            familyKey: "resistance",
            weaponId: prep.weaponId,
            weaponName: prep.weaponName,
            plan: null,
            damage: null,
            tnBase: prep.tnBase,
            tnMods: prep.tnMods,
            next: { kind: "", ui: {}, args: {} },
        }),
        commitFn: async (roll: unknown) => {
            const rollSnap = roll as RollSnapshot;
            const tn = rollState.targetNumber + lockedMods.reduce((s, m) => s + m.value, 0);
            const bodySuccesses = countSuccesses({ ...rollSnap, options: { ...rollSnap.options, targetNumber: tn } });

            const build = toResistanceBuildInput(prep, defender);
            const outcome = resolveResistance(build, bodySuccesses);

            if (outcome.applied && outcome.boxes > 0) {
                const trackPath = `system.health.${prep.trackKey}.value`;
                const current = ((defender.system as Record<string, unknown>).health as Record<string, Record<string, number>>)?.[prep.trackKey]?.value ?? 0;
                await defender.update?.({ [trackPath]: current + outcome.boxes });
            }
        },
    };
}
