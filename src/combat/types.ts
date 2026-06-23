import type SR3EActor from "../../module/documents/SR3EActor";
import type SR3EItem from "../../module/documents/SR3EItem";

// Known procedure kinds — registry maps these to builder fns (Decision 6)
export type ProcedureKind =
    | "skill"
    | "attribute"
    | "firearm"
    | "melee"
    | "explosive"
    | "dodge"
    | "resistance"
    | "melee-defense";

// Directive key system from DamagePacket (Decision 3) — extensible via string
export type DirectiveKey =
    | "damage.powerAdd"
    | "damage.powerMult"
    | "damage.stageAdd"
    | "armor.mult.ballistic"
    | "armor.mult.impact"
    | (string & Record<never, never>);

export type Directive = {
    key: DirectiveKey;
    value: number;
    source: string;
};

export type Modifier = {
    label: string;
    value: number;
    source: string;
};

// RollState — built by UI before procedure executes; passed explicitly, never stored (Decision 2, 5)
export type RollState = {
    pool: number;
    tn: number;
    modifiers: Modifier[];
    poolCap?: number;
    forbidPool?: boolean;
};

// Placeholders for Tier 1 rule types — replaced when rules/ modules are implemented
export type DamagePacket = { readonly _brand: "DamagePacket" };
export type ResistancePrep = { readonly _brand: "ResistancePrep" };

// Core procedure contract (Decision 1, 5)
export type CombatContext = {
    attacker: SR3EActor;
    weapon: SR3EItem;
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

export type CombatProcedure = (ctx: CombatContext) => Promise<CombatResult>;
