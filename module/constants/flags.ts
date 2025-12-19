/**
 * Flag constants for Foundry VTT actor and item flags.
 * Prevents magic strings throughout the codebase.
 */

export const FLAGS = {
	ACTOR: {
		IS_CHARACTER_CREATION: "isCharacterCreation",
		ATTRIBUTE_ASSIGNMENT_LOCKED: "attributeAssignmentLocked",
		IS_SHOPPING_STATE: "isShoppingState",
	},
} as const;

/**
 * Type helper for flag keys
 */
export type ActorFlagKey = (typeof FLAGS.ACTOR)[keyof typeof FLAGS.ACTOR];
