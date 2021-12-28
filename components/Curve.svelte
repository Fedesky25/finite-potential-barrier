<script context="module">
    /**
     * @param {number[]} x
     * @param {(x: number)=>number} xs x scale
     * @param {number[]} y
     * @param {(y: number)=>number} ys y scale
     * @param {number[]} [bi] breaking indexes
     */
    function joinIntoPath(x, xs, y, ys, bi) {
        var res = '';
        var i = 0;
        const LEN = Math.min(x.length, y.length);
        const BIL = bi ? bi.length : 0;
        for(let j=0; j<BIL; j++) {
            if(i >= bi[j]) continue;
            res += 'M' + xs(x[i]) + ',' + ys(y[i]);
            for(i++; i<bi[j]; i++) res += 'L' + xs(x[i]) + ',' + ys(y[i]);
        }
        if(i<LEN) {
            res += 'M' + xs(x[i]) + ',' + ys(y[i]);
            for(i++; i<LEN; i++) res += 'L' + xs(x[i]) + ',' + ys(y[i]);
        }
        return res;
    }
</script>

<script>
    import { fade } from "svelte/transition";
    import { getContext } from "svelte";

    /**
     * Array of x values
     * @type {number[]}
     */
    export let x = [];
    /**
     * Array of y values
     * @type {number[]}
     */
    export let y = [];
    /**
     * Indexes at which break the continuity
     * @type {number[]|null}
     */
    let breakingIndexes = null;
    export { breakingIndexes as breaks }
    /**
     * Color of the curve
     * @type {string} any valid format
     */
    export let color = "black";
    /**
     * THickness of the curve in pixels
     * @type {number|string}
     */
    export let thickness = 2;
    export let dash;

    let xScale;
    let yScale;
    getContext("xScale")(v => xScale = v);
    getContext("yScale")(v => yScale = v);
</script>

<path 
    d={joinIntoPath(x, xScale, y, yScale, breakingIndexes)} 
    fill="none" 
    stroke={color} 
    stroke-width={thickness} 
    stroke-dasharray={dash}
    transition:fade={{duration: 150}}
/>