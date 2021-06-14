import { get, writable } from 'svelte/store'
import { ManagerMessages } from './WorkerMessages.js'
import { randomIndex, shuffle } from './utils.js'

const seedWidth = 5;
const seedHeight = 5;
const seedSize = seedHeight * seedWidth;

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

class Life {
    constructor(color, seed) {
        this.color = color;
        this.seed = seed;
    }
}

let top4Seeds = [];

let seeds = null
let grid = null;

const targetGeneration = 100;
const generationPop = 200;
const competeMaxNum = 100;

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

const getTop4 = (seeds) => {

}

const initializeSeeds = (seed) => {
    seeds = [];
    for (int i = 0; i < generationPop; i++) {
        let cur = [];
        for(j = 0; j < seedSize; j ++)
            cur.push((Math.random() < 0.5))
        let curChild = new Life(cur, colors[randomIndex(0, 3)]);
        seeds.push(curChild);
    }
}

const initializeGrid = (c1, c2, c3, c4) => {
    for(int i = 0; i < 5; i++) {
        for(int j = 0; j < 5; j++)
            if (c1.seed[ (i+1) * seedWidth + j])
                grid[i][j] = c1.color
        for(int j = 25; j < 30; j++)
            if (c1.seed[ (i+1) * seedWidth + j])
                grid[i][j] = c3.color
    }
    
    for(int i = 25; i < 30; i++) {
        for(int j = 0; j < 5; j++)
            if (c1.seed[ (i+1) * seedWidth + j])
                grid[i][j] = c2.color
        for(int j = 0; j < 5; j++)
            if (c1.seed[ (i+1) * seedWidth + j])
                grid[i][j] = c4.color
    } 
}

const compete4group = (c1, c2, c3, c4) => {
    initializeGrid(c1, c2, c3, c4);
    for (int i = 0; i < competeMaxNum; i++){
        step();        
    }
}

const competeShuffle = (curChild) => {
    //Copy array and then splice
    cloneSeed = seeds.slice();
    cloneSeed.splice(curChild, 1);
    cloneSeed = shuffle(cloneSeed); 
    if (cloneSeed.length % 3 != 0){
        cloneSeed.append(cloneSeed[0]);
    }
    //Make sure we have a size divisible by 3
    if (cloneSeed.length % 3 != 0){
        cloneSeed.append(cloneSeed[0]);
    }
    for(int i = 0, i < cloneSeed.length; i+=3){
        compete4group(curChild, seeds[i], seeds[i+1], seeds[i+2]);
    }

}

const startLoop = () => {
    for (int i = 0; i < targetGeneration; i++) {
        for (int j = 0; j < generationPop; j++){
            competeShuffle(seeds[j]);
        }
    }
}

onmessage = function(e) {
    switch (e.data[0]) {
        case ManagerMessages.startWorkers:
            console.log("WorkerManager: start all workers");       
            grid = new Array(rows * cols).fill(0)
            if (e.data[1] == ManagerMessages.initialRun) {
                initializeSeeds(e.data[2])
            }
            startLoop()
            break;

        case ManagerMessages.pauseWorkers:
            console.log("WorkerManager: pause all workers");
            postMessage(seeds);
            close();
                        
            break;

        case ManagerMessages.resetWorkers:
            console.log("WorkerManager: reset all workers");
            break;

        default: 
            console.log("ERROR: Unkown Message sent to WorkerManager" + command);
    }
}

