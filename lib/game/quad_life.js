import game, { running } from './store'
import { onMount, onDestroy, setContext } from 'svelte'
import { get, writable } from 'svelte/store'

const seed_example = [true]

let steps = 0

const quadLife = {
	startPause: () => {
		running.set(!get(running))
		console.log(get(running) ? 'Started' : 'Paused')
		context.subscribe(cx => {
			cx.fillStyle = 'red'
			cx.fillRect(10, 10, 50, 50)
		})
	}
}

const step = () => {
	steps++
	console.log(steps)
}

export const context = writable(),
	canvas = writable()

export default quadLife
