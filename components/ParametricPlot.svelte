<script context="module">
    /**
     * @param {number[][]} data
     * @param {number} num
     * @param {(x:number)=>number} xScale
     * @param {(y:number)=>number} yScale
     */
    function joinMultipleIntoPaths(data, num, xScale, yScale) {
        const LEN = data.length;
        const paths = [];
        var i;
        var j;
        var piece = 'M'+xScale(data[0][0])+',';
        for(i=0; i<num; i++) paths.push(piece+yScale(data[0][i+1]));
        for(i=1; i<LEN; i++) {
            piece = 'M'+xScale(data[i][0])+',';
            for(j=0;j<num;j++) paths[j] += piece + yScale(data[i][j+1]);
        }
        return paths;
    }
</script>

<script>
    import { getContext } from "svelte";
    import { fade } from 'svelte/transition';

    /**
     * Function that computes the y values given a range and parameters
     * @type {(min:number, max:number, sample:number, parameters:array)=>number[][]}
     */
    export let fn;
    /**
     * @typedef PlotOptions
     * @property {any} parameter object or value to pass the function
     * @property {string} color color of the plot
     * @property {string|number} thickness width of the trace
     * @property {string} dash dash array
     */
    /**@type {PlotOptions[]}*/
    let options = [];
    /**@type {string[]}*/
    let paths = [];

    let xScale;
    let yScale;
    let range;
    let sample = 0;
    
    function recompute() {
        if(sample <= 0) return;
        const data = fn(range[0], range[1], sample, options.map(v => v.parameter));
        paths = joinMultipleIntoPaths(data, options.length, xScale, yScale);
    }
    
    getContext("xScale")(v => {xScale = v; recompute();});
    getContext("yScale")(v => {yScale = v; recompute();});
    getContext("xRange")(v => {range = v; recompute();});
    getContext("xPixels")(v => {sample = Math.round(v/2); recompute();});
    
    /**
     * Adds a new plot
     * @param {...PlotOptions} opts
     */
    export function add(...opts) {
        const p = opts.map(v => v.parameter);
        const newData = fn(range[0], range[1], sample, p);
        paths.push(...joinMultipleIntoPaths(newData, options.length, xScale, yScale));
        options.push(p);
        options = options;
    }
    /**
     * Removes a plot
     * @param {number} index
     */
    export function remove(index) {
        paths.splice(index, 1);
        options.splice(index, 1);
        options = options;
    }
</script>

{#each options as opt, i}
    <path 
        d={paths[i]} 
        stroke={opt.color} 
        stroke-width={opt.thickness||2} 
        stroke-dasharray={opt.dash}
        fill="none" 
        transition:fade={{duration: 150}} 
    />
{/each}