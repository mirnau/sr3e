import { captureHealthBaseline } from "../combat/damageApplication";
import { stageStep, type DamageStep, type DamageTrack } from "../combat/damageMath";
import { computeDrainOutcome, rerenderDrainMessage, type DrainOutcomeFlag, type MagicLossCheck } from "./drainRerollHandler";
import type { ProcedureSetup } from "../combat/procedures/simpleSetups";
import type { RollSnapshot } from "../combat/engine/types";
import type { DieEntry } from "../../ui/combat/chat/renderRollSummary";
import { extractDieResults } from "../../ui/combat/chat/renderRollSummary";
import { sustainingDrainPower } from "./sustainedSpells";

type ActorLike = {
    id?: string;
    name?: string;
    system: Record<string, any>;
    items?: { contents?: Array<{ id?: string; name?: string; type: string; system: Record<string, any> }> };
    update?: (data: Record<string, unknown>) => Promise<unknown>;
    getFlag?: (scope: string, key: string) => unknown;
    setFlag?: (scope: string, key: string, value: unknown) => Promise<unknown>;
};

type SpellMeta = {
    force?: number;
    name?: string;
    damageLevel?: string;
    drain?: { powerModifier?: number; damageLevelModifier?: number };
};

export function buildSpellDrainSetup(actor: ActorLike, spell: SpellMeta): ProcedureSetup {
    const force = Math.max(1, Number(spell.force ?? 1));
    const baseLevel = damageStep(spell.damageLevel) ?? "m";
    const drainPower = Math.max(2, Math.floor(force / 2) + Number(spell.drain?.powerModifier ?? 0) + sustainingDrainPower(actor));
    const level = applyLevelModifier(baseLevel, Number(spell.drain?.damageLevelModifier ?? 0));
    const track = drainTrack(actor, force);
    const sorcery = sorceryDice(actor);

    return {
        kind: "spell-drain",
        title: `Drain: ${spell.name ?? "Spell"}`,
        rollState: {
            dice: willpower(actor),
            poolDice: 0,
            karmaDice: 0,
            targetNumber: drainPower,
            modifiers: [{ id: "spell-pool-limit", name: "Spell Pool <= Sorcery", value: 0, poolCap: sorcery }],
        },
        lockPriority: "advanced",
        selfPublish: false,
        initialPoolKey: "spell",
        defenseHint: null,
        extraOptions: {
            spellDrain: { force, level, track, power: drainPower, spellName: spell.name ?? "Spell" },
        },
        exportFn: () => ({
            familyKey: "spell-drain",
            weaponId: null,
            weaponName: spell.name ?? "Spell",
            plan: null,
            damage: null,
            tnBase: drainPower,
            tnMods: [],
            next: { kind: "none", ui: {}, args: {} },
        }),
        commitFn: async (roll: unknown) => {
            await applyDrain(actor, roll as RollSnapshot, drainPower, level, track, spell.name ?? "Spell");
        },
    };
}

export function isSpellcastingSetup(setup: ProcedureSetup): boolean {
    return setup.kind === "spellcasting" && !!setup.extraOptions?.spell;
}

async function applyDrain(
    actor: ActorLike,
    roll: RollSnapshot,
    tn: number,
    baseLevel: DamageStep,
    track: DamageTrack,
    spellName: string,
): Promise<void> {
    const baseline = captureHealthBaseline(actor as never);
    const results: DieEntry[] = extractDieResults(roll.terms);

    const flag: DrainOutcomeFlag = {
        actorId: actor.id ?? "",
        actorName: actor.name ?? "Caster",
        spellName,
        tn,
        baseLevel,
        track,
        baseline,
        options: roll.options,
        meta: roll.meta,
        results,
        rerollCount: 0,
        magicLoss: null,
    };

    const { final } = computeDrainOutcome(flag);
    flag.magicLoss = track === "physical" && final === "d" ? await rollMagicLossCheck(actor) : null;

    if (typeof ChatMessage === "undefined") return;
    await (ChatMessage as any).create?.({
        content: rerenderDrainMessage(flag),
        flags: { sr3e: { drainOutcome: flag } },
    });
}

async function rollMagicLossCheck(actor: ActorLike): Promise<MagicLossCheck | null> {
    const previousMagic = magicValue(actor);
    if (previousMagic <= 0) return null;

    const rollTotal = await roll2d6();
    const lostMagic = rollTotal <= previousMagic;
    const newMagic = lostMagic ? Math.max(0, previousMagic - 1) : previousMagic;
    const burnedOut = lostMagic && newMagic === 0;

    if (lostMagic) {
        await actor.update?.({
            "system.attributes.magic.value": newMagic,
            "system.attributes.isBurnedOut": burnedOut,
        });
    }

    return { rollTotal, previousMagic, newMagic, lostMagic, burnedOut };
}

async function roll2d6(): Promise<number> {
    const roll = new (Roll as any)("2d6");
    await roll.evaluate();
    return Number(roll.total ?? roll.terms?.flatMap((t: { results?: Array<{ result?: number; total?: number }> }) => t.results ?? [])
        .reduce((sum: number, die: { result?: number; total?: number }) => sum + Number(die.total ?? die.result ?? 0), 0));
}

function drainTrack(actor: ActorLike, force: number): DamageTrack {
    const magic = magicValue(actor);
    const projecting = Boolean(actor.system?.magic?.astrallyProjecting ?? actor.getFlag?.("sr3e", "astrallyProjecting"));
    return force > magic || projecting ? "physical" : "stun";
}

function magicValue(actor: ActorLike): number {
    return Number(actor.system?.attributes?.magic?.total ?? actor.system?.attributes?.magic?.value ?? 0);
}

function willpower(actor: ActorLike): number {
    return Math.max(1, Number(actor.system?.attributes?.willpower?.total ?? actor.system?.attributes?.willpower?.value ?? 1));
}

function sorceryDice(actor: ActorLike): number {
    const skill = (actor.items?.contents ?? []).find(item =>
        item.type === "skill" && String(item.name ?? "").trim().toLowerCase() === "sorcery"
    );
    const data = skill?.system?.[`${skill.system?.skillType ?? "active"}Skill`] ?? {};
    return Math.max(0, Number(data.value ?? 0));
}

function applyLevelModifier(level: DamageStep, modifier: number): DamageStep {
    return stageStep(level, modifier) ?? "d";
}

function damageStep(value: unknown): DamageStep | null {
    const step = String(value ?? "").toLowerCase() as DamageStep;
    return ["l", "m", "s", "d"].includes(step) ? step : null;
}
