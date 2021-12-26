<script context="module">
    /**
     * Joins x and y arrays into a path
     * @param {number[]} x
     * @param {number[]} y
     * @param {(x: number) => number} xScale
     * @param {(y: number) => number} yScale
     * @returns {string}
     */
    function joinIntoPath(x, y, xScale, yScale) {
		const g = [ `M${xScale(x[0])},${yScale(y[0])}` ];
		const LEN = Math.min(x.length, y.length);
		for(var i=1; i<LEN; i++) g.push(`L${xScale(x[i])},${yScale(y[i])}`);
		return g.join(' ');
	}
</script>

<script>
    import { getContext } from 'svelte';
    import { fade } from 'svelte/transition'

    export let x = [];
    export let y = [];
    export let color = "black";
    export let thickness = 2;
    export let dash;

    let xScale;
    let yScale;
    getContext("xScale")(v => xScale = v);
    getContext("yScale")(v => yScale = v);
</script>

<path 
    d={joinIntoPath(x, y, xScale, yScale)} 
    stroke={color} 
    stroke-width={thickness} 
    stroke-dasharray={dash}
    fill="none" 
    transition:fade={{duration: 150}} 
/>