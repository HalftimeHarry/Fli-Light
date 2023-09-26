import { writable } from 'svelte/store';

interface OverlayData {
  visible: boolean;
  formType: 'subscribe' | 'register' | null;
}

export const overlayStore = writable<OverlayData>({ visible: false, formType: null });
