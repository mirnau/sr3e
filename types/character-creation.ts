/**
 * Shared TypeScript interfaces and constants for character creation.
 * Defines SR3e priority tables and data structures.
 */

/**
 * SR3e priority letters
 */
export type PriorityLetter = "A" | "B" | "C" | "D" | "E";

/**
 * Priority table entry structure
 */
export interface PriorityTableEntry {
	priority: PriorityLetter;
	points: number;
}

/**
 * SR3e priority tables for attributes, skills, and resources
 */
export const PRIORITY_TABLES = {
	attributes: [
		{ priority: "A" as const, points: 30 },
		{ priority: "B" as const, points: 27 },
		{ priority: "C" as const, points: 24 },
		{ priority: "D" as const, points: 21 },
		{ priority: "E" as const, points: 18 },
	],
	skills: [
		{ priority: "A" as const, points: 50 },
		{ priority: "B" as const, points: 40 },
		{ priority: "C" as const, points: 34 },
		{ priority: "D" as const, points: 30 },
		{ priority: "E" as const, points: 27 },
	],
	resources: [
		{ priority: "A" as const, points: 1000000 },
		{ priority: "B" as const, points: 400000 },
		{ priority: "C" as const, points: 90000 },
		{ priority: "D" as const, points: 20000 },
		{ priority: "E" as const, points: 5000 },
	],
} as const;

/**
 * Age phase definitions for character aging calculations
 */
export interface AgePhase {
	text: string;
	from: number;
	to: number;
}

/**
 * SR3e age phases with normalized ranges (0.0 to 1.0 of max lifespan)
 */
export const AGE_PHASES: readonly AgePhase[] = [
	{ text: "child", from: 0.0, to: 0.15 },
	{ text: "adolescent", from: 0.15, to: 0.2 },
	{ text: "youngadult", from: 0.2, to: 0.4 },
	{ text: "adult", from: 0.4, to: 0.5 },
	{ text: "middleage", from: 0.5, to: 0.65 },
	{ text: "goldenyears", from: 0.65, to: 0.8 },
	{ text: "ancient", from: 0.8, to: 1.0 },
] as const;

/**
 * Priority selection structure (all five priorities)
 */
export interface PrioritySelection {
	metatype: string;
	magic: string;
	attribute: string;
	skill: string;
	resource: string;
}

/**
 * Complete character creation selections including priorities and physical traits
 */
export interface CharacterCreationSelections extends PrioritySelection {
	age: number;
	height: number;
	weight: number;
}

/**
 * Metatype option from repository
 */
export interface MetatypeOption {
	name: string;
	foundryitemid: string;
	priority: string;
}

/**
 * Magic option from repository
 */
export interface MagicOption {
	priority: string;
	name: string;
	foundryitemid: string;
}
