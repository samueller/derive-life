import game, { running } from './store'
import { onMount, onDestroy, setContext } from 'svelte'
import { get } from 'svelte/store'

const seed_example = [true]

let steps = 0,
	context

const quadLife = {
	startPause: () => {
		running.set(!get(running))
		console.log(get(running) ? 'Started' : 'Paused')
	}
}

const step = () => {
	steps++
	console.log(steps)
}

export default quadLife
