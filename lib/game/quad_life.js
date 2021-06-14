import { running, runningAnim } from './store'
// import { onMount, onDestroy, setContext } from 'svelte'
import { get, writable } from 'svelte/store'
import { ManagerMessages } from './WorkerMessages.js'

let steps = 0,
	interval

let workerManager = null

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

const copySeed = (seed, num, row, col) => {
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
	colors = ['white', '#080708', '#3772FF', '#DF2935', '#FDCA40']

const seeds = [createSeed(), createSeed(), createSeed(), createSeed()]
let grid = new Array(rows * cols).fill(0)
copySeed(seeds[0], 1, 0, 0)
copySeed(seeds[1], 2, 21, 8)
copySeed(seeds[2], 3, 1, 17)
copySeed(seeds[3], 4, 18, 18)

const quadLife = {
	startPause: requestAnimationFrame => {
		running.set(!get(running))

		if (get(running)) {
			startWorkers()
		} else {
			pauseWorkers()
		}
	},
	startPauseAnim: requestAnimationFrame => {
		runningAnim.set(!get(runningAnim))

		if (get(runningAnim))
			interval = setInterval(() => requestAnimationFrame(quadLoop), 100)
		else clearInterval(interval)
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
}

export const quadLoop = () => {
	const cx = get(context)
	cx.clearRect(0, 0, canvasWidth, canvasHeight)
	for (let i = 0; i < rows; i++)
		for (let j = 0; j < cols; j++) {
			const seed = grid[i * cols + j]
			if (seed > 0) {
				cx.fillStyle = colors[grid[i * cols + j]]
				cx.fillRect(i * 20, j * 20, 20, 20)
			}
		}
	step()
}

export const context = writable(),
	canvas = writable()

export default quadLife
