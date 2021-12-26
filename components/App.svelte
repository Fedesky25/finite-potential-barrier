<script>
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing'
	import { transmission, table_l_E } from '@utils/transmission.js';
	import { linearSpaceH } from '@utils/linear.js';
	import randomColor from '@utils/randomColor.js';
	import { convert_eV_to_Ry, eV2Ry, A2au } from '@utils/convert.js';

	import Axis from './Axis.svelte';
	import DataPlot from './DataPlot.svelte';

	const POINTS = 300;

	/** maximum Energy [eV] */
    let minE = 0;
    /** maximum Energy [eV] */
    let maxE = 15;
    /** barrier poential [eV] */
    let V0 = 5;
	/** energis [eV] at which to compute the transmission */
	$: energies = linearSpaceH(minE, maxE, POINTS, [0, V0]);
	/**@type {{l: number, color: string, y: number[]}[]}*/
	let graphs = [];

	function addGraph(l) {
		const g = {l, color: randomColor(), y: []};
		for(var i=0; i<=POINTS; i++) g.y.push(transmission(energies[i]*eV2Ry, V0*eV2Ry, l*A2au));
		graphs.push(g);
		graphs = graphs;
	}
	function removeGraph(e) {
		const i = +e.target.getAttribute('data-index');
		graphs.splice(i, 1);
		graphs = graphs;
	}
	function allGraphs() {
		if(graphs.length == 0) return;
		const gs = table_l_E(convert_eV_to_Ry(energies, POINTS), V0*eV2Ry, graphs.map(g => g.l*A2au));
		const LEN = graphs.length;
		for(var i=0; i<LEN; i++) graphs[i].y = gs[i];
	}
	$: energies && allGraphs();

	function addLength(e) {
		const t = e.target;
		var v = +t.value;
		t.value = '';
		if(v <= 0) return;
		addGraph(v);
	}
	function forceBounds(node) {
		function change(e) {
			const t = e.target;
			var v = +t.value;
			if(v < +t.min) t.value = v = +t.min;
			else if(t.max && v > +t.max) t.value = v = +t.max;
			t.dispatchEvent(new CustomEvent("safe-change", {detail: v}));
		}
		node.addEventListener("change", change);
		return { destroy() {node.removeEventListener("change", change)} }
	}
</script>



<div class="inputs">
	<h3>Energy values [eV]</h3>
	<div class="grid2by2">
		<label for="#minE">Minimum:</label>
		<input type="number" id="minE" min="0" value="0" max={maxE-1} use:forceBounds on:safe-change={e => minE = e.detail}>
		<label for="#maxE">Maximum:</label>
		<input type="number" id="maxE" min={minE+1} value="15" use:forceBounds on:safe-change={e => maxE = e.detail}>
	</div>
	<h3>Barrier potential [eV]</h3>
	<input type="range" min="0.25" max="20" step="0.25" bind:value={V0}> {V0}
	<h3>Barrier length [&Aring;]</h3>
	<input type="number" min="0" on:change={addLength}>
	<div class="lengths">
		{#each graphs as g, i}
			<div class="graph-info" in:fade={{duration: 250, easing: cubicOut}}>
				<input type="color" bind:value={g.color}>
				<span>{g.l.toPrecision(3)}</span>
				<button data-index="{i}" on:click={removeGraph} title="Remove graph"></button>
			</div>
		{/each}
	</div>
</div>

<Axis min_x={minE} max_x={maxE} min_y={0} max_y={1}>
	{#if V0 > minE && V0 < maxE}
		<DataPlot x={[0, V0, V0, maxE]} y={[0, 0, 1, 1]} color="#999" dash="10" />
	{/if}
	{#each graphs as g}
		<DataPlot x={energies} y={g.y} color={g.color} />
	{/each}
</Axis>


<style>
	@media (min-width: 100ch) {
		:global(body) {
			display: grid;
			grid-template-columns: 35ch 1fr;
		}
	}
	.inputs {
		box-shadow: 0 0 30px #0001;
		padding: 1rem;
	}
	h3 {
		margin-bottom: 1rem;
	}
	h3:not(:first-of-type) {
		margin-top: 2rem;
	}
	.grid2by2 {
		display: grid;
		grid-template-columns: auto 1fr;
		column-gap: 1ch;
		row-gap: .5rem;
		align-items: center;
	}
	input[type=range] {
		vertical-align: middle;
		width: 25ch;
	}
	.lengths {
		display: flex;
		flex-wrap: wrap;
		column-gap: 1.7ch;
		row-gap: 1.7ch;
		align-items: center;
		margin-top: 1rem;
	}
	input[type=number] {
		width: 10ch;
		font-size: 1em;
		padding: .25rem .5rem;
		border-radius: .25em;
		border: 2px solid #e1e1e1;
	}
	input::-webkit-outer-spin-button,
	input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.graph-info {
		border: 2px solid #e1e1e1;
		border-radius: 2em;
		padding: .25em .5em;
		vertical-align: middle;
		display: flex;
		align-items: center;
		column-gap: 1ch;
	}
	input[type=color] {
		width: 1.4rem;
		height: 1.4rem;
		padding: 0;
		border: none;
		background-color: transparent;
	}
	.graph-info button {
		background: transparent;
		border: 0;
		width: .9rem;
		height: .9rem;
		position: relative;
		cursor: pointer;
	}
	.graph-info button::before,
	.graph-info button::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) rotate(var(--rot));
		width: 100%;
		outline: 1px solid #444;
	}
	.graph-info button::before {--rot: 45deg;}
	.graph-info button::after {--rot: -45deg;}
	
	:global(.axis) {
		margin: auto;
	}
</style>
