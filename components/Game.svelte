<script lang="ts">
	import game, { maxRuns, runs, running } from '../lib/game/store'
	import quadLife, {
		context as contextStore,
		canvas as canvasStore,
		quadLoop
	} from '../lib/game/quad_life.js'
	import { onMount, onDestroy, setContext } from 'svelte'

	let canvas: HTMLCanvasElement, context: CanvasRenderingContext2D

	const handleResize = () => {
		// width.set(window.innerWidth);
		// height.set(window.innerHeight);
		// pixelRatio.set(window.devicePixelRatio);
	}

	onMount(() => {
		const possibleContext = canvas.getContext('2d')
		if (possibleContext != null) {
			context = possibleContext
			canvasStore.set(canvas)
			contextStore.set(context)
			loop()
		}
	})
	let frame

	const loop = () => {
		setTimeout(() => {
			requestAnimationFrame(loop)
		}, 100)
		// requestAnimationFrame(loop)
		// context.subscribe(cx => {
		quadLoop(context)
		// })
	}
</script>

<main {...$$restProps}>
	<p>
		{$runs} out of {$maxRuns.toLocaleString()} runs
	</p>
	<br />
	<canvas bind:this={canvas} width="600" height="600" />
</main>
<svelte:window on:resize|passive={handleResize} />
