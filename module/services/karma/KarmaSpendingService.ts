/**
 * Service for handling karma spending during post-creation character advancement.
 *
 * Staged model:
 * - Attribute session: deltas tracked in-memory only; Foundry persisted only on commit.
 *   This avoids actor.update() calls during staging, preventing sheet re-renders that
 *   would reset the in-memory session store.
 * - Skill session: snapshot on open, live store writes for preview, revert on cancel, debit on commit.
 * - Closing without commit reverts all staged changes.
 *
 * SR3e cost rules:
 * - Attribute: newRating * 2 (≤ racial limit) or newRating * 3 (> racial limit)
 * - Active skill: 1 GK (new), ceil(rating * 1.5) / rating * 2 / ceil(rating * 2.5) vs linkedAttr thresholds
 * - Knowledge/language: 1 GK (new), rating / ceil(rating * 1.5) / rating * 2 vs Int thresholds
 * - Spec (active): ceil(specRating * 0.5) / specRating / ceil(specRating * 1.5)
 * - Spec (knowledge/language): ceil(specRating * 0.5) / specRating
 */

import { get } from "svelte/store";
import type { Writable } from "svelte/store";
import { StoreManager } from "../../utilities/StoreManager.svelte";

// ─── Constants ────────────────────────────────────────────────────────────────

const KARMA_BLOCKED_ATTRS = ["reaction", "magic", "essence", "initiative"] as const;

// ─── Session shapes ───────────────────────────────────────────────────────────

interface KarmaAttrSession {
    active: boolean;
    stagedSpent: number;
    attrSnapshot: Record<string, number>; // attrKey → value at session start
    stagedDeltas: Record<string, number>; // attrKey → net staged increments (never written to Foundry until commit)
}

export interface SkillSession {
    stagedSpent: number;
    snapshot: {
        value: number;
        specializations: Array<{ name: string; value: number }>;
    };
    sessionSpecInitialRatings: number[]; // initial rating of each session-added spec, in addition order
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class KarmaSpendingService {
    static #instance: KarmaSpendingService | null = null;

    private constructor() {}

    static Instance(): KarmaSpendingService {
        if (!this.#instance) this.#instance = new KarmaSpendingService();
        return this.#instance;
    }

    // ─── Buyable attribute keys ───────────────────────────────────────────────

    readonly BUYABLE_ATTRS = ["body", "quickness", "strength", "charisma", "intelligence", "willpower"] as const;

    // ─── Private store accessors ──────────────────────────────────────────────

    #getSessionStore(actor: Actor): Writable<KarmaAttrSession> {
        return StoreManager.Instance.GetShallowStore<KarmaAttrSession>(
            actor,
            "shoppingKarmaSession",
            { active: false, stagedSpent: 0, attrSnapshot: {}, stagedDeltas: {} }
        ) as Writable<KarmaAttrSession>;
    }

    #getGoodKarmaStore(actor: Actor): Writable<number> {
        return StoreManager.Instance.GetRWStore<number>(actor, "karma.goodKarma");
    }

    #getSkillRegistryStore(actor: Actor): Writable<Record<string, SkillSession>> {
        return StoreManager.Instance.GetShallowStore<Record<string, SkillSession>>(
            actor,
            "skillKarmaRegistry",
            {}
        ) as Writable<Record<string, SkillSession>>;
    }

    #getSkillKey(skill: Item): string {
        return `${(skill.system as Record<string, any>).skillType ?? "active"}Skill`;
    }

    #remainingKarma(actor: Actor): number {
        const attrSession = get(this.#getSessionStore(actor));
        const attrSpend = attrSession.active ? attrSession.stagedSpent : 0;
        const skillSpend = Object.values(get(this.#getSkillRegistryStore(actor))).reduce((sum, s) => sum + s.stagedSpent, 0);
        return get(this.#getGoodKarmaStore(actor)) - attrSpend - skillSpend;
    }

    // Returns the staged attr value (snapshot + in-memory delta, never reads Foundry)
    #getStagedAttrValue(actor: Actor, attrKey: string): number {
        const session = get(this.#getSessionStore(actor));
        if (!session.active) return get(StoreManager.Instance.GetRWStore<number>(actor, `attributes.${attrKey}.value`));
        return (session.attrSnapshot[attrKey] ?? 0) + (session.stagedDeltas[attrKey] ?? 0);
    }

    // ─── Private cost helpers ─────────────────────────────────────────────────

    #getRacialLimit(actor: Actor, attrKey: string): number {
        const metatype = actor.items.find((i: Item) => i.type === "metatype") as Item | undefined;
        const system = metatype?.system as { attributeLimits?: Record<string, number> } | undefined;
        return (system?.attributeLimits?.[attrKey] as number | undefined) ?? 6;
    }

    #getAttrMax(actor: Actor, attrKey: string): number {
        return Math.floor(this.#getRacialLimit(actor, attrKey) * 1.5);
    }

    #attrBuyCost(newRating: number, racialLimit: number): number {
        return newRating <= racialLimit ? newRating * 2 : newRating * 3;
    }

    // ─── Public cost helpers (called by skill editors) ────────────────────────

    calcSkillCost(newRating: number, linkedAttrRating: number, isActive: boolean): number {
        if (newRating === 1) return 1;
        if (isActive) {
            if (newRating <= linkedAttrRating) return Math.ceil(newRating * 1.5);
            if (newRating <= linkedAttrRating * 2) return newRating * 2;
            return Math.ceil(newRating * 2.5);
        } else {
            if (newRating <= linkedAttrRating) return newRating;
            if (newRating <= linkedAttrRating * 2) return Math.ceil(newRating * 1.5);
            return newRating * 2;
        }
    }

    calcSpecCost(newSpecRating: number, linkedAttrRating: number, isActive: boolean): number {
        if (isActive) {
            if (newSpecRating <= linkedAttrRating) return Math.ceil(newSpecRating * 0.5);
            if (newSpecRating <= linkedAttrRating * 2) return newSpecRating;
            return Math.ceil(newSpecRating * 1.5);
        } else {
            if (newSpecRating <= linkedAttrRating) return Math.ceil(newSpecRating * 0.5);
            return newSpecRating;
        }
    }

    // ─── Attribute session management ─────────────────────────────────────────

    startAttrSession(actor: Actor): void {
        const snapshot: Record<string, number> = {};
        for (const key of this.BUYABLE_ATTRS) {
            snapshot[key] = get(StoreManager.Instance.GetRWStore<number>(actor, `attributes.${key}.value`));
        }
        this.#getSessionStore(actor).set({ active: true, stagedSpent: 0, attrSnapshot: snapshot, stagedDeltas: {} });
    }

    canStageAttrIncrement(actor: Actor, attrKey: string): boolean {
        if ((KARMA_BLOCKED_ATTRS as readonly string[]).includes(attrKey)) return false;
        const currentStaged = this.#getStagedAttrValue(actor, attrKey);
        if (currentStaged + 1 > this.#getAttrMax(actor, attrKey)) return false;
        const cost = this.#attrBuyCost(currentStaged + 1, this.#getRacialLimit(actor, attrKey));
        return this.#remainingKarma(actor) >= cost;
    }

    stageAttrIncrement(actor: Actor, attrKey: string): void {
        const currentStaged = this.#getStagedAttrValue(actor, attrKey);
        const cost = this.#attrBuyCost(currentStaged + 1, this.#getRacialLimit(actor, attrKey));
        this.#getSessionStore(actor).update(s => ({
            ...s,
            stagedSpent: s.stagedSpent + cost,
            stagedDeltas: { ...s.stagedDeltas, [attrKey]: (s.stagedDeltas[attrKey] ?? 0) + 1 },
        }));
    }

    canStageAttrDecrement(actor: Actor, attrKey: string): boolean {
        if ((KARMA_BLOCKED_ATTRS as readonly string[]).includes(attrKey)) return false;
        const session = get(this.#getSessionStore(actor));
        if (!session.active) return false;
        const currentStaged = (session.attrSnapshot[attrKey] ?? 0) + (session.stagedDeltas[attrKey] ?? 0);
        return currentStaged > (session.attrSnapshot[attrKey] ?? currentStaged);
    }

    stageAttrDecrement(actor: Actor, attrKey: string): void {
        const currentStaged = this.#getStagedAttrValue(actor, attrKey);
        const refund = this.#attrBuyCost(currentStaged, this.#getRacialLimit(actor, attrKey));
        this.#getSessionStore(actor).update(s => ({
            ...s,
            stagedSpent: s.stagedSpent - refund,
            stagedDeltas: { ...s.stagedDeltas, [attrKey]: (s.stagedDeltas[attrKey] ?? 0) - 1 },
        }));
    }

    commitAttrSession(actor: Actor): void {
        const session = get(this.#getSessionStore(actor));
        if (!session.active) return;
        // Debit goodKarma
        const goodKarmaStore = this.#getGoodKarmaStore(actor);
        goodKarmaStore.set(get(goodKarmaStore) - session.stagedSpent);
        // Persist staged attr changes to Foundry
        for (const [key, delta] of Object.entries(session.stagedDeltas)) {
            if (delta !== 0) {
                StoreManager.Instance.GetRWStore<number>(actor, `attributes.${key}.value`)
                    .set((session.attrSnapshot[key] ?? 0) + delta);
            }
        }
        this.#getSessionStore(actor).set({ active: false, stagedSpent: 0, attrSnapshot: {}, stagedDeltas: {} });
    }

    cancelAttrSession(actor: Actor): void {
        const session = get(this.#getSessionStore(actor));
        if (!session.active) return;
        // Nothing was written to Foundry during staging — just clear the session
        this.#getSessionStore(actor).set({ active: false, stagedSpent: 0, attrSnapshot: {}, stagedDeltas: {} });
    }

    // ─── Skill delta commit (internal) ───────────────────────────────────────

    commitSkillDelta(actor: Actor, karmaDelta: number): void {
        if (karmaDelta <= 0) return;
        const goodKarmaStore = this.#getGoodKarmaStore(actor);
        goodKarmaStore.set(get(goodKarmaStore) - karmaDelta);
    }

    // ─── Skill session management ─────────────────────────────────────────────

    startSkillSession(actor: Actor, skill: Item): void {
        const skillKey = this.#getSkillKey(skill);
        const value = get(StoreManager.Instance.GetRWStore<number>(skill, `${skillKey}.value`));
        const specializations = get(StoreManager.Instance.GetRWStore<Array<{ name: string; value: number }>>(skill, `${skillKey}.specializations`)).map(s => ({ ...s }));
        this.#getSkillRegistryStore(actor).update(r => ({ ...r, [skill.id!]: { stagedSpent: 0, snapshot: { value, specializations }, sessionSpecInitialRatings: [] } }));
    }

    cancelSkillSession(actor: Actor, skill: Item): void {
        const registry = this.#getSkillRegistryStore(actor);
        const session = get(registry)[skill.id!];
        if (!session) return;
        const skillKey = this.#getSkillKey(skill);
        StoreManager.Instance.GetRWStore<number>(skill, `${skillKey}.value`).set(session.snapshot.value);
        StoreManager.Instance.GetRWStore<Array<{ name: string; value: number }>>(skill, `${skillKey}.specializations`).set(session.snapshot.specializations.map(s => ({ ...s })));
        registry.update(r => { const next = { ...r }; delete next[skill.id!]; return next; });
    }

    commitSkillSession(actor: Actor, skillId: string): void {
        const registry = this.#getSkillRegistryStore(actor);
        const session = get(registry)[skillId];
        if (!session) return;
        this.commitSkillDelta(actor, session.stagedSpent);
        registry.update(r => { const next = { ...r }; delete next[skillId]; return next; });
    }

    canStageSkillIncrement(actor: Actor, skill: Item, linkedAttrRating: number, isActive: boolean): boolean {
        const skillKey = this.#getSkillKey(skill);
        const currentVal = get(StoreManager.Instance.GetRWStore<number>(skill, `${skillKey}.value`));
        return this.#remainingKarma(actor) >= this.calcSkillCost(currentVal + 1, linkedAttrRating, isActive);
    }

    stageSkillIncrement(actor: Actor, skill: Item, linkedAttrRating: number, isActive: boolean): void {
        const skillKey = this.#getSkillKey(skill);
        const valueStore = StoreManager.Instance.GetRWStore<number>(skill, `${skillKey}.value`);
        const currentVal = get(valueStore);
        const cost = this.calcSkillCost(currentVal + 1, linkedAttrRating, isActive);
        valueStore.set(currentVal + 1);
        this.#getSkillRegistryStore(actor).update(r => ({
            ...r,
            [skill.id!]: { ...r[skill.id!]!, stagedSpent: (r[skill.id!]?.stagedSpent ?? 0) + cost },
        }));
    }

    canStageSkillDecrement(actor: Actor, skill: Item): boolean {
        const session = get(this.#getSkillRegistryStore(actor))[skill.id!];
        if (!session) return false;
        const skillKey = this.#getSkillKey(skill);
        const currentVal = get(StoreManager.Instance.GetRWStore<number>(skill, `${skillKey}.value`));
        if (currentVal <= session.snapshot.value) return false;
        // Block if session has added specs to prevent spec ceiling violations on decrement
        const specs = get(StoreManager.Instance.GetRWStore<Array<{ name: string; value: number }>>(skill, `${skillKey}.specializations`));
        return specs.length <= session.snapshot.specializations.length;
    }

    stageSkillDecrement(actor: Actor, skill: Item, linkedAttrRating: number, isActive: boolean): void {
        const skillKey = this.#getSkillKey(skill);
        const valueStore = StoreManager.Instance.GetRWStore<number>(skill, `${skillKey}.value`);
        const currentVal = get(valueStore);
        const refund = this.calcSkillCost(currentVal, linkedAttrRating, isActive);
        valueStore.set(currentVal - 1);
        this.#getSkillRegistryStore(actor).update(r => ({
            ...r,
            [skill.id!]: { ...r[skill.id!]!, stagedSpent: (r[skill.id!]?.stagedSpent ?? 0) - refund },
        }));
    }

    // ─── Spec session management ──────────────────────────────────────────────

    canAddSpec(actor: Actor, skill: Item, linkedAttrRating: number, isActive: boolean): boolean {
        const skillKey = this.#getSkillKey(skill);
        const currentValue = get(StoreManager.Instance.GetRWStore<number>(skill, `${skillKey}.value`));
        const specs = get(StoreManager.Instance.GetRWStore<Array<{ name: string; value: number }>>(skill, `${skillKey}.specializations`));
        if (specs.length >= currentValue) return false;
        return this.#remainingKarma(actor) >= this.calcSpecCost(currentValue + 1, linkedAttrRating, isActive);
    }

    stageSpecAdd(actor: Actor, skill: Item, specName: string, linkedAttrRating: number, isActive: boolean): void {
        const skillKey = this.#getSkillKey(skill);
        const currentValue = get(StoreManager.Instance.GetRWStore<number>(skill, `${skillKey}.value`));
        const specsStore = StoreManager.Instance.GetRWStore<Array<{ name: string; value: number }>>(skill, `${skillKey}.specializations`);
        const startingRating = currentValue + 1;
        const cost = this.calcSpecCost(startingRating, linkedAttrRating, isActive);
        specsStore.update(specs => [...specs, { name: specName, value: startingRating }]);
        this.#getSkillRegistryStore(actor).update(r => ({
            ...r,
            [skill.id!]: {
                ...r[skill.id!]!,
                stagedSpent: (r[skill.id!]?.stagedSpent ?? 0) + cost,
                sessionSpecInitialRatings: [...(r[skill.id!]?.sessionSpecInitialRatings ?? []), startingRating],
            },
        }));
    }

    canStageSpecIncrement(actor: Actor, skill: Item, specIndex: number, linkedAttrRating: number, isActive: boolean): boolean {
        const skillKey = this.#getSkillKey(skill);
        const currentSkillValue = get(StoreManager.Instance.GetRWStore<number>(skill, `${skillKey}.value`));
        const specs = get(StoreManager.Instance.GetRWStore<Array<{ name: string; value: number }>>(skill, `${skillKey}.specializations`));
        const spec = specs[specIndex];
        if (!spec) return false;
        const ceiling = currentSkillValue === 1 ? 3 : currentSkillValue * 2;
        if (spec.value + 1 > ceiling) return false;
        return this.#remainingKarma(actor) >= this.calcSpecCost(spec.value + 1, linkedAttrRating, isActive);
    }

    stageSpecIncrement(actor: Actor, skill: Item, specIndex: number, linkedAttrRating: number, isActive: boolean): void {
        const skillKey = this.#getSkillKey(skill);
        const specsStore = StoreManager.Instance.GetRWStore<Array<{ name: string; value: number }>>(skill, `${skillKey}.specializations`);
        const specs = get(specsStore);
        const spec = specs[specIndex];
        if (!spec) return;
        const cost = this.calcSpecCost(spec.value + 1, linkedAttrRating, isActive);
        specsStore.set(specs.map((s, i) => i === specIndex ? { ...s, value: s.value + 1 } : s));
        this.#getSkillRegistryStore(actor).update(r => ({
            ...r,
            [skill.id!]: { ...r[skill.id!]!, stagedSpent: (r[skill.id!]?.stagedSpent ?? 0) + cost },
        }));
    }

    canDeleteSessionSpec(actor: Actor, skill: Item, specIndex: number): boolean {
        const session = get(this.#getSkillRegistryStore(actor))[skill.id!];
        if (!session) return false;
        return specIndex >= session.snapshot.specializations.length;
    }

    stageSpecDelete(actor: Actor, skill: Item, specIndex: number, linkedAttrRating: number, isActive: boolean): void {
        const skillKey = this.#getSkillKey(skill);
        const specsStore = StoreManager.Instance.GetRWStore<Array<{ name: string; value: number }>>(skill, `${skillKey}.specializations`);
        const specs = get(specsStore);
        const spec = specs[specIndex];
        if (!spec) return;
        const registry = this.#getSkillRegistryStore(actor);
        const session = get(registry)[skill.id!];
        if (!session) return;

        const relativeIndex = specIndex - session.snapshot.specializations.length;
        const initialRating = session.sessionSpecInitialRatings[relativeIndex] ?? spec.value;
        let refund = 0;
        for (let r = initialRating; r <= spec.value; r++) {
            refund += this.calcSpecCost(r, linkedAttrRating, isActive);
        }

        specsStore.set(specs.filter((_, i) => i !== specIndex));
        registry.update(r => {
            const s = r[skill.id!]!;
            return {
                ...r,
                [skill.id!]: {
                    ...s,
                    stagedSpent: s.stagedSpent - refund,
                    sessionSpecInitialRatings: s.sessionSpecInitialRatings.filter((_, i) => i !== relativeIndex),
                },
            };
        });
    }
}
