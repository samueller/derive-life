import {
	threads,
	seedsInitialized,
	eliteRelativeFitness,
	topRelativeFitness,
	running,
	runningAnim,
	runs,
	type,
	randomSeed,
	population,
	trials,
	generations,
	minSeedWidth,
	minSeedHeight,
	seedWidth,
	seedHeight,
	maxAreaInitial,
	maxAreaFinal,
	seedDensity,
	widthFactor,
	heightFactor,
	timeFactor,
	tournamentSize,
	mutationRate,
	probGrow,
	probShrink,
	eliteSize,
	minSimilarity,
	maxSimilarity,
	probFission,
	probFusion,
	fusionShuffle,
	persistentMutualism,
	perfStats,
	probFlip
} from './store'
import { get, writable } from 'svelte/store'
import { Message } from './runs_messages.js'

let interval, runsThread, grid

const createSampleSeed1 = () => ({
	width: 5,
	height: 5,
	cells: [
		false,
		true,
		true,
		true,
		true,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		false,
		true,
		true,
		true,
		false,
		false,
		false,
		false,
		true,
		false,
		false
	]
})

const placeSeed = (seed, num, row, col) => {
	for (let i = 0; i < seed.height; i++)
		for (let j = 0; j < seed.width; j++)
			if (seed.cells[seed.width * i + j]) grid[cols * (row + i) + col + j] = num
}

const placeSeedTransposed = (seed, num, row, col) => {
	const cells = new Array(seed.cells.length).fill(false)
	for (let i = 0; i < seed.height; i++)
		for (let j = 0; j < seed.width; j++)
			if (seed.cells[seed.width * i + j]) cells[seed.height * j + i] = true
	placeSeed({ cells, width: seed.height, height: seed.width }, num, row, col)
}

const canvasWidth = 600,
	canvasHeight = 600,
	seedViewWidth = 20,
	seedViewHeight = 20,
	colors = ['white', '#080708', '#3772FF', '#DF2935', '#FDCA40']

let topSeed1,
	topSeed2,
	topSeed3,
	topSeed4,
	currentSeed1,
	currentSeed2,
	currentSeed3,
	currentSeed4,
	rows,
	cols,
	cellWidth,
	cellHeight

const randRange = (start, end) =>
	Math.floor((end - start) * Math.random()) + start

const placeSeeds = () => {
	const halfRows = Math.floor(rows / 2),
		halfCols = Math.floor(cols / 2)
	;[
		[currentSeed1, 0, 1],
		[currentSeed2, 0, 0],
		[currentSeed3, 1, 0],
		[currentSeed4, 1, 1]
	].forEach(([seed, quadrantRow, quadrantCol], i) => {
		if (Math.random() < 0.5) {
			const row = randRange(
					halfRows * quadrantRow,
					halfRows * (quadrantRow + 1) - seed.height + 1
				),
				col = randRange(
					halfCols * quadrantCol,
					halfCols * (quadrantCol + 1) - seed.width + 1
				)
			placeSeed(seed, i + 1, row, col)
		} else {
			const row = randRange(
					halfRows * quadrantRow,
					halfRows * (quadrantRow + 1) - seed.width + 1
				),
				col = randRange(
					halfCols * quadrantCol,
					halfCols * (quadrantCol + 1) - seed.height + 1
				)
			placeSeedTransposed(seed, i + 1, row, col)
		}
	})
}

const copyTopToCurrentSeeds = () => {
	currentSeed1 = topSeed1
	currentSeed2 = topSeed2
	currentSeed3 = topSeed3
	currentSeed4 = topSeed4
}

const dimensions = () => {
	const maxSize = Math.max(
		currentSeed1.width + currentSeed2.width,
		currentSeed3.width + currentSeed4.width,
		currentSeed1.height + currentSeed4.height,
		currentSeed2.height + currentSeed3.height
	)
	return [
		Math.round(maxSize * get(widthFactor)),
		Math.round(maxSize * get(heightFactor))
	]
}

const resetGrid = () => {
	;[rows, cols] = dimensions()
	cellWidth = canvasWidth / cols
	cellHeight = canvasHeight / rows
	let grid = new Array(rows * cols).fill(0)
	return grid
}

const drawSeeds = seeds => {
	seeds.forEach(([seed, cx], seedNumber) => {
		cx.clearRect(0, 0, seedViewWidth, seedViewHeight)
		cx.fillStyle = colors[seedNumber + 1]
		const cellWidth = seedViewWidth / seed.width,
			cellHeight = seedViewHeight / seed.height
		for (let i = 0; i < seed.height; i++)
			for (let j = 0; j < seed.width; j++) {
				const cell = seed.cells[i * seed.width + j]
				if (cell)
					cx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight)
			}
	})
}

const drawTopSeeds = () => {
	drawSeeds([
		[topSeed1, get(seed1Context)],
		[topSeed2, get(seed2Context)],
		[topSeed3, get(seed3Context)],
		[topSeed4, get(seed4Context)]
	])
}

const drawCurrentSeeds = () => {
	drawSeeds([
		[currentSeed1, get(seed1AnimContext)],
		[currentSeed2, get(seed2AnimContext)],
		[currentSeed3, get(seed3AnimContext)],
		[currentSeed4, get(seed4AnimContext)]
	])
}

const updateTopSeeds = (seed1, seed2, seed3, seed4) => {
	topSeed1 = seed1
	topSeed2 = seed2
	topSeed3 = seed3
	topSeed4 = seed4
	drawTopSeeds()
}

const quadLife = {
	startPause: requestAnimationFrame => {
		running.set(!get(running))

		if (get(running)) {
			startRunsThread()
		} else {
			runsThread.postMessage([Message.reset])
			runsThread.terminate()
			// console.log('Terminated background process')
		}
	},
	competeAnim: requestAnimationFrame => {
		copyTopToCurrentSeeds()
		drawCurrentSeeds()
		quadLife.resetAnim(requestAnimationFrame)
	},
	startPauseAnim: requestAnimationFrame => {
		runningAnim.set(!get(runningAnim))

		if (get(runningAnim)) {
			if (!currentSeed1) {
				copyTopToCurrentSeeds()
				drawCurrentSeeds()
				grid = resetGrid()
				placeSeeds()
				draw()
			}
			interval = setInterval(() => requestAnimationFrame(quadLoop), 100)
		} else clearInterval(interval)
	},
	resetAnim: requestAnimationFrame => {
		clearInterval(interval)
		runningAnim.set(false)
		steps.set(0)
		seedsInitialized.set(0)
		grid = resetGrid()
		placeSeeds()
		draw()
	}
	// move: requestAnimationFrame => {}
}

const meanScore = seeds =>
	seeds.reduce((sum, seed) => sum + seed.score, 0) / seeds.length

const startRunsThread = () => {
	// console.log('Starting background process')
	// runsThread = new Worker('./lib/game/runs_thread.js')
	runsThread = new Worker('/runs_thread.js')
	runsThread.onmessage = function (e) {
		switch (e.data[0]) {
			case Message.initialized:
				updateTopSeeds(...e.data[1])
				if (get(perfStats)) console.time(0)
				break
			case Message.initialScoringUpdate:
				// console.log('Initialized seed', e.data[1])
				const initialScoringCount = e.data[1]
				if (get(perfStats)) {
					console.timeEnd(initialScoringCount - 1)
					console.time(initialScoringCount)
				}
				seedsInitialized.set(initialScoringCount)
				break
			case Message.initialScoring:
				// console.log('Initial fitness scores complete', e.data[1])
				updateTopSeeds(...e.data[1])
				eliteRelativeFitness.set(e.data[2])
				if (get(perfStats)) console.timeEnd(get(seedsInitialized))
				seedsInitialized.set(0)
				break
			case Message.runCompleted:
				// console.log('Run completed', e.data[1])
				runs.set(e.data[1])
				break
			case Message.generationCompleted:
				// console.log('Generation completed with top seeds', e.data[1])
				eliteRelativeFitness.set(e.data[2])
				topRelativeFitness.set(meanScore(e.data[1]))
				if (get(perfStats)) console.log('Top seed score', e.data[1][0].score)
				// console.log('Top seeds', e.data[1])
				e.data[1].forEach(seed => {
					seed.height = seed.cells.length / seed.width
				})
				updateTopSeeds(...e.data[1])
				break
			case Message.resetThreads:
				runsThread.terminate()
				break
			default:
				console.error('Unknown message sent to WorkerManager', e.data[0])
		}
	}
	runsThread.postMessage([
		Message.start,
		{
			threads: get(threads),
			eliteSize: Math.min(population.length, get(eliteSize)),
			type: get(type),
			randomSeed: get(randomSeed),
			populationSize: get(population),
			trials: get(trials),
			generations: get(generations),
			minSeedWidth: get(minSeedWidth),
			minSeedHeight: get(minSeedHeight),
			seedWidth: get(seedWidth),
			seedHeight: get(seedHeight),
			maxAreaInitial: get(maxAreaInitial),
			maxAreaFinal: get(maxAreaFinal),
			seedDensity: get(seedDensity),
			widthFactor: get(widthFactor),
			heightFactor: get(heightFactor),
			timeFactor: get(timeFactor),
			tournamentSize: get(tournamentSize),
			mutationRate: get(mutationRate),
			probGrow: get(probGrow),
			probShrink: get(probShrink),
			eliteSize: get(eliteSize),
			minSimilarity: get(minSimilarity),
			maxSimilarity: get(maxSimilarity),
			probFission: get(probFission),
			probFusion: get(probFusion),
			fusionShuffle: get(fusionShuffle),
			persistentMutualism: get(persistentMutualism),
			probFlip: get(probFlip)
		}
	])
	// console.log('Started background process')
}

const coords = (row, col) => {
	const i = row == -1 ? rows - 1 : row == rows ? 0 : row,
		j = col == -1 ? cols - 1 : col == cols ? 0 : col
	return i * cols + j
}

const findNeighbors = (row, col) => {
	const result = []
	if (grid[coords(row - 1, col - 1)] != 0)
		result.push(grid[coords(row - 1, col - 1)])
	if (grid[coords(row - 1, col)] != 0) result.push(grid[coords(row - 1, col)])
	if (grid[coords(row - 1, col + 1)] != 0)
		result.push(grid[coords(row - 1, col + 1)])
	if (grid[coords(row, col - 1)] != 0) result.push(grid[coords(row, col - 1)])
	if (grid[coords(row, col + 1)] != 0) result.push(grid[coords(row, col + 1)])
	if (grid[coords(row + 1, col - 1)] != 0)
		result.push(grid[coords(row + 1, col - 1)])
	if (grid[coords(row + 1, col)] != 0) result.push(grid[coords(row + 1, col)])
	if (grid[coords(row + 1, col + 1)] != 0)
		result.push(grid[coords(row + 1, col + 1)])
	return result
}

const sample = array => array[Math.floor(Math.random() * array.length)]

const childColor = parents =>
	parents[0] == parents[1] || parents[0] == parents[2]
		? parents[0]
		: parents[1] == parents[2]
		? parents[1]
		: sample(parents)

const step = () => {
	const grid2 = [...grid]
	for (let i = 0; i < rows; i++)
		for (let j = 0; j < cols; j++) {
			const neighbors = findNeighbors(i, j)
			if (grid[coords(i, j)] == 0) {
				if (neighbors.length == 3) grid2[coords(i, j)] = childColor(neighbors)
			} else if (neighbors.length < 2 || neighbors.length > 3)
				grid2[coords(i, j)] = 0
		}
	grid = grid2
	steps.set(get(steps) + 1)
}

const draw = () => {
	const cx = get(context)
	cx.clearRect(0, 0, canvasWidth, canvasHeight)
	for (let i = 0; i < rows; i++)
		for (let j = 0; j < cols; j++) {
			const seedNumber = grid[i * cols + j]
			if (seedNumber > 0) {
				cx.fillStyle = colors[seedNumber]
				cx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight)
			}
		}
}

const quadLoop = () => {
	step()
	draw()
}

export const canvas = writable(),
	context = writable(),
	seed1Context = writable(),
	seed2Context = writable(),
	seed3Context = writable(),
	seed4Context = writable(),
	seed1AnimContext = writable(),
	seed2AnimContext = writable(),
	seed3AnimContext = writable(),
	seed4AnimContext = writable(),
	steps = writable(0)

seed4AnimContext.subscribe(ready => {
	if (ready)
		updateTopSeeds(
			createSampleSeed1(),
			createSampleSeed1(),
			createSampleSeed1(),
			createSampleSeed1()
		)
})

export default quadLife
