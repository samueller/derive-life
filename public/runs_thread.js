const Message = {
	start: 'start',
	reset: 'reset',
	resetThreads: 'reset threads',
	initialized: 'initialized',
	initialScoringUpdate: 'initial scoring update',
	initialScoring: 'initial scoring',
	runCompleted: 'run completed',
	generationCompleted: 'generation completed'
}

const rotate = (cells, width, height) => {
	const rotated = new Array(cells.length)
	for (let i = 0; i < width; i++)
		for (let j = 0; j < height; j++)
			rotated[j * height + i] = cells[i * width + (width - j - 1)]
	return rotated
}

const createSeed =
	populationSize =>
	(cells, width = 5, height = 5) => ({
		cells, // 1-dimensional boolean array, row-major order
		width,
		height,
		live: cells.filter(Boolean).length,
		history: Array.from({ length: populationSize }, () => ({
			scores: 0,
			games: 0
		})), // competitions against other seeds
		similarities: new Array(populationSize) // percent cells the same, 0 if diff shape
	})

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

// at least one
const randomlyFlipCells = prob => seed => {
	let notFlipped = true
	for (let i = 0; i < seed.cells.length; i++)
		if (Math.random() < prob) {
			flipped = false
			seed.cells[i] = !seed.cells[i]
		}
	if (notFlipped) {
		const i = randInt(seed.cells.length)
		seed.cells[i] = !seed.cells[i]
	}
}

const initializeSeed = populationSize => density => width => height =>
	createSeed(populationSize)(randBools(density)(width * height), width, height)

const initializePopulation =
	populationSize => seedWidth => seedHeight => seedDensity => {
		population = []
		for (let i = 0; i < populationSize; i++)
			population.push(
				initializeSeed(populationSize)(seedDensity)(seedWidth)(seedHeight)
			)
		return population
	}

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
	shuffle(seeds)
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

const updateHistoriesFromGameForSeed = (
	seed,
	score,
	other1,
	other2,
	other3
) => {
	// console.log('Histories', seed.history, score, other1, other2, other3)
	seed.history[other1].scores += score
	seed.history[other2].scores += score
	seed.history[other3].scores += score
	seed.history[other1].games++
	seed.history[other2].games++
	seed.history[other3].games++
}

const updateHistoriesFromGame = population => (seedIndices, scores) => {
	updateHistoriesFromGameForSeed(
		population[seedIndices[0]],
		scores[0],
		seedIndices[1],
		seedIndices[2],
		seedIndices[3]
	)
	updateHistoriesFromGameForSeed(
		population[seedIndices[1]],
		scores[1],
		seedIndices[0],
		seedIndices[2],
		seedIndices[3]
	)
	updateHistoriesFromGameForSeed(
		population[seedIndices[2]],
		scores[2],
		seedIndices[0],
		seedIndices[1],
		seedIndices[3]
	)
	updateHistoriesFromGameForSeed(
		population[seedIndices[3]],
		scores[3],
		seedIndices[0],
		seedIndices[1],
		seedIndices[2]
	)
}

const updateHistories = params => population => seedIndex => {
	population[seedIndex].history[seedIndex].scores = 0.5
	population[seedIndex].history[seedIndex].games = 1
	const length = population.length - 1,
		shuffled = shuffle(
			Array.from({ length }, (_, j) => (j >= seedIndex ? j + 1 : j))
		)
	// compete with partitions of 3
	const groups = []
	for (let j = 0; j < length; j += 3)
		groups.push([
			seedIndex,
			shuffled[j],
			shuffled[(j + 1) % length],
			shuffled[(j + 2) % length]
		])
	for (let j = 0; j < groups.length; j++)
		threads[j % threads.length].postMessage([
			'quad',
			bareSeeds(groups[j].map(seedIndex => population[seedIndex])), // minimize data transfer
			groups[j]
		])
}

const setAllHistories = params => population => {
	const update = updateHistories(params)(population)
	for (let i = 0; i < population.length; i++) {
		update(i)
	}
}

const updateAllScores = population => {
	// console.log(
	// 	'hist',
	// 	population[0].history.flatMap(h => [h.scores, h.games])
	// )
	population.forEach(seed => {
		seed.score =
			seed.history.reduce(
				(score, { scores, games }) => score + scores / games,
				0
			) / population.length
	})
}

const meanScore = seeds =>
	seeds.reduce((sum, seed) => sum + seed.score, 0) / seeds.length

const topSeedsWithEliteFitness = eliteSize => population => {
	seeds = population.slice()
	seeds.sort((seed1, seed2) => seed2.score - seed1.score)
	// console.log('El size', eliteSize, seeds.length)
	return [seeds.slice(0, 4), meanScore(seeds.slice(0, eliteSize))]
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

const uniformAsexual = params => (candidateSeed, population) => {
	// console.log('Uniform asexual')
	const child = copyIntoSimpleSeed(candidateSeed)
	randomlyFlipCells(params.mutationRate)(child)
	const newSeed = createSeed(params.populationSize)(
		child.cells,
		child.width,
		child.height
	)
	oldSeedIndex = indexMinFitness(population)
	population[oldSeedIndex] = newSeed
	updateSimilarities(population)(oldSeedIndex)
	updateHistories(params)(population)(oldSeedIndex)
}

const variableAsexual = params => (candidateSeed, population, maxSeedArea) => {
	// console.log('Variable asexual')
	const child = copyIntoSimpleSeed(candidateSeed)
	mutate(params)(child)
	if (child.width * child.height > maxSeedArea)
		return uniformAsexual(params)(candidateSeed, population)
	const newSeed = createSeed(params.populationSize)(
		child.cells,
		child.width,
		child.height
	)
	oldSeedIndex = indexMinFitness(population)
	population[oldSeedIndex] = newSeed
	updateSimilarities(population)(oldSeedIndex)
	updateHistories(params)(population)(oldSeedIndex)
}

const findSimilar = (candidateSeed, population, minSimilarity, maxSimilarity) =>
	candidateSeed.similarities.flatMap((s, i) =>
		s >= minSimilarity && s <= maxSimilarity ? [population[i]] : []
	)

// seeds must be the same size
const mate = (seed1, seed2) => {
	const width = seed1.width,
		height = seed1.height,
		childCells = new Array(width * height).fill(false)
	if (Math.random() < 0.5) {
		rowSplitPoint = randInt(height - 1)
		for (let i = 0; i < height; i++)
			for (let j = 0; j < width; j++)
				if (i <= rowSplitPoint) {
					if (seed1.cells[width * i + j]) childCells[width * i + j] = true
				} else if (seed2.cells[width * i + j]) childCells[width * i + j] = true
	} else {
		colSplitPoint = randInt(width - 1)
		for (let i = 0; i < height; i++)
			for (let j = 0; j < width; j++)
				if (j <= colSplitPoint) {
					if (seed1.cells[width * i + j]) childCells[width * i + j] = true
				} else if (seed2.cells[width * i + j]) childCells[width * i + j] = true
	}
	return createSimpleSeed(childCells, width, height)
}

const addFirstRow = (seed, row) => {
	seed.cells.unshift(...row)
	seed.height++
}
const addLastRow = (seed, row) => {
	seed.cells.push(...row)
	seed.height++
}
const addFirstCol = (seed, col) => {
	transposeSimpleSeed(seed)
	seed.cells.unshift(...col)
	seed.height++
	transposeSimpleSeed(seed)
}
const addLastCol = (seed, col) => {
	transposeSimpleSeed(seed)
	seed.cells.push(...col)
	seed.height++
	transposeSimpleSeed(seed)
}

// mutates
const grow = (seed, density) => {
	switch (randInt(4)) {
		case 0:
			addFirstRow(seed, randBools(density)(seed.width))
			break
		case 1:
			addLastRow(seed, randBools(density)(seed.width))
			break
		case 2:
			addFirstCol(seed, randBools(density)(seed.height))
			break
		case 3:
			addLastCol(seed, randBools(density)(seed.height))
			break
	}
}

const delFirstRow = seed => {
	seed.cells.splice(0, seed.width)
	seed.height--
}

const delLastRow = seed => {
	seed.cells.splice(seed.cells.length - seed.width, seed.width)
	seed.height--
}

const delFirstCol = seed => {
	transposeSimpleSeed(seed)
	seed.cells.splice(0, seed.width)
	seed.height--
	transposeSimpleSeed(seed)
}

const delLastCol = seed => {
	transposeSimpleSeed(seed)
	seed.cells.splice(seed.cells.length - seed.width, seed.width)
	seed.height--
	transposeSimpleSeed(seed)
}

const shrink = params => seed => {
	switch (randInt(4)) {
		case 0:
			if (seed.height > params.minSeedHeight) delFirstRow(seed)
			break
		case 1:
			if (seed.height > params.minSeedHeight) delLastRow(seed)
			break
		case 2:
			if (seed.width > params.minSeedWidth) delFirstCol(seed)
			break
		case 3:
			if (seed.width > params.minSeedWidth) delLastCol(seed)
			break
	}
}

// mutates the seed programmatically too :)
const mutate = params => seed => {
	const picker = Math.random()
	if (picker < params.probGrow) grow(seed, params.seedDensity)
	else if (picker < params.probGrow + params.probFlip)
		randomlyFlipCells(params.mutationRate)(seed)
	else shrink(params)(seed)
}

const sexual =
	(params, populationIndices) => (candidateSeed, population, maxSeedArea) => {
		// console.log('Sexual')
		const similarSeeds = findSimilar(
			candidateSeed,
			population,
			params.minSimilarity,
			params.maxSimilarity
		)
		if (similarSeeds.length == 0)
			return variableAsexual(params)(candidateSeed, population, maxSeedArea)
		const candidateSeed2 =
				similarSeeds.length <= params.tournamentSize
					? maxFitness(similarSeeds)
					: maxFitness(sampleN(similarSeeds, params.tournamentSize)),
			child = mate(candidateSeed, candidateSeed2)
		mutate(params)(child)
		if (child.width * child.height > maxSeedArea)
			return uniformAsexual(params)(candidateSeed, population)
		const newSeed = createSeed(params.populationSize)(
			child.cells,
			child.width,
			child.height
		)
		oldSeedIndex = indexMinFitness(population)
		population[oldSeedIndex] = newSeed
		updateSimilarities(population)(oldSeedIndex)
		updateHistories(params)(population)(oldSeedIndex)
	}

const indexMin = list =>
	list.reduce(
		(bestIndex, x, i, list) => (x < list[bestIndex] ? i : bestIndex),
		0
	)

const indexMinCol = ({ cells, width, height }) => {
	const cols = new Array(width).fill(0)
	for (let i = 0; i < height; i++)
		for (let j = 0; j < width; j++) if (cells[i * width + j]) cols[j]++
	return indexMin(cols)
}

const cellsLeftOfCol = (seed, col) => {
	const newCells = new Array(col * seed.height).fill(false)
	for (let i = 0; i < seed.height; i++)
		for (let j = 0; j < col; j++)
			if (seed.cells[i * seed.width + j]) newCells[i * col + j] = true
	return newCells
}

const cellsRightOfCol = (seed, col) => {
	const newWidth = seed.width - col - 1,
		newCells = new Array(newWidth * seed.height).fill(false)
	for (let i = 0; i < seed.height; i++)
		for (let j = 0; j < newWidth; j++)
			if (seed.cells[i * seed.width + j + col + 1])
				newCells[i * newWidth + j] = true
	return newCells
}

const fission =
	(params, populationIndices) => (candidateSeed, population, maxSeedArea) => {
		// console.log('Fission')
		if (candidateSeed.width <= params.minSeedWidth)
			return sexual(params, populationIndices)(
				candidateSeed,
				population,
				maxSeedArea
			)
		const sparseCol = indexMinCol(candidateSeed)
		let newSeed
		if (sparseCol >= params.minSeedWidth) {
			if (candidateSeed.width - sparseCol - 1 >= params.minSeedWidth)
				newSeed =
					Math.random() < 0.5
						? createSeed(params.populationSize)(
								cellsLeftOfCol(candidateSeed, sparseCol),
								sparseCol,
								candidateSeed.height
						  )
						: createSeed(params.populationSize)(
								cellsRightOfCol(candidateSeed, sparseCol),
								candidateSeed.width - sparseCol - 1,
								candidateSeed.height
						  )
			else
				newSeed = createSeed(params.populationSize)(
					cellsLeftOfCol(candidateSeed, sparseCol),
					sparseCol,
					candidateSeed.height
				)
		} else if (candidateSeed.width - sparseCol - 1 >= params.minSeedWidth)
			newSeed = createSeed(params.populationSize)(
				cellsRightOfCol(candidateSeed, sparseCol),
				candidateSeed.width - sparseCol - 1,
				candidateSeed.height
			)
		else
			return sexual(params, populationIndices)(
				candidateSeed,
				population,
				maxSeedArea
			)
		oldSeedIndex = indexMinFitness(population)
		population[oldSeedIndex] = newSeed
		updateSimilarities(population)(oldSeedIndex)
		updateHistories(params)(population)(oldSeedIndex)
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

const fusion =
	(params, populationIndices) => (candidateSeed, population, maxSeedArea) => {
		// console.log('Fusion')
		const tournamentSample = sampleN(
				populationIndices,
				params.tournamentSize
			).map(i => population[i]),
			seed1 = copyIntoSimpleSeed(candidateSeed),
			candidateSeed2 = maxFitness(tournamentSample)
		seed2 = copyIntoSimpleSeed(candidateSeed2)
		if (params.fusionShuffle) shuffle(seed2.cells)
		if (Math.random() < 0.5) transposeSimpleSeed(seed1)
		if (Math.random() < 0.5) transposeSimpleSeed(seed2)
		const width = seed1.width + seed2.width + 1,
			height = Math.max(seed1.height, seed2.height),
			area = width * height
		if (area > maxSeedArea) {
			return sexual(params, populationIndices)(
				candidateSeed,
				population,
				maxSeedArea
			)
		}
		const cells = new Array(area).fill(false),
			copyIntoCells = placeSeed(cells, width)
		copyIntoCells(seed1, true, 0, 0)
		copyIntoCells(seed2, true, 0, seed1.width + 1)
		const newSeed = createSeed(params.populationSize)(cells, width, height),
			oldSeedIndex = indexMinFitness(population)
		population[oldSeedIndex] = newSeed
		updateSimilarities(population)(oldSeedIndex)
		updateHistories(params)(population)(oldSeedIndex)
		// if (
		// 	params.persistentMutualism &&
		// 	(newSeed.score <= candidateSeed.score ||
		// 		newSeed.score <= candidateSeed2.score)
		// )
		// 	sexual(params, populationIndices)(candidateSeed, population, maxSeedArea)
	}

const symbiotic =
	(params, populationIndices) => (candidateSeed, population, maxSeedArea) => {
		const picker = Math.random()
		if (picker < params.probFission)
			fission(params, populationIndices)(candidateSeed, population, maxSeedArea)
		else if (picker < params.probFission + params.probFusion)
			fusion(params, populationIndices)(candidateSeed, population, maxSeedArea)
		else
			sexual(params, populationIndices)(candidateSeed, population, maxSeedArea)
	}

const bareSeeds = seeds =>
	seeds.map(({ cells, width, height, live }) => ({
		cells,
		width,
		height,
		live
	}))

const bareSeedsWithScore = seeds =>
	seeds.map(({ cells, width, score }) => ({ cells, width, score }))

const run = params => {
	// if (params.randomSeed != -1)
	// 	math.config({randomSeed: params.randomSeed})
	population = initializePopulation(params.populationSize)(params.seedWidth)(
		params.seedHeight
	)(params.seedDensity)
	populationIndices = Array.from({ length: params.populationSize }, (_, i) => i)
	populationSize = params.populationSize
	this.postMessage([Message.initialized, population.slice(0, 4)])
	setAllSimilarities(population)
	setAllHistories(params)(population)
}

const continueInitialization = params => {
	updateAllScores(population)
	this.postMessage([
		Message.initialScoring,
		...topSeedsWithEliteFitness(params.eliteSize)(population)
	])

	switch (params.type) {
		case 0:
			updatePopulation = uniformAsexual
			break
		case 1:
			updatePopulation = variableAsexual
			break
		case 2:
			updatePopulation = sexual
			break
		case 3:
			updatePopulation = symbiotic
			break
	}
	updatePopulation = updatePopulation(params, populationIndices)
	maxRuns = params.generations * params.populationSize
	maxAreaDelta = params.maxAreaFinal - params.maxAreaInitial
	computeRun()
}

const computeRun = () => {
	const maxAreaIncrement = (maxAreaDelta * runs) / (maxRuns + 1),
		maxSeedArea = params.maxAreaInitial + maxAreaIncrement,
		tournamentSample = sampleN(populationIndices, params.tournamentSize).map(
			i => population[i]
		),
		candidateSeed = maxFitness(tournamentSample)

	updatePopulation(candidateSeed, population, maxSeedArea)
}

let threads,
	runs,
	updatePopulation,
	population,
	populationSize,
	populationIndices,
	phase,
	initializedSeeds,
	maxAreaDelta,
	maxRuns,
	params,
	quadGroupsCount

onmessage = function (e) {
	switch (e.data[0]) {
		case Message.start:
			// console.log('Starting')
			runs = phase = initializedSeeds = quadGroupsCount = 0
			params = e.data[1]
			const quadGroupsPerSeed = Math.round(params.populationSize / 3) // avoids floating point issues with ceil
			threads = Array.from({ length: params.threads }, () => {
				const thread = new Worker('score_quad.js')
				thread.onmessage = function (e) {
					switch (e.data[0]) {
						case 'scored':
							if (phase == 0) {
								updateHistoriesFromGame(population)(e.data[1], e.data[2])
								if (++quadGroupsCount == quadGroupsPerSeed) {
									quadGroupsCount = 0 // reset to count again
									postMessage([
										Message.initialScoringUpdate,
										++initializedSeeds
									])
									if (initializedSeeds == populationSize) {
										phase = 1
										continueInitialization(params)
									}
								}
							} else {
								updateHistoriesFromGame(population)(e.data[1], e.data[2])
								if (++quadGroupsCount == quadGroupsPerSeed) {
									quadGroupsCount = 0
									updateAllScores(population)
									if (runs % 10 == 0) postMessage([Message.runCompleted, runs])
									if (runs % Math.max(populationSize, 50) == 0) {
										const [top, eliteFitness] = topSeedsWithEliteFitness(
											params.eliteSize
										)(population)
										postMessage([
											Message.generationCompleted,
											bareSeedsWithScore(top),
											eliteFitness
										])
									}
									if (runs++ <= maxRuns) computeRun()
								}
							}
							break
					}
				}
				thread.postMessage([
					'init',
					params.widthFactor,
					params.heightFactor,
					params.timeFactor
				])
				return thread
			})
			run(params)
			break

		case Message.reset:
			this.postMessage([Message.resetThreads])
			break

		default:
			console.error('Unknown message sent to runs thread', e.data)
	}
}
