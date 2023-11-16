// calculateFantasyScore.js

// Hardcoded fantasy score values
const fantasyValues = {
    "det_sco_4_under": -2,
    "det_sco_3_under": -1.5,
    "det_sco_2_under": -1,
    "det_sco_1_under": -0.5,
    "det_sco_par": 0,
    "det_sco_1_bogey": 1,
    "det_sco_2_bogey": 2,
    "det_sco_3_bogey": 3,
    "det_sco_4_bogey": 4,
    "det_sco_5_bogey": 5,
    "det_sco_6_bogey": 6
};

/**
 * Calculates the fantasy score for a given actual score and par.
 * @param {number} actualScore - The actual score of the player.
 * @param {number} par - The par for the hole.
 * @returns {number} The calculated fantasy score.
 */
export function calculateFantasyScore(actualScore, par) {
    // Calculate the difference between actual score and par
    const difference = actualScore - par;

    // Determine the key for the fantasyValues based on the score difference
    let key;
    if (difference < 0) {
        key = `det_sco_${Math.abs(difference)}_under`; // for scores under par
    } else {
        key = `det_sco_${difference}_bogey`; // for bogeys and above
    }

    // Return the corresponding fantasy score, default to 0 if not found
    return fantasyValues[key] || 0;
}
