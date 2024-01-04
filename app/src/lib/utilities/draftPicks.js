// Create a draftPicks.js file (or any appropriate name)
import { writable } from 'svelte/store';

// Initialize an empty array for draft picks
const initialDraftPicks = [];

// Create a writable store for draft picks
export const draftPicks = writable(initialDraftPicks);
