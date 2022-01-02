<script>
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing'
	import { LinearSpace } from '@utils/linear.js';
	import { eV2Ry, A2au } from '@utils/convert.js';
	import { transmission, transmission_pot } from '@utils/transmission.js';
	import randomColor from '@utils/randomColor.js';

	import Axis from './Axis.svelte';
	import DataPlot from './DataPlot.svelte';

	/** maximum Energy [eV] */
    let minE = 0;
    /** maximum Energy [eV] */
    let maxE = 15;
	/** barrier width [A]*/
	let global_length = 3;
    /** barrier poential [eV] */
    let global_potential = 5;
	/** particle mass in terms of electron mass */
	let global_mass = 1;

	/**
	 * Input mode: \
	 * 0 - fixed V0 and m \
	 * 1 - fixed l and m \
	 * 2 - fixed l and V0
	 */
	let mode = 0;

	
	/**@type {{color: string, value: number, transmissions: number[]}[]}*/
	let graphs = [];
	$: (mode+1) && (graphs = []);
	
	$: xs = new LinearSpace(minE, maxE, 500, minE == 0);

	/**
	 * @param {number} pot barrier potential
	 * @param {number} length
	 * @param {number} mass
	 * @param {number[]} arr
	 * @returns {number[]}
	 */
	function calculate(pot, length, mass, arr) {
		if(!arr) arr = new Array(500);
		pot *= eV2Ry;
		length *= A2au;
		var i = 0;
		const pot_index = xs.indexOf(pot);
		if(pot_index !== -1) {
			for(; i<pot_index; i++) arr[i] = transmission(xs[i]*eV2Ry, pot, length, mass);
			arr[pot_index] = transmission_pot(pot, length, mass);
			i = pot_index+1;
		}
		for(; i<500; i++) arr[i] = transmission(xs[i]*eV2Ry, pot, length, mass)
		return arr;
	}
	const evaluators = [
		(len, arr) => calculate(global_potential, len, global_mass, arr),
		(pot, arr) => calculate(pot, global_length, global_mass, arr),
		(mass, arr) => calculate(global_potential, global_length, mass, arr),
	]
	
	function removeGraph(e) {
		const i = +e.target.getAttribute('data-index');
		graphs.splice(i, 1);
		graphs = graphs;
	}
	function updateGraphs() {
		const LEN = graphs.length;
		for(var i=0; i<LEN; i++) graphs[i].transmissions = evaluators[mode](graphs[i].value, graphs[i].transmissions);
	}
	$: (xs || global_length || global_potential || global_mass) && updateGraphs();
	function addGraph(v) {
		graphs.push({
			value: v, 
			transmissions: evaluators[mode](v),
			color: randomColor(), 
		});
		graphs = graphs;
	}
	let currentInput;
	function add() {
		const v = +currentInput.value;
		currentInput.value = '';
		if(v > 0) addGraph(v);
	}
	/**@param {KeyboardEvent} e*/
	function onEnter(e) { if(e.key === "Enter") add()}


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
		<input type="number" id="minE" min="0" value="0" max={maxE-.01} use:forceBounds on:safe-change={e => minE = e.detail}>
		<label for="#maxE">Maximum:</label>
		<input type="number" id="maxE" min={minE+.01} value="15" use:forceBounds on:safe-change={e => maxE = e.detail}>
	</div>

	<h3>Fixed data selection</h3>
	<select bind:value={mode}>
		<option value={0}>Potential and mass</option>
		<option value={1}>Barrier width and mass</option>
		<option value={2}>Barrier width and potential</option>
	</select>

	{#if mode !== 0}
		<h3>Barrier length [&Aring;]</h3>
		<input type="range" min="0.025" max="10" step="0.025" bind:value={global_length}> {global_length}
	{/if}

	{#if mode !== 1}
		<h3>Barrier potential [eV]</h3>
		<input type="range" min="0.05" max="20" step="0.05" bind:value={global_potential}> {global_potential}
	{/if}

	{#if mode !== 2}
		<h3>Particle mass</h3>
		<select bind:value={global_mass}>
			<option value={2e-3}>electron neutrino</option>
			<option value={0.33}>muon neutrino</option>
			<option value={1}>electron</option>
			<option value={3.9}>quark up</option>
			<option value={9.4}>quark down</option>
			<option value={35.6}>tau neutrino</option>
			<option value={206.77}>muon</option>
			<option value={1836.1}>proton</option>
		</select>
	{/if}

	<h3>{#if mode === 0}Barrier lengths [&Aring;]{:else if mode === 1}Potentials [eV]{:else}Masses [m<sub>e</sub>]{/if}</h3>
	<input type="number" min="0" bind:this={currentInput} on:keydown={onEnter}>
	<button class="add" on:click={add}></button>
	<div class="legends">
		{#each graphs as g, i}
			<div class="graph-info" in:fade={{duration: 250, easing: cubicOut}}>
				<input type="color" bind:value={g.color}>
				<span>{g.value.toPrecision(3)}</span>
				<button class="remove" data-index="{i}" on:click={removeGraph} title="Remove graph"></button>
			</div>
		{/each}
	</div>
</div>

<Axis min_x={minE} max_x={maxE} min_y={0} max_y={1}>
	{#if mode != 1 && global_potential > minE && global_potential < maxE}
		<DataPlot x={[0, global_potential, global_potential, maxE]} y={[0, 0, 1, 1]} color="#999" dash="10" />
	{/if}
	{#each graphs as g}
		<DataPlot x={xs} y={g.transmissions} color={g.color} />
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
	select {
		font-size: 1em;
		padding: .25rem .5rem;
		border-radius: .25em;
		border: 2px solid #e1e1e1;
	}
	input[type=range] {
		vertical-align: middle;
		width: 25ch;
	}
	.legends {
		display: flex;
		flex-wrap: wrap;
		column-gap: 1.7ch;
		row-gap: 1.7ch;
		align-items: center;
		margin-top: 1.5rem;
	}
	input[type=number] {
		width: 10ch;
		font-size: 1em;
		padding: .25rem .5rem;
		border-radius: .25em;
		border: 2px solid #e1e1e1;
		vertical-align: middle;
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

	button.add {
		vertical-align: middle;
		margin-inline: 1ch;
	}
	button.add,
	button.remove {
		background: transparent;
		border: 0;
		width: .9rem;
		height: .9rem;
		position: relative;
		cursor: pointer;
	}
	button.add::before,
	button.add::after,
	button.remove::before,
	button.remove::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%) rotate(var(--rot));
		width: 100%;
		outline: 1px solid #444;
	}
	button.add::before {--rot: 0deg}
	button.add::after {--rot: 90deg}
	button.remove::before {--rot: 45deg;}
	button.remove::after {--rot: -45deg;}
	
	:global(.axis) {
		margin: auto;
	}
</style>
