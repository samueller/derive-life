<script lang="ts">
	import types from '../lib/game/types'
	import game, { running } from '../lib/game/store'
	import quad from '../lib/game/quad_life'
	import Parameter from './Parameter.svelte'
	import { get } from 'svelte/store'
	import { subscribe } from 'svelte/internal'
</script>

<aside {...$$restProps}>
	<form on:submit|preventDefault>
		<div class="controls">
			<button on:click={quad.startPause}>{$running ? 'Pause' : 'Start'}</button>
		</div>
		<Parameter
			class="parameter"
			id="type"
			title="type"
			description="Genetic operator"
			let:id
		>
			<select {id} bind:value={$game.type}>
				{#each types as name, value}
					<option {value} selected={$game.type === value}>
						{name}
					</option>
				{/each}
			</select>
		</Parameter>
		<Parameter
			class="parameter"
			id="seed"
			title="random seed"
			description="-1 means complete random"
			let:id
		>
			<input
				{id}
				bind:value={$game.seed}
				type="number"
				min="-1"
				max="9999"
				placeholder="Random seed"
			/>
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
				bind:value={$game.population}
				type="number"
				min="4"
				max="9999"
				placeholder="Population"
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
				bind:value={$game.trials}
				type="number"
				min="1"
				max="99"
				placeholder="Trials"
			/>
		</Parameter>
		<Parameter
			class="parameter"
			id="generations"
			title="generations"
			description="Generation is when opulation size number of children born"
			let:id
		>
			<input
				{id}
				bind:value={$game.generations}
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
				bind:value={$game.min_seed_width}
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
				bind:value={$game.min_seed_height}
				type="number"
				min="1"
				max="99"
				placeholder="Height"
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
				bind:value={$game.min_seed_width}
				type="number"
				min="1"
				max="99"
				placeholder="Width"
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
				bind:value={$game.min_seed_width}
				type="number"
				min="1"
				max="99"
				placeholder="Width"
			/>
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
	}
</style>
