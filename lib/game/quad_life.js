import game, { running } from './store'
import { onMount, onDestroy, setContext } from 'svelte'
import { get, writable } from 'svelte/store'

const seed_example = [true]

let steps = 0

const quadLife = {
	startPause: () => {
		running.set(!get(running))
		console.log(get(running) ? 'Started' : 'Paused')
		if (get(running)){
			console.log('running')
			createGenArrays()
			initGenArrays()
			evolve()
		} else {
		}
//		context.subscribe(cx => {
//			cx.fillStyle = 'red'
//			cx.fillRect(10, 10, 50, 50)
//		})
	}
}

const step = () => {
	steps++
	console.log(steps)
}


var C_HEIGHT = 25
var C_WIDTH = 25
var EDGE = 50
var R1 =  "#080708"
var R2 = "#3772FF"
var R3 = "#DF2935"
var R4 = "#FDCA40"
var DEAD= "FFFFFF"

const rows = 44;
const cols = 44;
let timer;//To control evolutions
let evolutionSpeed=500;// One second between generations
// Need 2D arrays. These are 1D
let currGen =[rows];
let nextGen =[rows];
// Creates two-dimensional arrays
function createGenArrays() {
    for (let i = 0; i < rows; i++) {
        currGen[i] = new Array(cols);
        nextGen[i] = new Array(cols);
      
    }
}

function initGenArrays() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            currGen[i][j] = DEAD;
            nextGen[i][j] = DEAD;
        }
    }
}

function createNextGen() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
           
            let neighbors = getNeighborCount(row, col);
            let maxColor = Math.max(neighbors, key = neighbors.get)
	    let totNeighbor = 0;
	    for (var key in neighbors){
		    totNeighbor += neighbors[key];
	    }
	    
            // Check the rules
            // If Alive
            if (currGen[row][col] != DEAD) {
              
                if (totNeighbor < 2) {
                    nextGen[row][col] = DEAD;
                } else if (totNeighbor == 2 || totNeighbor == 3) {
                    nextGen[row][col] = currGen[row][col];
                } else if (neighbors > 3) {
                    nextGen[row][col] = 0;
                }
            } else if (currGen[row][col] == DEAD) {
                // If Dead or Empty
            
                if (neighbors == 3) {
                    // Propogate the species
                    nextGen[row][col] = maxColor;// Birth?
                }
            }
        }
    }
    
}

function getNeighborCount(row, col) {

	let count = {
		R1: 0,
		R2: 0,
		R3: 0,
		R4: 0

	};
	let nrow=Number(row);
	let ncol=Number(col);

	// Make sure we are not at the first row
	if (nrow - 1 >= 0) {
		// Check top neighbor
		if (currGen[nrow - 1][ncol] != DEAD) 
			count.currGen[nrow - 1][ncol]++;
	}
	// Make sure we are not in the first cell
	// Upper left corner
	if (nrow - 1 >= 0 && ncol - 1 >= 0) {
		//Check upper left neighbor
		if (currGen[nrow - 1][ncol - 1] != DEAD) 
			cout.currGen[nrow - 1][ncol - 1]++;
	}
	// Make sure we are not on the first row last column
	// Upper right corner
	if (nrow - 1 >= 0 && ncol + 1 < cols) {
		//Check upper right neighbor
		if (currGen[nrow - 1][ncol + 1] != DEAD) 
			count.currGen[nrow - 1][ncol + 1]++;
	}
	// Make sure we are not on the first column
	if (ncol - 1 >= 0) {
		//Check left neighbor
		if (currGen[nrow][ncol - 1] != DEAD) 
			count.currGen[nrow][ncol - 1]++;
	}
	// Make sure we are not on the last column
	if (ncol + 1 < cols) {
		//Check right neighbor
		if (currGen[nrow][ncol + 1] != DEAD) 
			count.currGen[nrow][ncol + 1]++;
	}
	// Make sure we are not on the bottom left corner
	if (nrow + 1 < rows && ncol - 1 >= 0) {
		//Check bottom left neighbor
		if (currGen[nrow + 1][ncol - 1] != DEAD) 
			count.currGen[nrow + 1][ncol - 1]++;
	}
	// Make sure we are not on the bottom right
	if (nrow + 1 < rows && ncol + 1 < cols) {
		//Check bottom right neighbor
		if (currGen[nrow + 1][ncol + 1] != DEAD) 
			count.currGen[nrow + 1][ncol + 1]++;
	}


	// Make sure we are not on the last row
	if (nrow + 1 < rows) {
		//Check bottom neighbor
		if (currGen[nrow + 1][ncol] != DEAD) 
			count.currGen[nrow + 1][ncol]++;
	}


	return count;
}
    
function updateCurrGen() {
       
        for (const row of currGen) {
            for (const col of currGen[row]) {
                // Update the current generation with
                // the results of createNextGen function
                currGen[row][col] = nextGen[row][col];
                // Set nextGen back to empty
                nextGen[row][col] = 0;
            }
        }
     
}

function updateWorld() {
        let cell='';
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                if (currGen[row][col] == DEAD) {
                    
                } else {
                    cell.setAttribute('class', 'alive');
                }
            }
        }
}

function evolve(){
      
        createNextGen();
        updateCurrGen();
//        updateWorld();
//	if (started) {
//        	timer = setTimeout(evolve, evolutionSpeed);
//        }
}
//
// 
//function resetWorld() {
//        location.reload();
//}



export const context = writable(),
	canvas = writable()

export default quadLife
