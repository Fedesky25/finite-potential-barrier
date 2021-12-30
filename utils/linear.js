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


export class LinearSpace extends Array {
    /**
     * Constructs an array with equispaced values between a min and a max
     * @constructor
     * @param {number} min starting value
     * @param {number} max ending values
     * @param {number} points number of points taken
     * @param {boolean} [excludeMin] whether to exclude the min value
     * @param {boolean} [excludeMax] whether to exclude the max value
     */
    constructor(min, max, points, excludeMin=false, excludeMax=false) {
        super(points);
        this.min = min;
        this.span = (max-min)/(points-1);
        for(var i=0; i<points; i++) this[i] = this.span*i + min;
        if(excludeMin) this[0] += this.span*0.05;
        if(excludeMax) this[points-1]
    }
    /**
     * Returns the index of the occurrence of a value in a linear space, or -1 if it is not present. \
     * Works correctly only if the array value is not modified. \
     * Has order of complexity O(1)
     * @param {number} x value to search
     * @returns {number} index of the value or -1
     */
    indexOf(x) {
        const i = Math.round((x-this.min)/this.span);
        if(i >= 0 && i < this.length && Math.abs(this[i]-x) < this.span*0.05) return i;
        else return -1;
    }
    /**
     * Determines whether an linear space includes a certain value. \
     * Works correctly only if the array value is not modified. 
     * @param {number} x value to search for
     * @returns {boolean}
     */
    includes(x) {return this.indexOf(x) !== -1}
}
if(typeof window !== "undefined") Object.defineProperty(window, "LinearSpace", {value: LinearSpace});


// function LinearSpace2(min, max, points) {
//     const res = new Array(points);
//     const span = (max-min)/(points-1);
//     for(var i=0; i<points; i++) res[i] = span*i + min;
//     res.span = span;
//     res.min = min;
//     Object.setPrototypeOf(res, LinearSpace2.prototype);
//     return res;
// }
// LinearSpace2.prototype.indexOf = function(x) {
//     const i = Math.round((x-this.min)/this.span);
//     if(Math.abs((this[i]-x)/this[i]) < this.span*0.05) return i;
//     else return -1;
// }
// LinearSpace2.prototype.includes = function(x) { return this.indexOf(x) !== -1 }