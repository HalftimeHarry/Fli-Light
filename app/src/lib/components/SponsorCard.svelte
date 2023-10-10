<script lang="ts">
	export let name: string;
	export let sponsorImageUrl: string | null = null;
</script>

<div
	class="border border-gray-300 rounded p-4 transition-shadow hover:shadow-md flex flex-col items-center text-center"
>
	{#if sponsorImageUrl}
		<img class="w26 h-12 object-cover mb-4" src={sponsorImageUrl} alt="{name}'s logo" />
	{/if}
	<div class="text-xl font-bold mb-2">{name}</div>
</div>
