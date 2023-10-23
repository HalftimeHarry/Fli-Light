// src/lib/utilities/teamColors.ts

	const colors: Record<string, string> = {
		'ace-makers-primary': '#FF5733',
		'ace-makers-outline': '#900C3F',
		'birdie-storm-primary': '#33FF57',
		'birdie-storm-outline': '#0C9F90',
		'chain-breakers-primary': '#5723FF',
		'chain-breakers-outline': '#3F0C90',
		'chain-seekers-primary': '#57FFD1',
		'chain-seekers-outline': '#0C90A5',
		'disc-dynasty-primary': '#FFD133',
		'disc-dynasty-outline': '#907A0C',
		'disc-jesters-primary': '#FF33A8',
		'disc-jesters-outline': '#900C5A',
		'fairway-bombers-primary': '#33A8FF',
		'fairway-bombers-outline': '#0C5A90',
		'flight-squad-primary': '#A8FF33',
		'flight-squad-outline': '#5A900C',
		'glide-masters-primary': '#FF33FF',
		'glide-masters-outline': '#900C90',
		'huk-a-mania-primary': '#A833FF',
		'huk-a-mania-outline': '#5A0C90',
		'hyzer-heros-primary': '#33FFA8',
		'hyzer-heros-outline': '#0C905A',
		'midas-touch-primary': '#FFA833',
		'midas-touch-outline': '#90650C'
	};

export function getTeamColors(teamName: string): { primary: string, outline: string } {
    const defaultColors = {
        primary: '#273444',
        outline: '#d3dce6'
    };

    const formattedTeamName = teamName.toLowerCase().replace(/ /g, '-');

    return {
        primary: colors[`${formattedTeamName}-primary`] || defaultColors.primary,
        outline: colors[`${formattedTeamName}-outline`] || defaultColors.outline
    };
}
