import { writable, derived } from 'svelte/store'

const game = writable({
	// running: false,
	// runs: 0,
	type: 3,
	seed: -1,
	population: 200,
	trials: 2,
	generations: 100,
	min_seed_width: 5,
	min_seed_height: 5,
	seed_width: 5,
	seed_height: 5,
	max_area_initial: 120,
	max_area_final: 170
})

export let running = writable(false),
	runs = writable(0)

export const maxRuns = derived(
	game,
	$game => $game.generations * $game.population
)

export default game
