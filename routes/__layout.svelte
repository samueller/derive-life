<script lang="ts">
	import Navbar from '../components/Navbar.svelte'
</script>

<Navbar />
<slot />

<style lang="scss" global>
	*,
	::before,
	::after {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
			Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		border: none;
		outline: none;
	}

	html,
	body,
	#root {
		height: 100%;
	}

	#root {
		display: grid;
		grid: auto 1fr / 1fr;
	}

	button {
		box-shadow: 0px 10px 14px -7px #276873;
		background: linear-gradient(to bottom, #599bb3 5%, #408c99 100%);
		background-color: #599bb3;
		border-radius: 8px;
		display: inline-block;
		cursor: pointer;
		color: #ffffff;
		font-family: Arial;
		font-size: 14px;
		font-weight: bold;
		padding: 7px 21px;
		text-decoration: none;
		text-shadow: 0px 1px 0px #3d768a;
	}
	button:hover {
		background: linear-gradient(to bottom, #408c99 5%, #599bb3 100%);
		background-color: #408c99;
	}
	button:active {
		position: relative;
		top: 1px;
	}
	canvas {
		box-shadow: 0px 0px 3px black;
	}
	canvas.seed {
		vertical-align: middle;
		box-shadow: 0px 0px 2px black;
	}
</style>
