<script lang="ts">
    import { writable } from 'svelte/store';

    // Replace these with your actual data types
    interface Hole {
        det_sco_par: number;
        det_sco_hole_number: number;
        det_sco_hole_name: string;
    }

    interface Score {
        hole: Hole;
        score: number;
    }

    const scores = writable<Score[]>([]);

    let currentHole: Hole | undefined;
    let score: number; // declare the score variable

    const updateScore = (hole: Hole, score: number) => {
        scores.update((currentScores) => {
            const index = currentScores.findIndex(
                (s) => s.hole.det_sco_hole_number === hole.det_sco_hole_number
            );

            if (index !== -1) {
                currentScores[index].score = score;
            } else {
                currentScores.push({ hole, score });
            }

            return currentScores;
        });
    };

    const handleSubmit = () => {
        scores.subscribe((currentScores) => {
            console.log(currentScores);
            // Handle the form submission here
            // For example, send the scores to a server
        });
    };
</script>

<main>
    <h1>Enter Scoring Form</h1>

    {#if currentHole}
        <h2>{currentHole.det_sco_hole_name}</h2>
        <p>Par: {currentHole.det_sco_par}</p>

        <form on:submit|preventDefault={handleSubmit}>
            <label for="score">Score:</label>
            <input type="number" id="score" bind:value={score} min="1" required />

            <button type="submit">Submit</button>
        </form>
    {:else}
        <p>Loading...</p>
    {/if}
</main>

<style>
    /* Add your styles here */
</style>
