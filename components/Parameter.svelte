<script lang="ts">
	export let id: string
	export let title: string
	export let description: string
</script>

<div {...$$restProps}>
	<label for={id} aria-label={description} data-balloon-pos="right">
		{title}
	</label>
	<slot {id} />
</div>

<style lang="scss">
	div {
		display: flex;
		align-items: center;
	}

	label {
		flex-shrink: 0;
		margin-right: 8px;
		padding: 2px 4px;
		font-size: 12px;
		color: white;
		background: #4a4a4a;
		border-radius: 4px;
	}
</style>
