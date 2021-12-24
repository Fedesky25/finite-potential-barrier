<script>
    import { onMount } from 'svelte';
	import { transmission } from '@utils/transmission.js'

    let width = 400;
    let height = 500;
    const padding = { top: 20, right: 40, bottom: 40, left: 25 };
    /**@type {HTMLSvgElement}*/
    let svg;
    /** maximum Energy [eV] */
    let maxE = 15;
    /** barrier poential [eV] */
    let V0 = 5;
    /** barrier length [A] */
    let ls = [];

	let graphs = [];

	function xScale(v) { return v/maxE*width }
	function yScale(v) { return height*(1-v) }

	function addGraph(l) {
		for(var i=0; i<200; i++) {

		}
	}

	function addLength(e) {
		const t = e.target;
		var v = +t.value;
		t.value = '';
		if(v <= 0) return;
		ls.push(v);
		ls = ls;
	}

    const yTicks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
	function ticks(from) {}
    $: xTicks = [];

    function resize() {({width, height} = svg.getBoundingClientRect())}
    onMount(resize);
</script>



<label>
    Maximum energy value [eV]
    <input type="range" min="1" max="30" bind:value={maxE}>
</label>
<label>
    Barrier potential [eV]
    <input type="range" min="1" max="20" bind:value={V0}>
</label>
<label>
    Barrier length [&Aring;]
    <input type="number" min="0" on:change={addLength}>
	<div class="lengths">
		{#each ls as l}
			<span>{l}</span>
		{/each}
	</div>
</label>
{@debug width, height}

<svelte:window on:resize={resize} />
<svg bind:this={svg}>
	<!-- y axis -->
	<g class='axis y-axis'>
		{#each yTicks as tick}
		<g class='tick' transform='translate(0, {-tick*height})'>
			<line x1='{padding.left}' x2={width} />
			<text x={padding.left - 8} y={0}>{tick}</text>
		</g>
		{/each}
	</g>
	
	<!-- x axis -->
	<g class='axis x-axis'>
		{#each xTicks as tick}
		<g class='tick' transform='translate({tick/maxE*width},0)'>
			<line y1={padding.bottom} y2={height} />
			<text y={height - padding.bottom + 16}>{tick}</text>
		</g>
		{/each}
	</g>

	{#each graphs as graph}
		<path d={graph} />
	{/each}
</svg>

<style>
	.lengths {
		display: flex;
		flex-wrap: wrap;
		column-gap: 2ch;
	}
	
	svg {
		display: block;
		width: 100%;
        height: 100%;
		max-width: 40rem;
		max-height: 30rem;
		margin: 2rem auto;
	}

	.tick line {
		stroke: #ddd;
		stroke-dasharray: 2;
	}

	text {
		font-size: 12px;
		fill: #999;
	}

	.x-axis text {
		text-anchor: middle;
	}

	.y-axis text {
		text-anchor: end;
	}
</style>
