import { ManagerMessages } from './WorkerMessages.js'

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

const seeds = [createSeed(), createSeed(), createSeed(), createSeed()]
let grid = null;

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

const quadLoop = () => {
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

let wokerList = [];

onmessage = function(e) {
    switch (e.data[0]) {
        case ManagerMessages.startWorkers:
            console.log("WorkerManager: start all workers");       
            if (grid == null) {
                grid = new Array(rows * cols).fill(0)
                copySeed(seeds[0], 1, 0, 0)
                copySeed(seeds[1], 2, 21, 8)
                copySeed(seeds[2], 3, 1, 17)
                copySeed(seeds[3], 4, 18, 18)
            }
            step();
            postMessage(grid)
            break;

        case ManagerMessages.pauseWorkers:
            console.log("WorkerManager: pause all workers");
                        
            break;

        case ManagerMessages.resetWorkers:
            console.log("WorkerManager: reset all workers");
            break;

        default: 
            console.log("ERROR: Unkown Message sent to WorkerManager" + command);
    }
}

