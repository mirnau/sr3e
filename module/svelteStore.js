import { writable } from 'svelte/store';

export const layoutStore = writable({});
export const cardLayout = writable([]);
export const shoppingState = writable([]);

export const attributePointStore = writable(0);
export const skillPointStore = writable(0);
export const knowledgePointStore = writable(0);
export const languagePointStore = writable(0);
export const attributeAssignmentLocked = writable(false);
