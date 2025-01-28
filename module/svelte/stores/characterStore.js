// src/stores/actorStore.js
import { writable } from 'svelte/store';

export const characterStore = writable({ name: 'John Doe' });
