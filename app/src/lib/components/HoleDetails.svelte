<script lang="ts">
	interface Hole {
		hole_name: string;
		hole_number: string;
		par: number;
		distance: number;
		not_using: boolean;
		//... other properties ...
	}

	export let holeData: Hole;
</script>

<div>
	<p>{holeData.distance} Foot - Par: {holeData.par}</p>
	<!-- Additional hole details here... -->
</div>
