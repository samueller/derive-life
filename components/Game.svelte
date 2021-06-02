<script lang="ts">
	import game, { maxRuns, runs } from '../lib/game/store'
	import quadLife from '../lib/game/quad_life.js'
	import { onMount, onDestroy, setContext } from 'svelte'

	let canvas: HTMLCanvasElement, context

	const handleResize = () => {
		// width.set(window.innerWidth);
		// height.set(window.innerHeight);
		// pixelRatio.set(window.devicePixelRatio);
	}

	onMount(() => {
		context = canvas.getContext('2d')
	})
</script>

<main {...$$restProps}>
	<p>
		{$runs} out of {$maxRuns.toLocaleString()} runs
	</p>
	<canvas bind:this={canvas} width="100%" />
</main>
<svelte:window on:resize|passive={handleResize} />
