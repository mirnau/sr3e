/**
 * Service for handling skill point spending during character creation.
 * Manages separate point pools for active, knowledge, and language skills.
 *
 * SR3e cost rules (all skill types use the same formula):
 *   cost = currentValue < linkedAttrRating ? 1 : 2
 *
 *   Active skills:   linkedAttrRating = skill's linked attribute
 *   Knowledge skills: linkedAttrRating = Intelligence (always, per SR3e rules)
 *   Language skills:  linkedAttrRating = Intelligence (always, per SR3e rules)
 */

import { get } from "svelte/store";
import { StoreManager } from "../../utilities/StoreManager.svelte";

export type SkillCategory = "active" | "knowledge" | "language";

/**
 * Maximum skill rating during character creation (SR3e rule: skills cap at 6)
 */
const MAX_SKILL_RATING = 6;

/** Maps category to the actor's creation point pool path */
const POOL_PATH: Record<SkillCategory, string> = {
    active: "creation.activePoints",
    knowledge: "creation.knowledgePoints",
    language: "creation.languagePoints",
};

/** Maps category to the skill item's value path */
const VALUE_PATH: Record<SkillCategory, string> = {
    active: "activeSkill.value",
    knowledge: "knowledgeSkill.value",
    language: "languageSkill.value",
};

/** Maps category to the skill item's specializations path */
const SPEC_PATH: Record<SkillCategory, string> = {
    active: "activeSkill.specializations",
    knowledge: "knowledgeSkill.specializations",
    language: "languageSkill.specializations",
};

/**
 * Skill spending service for character creation.
 * Follows singleton pattern established in Phase 1.
 *
 * IMPORTANT: This service does NOT call storeManager.Subscribe/Unsubscribe —
 * that is the component's responsibility.
 */
export class SkillSpendingService {
    static #instance: SkillSpendingService | null = null;

    static Instance(): SkillSpendingService {
        if (!this.#instance) this.#instance = new SkillSpendingService();
        return this.#instance;
    }

    // ─── Cost helpers ─────────────────────────────────────────────────────────

    /**
     * Compute the cost to increase a skill from its current value to current+1.
     * All skill types: cost = currentValue < linkedAttrRating ? 1 : 2
     * (Knowledge/language callers pass Intelligence as linkedAttrRating)
     */
    #increaseCost(currentValue: number, linkedAttrRating: number): number {
        return currentValue < linkedAttrRating ? 1 : 2;
    }

    /**
     * Compute the refund for decreasing a skill from its current value to current-1.
     * All skill types: refund = currentValue > linkedAttrRating ? 2 : 1
     */
    #decreaseRefund(currentValue: number, linkedAttrRating: number): number {
        return currentValue > linkedAttrRating ? 2 : 1;
    }

    // ─── Store accessors ──────────────────────────────────────────────────────

    #getValueStore(skill: Item, category: SkillCategory) {
        return StoreManager.Instance.GetRWStore<number>(skill, VALUE_PATH[category]);
    }

    #getPoolStore(actor: Actor, category: SkillCategory) {
        return StoreManager.Instance.GetRWStore<number>(actor, POOL_PATH[category]);
    }

    #getSpecStore(skill: Item, category: SkillCategory) {
        return StoreManager.Instance.GetRWStore<Array<{ name: string; value: number }>>(
            skill,
            SPEC_PATH[category]
        );
    }

    // ─── Public API ───────────────────────────────────────────────────────────

    /**
     * Check if the character can increase a skill.
     * Validates: has enough points in the pool AND skill not at max rating.
     */
    canIncrease(actor: Actor, skill: Item, category: SkillCategory, linkedAttrRating: number): boolean {
        const valueStore = this.#getValueStore(skill, category);
        const currentValue = get(valueStore) ?? 0;

        if (currentValue >= MAX_SKILL_RATING) return false;

        const poolStore = this.#getPoolStore(actor, category);
        const remainingPoints = get(poolStore) ?? 0;
        const cost = this.#increaseCost(currentValue, linkedAttrRating);

        return remainingPoints >= cost;
    }

    /**
     * Increase a skill by 1, spending points from the appropriate pool.
     * cost = currentValue < linkedAttrRating ? 1 : 2 (active only; knowledge/language always 1)
     */
    increase(actor: Actor, skill: Item, category: SkillCategory, linkedAttrRating: number): void {
        const valueStore = this.#getValueStore(skill, category);
        const currentValue = get(valueStore) ?? 0;
        const cost = this.#increaseCost(currentValue, linkedAttrRating);

        const poolStore = this.#getPoolStore(actor, category);
        const currentPool = get(poolStore) ?? 0;

        valueStore.set(currentValue + 1);
        poolStore.set(currentPool - cost);
    }

    /**
     * Check if the character can decrease a skill.
     * Validates: skill rating > 0.
     */
    canDecrease(actor: Actor, skill: Item, category: SkillCategory): boolean {
        const valueStore = this.#getValueStore(skill, category);
        const currentValue = get(valueStore) ?? 0;
        return currentValue > 0;
    }

    /**
     * Decrease a skill by 1, refunding points to the appropriate pool.
     * refund = currentValue > linkedAttrRating ? 2 : 1 (active only; knowledge/language always 1)
     */
    decrease(actor: Actor, skill: Item, category: SkillCategory, linkedAttrRating: number): void {
        const valueStore = this.#getValueStore(skill, category);
        const currentValue = get(valueStore) ?? 0;

        if (currentValue <= 0) return;

        const refund = this.#decreaseRefund(currentValue, linkedAttrRating);

        const poolStore = this.#getPoolStore(actor, category);
        const currentPool = get(poolStore) ?? 0;

        valueStore.set(currentValue - 1);
        poolStore.set(currentPool + refund);
    }

    /**
     * Delete a skill and refund all spent points to the pool.
     *
     * Delete-first-then-refund pattern:
     *   1. Snapshot the full refund amount BEFORE deletion
     *   2. await deleteEmbeddedDocuments (prevents race with updateActor hook)
     *   3. Apply refund via store.set()
     *
     * Specialization-aware: if a specialization exists, base rating = displayedValue + 1
     * (the specialization was "funded" by reducing base by 1, so we restore that level too).
     *
     * All skill types use: cost per level i = i <= linkedAttrRating ? 1 : 2
     */
    async deleteWithRefund(
        actor: Actor,
        skill: Item,
        category: SkillCategory,
        linkedAttrRating: number
    ): Promise<void> {
        // 1. Snapshot values BEFORE delete
        const valueStore = this.#getValueStore(skill, category);
        const specStore = this.#getSpecStore(skill, category);
        const currentValue = get(valueStore) ?? 0;
        const specs = get(specStore) ?? [];

        // Account for specialization: the displayed value was reduced by 1 when spec was added
        const baseRating = specs.length > 0 ? currentValue + 1 : currentValue;

        // Sum the cost of each level (1-indexed: level i costs were paid going from i-1 to i)
        // All skill types use the same formula: i <= linkedAttrRating ? 1 : 2
        let refund = 0;
        for (let i = 1; i <= baseRating; i++) {
            refund += i <= linkedAttrRating ? 1 : 2;
        }

        const poolStore = this.#getPoolStore(actor, category);
        const currentPool = get(poolStore) ?? 0;
        const newPool = currentPool + refund;

        // 2. Delete first (prevents race condition with updateActor hook)
        await actor.deleteEmbeddedDocuments("Item", [skill.id!]);

        // 3. Apply refund after delete
        poolStore.set(newPool);
    }
}
