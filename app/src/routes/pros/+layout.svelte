<script lang="ts">
	import { goto } from '$app/navigation';

	let currentTile: number = 0;

	const navigate = (path: string) => {
		goto(path);
	};
</script>

<div class="flex">
	<div class="container mx-auto px-4 mt-16 ml-24">
		<slot />
	</div>
</div>
