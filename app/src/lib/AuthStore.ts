// AuthStore.ts
import { writable } from 'svelte/store';

const initialState = {
    formType: '', // 'register', 'login', etc.
    isLoggedIn: false
};

const authStore = writable(initialState);

export default authStore;
