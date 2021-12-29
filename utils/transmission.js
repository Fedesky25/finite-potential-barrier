import Complex from "./Complex.js";
import Matrix2x2 from "./Matrix2x2.js";

const M = [new Matrix2x2, new Matrix2x2, new Matrix2x2, new Matrix2x2];
const k = new Complex;
const b = new Complex;

/**
 * Computes the matrix products, with the current M, b, and k
 * @param {number} l 
 * @returns {number}
 */
function compute(l) {
    // M1 = [1, 1; k, -k]
    M[0].a.toOne();
    M[0].b.toOne();
    M[0].c.eq(k);
    M[0].d.eq(k).toOpposite();

    // M2 = [1, 1; b, -b]
    M[1].a.toOne();
    M[1].b.toOne();
    M[1].c.eq(b);
    M[1].d.eq(b).toOpposite();
    
    // M3 = [exp(b*l), exp(-b*l); b*exp(b*l), -b*exp(-b*l)]
    M[2].a.eq(b).mul_r(l).intoExp();
    M[2].b.eq(M[2].a).toReciprocal();
    M[2].c.eq(M[2].a).mul(b);
    M[2].d.eq(M[2].b).mul(b).toOpposite();

    // M4 = [exp(k*l), exp(-k*l); k*exp(k*l), -k*exp(-k*l)]
    M[3].a.eq(k).mul_r(l).intoExp();
    M[3].b.eq(M[3].a).toReciprocal();
    M[3].c.eq(M[3].a).mul(k);
    M[3].d.eq(M[3].b).mul(k).toOpposite();

    // inv(M1)*M2*inv(M3)*M4
    M[0].toInverse().mul_right(M[1]).mul_right(M[2].toInverse()).mul_right(M[3]);
    return 1/M[0].a.squareModulus;
}

/**
 * @param {number} E energy [Ry]
 * @param {number} V0 potential [Ry]
 * @param {number} l barrier width [a.u.]
 * @returns {number} transmission coefficient
 */
export function transmission(E, V0, l) {
    k.becomes(-E,0).pow_r(.5);     // k^2 = -E 2m/h^2 
    if(Math.abs((E-V0)/E) < 2*Number.EPSILON) return 1/k.mul_r(l).intoExp().squareModulus;
    b.becomes(V0-E,0).pow_r(.5);   // beta^2 = (V0-E) 2m/h^2
    return compute(l);
}


/**
 * 
 * @param {number[]} E 
 * @param {number} V0 
 * @param {number[]} l 
 */
export function table_E_l(E, V0, l) {
    var i;
    var j;
    const LEN_E = E.length;
    const LEN_l = l.length;
    const res = new Array(LEN_E);
    for(i=0; i<LEN_E; i++) {
        k.becomes(-E[i],0).pow_r(.5);
        if(Math.abs(V0-E[i]) < 2*Number.EPSILON) {
            console.log(E[i]);
            const s = 1/k.mul_r(l).intoExp().squareModulus;
            for(j=0; j<LEN_l; j++) res[i][j] = s;
        } else {
            b.becomes(V0-E[i],0).pow_r(.5);
            res[i] = new Array(LEN_l);
            for(j=0; j<LEN_l; j++) res[i][j] = compute(l[j]);
        }
    }
    return res;
}

/**
 * Computes a table of array of the trasmission
 * coeffienciente of an array of lengths
 * @param {number[]} E energy values [Ry]
 * @param {number} V0 barrier potential [Ry]
 * @param {number[]} l barrier lengths [a.u.]
 * @returns {number[][]}
 */
export function table_l_E(E, V0, l) {
    var i;
    var j;
    const LEN_E = E.length;
    const LEN_l = l.length;
    const res = new Array(LEN_l);
    for(i=0; i<LEN_l; i++) res[i] = [];
    for(i=0; i<LEN_E; i++) {
        k.becomes(-E[i],0).pow_r(.5);
        b.becomes(V0-E[i],0).pow_r(.5);
        for(j=0; j<LEN_l; j++) res[j].push(compute(l[j]));
    }
    return res;
}


function piece1(E, V0) {
    k.becomes(-E,0).pow_r(.5);
    b.becomes(V0-E,0).pow_r(.5);
    // M1 = [1, 1; k, -k]
    M[0].a.toOne();
    M[0].b.toOne();
    M[0].c.eq(k);
    M[0].d.eq(k).toOpposite();
    M[0].toInverse();
    // M2 = [1, 1; b, -b]
    M[1].a.toOne();
    M[1].b.toOne();
    M[1].c.eq(b);
    M[1].d.eq(b).toOpposite();
}
function piece2(l) {
    // M3 = [exp(b*l), exp(-b*l); b*exp(b*l), -b*exp(-b*l)]
    M[2].a.eq(b).mul_r(l).intoExp();
    M[2].b.eq(M[2].a).toReciprocal();
    M[2].c.eq(M[2].a).mul(b);
    M[2].d.eq(M[2].b).mul(b).toOpposite();
    // M4 = [exp(k*l), exp(-k*l); k*exp(k*l), -k*exp(-k*l)]
    M[3].a.eq(k).mul_r(l).intoExp();
    M[3].b.eq(M[3].a).toReciprocal();
    M[3].c.eq(M[3].a).mul(k);
    M[3].d.eq(M[3].b).mul(k).toOpposite();

    M[3].mul_left(M[2].toInverse()).mul_left(M[1]).mul_left(M[0]);
    return 1/M[3].a.squareModulus;
}
function piece3(l) {
    // M2 = [1, -l; 0, 1]
    M[1].a.toOne();
    M[1].b.becomes(-l,0);
    M[1].c.toZero();
    M[1].d.toOne();
    // M4 = [exp(k*l), exp(-k*l); k*exp(k*l), -k*exp(-k*l)]
    M[3].a.eq(k).mul_r(l).intoExp();
    M[3].b.eq(M[3].a).toReciprocal();
    M[3].c.eq(M[3].a).mul(k);
    M[3].d.eq(M[3].b).mul(k).toOpposite();

    M[3].mul_left(M[1]).mul_left(M[0]);
    return 1/M[3].a.squareModulus;
}


function areFloatEqual(a,b) { return Math.abs((a-b)/a) < 2*Number.EPSILON }

/**
 * 
 * @param {number} minE starting energy value [Ry]
 * @param {number} maxE last energy value [Ry]
 * @param {number} samples how many values of E to take
 * @param {number} V0 barrier potential [Ry]
 * @param {number[]} lengths barrier lengths [a.u.]
 * @returns {number[][]} samples long array containing [energy, ...transmissions]
 */
export function table(minE, maxE, samples, V0, lengths) {
    const LEN_l = lengths.length;
    const res = new Array(samples);
    var i;
    var j;
    var E;
    if(minE <= 0) {
        samples *= maxE / (maxE-minE);
        minE = .1 * maxE / samples; 
    }

    const span = (maxE-minE)/(samples-1);
    const V0_index = Math.round((V0-minE)/span);
    const through_V0 = V0_index >= 0 && V0_index < samples && areFloatEqual(V0, minE+span*V0_index);
    const stop_index = through_V0 ? V0_index : samples;

    for(i=0; i<stop_index; i++) {
        E = minE + span*i;
        res[i] = new Array(LEN_l+1);
        res[i][0] = E;
        piece1(E, V0);
        for(j=0; j<LEN_l; j++) res[i][j+1] = piece2(lengths[j]);
    }
    if(!through_V0) return res;
    
    // special case: energy = potential
    k.becomes(-V0,0).pow_r(.5);
    // M1 = [1, 1; k, -k]
    M[0].a.toOne();
    M[0].b.toOne();
    M[0].c.eq(k);
    M[0].d.eq(k).toOpposite();
    M[0].toInverse();
    res[i] = new Array(LEN_l+1);
    res[i][0] = V0;
    for(j=0; j<LEN_l; j++) res[i][j+1] = piece3(lengths[j]);
    // normal calculation again
    for(i++; i<samples; i++) {
        E = minE + span*i;
        res[i] = new Array(LEN_l+1);
        res[i][0] = E;
        piece1(E,V0);
        for(j=0; j<LEN_l; j++) res[i][j+1] = piece2(lengths[j]);
    }
    return res;
}