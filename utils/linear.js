/**
 * @typedef {{
 * (value: number) => number, 
 * domain: (min: number, max: number) => linearScale,
 * range: (min: number, max: number) => linearScale
 * }} linearScale
 */
/**
 * Constructs a new linear scale
 * @returns {linearScale}
 */
export function linearScale() {
    var from_min = 0;
    var from_dim = 1;
    var to_min = 0;
    var to_dim = 1;
    const compute = v => (v-from_min)/from_dim*to_dim + to_min;
    compute.domain = (min, max) => {
        from_min = min;
        from_dim = max-min;
        return compute;
    }
    compute.range = (min, max) => {
        to_min = min;
        to_dim = max-min;
        return compute;
    }
    return compute;
}

/**
 * Creates an array array with equispaced values such that
 * they divide in equal spaces the range between min and max
 * @param {number} min minimum range value (included)
 * @param {number} max maximum range value (included)
 * @param {number} spaces number of equal spaces
 * @returns {number[]} threshold values of each equispaced interval (spaces+1 long)
 */
export function linearSpace(min, max, spaces) {
    const res = new Array(spaces+1);
    const span = (max-min)/spaces;
    for(var i=0; i<=spaces; i++) res[i] = span*i + min;
    return res;
}

/**
 * Creates an array array with equispaced values such that
 * they divide the range between min and max in equal spaces
 * and they avoid the secified holes
 * @param {number} min minimum range value (included)
 * @param {number} max maximum range value (included)
 * @param {number} spaces number of equal spaces
 * @param {number[]} holes list of (unique) numbers to skip
 * @returns {number[]} threshold values of each equispaced interval (spaces+1 long)
 */
export function linearSpaceH(min, max, spaces, holes) {
    const res = new Array(spaces+1);
    const span = (max-min)/spaces;
    var i;
    for(i=0; i<=spaces; i++) res[i] = span*i + min;
    if(!holes) return res;
    const H = holes.length;
    var p;
    var d;
    const err = span * 0.05;
    for(i=0; i<H; i++) {
        if(holes[i] < min || holes[i] > max) continue
        p = Math.floor((holes[i] - min) / span);
        d = holes[i] - res[p];
        if(d < err) res[p] += d + err;
        else {
            p += 1;
            d = res[p] - holes[i];
            if(d < err) res[p] -= d + err;
        }
    }
    return res;
}