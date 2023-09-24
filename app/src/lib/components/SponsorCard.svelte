<script lang="ts">
    export let name: string;
    export let sponsorImageUrl: string | null = null;
    export let associatedWith: string = ''; // Tournaments or events the sponsor is associated with
</script>


<div class="border border-gray-300 rounded p-4 transition-shadow hover:shadow-md flex items-center">
    {#if sponsorImageUrl}
        <img
            class="w-10 h-10 rounded-full object-cover mr-4"
            src={sponsorImageUrl}
            alt="{name}'s logo"
        />
    {/if}
    <div>
        <div class="text-xl font-bold mb-2">{name}</div>
        <div class="text-gray-400">Associated with: {associatedWith}</div>
    </div>
</div>
