const placeSeed =
	(grid, cols) =>
	({ cells, width, height }, num, row, col) => {
		for (let i = 0; i < height; i++)
			for (let j = 0; j < width; j++)
				if (cells[width * i + j]) grid[cols * (row + i) + col + j] = num
	}

const placeSeedTransposed = (grid, cols) => (seed, num, row, col) => {
	const transposedSeed = copyIntoSimpleSeed(seed)
	transposeSimpleSeed(transposedSeed)
	placeSeed(grid, cols)(transposedSeed, num, row, col)
}

const coords = (rows, cols) => (row, col) => {
	const i = row == -1 ? rows - 1 : row == rows ? 0 : row,
		j = col == -1 ? cols - 1 : col == cols ? 0 : col
	return i * cols + j
}

const simpleCoords = (cols, i, j) => i * cols + j

const findNeighbors = (grid, rows, cols) => (row, col) => {
	const result = [],
		coords_ = coords(rows, cols)
	if (grid[coords_(row - 1, col - 1)] != 0)
		result.push(grid[coords_(row - 1, col - 1)])
	if (grid[coords_(row - 1, col)] != 0) result.push(grid[coords_(row - 1, col)])
	if (grid[coords_(row - 1, col + 1)] != 0)
		result.push(grid[coords_(row - 1, col + 1)])
	if (grid[coords_(row, col - 1)] != 0) result.push(grid[coords_(row, col - 1)])
	if (grid[coords_(row, col + 1)] != 0) result.push(grid[coords_(row, col + 1)])
	if (grid[coords_(row + 1, col - 1)] != 0)
		result.push(grid[coords_(row + 1, col - 1)])
	if (grid[coords_(row + 1, col)] != 0) result.push(grid[coords_(row + 1, col)])
	if (grid[coords_(row + 1, col + 1)] != 0)
		result.push(grid[coords_(row + 1, col + 1)])
	return result
}

const countNeighbors = (grid, row, col) =>
	(((((((grid[simpleCoords(row - 1, col - 1)] !=
		0 + grid[simpleCoords(row - 1, col)]) !=
		0 + grid[simpleCoords(row - 1, col + 1)]) !=
		0 + grid[simpleCoords(row, col - 1)]) !=
		0 + grid[simpleCoords(row, col + 1)]) !=
		0 + grid[simpleCoords(row + 1, col - 1)]) !=
		0 + grid[simpleCoords(row + 1, col)]) !=
		0 + grid[simpleCoords(row + 1, col + 1)]) !=
	0

const sample = array => array[Math.floor(Math.random() * array.length)]

const childColor = parents =>
	parents[0] == parents[1] || parents[0] == parents[2]
		? parents[0]
		: parents[1] == parents[2]
		? parents[1]
		: sample(parents)

const step = (rows, cols) => grid => {
	const findNeighbors_ = findNeighbors(grid, rows, cols),
		coords_ = coords(rows, cols),
		grid2 = [...grid]
	for (let i = 0; i < rows; i++)
		for (let j = 0; j < cols; j++) {
			const neighbors = findNeighbors_(i, j)
			if (grid[coords_(i, j)] == 0) {
				if (neighbors.length == 3) grid2[coords_(i, j)] = childColor(neighbors)
			} else if (neighbors.length < 2 || neighbors.length > 3)
				grid2[coords_(i, j)] = 0
		}
	return grid2
}

const initializeSeed = populationSize => density => width => height =>
	createSeed(populationSize)(randBools(density)(width * height), width, height)

const similarity = (cells1, cells2) => {
	let same = 0
	for (let i = 0; i < cells1.length; i++) if (cells1[i] == cells2[i]) same++
	return same / cells1.length
}

const updateSimilarity = population => (seed1Index, seed2Index) => {
	const seed1 = population[seed1Index],
		seed2 = population[seed2Index]
	seed1.similarities[seed2Index] = seed2.similarities[seed1Index] =
		seed1.width != seed2.width || seed1.height != seed2.height
			? 0
			: similarity(seed1.cells, seed2.cells)
}

const updateSimilarities = population => seedIndex => {
	for (let i = 0; i < population.length; i++)
		if (i != seedIndex) updateSimilarity(population)(seedIndex, i)
	population[seedIndex].similarities[seedIndex] = 1
}

const setAllSimilarities = population => {
	for (let i = 0; i < population.length; i++) {
		for (let j = i + 1; j < population.length; j++)
			updateSimilarity(population)(i, j)
		population[i].similarities[i] = 1
	}
}

// mutates list
const shuffle = list => {
	// modern version of the Fisher–Yates shuffle
	for (let i = list.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		const temp = list[i]
		list[i] = list[j]
		list[j] = temp
	}
	return list
}

// mutates list
const sampleN = (list, n) => {
	for (let i = list.length - 1; i >= list.length - n; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		const temp = list[i]
		list[i] = list[j]
		list[j] = temp
	}
	return list.slice(list.length - n)
}

const dimensions =
	({ widthFactor, heightFactor, timeFactor }) =>
	seeds => {
		const maxSize = Math.max(
				seeds[0].width + seeds[1].width,
				seeds[2].width + seeds[3].width,
				seeds[0].height + seeds[3].height,
				seeds[1].height + seeds[2].height
			),
			gridWidth = Math.round(maxSize * widthFactor),
			gridHeight = Math.round(maxSize * heightFactor)
		return [
			gridWidth,
			gridHeight,
			Math.round((gridWidth + gridHeight) * timeFactor)
		]
	}

const points = [1, 2 / 3, 1 / 3, 0],
	points2way1 = [5 / 6, 1 / 3, 0],
	points2way2 = [1, 1 / 2, 0],
	points2way3 = [1, 2 / 3, 1 / 6],
	points2way13 = [5 / 6, 1 / 6],
	points3way1 = [2 / 3, 0],
	points3way2 = [1, 1 / 3],
	points4way = [1 / 2]

const assignPoints = seedCellCounts => {
	seedCellCounts = seedCellCounts.map((count, i) => [i, Math.max(0, count)])
	seedCellCounts.sort((count1, count2) => count2[1] - count1[1])
	const result = new Array(seedCellCounts.length)
	if (seedCellCounts[0][1] == seedCellCounts[1][1]) {
		if (seedCellCounts[1][1] == seedCellCounts[2][1]) {
			if (seedCellCounts[2][1] == seedCellCounts[3][1])
				result[0] = result[1] = result[2] = result[3] = points4way[0]
			else {
				result[seedCellCounts[0][0]] =
					result[seedCellCounts[1][0]] =
					result[seedCellCounts[2][0]] =
						points3way1[0]
				result[seedCellCounts[3][0]] = points3way1[1]
			}
		} else {
			if (seedCellCounts[2][1] == seedCellCounts[3][1]) {
				result[seedCellCounts[0][0]] = result[seedCellCounts[1][0]] =
					points2way13[0]
				result[seedCellCounts[2][0]] = result[seedCellCounts[3][0]] =
					points2way13[1]
			} else {
				result[seedCellCounts[0][0]] = result[seedCellCounts[1][0]] =
					points2way1[0]
				result[seedCellCounts[2][0]] = points2way1[1]
				result[seedCellCounts[3][0]] = points2way1[2]
			}
		}
	} else {
		if (seedCellCounts[1][1] == seedCellCounts[2][1]) {
			if (seedCellCounts[2][1] == seedCellCounts[3][1]) {
				result[seedCellCounts[0][0]] = points3way2[0]
				result[seedCellCounts[1][0]] =
					result[seedCellCounts[2][0]] =
					result[seedCellCounts[3][0]] =
						points3way2[1]
			} else {
				result[seedCellCounts[0][0]] = points2way2[0]
				result[seedCellCounts[1][0]] = result[seedCellCounts[2][0]] =
					points2way2[1]
				result[seedCellCounts[3][0]] = points2way2[2]
			}
		} else {
			if (seedCellCounts[2][1] == seedCellCounts[3][1]) {
				result[seedCellCounts[0][0]] = points2way3[0]
				result[seedCellCounts[1][0]] = points2way3[1]
				result[seedCellCounts[2][0]] = result[seedCellCounts[3][0]] =
					points2way3[2]
			} else {
				result[seedCellCounts[0][0]] = points[0]
				result[seedCellCounts[1][0]] = points[1]
				result[seedCellCounts[2][0]] = points[2]
				result[seedCellCounts[3][0]] = points[3]
			}
		}
	}
	return result
}

const randRange = (start, end) =>
	Math.floor((end - start) * Math.random()) + start

const randInt = end => Math.floor(end * Math.random())

const randBools = density => n =>
	Array.from({ length: n }, () => Math.random() < density)

const placeSeeds = (grid, cols, rows, halfCols, halfRows, seeds) => {
	const placeSeed_ = placeSeed(grid, cols),
		placeSeedTransposed_ = placeSeedTransposed(grid, cols)
	let t = Math.random() < 0.5,
		row = randInt(halfRows - (t ? seeds[0].width : seeds[0].height) + 1),
		col = randRange(halfCols, cols - (t ? seeds[0].height : seeds[0].width) + 1)
	if (t) placeSeed_(seeds[0], 1, row, col)
	else placeSeedTransposed_(seeds[0], 1, row, col)
	t = Math.random() < 0.5
	row = randInt(halfRows - (t ? seeds[1].width : seeds[1].height) + 1)
	col = randInt(halfCols - (t ? seeds[1].height : seeds[1].width) + 1)
	if (t) placeSeed_(seeds[1], 2, row, col)
	else placeSeedTransposed_(seeds[1], 2, row, col)
	t = Math.random() < 0.5
	row = randRange(halfRows, rows - (t ? seeds[2].width : seeds[2].height) + 1)
	col = randInt(halfCols - (t ? seeds[2].height : seeds[2].width) + 1)
	if (t) placeSeed_(seeds[2], 3, row, col)
	else placeSeedTransposed_(seeds[2], 3, row, col)
	t = Math.random() < 0.5
	row = randRange(halfRows, rows - (t ? seeds[3].width : seeds[3].height) + 1)
	col = randRange(halfCols, cols - (t ? seeds[3].height : seeds[3].width) + 1)
	if (t) placeSeed_(seeds[3], 4, row, col)
	else placeSeedTransposed_(seeds[3], 4, row, col)
}

const scoreQuad = params => seeds => {
	// setup grid
	;[gridWidth, gridHeight, maxSteps] = dimensions(params)(seeds)
	let grid = new Array(gridWidth * gridHeight).fill(0)

	// place seeds random 90 deg rotation and position
	// shuffle(seeds)
	placeSeeds(
		grid,
		gridWidth,
		gridHeight,
		Math.floor(gridWidth / 2),
		Math.floor(gridHeight / 2),
		seeds
	)

	// run for max steps
	const step_ = step(gridHeight, gridWidth)
	for (let i = 0; i < maxSteps; i++) grid = step_(grid)

	// count cells by each seed, starting with a deficit of seed's live cell counts
	const counts = seeds.map(seed => -seed.live)
	for (let i = 0; i < grid.length; i++) if (grid[i] > 0) counts[grid[i] - 1]++

	// return scores
	return assignPoints(counts)
}

const updateHistoriesFromGame = (seed, score, other1, other2, other3) => {
	seed.history[other1].scores += score
	seed.history[other2].scores += score
	seed.history[other3].scores += score
	seed.history[other1].games++
	seed.history[other2].games++
	seed.history[other3].games++
}

const updateAllScores = population => {
	population.forEach(seed => {
		seed.score =
			seed.history.reduce(
				(score, { scores, games }) => score + scores / games,
				0
			) / population.length
	})
}

const topSeeds = population => {
	seeds = population.slice()
	seeds.sort((seed1, seed2) => seed2.score - seed1.score)
	return seeds.slice(0, 4)
}

const maxFitness = seeds => {
	let bestSeed,
		bestFitness = 0
	for (let i = 0; i < seeds.length; i++)
		if (bestFitness < seeds[i].score) {
			bestSeed = seeds[i]
			bestFitness = bestSeed.score
		}
	return bestSeed || sample(seeds)
}

const indexMinFitness = seeds => {
	let bestIndex,
		bestFitness = 1
	for (let i = 0; i < seeds.length; i++)
		if (bestFitness > seeds[i].score) {
			bestIndex = i
			bestFitness = seeds[bestIndex].score
		}
	return bestIndex || randInt(seeds.length)
}

const createSimpleSeed = (cells, width, height) => ({
	cells,
	width,
	height
})
const copyIntoSimpleSeed = seed =>
	createSimpleSeed([...seed.cells], seed.width, seed.height)
const transposeSimpleSeed = seed => {
	const cells = new Array(seed.cells.length).fill(false)
	for (let i = 0; i < seed.height; i++)
		for (let j = 0; j < seed.width; j++)
			if (seed.cells[seed.width * i + j]) cells[seed.height * j + i] = true
	seed.cells = cells
	const temp = seed.width
	seed.width = seed.height
	seed.height = temp
}

const bareSeeds = seeds =>
	seeds.map(seed => ({
		cells: seed.cells,
		width: seed.width,
		score: seed.score
	}))

let widthFactor, heightFactor, timeFactor

onmessage = function (e) {
	switch (e.data[0]) {
		case 'init':
			console.log('New thread')
			;[widthFactor, heightFactor, timeFactor] = e.data.slice(1)
			break

		case 'quad':
			const seeds = e.data[1],
				group = e.data[2]
			this.postMessage([
				'scored',
				group,
				scoreQuad({ widthFactor, heightFactor, timeFactor })(seeds)
			])
			break

		case 'quads':
			const population = e.data[1],
				groups = e.data[2]
			this.postMessage([
				'scored',
				groups.map(group => [
					group,
					scoreQuad({ widthFactor, heightFactor, timeFactor })(
						group.map(seed => population[seed])
					)
				])
			])
			break

		default:
			console.error('Unknown message sent to runs thread', e.data)
	}
}
