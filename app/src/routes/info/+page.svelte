<script lang="ts">
	import Icon from '@iconify/svelte';
	// Any JavaScript can go here, e.g., dynamic behavior or data handling
	let listItems = [
		'Pairs Competition: FLI GOLF TOUR sets a new standard, spotlighting mixed-gender teams — a nod to both talent amalgamation and a commitment to championing gender equality.',
		'Monthly Tournaments: Anchoring the tour are its monthly 1-day events, hosted at various renowned college campuses throughout the U.S.',
		'Custom Course Excellence: Every tournament showcases a meticulously designed course, pushing players to their limits and ensuring fans are on the edge of their seats.',
		"Uplift Disc Golf: Elevate the sport's stature, broadening its fan base and affirming its competitive essence.",
		'Promote Gender Equality: Pioneering mixed-gender competitions, the tour positions itself at the forefront of inclusivity in sports.',
		'Entertainment First: A commitment to offering fans a captivating experience, ensuring they are as much a part of the tour as the athletes.',
		'Inspire Future Talents: Showcase the zenith of disc golf skill, aiming to kindle passion in the upcoming generation.',
		'Sponsorships: Collaborations with eminent brands across various sectors form a significant chunk of the revenue.',
		'Ticketing: With multiple ticket options, fans can enjoy the interactive center on media day, tournament play, and even a live show to culminate the event.',
		'Merchandising: The tour boosts its earnings with a diverse range of official merchandise, including branded attire and exclusive collectibles.',
		'Legal Gambling Partnerships: Tournaments are amplified by alliances with authorized sportsbooks, introducing a thrilling dimension for fans.',
		'Media Collaborations: Venturing into broadcasting and streaming tie-ups not only enhances visibility but opens up monetization avenues.'
	];
</script>

<div>
	<img src="/GROUP.jpg" alt="Group Image" />
	<div class="image-caption mb-6">Corey LaRusso, Dustin Dinsmore, Tony Smart, and Andrew Panza</div>
</div>

<ul class="customBulletList">
	{#each listItems as item}
		<li>{item}</li>
	{/each}
</ul>

<div class="p-6 text-white">
	<p class="text-xl font-semibold mb-4">
		Located at the intersection of sports and entertainment, the FLI GOLF TOUR - Pairs Edition is
		all set to mark a new chapter in the world of disc golf.
	</p>
	<div class="border-t pt-4 mt-4">
		<p class="text-lg mb-2">For media inquiries, please contact:</p>
		<div class="flex items-center">
			<Icon icon="ion:mail-outline" class="mr-2" />
			<a href="mailto:info@fligolf.com" class="text-blue-600 underline">info@fligolf.com</a>
		</div>
	</div>
</div>

<style>
	.customBulletList {
		list-style-type: none;
		padding-left: 0;
	}

	.customBulletList li {
		position: relative;
		padding-left: 30px; /* Adjust depending on the size of your image */
		margin-bottom: 10px;
	}

	.customBulletList li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 20px; /* Adjust based on the actual size of your image */
		height: 20px; /* Adjust based on the actual size of your image */
		background-image: url('/FLI_BUL.png');
		background-size: cover;
		background-repeat: no-repeat;
	}
</style>
