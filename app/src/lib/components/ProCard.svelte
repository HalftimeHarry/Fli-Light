<script lang="ts">
	export let name: string;
	export let gender: boolean = true;
	export let proImageUrl: string | null = null;
	export let teamId: number | null = null;
	export let earnings: number = 0;
	export let points: number = 0;
</script>

<div class="border border-gray-300 rounded p-4 transition-shadow hover:shadow-md flex items-center">
	{#if proImageUrl}
		<!-- Adjusting the size to w-10 h-10 -->
		<img class="w-10 h-10 rounded-full object-cover mr-4" src={proImageUrl} alt="{name}'s image" />
	{/if}
	<div class="text-xl font-bold mr-4">{name}</div>
	<div class="text-gray-400">
		<div>{gender ? 'Male' : 'Female'}</div>
		<div>Earnings: ${earnings.toFixed(2)}</div>
		<div>{points} points</div>
	</div>
</div>
