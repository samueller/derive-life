<script lang="ts">
	import {
		seedsInitialized,
		topRelativeFitness,
		eliteRelativeFitness,
		maxRuns,
		runs,
		runningAnim,
		population,
		generations
	} from '../lib/game/store'
	import quad, {
		context as contextStore,
		canvas as canvasStore,
		seed1Context as seed1ContextStore,
		seed2Context as seed2ContextStore,
		seed3Context as seed3ContextStore,
		seed4Context as seed4ContextStore,
		seed1AnimContext as seed1AnimContextStore,
		seed2AnimContext as seed2AnimContextStore,
		seed3AnimContext as seed3AnimContextStore,
		seed4AnimContext as seed4AnimContextStore,
		steps
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
		const context = canvas.getContext('2d'),
			seed1Context = seed1.getContext('2d'),
			seed2Context = seed2.getContext('2d'),
			seed3Context = seed3.getContext('2d'),
			seed4Context = seed4.getContext('2d'),
			seed1AnimContext = seed1Anim.getContext('2d'),
			seed2AnimContext = seed2Anim.getContext('2d'),
			seed3AnimContext = seed3Anim.getContext('2d'),
			seed4AnimContext = seed4Anim.getContext('2d')
		if (
			context &&
			seed1Context &&
			seed2Context &&
			seed3Context &&
			seed4Context &&
			seed1AnimContext &&
			seed2AnimContext &&
			seed3AnimContext &&
			seed4AnimContext
		) {
			canvasStore.set(canvas)
			contextStore.set(context)
			seed1ContextStore.set(seed1Context)
			seed2ContextStore.set(seed2Context)
			seed3ContextStore.set(seed3Context)
			seed4ContextStore.set(seed4Context)
			seed1AnimContextStore.set(seed1AnimContext)
			seed2AnimContextStore.set(seed2AnimContext)
			seed3AnimContextStore.set(seed3AnimContext)
			seed4AnimContextStore.set(seed4AnimContext)
		}
	})
</script>

<main {...$$restProps}>
	<div style="margin-bottom: 7px">
		Top seeds: <canvas class="seed" bind:this={seed1} width="20" height="20" />
		<canvas class="seed" bind:this={seed2} width="20" height="20" />
		<canvas class="seed" bind:this={seed3} width="20" height="20" />
		<canvas class="seed" bind:this={seed4} width="20" height="20" />
		<button on:click={() => quad.competeAnim(window.requestAnimationFrame)}
			>Compete</button
		>
		Animation:
		<canvas class="seed" bind:this={seed1Anim} width="20" height="20" />
		<canvas class="seed" bind:this={seed2Anim} width="20" height="20" />
		<canvas class="seed" bind:this={seed3Anim} width="20" height="20" />
		<canvas class="seed" bind:this={seed4Anim} width="20" height="20" />
		<button on:click={() => quad.startPauseAnim(window.requestAnimationFrame)}
			>{$runningAnim ? 'Pause' : 'Play'}</button
		>
		<button on:click={() => quad.resetAnim(window.requestAnimationFrame)}
			>Reset</button
		>
		Steps: {$steps}
	</div>
	<p style="margin-bottom: 7px;">
		{#if $seedsInitialized == 0 || $seedsInitialized == $population}
			{$runs} out of {$maxRuns.toLocaleString()} runs, {Math.floor(
				$runs / $population
			)} out of {$generations.toLocaleString()} generations, Avg top seed fitness:
			{$topRelativeFitness.toFixed(2)}, Avg elite fitness:
			{$eliteRelativeFitness.toFixed(2)}
		{/if}
		{#if !($seedsInitialized == 0 || $seedsInitialized == $population)}
			{$seedsInitialized} out of {$population} seeds initialized
		{/if}
	</p>
	<canvas bind:this={canvas} width="600" height="600" />
</main>
<svelte:window on:resize|passive={handleResize} />
