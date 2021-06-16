import { writable, derived } from 'svelte/store'

export const threads = writable(4),
	seedsInitialized = writable(0),
	topRelativeFitness = writable(0),
	running = writable(false),
	runningAnim = writable(false),
	runs = writable(0),
	type = writable(3),
	randomSeed = writable(-1),
	population = writable(20),
	trials = writable(2),
	generations = writable(100),
	minSeedWidth = writable(5),
	minSeedHeight = writable(5),
	seedWidth = writable(5),
	seedHeight = writable(5),
	maxAreaInitial = writable(120),
	maxAreaFinal = writable(170),
	seedDensity = writable(0.375),
	widthFactor = writable(6.0),
	heightFactor = writable(6.0),
	timeFactor = writable(6.0),
	tournamentSize = writable(2),
	mutationRate = writable(0.01),
	probGrow = writable(0.2),
	probShrink = writable(0.2),
	eliteSize = writable(10),
	minSimilarity = writable(0.8),
	maxSimilarity = writable(0.99),
	probFission = writable(0.01),
	probFusion = writable(0.005),
	fusionShuffle = writable(false),
	persistentMutualism = writable(false),
	perfStats = writable(false),
	maxRuns = derived(
		[generations, population],
		([$generations, $population]) => $generations * $population
	),
	probFlip = derived(
		[probGrow, probShrink],
		([$probGrow, $probShrink]) =>
			Math.round((1 - ($probGrow + $probShrink) + Number.EPSILON) * 100) / 100
	)
