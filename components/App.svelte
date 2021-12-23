<script>
    import { onMount } from 'svelte'

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
    let l=0;

    $: if(l<0) l=0.1;

    const yTicks = [0.0, 0.2, 0.4, 0.6, 0.8, 1.0];
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
    <input type="number" min="0" bind:value={l}>
</label>

<svelte:window on:resize={resize} />
<svg bind:this={svg}>
    <!-- y axis -->
	<g class='axis y-axis'>
		{#each yTicks as tick}
			<g class='tick' transform='translate(0, {-tick*height})'>
				<line x1='{padding.left}' x2={width} />
				<text x='{padding.left - 8}' y='+4'>{tick}</text>
			</g>
		{/each}
	</g>

	<!-- x axis -->
	<g class='axis x-axis'>
		{#each xTicks as tick}
			<g class='tick' transform='translate({tick/maxE*width},0)'>
				<line y1={padding.bottom} y2={height} />
				<text y='{height - padding.bottom + 16}'>{tick}</text>
			</g>
		{/each}
	</g>
</svg>

<style>
	svg {
		width: 100%;
        height: 100%;
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
