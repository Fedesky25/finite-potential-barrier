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
    
    export let data = [];
    export let colors = [];

    let xScale;
    let yScale;
    getContext("xScale")(v => xScale = v);
    getContext("yScale")(v => yScale = v);

    $: paths = joinMultipleIntoPaths(data, colors.length, xScale, yScale);
</script>

{#each paths as p,i}
    <path d={p} 
        stroke={colors[i]} 
        stroke-width={2} 
        fill="none" 
        transition:fade={{duration: 150}} 
    />
{/each}