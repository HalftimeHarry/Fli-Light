<script lang="ts">
    console.log('DraftOverlayForm component loaded');
    import GenerateMatchUps from '$lib/components/GenerateMatchUps.svelte';
    import { getDrawerStore } from '@skeletonlabs/skeleton';

    export let onGenerateMatchUps;
    const drawerStore = getDrawerStore();

    // Function to close the drawer
    function closeDrawer() {
        drawerStore.close();
    }
</script>

<div class="fixed top-0 left-0 right-0 bottom-0 bg-red-500 flex justify-center items-center z-50">
    <!-- Close button -->
    <button
        on:click={closeDrawer}
        class="absolute top-2 right-2 bg-white text-black px-4 py-2 rounded shadow-lg"
    >
        Close
    </button>

    <!-- Display drawer metadata -->
    <div class="absolute top-2 left-2 text-white">
        {$drawerStore.meta}
    </div>

    <!-- Generate MatchUps Component -->
    <GenerateMatchUps {onGenerateMatchUps} />
</div>
