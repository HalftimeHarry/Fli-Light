<!-- src/routes/fantasy/+page.svelte -->
<script lang="ts">
	import FantasyEntryForm from '$lib/components/FantasyEntryForm.svelte';
	import HeadToHeadFantasyForm from '$lib/components/HeadToHeadFantasyForm.svelte';

	let activeTab = 'entry';
</script>

<div class="container" style="padding: 50px 0 100px 0">
	<ul class="flex border-b">
		<li class="-mb-px mr-1">
			<button
				on:click={() => (activeTab = 'entry')}
				class:active={activeTab === 'entry'}
				class="bg-white inline-block border-l border-t border-r rounded-t py-2 px-4 text-blue-700 font-semibold">Entry Form</button>
		</li>
		<li class="mr-1">
			<button
				on:click={() => (activeTab = 'headToHead')}
				class:active={activeTab === 'headToHead'}
				class="bg-white inline-block py-2 px-4 text-blue-500 hover:text-blue-800 font-semibold">Head-to-Head Form</button>
		</li>
	</ul>

	{#if activeTab === 'entry'}
		<FantasyEntryForm />
	{:else if activeTab === 'headToHead'}
		<HeadToHeadFantasyForm />
	{/if}
</div>

<style>
	.active {
		color: #333;
		background-color: #fff;
		border-bottom: 2px solid #333;
	}
</style>
