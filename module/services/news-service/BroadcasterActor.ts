/**
 * Type for broadcaster actor from Foundry
 */
export interface BroadcasterActor {
	type: string;
	name: string;
	system: {
		isBroadcasting?: boolean;
		rollingNews?: string[];
	};
}
