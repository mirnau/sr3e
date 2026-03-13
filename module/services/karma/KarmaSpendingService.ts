/**
 * Service for handling karma spending during post-creation character advancement.
 *
 * Staged model:
 * - Attribute session: staged (debit only when shopping cart toggles OFF via commitAttrSession)
 * - Skill session: editors accumulate localStagedSpent; commitSkillDelta debits goodKarma directly
 * - Closing without commit reverts all staged changes
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

// ─── Session shape ────────────────────────────────────────────────────────────

interface KarmaAttrSession {
    active: boolean;
    stagedSpent: number;
    attrSnapshot: Record<string, number>; // attrKey → value at session start
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
            { active: false, stagedSpent: 0, attrSnapshot: {} }
        ) as Writable<KarmaAttrSession>;
    }

    #getGoodKarmaStore(actor: Actor): Writable<number> {
        return StoreManager.Instance.GetRWStore<number>(actor, "karma.goodKarma");
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

    /**
     * Cost to buy UP to newRating (the GK cost of that single step).
     * ≤ racial limit: newRating * 2; > racial limit: newRating * 3
     */
    #attrBuyCost(newRating: number, racialLimit: number): number {
        return newRating <= racialLimit ? newRating * 2 : newRating * 3;
    }

    // ─── Public cost helpers (called by skill editors) ────────────────────────

    /**
     * SR3e karma cost for one rating step of a skill.
     * @param newRating - The rating being bought (1-indexed step target)
     * @param linkedAttrRating - Linked attribute rating (use Intelligence for knowledge/language)
     * @param isActive - true = active skill; false = knowledge or language
     */
    calcSkillCost(newRating: number, linkedAttrRating: number, isActive: boolean): number {
        if (newRating === 1) return 1; // new skill — flat 1 GK
        if (isActive) {
            if (newRating <= linkedAttrRating) return Math.ceil(newRating * 1.5);
            if (newRating <= linkedAttrRating * 2) return newRating * 2;
            return Math.ceil(newRating * 2.5);
        } else {
            // knowledge / language
            if (newRating <= linkedAttrRating) return newRating;
            if (newRating <= linkedAttrRating * 2) return Math.ceil(newRating * 1.5);
            return newRating * 2;
        }
    }

    /**
     * SR3e karma cost for one rating step of a specialization.
     * @param newSpecRating - The spec rating being bought
     * @param linkedAttrRating - Linked attribute rating (use Intelligence for knowledge/language)
     * @param isActive - true = active skill spec; false = knowledge or language spec
     */
    calcSpecCost(newSpecRating: number, linkedAttrRating: number, isActive: boolean): number {
        if (isActive) {
            if (newSpecRating <= linkedAttrRating) return Math.ceil(newSpecRating * 0.5);
            if (newSpecRating <= linkedAttrRating * 2) return newSpecRating;
            return Math.ceil(newSpecRating * 1.5);
        } else {
            // knowledge / language
            if (newSpecRating <= linkedAttrRating) return Math.ceil(newSpecRating * 0.5);
            return newSpecRating; // SR3e has no higher tier for K/L specs
        }
    }

    // ─── Attribute session management ─────────────────────────────────────────

    /**
     * Start a new attribute karma-shopping session.
     * Snapshots all buyable attribute values so they can be restored on cancel.
     * goodKarma is NOT debited here — only on commitAttrSession().
     */
    startAttrSession(actor: Actor): void {
        const snapshot: Record<string, number> = {};
        for (const key of this.BUYABLE_ATTRS) {
            const store = StoreManager.Instance.GetRWStore<number>(actor, `attributes.${key}.value`);
            snapshot[key] = get(store);
        }
        this.#getSessionStore(actor).set({ active: true, stagedSpent: 0, attrSnapshot: snapshot });
    }

    /**
     * Returns true if the actor can stage an increment of the given attribute.
     * Validates: attr is not blocked, not at max, and virtual karma balance covers cost.
     */
    canStageAttrIncrement(actor: Actor, attrKey: string): boolean {
        if ((KARMA_BLOCKED_ATTRS as readonly string[]).includes(attrKey)) return false;
        const attrStore = StoreManager.Instance.GetRWStore<number>(actor, `attributes.${attrKey}.value`);
        const currentVal = get(attrStore);
        const attrMax = this.#getAttrMax(actor, attrKey);
        if (currentVal + 1 > attrMax) return false;
        const racialLimit = this.#getRacialLimit(actor, attrKey);
        const cost = this.#attrBuyCost(currentVal + 1, racialLimit);
        const session = get(this.#getSessionStore(actor));
        const goodKarma = get(this.#getGoodKarmaStore(actor));
        return goodKarma - session.stagedSpent >= cost;
    }

    /**
     * Stage an attribute increment — immediately updates the attr store (display changes),
     * accumulates stagedSpent. goodKarma is NOT debited until commitAttrSession().
     */
    stageAttrIncrement(actor: Actor, attrKey: string): void {
        const attrStore = StoreManager.Instance.GetRWStore<number>(actor, `attributes.${attrKey}.value`);
        const currentVal = get(attrStore);
        const racialLimit = this.#getRacialLimit(actor, attrKey);
        const cost = this.#attrBuyCost(currentVal + 1, racialLimit);
        attrStore.set(currentVal + 1);
        this.#getSessionStore(actor).update(s => ({ ...s, stagedSpent: s.stagedSpent + cost }));
    }

    /**
     * Returns true if the actor can undo a staged attribute increment.
     * Can only decrement back to the snapshot value — cannot sell pre-existing ratings.
     */
    canStageAttrDecrement(actor: Actor, attrKey: string): boolean {
        if ((KARMA_BLOCKED_ATTRS as readonly string[]).includes(attrKey)) return false;
        const session = get(this.#getSessionStore(actor));
        if (!session.active) return false;
        const attrStore = StoreManager.Instance.GetRWStore<number>(actor, `attributes.${attrKey}.value`);
        const currentVal = get(attrStore);
        const snapshotVal = session.attrSnapshot[attrKey] ?? currentVal;
        return currentVal > snapshotVal;
    }

    /**
     * Stage an attribute decrement — undoes the last staged increment.
     * Refunds the cost of the step that is being removed from stagedSpent.
     */
    stageAttrDecrement(actor: Actor, attrKey: string): void {
        const attrStore = StoreManager.Instance.GetRWStore<number>(actor, `attributes.${attrKey}.value`);
        const currentVal = get(attrStore);
        const racialLimit = this.#getRacialLimit(actor, attrKey);
        const refund = this.#attrBuyCost(currentVal, racialLimit); // cost of the last step purchased
        attrStore.set(currentVal - 1);
        this.#getSessionStore(actor).update(s => ({ ...s, stagedSpent: s.stagedSpent - refund }));
    }

    /**
     * Commit the attribute session — debit goodKarma by stagedSpent and clear session.
     * Called when shopping cart is toggled OFF.
     */
    commitAttrSession(actor: Actor): void {
        const session = get(this.#getSessionStore(actor));
        if (!session.active) return;
        const goodKarmaStore = this.#getGoodKarmaStore(actor);
        goodKarmaStore.set(get(goodKarmaStore) - session.stagedSpent);
        this.#getSessionStore(actor).set({ active: false, stagedSpent: 0, attrSnapshot: {} });
    }

    /**
     * Cancel the attribute session — restore all attrs to snapshot values.
     * goodKarma is NOT changed. Called on sheet close or explicit cancel.
     */
    cancelAttrSession(actor: Actor): void {
        const session = get(this.#getSessionStore(actor));
        if (!session.active) return;
        for (const [key, snapshotVal] of Object.entries(session.attrSnapshot)) {
            const attrStore = StoreManager.Instance.GetRWStore<number>(actor, `attributes.${key}.value`);
            attrStore.set(snapshotVal);
        }
        this.#getSessionStore(actor).set({ active: false, stagedSpent: 0, attrSnapshot: {} });
    }

    // ─── Skill delta commit ───────────────────────────────────────────────────

    /**
     * Debit goodKarma by the editor's accumulated karma delta.
     * Called by skill editors on thumbs-up commit.
     * If karmaDelta <= 0, no-op (nothing to debit).
     */
    commitSkillDelta(actor: Actor, karmaDelta: number): void {
        if (karmaDelta <= 0) return;
        const goodKarmaStore = this.#getGoodKarmaStore(actor);
        goodKarmaStore.set(get(goodKarmaStore) - karmaDelta);
    }
}
