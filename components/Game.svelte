<script lang="ts">
	import { maxRuns, runs, runningAnim } from '../lib/game/store'
	import quad, {
		context as contextStore,
		canvas as canvasStore
	} from '../lib/game/quad_life.js'
	import { onMount, onDestroy, setContext } from 'svelte'

	let canvas: HTMLCanvasElement,
		seed1: HTMLCanvasElement,
		seed2: HTMLCanvasElement,
		seed3: HTMLCanvasElement,
		seed4: HTMLCanvasElement,
		seed1Anim: HTMLCanvasElement,
		seed2Anim: HTMLCanvasElement,
		seed3Anim: HTMLCanvasElement,
		seed4Anim: HTMLCanvasElement,
		context: CanvasRenderingContext2D,
		seed1Context: CanvasRenderingContext2D,
		seed2Context: CanvasRenderingContext2D,
		seed3Context: CanvasRenderingContext2D,
		seed4Context: CanvasRenderingContext2D,
		seed1AnimContext: CanvasRenderingContext2D,
		seed2AnimContext: CanvasRenderingContext2D,
		seed3AnimContext: CanvasRenderingContext2D,
		seed4AnimContext: CanvasRenderingContext2D

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
		}
	})
</script>

<main {...$$restProps}>
	<div>
		Top seeds: <canvas bind:this={seed1} width="20" height="20" />
		<canvas bind:this={seed2} width="20" height="20" />
		<canvas bind:this={seed3} width="20" height="20" />
		<canvas bind:this={seed4} width="20" height="20" />
		<button>Compete</button>
		Animation: <canvas bind:this={seed1Anim} width="20" height="20" />
		<canvas bind:this={seed2Anim} width="20" height="20" />
		<canvas bind:this={seed3Anim} width="20" height="20" />
		<canvas bind:this={seed4Anim} width="20" height="20" />
		<button on:click={() => quad.startPauseAnim(window.requestAnimationFrame)}
			>{$runningAnim ? 'Pause' : 'Play'}</button
		> <button>Reset</button>
	</div>
	<p style="margin-bottom: 7px;">
		{$runs} out of {$maxRuns.toLocaleString()} runs, Generation 1, Average elite
		seed fitness: 5.2
	</p>
	<canvas bind:this={canvas} width="600" height="600" />
</main>
<svelte:window on:resize|passive={handleResize} />
