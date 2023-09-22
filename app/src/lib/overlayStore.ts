import { writable } from 'svelte/store';

export const overlayStore = writable<boolean>(false);