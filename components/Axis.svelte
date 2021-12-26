<script>
    import { onMount, setContext } from 'svelte';
    import { writable } from 'svelte/store';
    import { linearScale, linearSpace } from '@utils/linear.js'

    export let min_x = 0;
    export let max_x = 1;
    export let min_y = 0;
    export let max_y = 1;

    export let density = 140;

    let width = 800;
    let height = 400;
    const pad = 2;

    const xScale = linearScale();
    const xs_store = writable(xScale);
    setContext("xScale", xs_store.subscribe);
    $: xs_store.set(xScale.domain(min_x, max_x).range(pad, width-pad));

    const yScale = linearScale();
    const ys_store = writable(yScale);
    setContext("yScale", ys_store.subscribe);
    $: ys_store.set(yScale.domain(min_y, max_y).range(height-pad, pad));

    $: xTicks = linearSpace(min_x, max_x, Math.ceil(width/density));
    $: yTicks = linearSpace(min_y, max_y, Math.ceil(height/density))

    /**@type {HTMLSvgElement}*/
    let svg;

    const resize = (function(){
        let waiting = false;
        function exec() {
            ({width, height} = svg.getBoundingClientRect());
            waiting = false;
        }
        return function() {
            if(waiting) return;
            waiting = true;
            requestAnimationFrame(exec);
        }
    })();
    onMount(resize);
</script>

<svelte:window on:resize={resize} />
<div class="axis">
    {#each yTicks as tick}
        <div class="y-tick" style="--t: {yScale(tick)}px;">{tick.toPrecision(3)}</div>
    {/each}
    {#each xTicks as tick}
        <div class="x-tick" style="--t: {xScale(tick)}px;">{tick.toPrecision(3)}</div>
    {/each}
    <svg bind:this={svg}>
        <g>
            {#each yTicks as tick}
                <line x1={pad} x2={width-pad} transform="translate(0, {yScale(tick)})" />
            {/each}
        </g>
        <g>
            {#each xTicks as tick}
                <line y1={pad} y2={height-pad} transform="translate({xScale(tick)}, 0)" />
            {/each}
        </g>
        <slot />
    </svg>
</div>

<style>
    .axis {
        padding: 1em;
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: 1fr 1em;
        gap: .7ch;

        width: 100%;
        height: 100%;
        max-width: 60em;
        max-height: 35em;
    }
    .x-tick {
        color: #999;
        grid-row: 2;
        grid-column: 2;
        justify-self: start;
        transform: translateX(calc(var(--t) - 50%));
    }
    .y-tick {
        color: #999;
        grid-row: 1;
        grid-column: 1;
        justify-self: end;
        align-self: start;
        transform: translateY(calc(var(--t) - 50%));
    }
    svg {
        width: 100%;
        height: 100%;
        grid-row: 1;
        grid-column: 2;
    }
    line {
		stroke: #ddd;
		stroke-dasharray: 2;
	}
</style>