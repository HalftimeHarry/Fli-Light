// rollDiceTransition.ts
import { cubicOut } from 'svelte/easing';

export function rollDice(node, { duration = 3000 }) {
    return {
        duration,
        css: t => {
            const scale = t < 0.5 ? 2 * t : 2 * (1 - t); // scale down and up
            const rotate = t * 360; // rotate
            const opacity = t;
            return `
                transform: scale(${scale}) rotate(${rotate}deg);
                opacity: ${opacity};
                transition: transform ${duration}ms, opacity ${duration}ms;
            `;
        }
    };
}
