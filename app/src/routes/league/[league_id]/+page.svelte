<script context="module">
	import { supabase } from '/workspace/Fli-Light/app/src/supabaseClient.ts';

	let { data: league, error } = await supabase.from('league').select('*');
	console.log(league[0].league_id);
	let leagueToUse = league[0].league_id;
	let leagueName = league[0].league_name;
</script>

{#if error}
	<p>Error loading league: {error}</p>
{:else if leagueToUse}
	<h1>League: {leagueName}</h1>
	<p>Details about the league will be displayed here.</p>
{/if}
