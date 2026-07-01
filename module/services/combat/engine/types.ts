import type SR3EActor from "../../../documents/SR3EActor";
import type SR3EItem from "../../../documents/SR3EItem";
import type { Modifier } from "../modifierList";
import type { RollState } from "../diceFormula";
import type { Directive, AttackPlan, DamagePacket } from "../damagePacket";
import type { DamageStep, DamageTrack } from "../damageMath";

export type { Modifier, RollState, Directive, AttackPlan, DamagePacket, DamageStep, DamageTrack };

export type CombatContext = {
    attacker: SR3EActor;
    weapon: SR3EItem | null;
    targets: Token[];
    rollState: RollState;
    directives: Directive[];
};

export type CombatResult = {
    roll: Roll;
    netSuccesses: number;
    damagePacket: DamagePacket | null;
    resistancePrep: ResistancePrep | null;
    chatHtml: string;
};

export type RollSnapshot = {
    terms: unknown[];
    options: { targetNumber?: number | null; [k: string]: unknown };
    meta: { flavor: string; procedureKind: string };
};

export type ResistancePrep = {
    familyKey: string;
    weaponId: string | null;
    weaponName: string;
    tnBase: number;
    tnMods: Modifier[];
    stagedStepBeforeResist: DamageStep;
    trackKey: DamageTrack;
    boxesIfUnresisted: number;
};

export type DefenseHint = {
    type: "attribute" | "skill";
    key: string;
    tnMod: number;
    tnLabel: string;
};

export type ContestExport = {
    familyKey: string;
    weaponId: string | null;
    weaponName: string;
    plan: AttackPlan | null;
    damage: DamagePacket | null;
    tnBase: number;
    tnMods: Modifier[];
    next: {
        kind: string;
        ui: Record<string, string>;
        args: Record<string, unknown>;
    };
};

export type ContestStub = {
    contestId: string;
    initiator: { actorId: string; userId: string };
    target: { actorId: string; name: string; tokenId: string | null; sceneId: string | null };
    initiatorRoll: RollSnapshot;
    procedureKind: string;
    exportCtx: ContestExport;
    defenseHint: DefenseHint;
};

export type SerializedProcedure = {
    schema: 2;
    kind: string;
    actor: { id: string; uuid: string };
    item: { id: string | null; uuid: string | null };
    rollState: RollState;
    exportCtx: ContestExport;
};

export type ProcedureBuilder = (ctx: CombatContext) => Promise<CombatResult>;
