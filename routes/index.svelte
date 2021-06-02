<script lang="ts">
	import Sidebar from '../components/Sidebar.svelte'
	import Game from '../components/Game.svelte'
</script>

<svelte:head>
	<title>Evolve Quad-Community</title>
	<link href="https://unpkg.com/balloon-css/balloon.min.css" rel="stylesheet" />
	<script src="https://unpkg.com/mathjs/lib/browser/math.js"></script>
</svelte:head>

<div>
	<Sidebar />
	<Game />
</div>

<style lang="scss">
	div {
		display: grid;
		grid: 1fr / auto 1fr;
		gap: 16px;
		padding: 12px 16px;
	}
</style>
