<script>
	import { overlayStore } from '$lib/overlayStore';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	import { writable } from 'svelte/store';

	function closeOverlay() {
		overlayStore.set(false);
	}

	function handleOutsideClick(e) {
		if (e.target === e.currentTarget) {
			closeOverlay();
		}
	}
</script>

{#if $overlayStore}
	<div
		class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
		on:click={handleOutsideClick}
	>
		<div class="relative bg-white p-4 rounded-lg max-w-xl w-full">
			<!-- Close button -->
			<button
				class="absolute top-0 right-0 m-2 text-gray-700 hover:text-gray-900"
				type="button"
				on:click={closeOverlay}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					class="h-6 w-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>

			<!-- Content of your popup -->
			<div class="text-black">Subscribe form to add here</div>
		</div>
	</div>
{/if}
