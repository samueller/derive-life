<script lang="ts">
	import types from '../lib/game/types'
	import {
		threads,
		running,
		type,
		randomSeed,
		population,
		trials,
		generations,
		minSeedWidth,
		minSeedHeight,
		seedWidth,
		seedHeight,
		maxAreaInitial,
		maxAreaFinal,
		seedDensity,
		widthFactor,
		heightFactor,
		timeFactor,
		tournamentSize,
		mutationRate,
		probGrow,
		probShrink,
		eliteSize,
		minSimilarity,
		maxSimilarity,
		probFission,
		probFusion,
		fusionShuffle,
		persistentMutualism,
		perfStats,
		probFlip
	} from '../lib/game/store'
	import quad from '../lib/game/quad_life'
	import Parameter from './Parameter.svelte'
	import { get } from 'svelte/store'
	import { subscribe } from 'svelte/internal'
</script>

<aside {...$$restProps}>
	<form on:submit|preventDefault>
		<div class="controls">
			<button on:click={() => quad.startPause(window.requestAnimationFrame)}
				>{$running ? 'Reset' : 'Start'}</button
			>
		</div>
		<Parameter
			class="parameter"
			id="threads"
			title="threads"
			description="Parallelize calculations to use the full power of your CPU"
			let:id
		>
			<input
				{id}
				bind:value={$threads}
				type="number"
				min="1"
				max="1024"
				placeholder="Count"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="type"
			title="type"
			description="Genetic operator"
			let:id
		>
			<select {id} bind:value={$type}>
				{#each types as name, value}
					<option {value} selected={$type === value}>
						{name}
					</option>
				{/each}
			</select>
		</Parameter>
		<Parameter
			class="parameter"
			id="population"
			title="population"
			description="Population always remains constant"
			let:id
		>
			<input
				{id}
				bind:value={$population}
				type="number"
				min="4"
				max="9999"
				placeholder="Population"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="generations"
			title="generations"
			description="Generation is when population size number of children born"
			let:id
		>
			<input
				{id}
				bind:value={$generations}
				type="number"
				min="1"
				max="99999"
				placeholder="Generations"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="min-seed-width"
			title="min seed width"
			description="Seeds cannot get thinner than this"
			let:id
		>
			<input
				{id}
				bind:value={$minSeedWidth}
				type="number"
				min="1"
				max="99"
				placeholder="Width"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="min-seed-height"
			title="min seed height"
			description="Seeds cannot get taller than this"
			let:id
		>
			<input
				{id}
				bind:value={$minSeedHeight}
				type="number"
				min="1"
				max="99"
				placeholder="Height"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="seed-width"
			title="seed width"
			description="Seeds start at this width"
			let:id
		>
			<input
				{id}
				bind:value={$seedWidth}
				type="number"
				min={$minSeedWidth}
				max="99"
				placeholder="Width"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="seed-height"
			title="seed height"
			description="Seeds start at this height"
			let:id
		>
			<input
				{id}
				bind:value={$seedHeight}
				type="number"
				min={$minSeedHeight}
				max="99"
				placeholder="Height"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="max-area-initial"
			title="max area initial"
			description="Maximum seed area for first run, increases linearly for each run over entire number of runs"
			let:id
		>
			<input
				{id}
				bind:value={$maxAreaInitial}
				type="number"
				min={$minSeedWidth * $minSeedHeight}
				max={$minSeedWidth * $minSeedHeight * 100}
				placeholder="Area"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="max-area-final"
			title="max area final"
			description="Maximum seed area for last run, increases linearly for each run over entire number of runs"
			let:id
		>
			<input
				{id}
				bind:value={$maxAreaFinal}
				type="number"
				min={$maxAreaInitial}
				max={$maxAreaInitial * 10}
				placeholder="Area"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="seed-density"
			title="seed density"
			description="Probability of a live cell for each cell"
			let:id
		>
			<input
				{id}
				bind:value={$seedDensity}
				type="number"
				min="0"
				max="1"
				step="0.005"
				placeholder="Density"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="width-factor"
			title="width factor"
			description="Multiplied by biggest seed width for grid width"
			let:id
		>
			<input
				{id}
				bind:value={$widthFactor}
				type="number"
				min="2"
				max="99"
				step="0.05"
				placeholder="Factor"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="height-factor"
			title="height factor"
			description="Multiplied by biggest seed height for grid height"
			let:id
		>
			<input
				{id}
				bind:value={$heightFactor}
				type="number"
				min="2"
				max="99"
				step="0.05"
				placeholder="Factor"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="time-factor"
			title="time factor"
			description="Multiplied by grid width + height for number of steps in each game"
			let:id
		>
			<input
				{id}
				bind:value={$timeFactor}
				type="number"
				min="1"
				max="99"
				step="0.05"
				placeholder="Factor"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="tournament-size"
			title="tournament size"
			description="Number of seeds chosen at random to compete"
			let:id
		>
			<input
				{id}
				bind:value={$tournamentSize}
				type="number"
				min="1"
				max={$population}
				placeholder="Size"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="mutation-rate"
			title="mutation rate"
			description="Probability of flipping cell in uniform asexual reproduction"
			let:id
		>
			<input
				{id}
				bind:value={$mutationRate}
				type="number"
				min="0"
				max="1"
				step="0.005"
				placeholder="Rate"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="prob-grow"
			title="probability to grow"
			description="In variable asexual reproduction"
			let:id
		>
			<input
				{id}
				bind:value={$probGrow}
				type="number"
				min="0"
				max={1 - $probShrink}
				step="0.05"
				placeholder="Probability"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="prob-shrink"
			title="probability to shrink"
			description="In variable asexual reproduction"
			let:id
		>
			<input
				{id}
				bind:value={$probShrink}
				type="number"
				min="0"
				max={1 - $probGrow}
				step="0.05"
				placeholder="Probability"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="prob-flip"
			title="probability to flip"
			description="In variable asexual reproduction"
			let:id
		>
			{$probFlip}
		</Parameter>
		<Parameter
			class="parameter"
			id="elite-size"
			title="elite size"
			description="Number of most fit seeds to evaluate average fitness"
			let:id
		>
			<input
				{id}
				bind:value={$eliteSize}
				type="number"
				min="1"
				max={$population}
				placeholder="Size"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="min-similarity"
			title="min similarity"
			description="Minimum percent same cells to be considered a mate for sexual reproduction"
			let:id
		>
			<input
				{id}
				bind:value={$minSimilarity}
				type="number"
				min="0"
				max="1"
				step="0.01"
				placeholder="Percent"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="max-similarity"
			title="max similarity"
			description="Maximum percent same cells to be considered a mate for sexual reproduction"
			let:id
		>
			<input
				{id}
				bind:value={$maxSimilarity}
				type="number"
				min="0"
				max="1"
				step="0.01"
				placeholder="Percent"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="random-seed"
			title="random seed"
			description="-1 means complete random"
			let:id
		>
			<input
				{id}
				bind:value={$randomSeed}
				type="number"
				min="-1"
				max="9999"
				placeholder="Random seed"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="trials"
			title="trials per run"
			description="Seeds placed/rotated randomly each trial"
			let:id
		>
			<input
				{id}
				bind:value={$trials}
				type="number"
				min="1"
				max="99"
				placeholder="Trials"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="prob-fission"
			title="probability fission"
			description="Probability to split seed in symbiosis"
			let:id
		>
			<input
				{id}
				bind:value={$probFission}
				type="number"
				min="0"
				max="1"
				step="0.001"
				placeholder="Probability"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="prob-fusion"
			title="probability fusion"
			description="Probability to join seed with another in symbiosis"
			let:id
		>
			<input
				{id}
				bind:value={$probFusion}
				type="number"
				min="0"
				max={1 - $probFission}
				step="0.001"
				placeholder="Probability"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="fusion-shuffle"
			title="fusion shuffle"
			description="Whether to shuffle cells in fused seed"
			let:id
		>
			<input {id} bind:checked={$fusionShuffle} type="checkbox" />
		</Parameter>
		<Parameter
			class="parameter"
			id="persistent-mutualism"
			title="persistent mutualism"
			description="Only fuse seeds during symbiosis if the fused pair is more fit than each seed"
			let:id
		>
			<input {id} bind:checked={$persistentMutualism} type="checkbox" />
		</Parameter>
		<Parameter
			class="parameter"
			id="performance-stats"
			title="performance stats"
			description="Various stats printed in the console"
			let:id
		>
			<input {id} bind:checked={$perfStats} type="checkbox" />
		</Parameter>
	</form>
</aside>

<style lang="scss">
	aside {
		padding-right: 16px;
		border-right: 1px solid #eee;
	}

	// form > :global(.parameter + .parameter) {
	form > :global(.parameter) {
		margin-top: 8px;
	}

	select,
	input,
	button {
		flex-grow: 1;
	}

	div.controls {
		display: flex;
		align-items: center;
		margin-bottom: 9px;
	}
</style>
