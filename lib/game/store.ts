import { writable, derived } from 'svelte/store'

// const game = writable({
// running: false,
// runs: 0,
// type: 3,
// seed: -1,
// population: 200,
// trials: 2,
// generations: 100,
// min_seed_width: 5,
// min_seed_height: 5,
// seed_width: 5,
// seed_height: 5,
// max_area_initial: 120,
// max_area_final: 170
// })

export const running = writable(false),
	runningAnim = writable(false),
	runs = writable(0),
	type = writable(3),
	seed = writable(-1),
	population = writable(200),
	trials = writable(2),
	generations = writable(100),
	min_seed_width = writable(5),
	min_seed_height = writable(5),
	seed_width = writable(5),
	seed_height = writable(5),
	max_area_initial = writable(120),
	max_area_final = writable(170),
	seed_density = writable(0.375),
	width_factor = writable(6.0),
	height_factor = writable(6.0),
	time_factor = writable(6.0),
	tournament_size = writable(2),
	mutation_rate = writable(0.01),
	prob_grow = writable(0.2),
	prob_shrink = writable(0.2),
	elite_size = writable(50),
	min_similarity = writable(0.8),
	max_similarity = writable(0.99),
	prob_fission = writable(0.01),
	prob_fusion = writable(0.005),
	fusion_shuffle = writable(false),
	persistent_mutualism = writable(false),
	maxRuns = derived(
		[generations, population],
		([$generations, $population]) => $generations * $population
	),
	prob_flip = derived(
		[prob_grow, prob_shrink],
		([$prob_grow, $prob_shrink]) =>
			Math.round((1 - ($prob_grow + $prob_shrink) + Number.EPSILON) * 100) / 100
	)

// export default game
