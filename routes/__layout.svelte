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
</style>
