import { writable } from 'svelte/store';

// Assuming you have an array of pro identifiers
const pros = ['pro1', 'pro2', 'pro3', 'pro4'];

// Create a store that holds scores for each pro
export const scores = writable(pros.reduce((obj, pro) => ({ ...obj, [pro]: 0 }), {}));
