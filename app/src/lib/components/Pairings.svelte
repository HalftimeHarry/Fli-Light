<!-- displayPairings.svelte -->
<script lang="ts">
	interface Pairing {
		team_a: string;
		team_b: string;
	}

	export let pairingData: Pairing;
</script>

<div>
	<p>{pairingData.team_a} vs {pairingData.team_b}</p>
	<!-- Additional hole details here... -->
</div>
