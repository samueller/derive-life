import { running, runningAnim, seed } from './store'
// import { onMount, onDestroy, setContext } from 'svelte'
import { get, writable } from 'svelte/store'
import { ManagerMessages } from './WorkerMessages.js'

let interval,
	workerManager = null

const createSeed = () => ({
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
	],
	history: [],
	similarities: []
})

const placeSeed = (seed, num, row, col) => {
	for (let i = 0; i < 5; i++)
		for (let j = 0; j < 5; j++)
			if (seed.cells[seed.width * i + j]) grid[cols * (row + i) + col + j] = num
}

const rows = 30,
	cols = 30,
	canvasWidth = 600,
	canvasHeight = 600,
	cellWidth = canvasWidth / cols,
	cellHeight = canvasHeight / rows,
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
	currentSeed4

const placeSeeds = () => {
	placeSeed(currentSeed1, 1, 0, 0)
	placeSeed(currentSeed2, 2, 21, 8)
	placeSeed(currentSeed3, 3, 1, 17)
	placeSeed(currentSeed4, 4, 18, 18)
}

const copyTopToCurrentSeeds = () => {
	currentSeed1 = topSeed1
	currentSeed2 = topSeed2
	currentSeed3 = topSeed3
	currentSeed4 = topSeed4
}

const resetGrid = () => {
	let grid = new Array(rows * cols).fill(0)
	if (currentSeed1) placeSeeds()
	return grid
}

let grid = resetGrid()

const drawSeeds = seeds => {
	seeds.forEach(([seed, cx], seedNumber) => {
		cx.clearRect(0, 0, seedViewWidth, seedViewHeight)
		cx.fillStyle = colors[seedNumber + 1]
		const cellWidth = seedViewWidth / seed.width,
			cellHeight = seedViewHeight / seed.height
		for (let i = 0; i < seed.height; i++)
			for (let j = 0; j < seed.width; j++) {
				const cell = seed.cells[i * seed.width + j]
				if (cell > 0)
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
			startWorkers()
		} else {
			pauseWorkers()
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
				placeSeeds()
				drawCurrentSeeds()
				draw()
			}
			interval = setInterval(() => requestAnimationFrame(quadLoop), 100)
		} else clearInterval(interval)
	},
	resetAnim: requestAnimationFrame => {
		clearInterval(interval)
		runningAnim.set(false)
		steps.set(0)
		grid = resetGrid()
		placeSeeds()
		draw()
	}
}

const startWorkers = () => {
	console.log(
		'quadLife: start game with ' +
			window.navigator.hardwareConcurrency +
			' background threads'
	)
	workerManager = new Worker('./lib/game/WorkerManager.js', { type: 'module' })
	workerManager.postMessage([
		ManagerMessages.startWorkers,
		ManagerMessages.initialRun,
		10
	])
	workerManager.onmessage = function (e) {
		let result = e.data
		console.log('Message received from worker')
	}
}

const pauseWorkers = () => {
	console.log('quadLife: paused game')
	workerManager.postMessage([ManagerMessages.pauseWorkers])
	workerManager.postMessage([ManagerMessages.pauseWorkers])
	//    workerManager.postMessage([ManagerMessages.pauseWorkers]);
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
		updateTopSeeds(createSeed(), createSeed(), createSeed(), createSeed())
})

export default quadLife
