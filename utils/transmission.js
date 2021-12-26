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
    M[0].toInverse().mul(M[1]).mul(M[2].toInverse()).mul(M[3]);
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
    if(Math.abs(E-V0) < Number.EPSILON) return 1/k.mul_r(l).intoExp().squareModulus;
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
    var v;
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