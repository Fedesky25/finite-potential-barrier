import Complex from "./Complex";
import Matrix2x2 from "./Matrix2x2";

const M = [new Matrix2x2, new Matrix2x2, new Matrix2x2, new Matrix2x2];
const k = new Complex;
const b = new Complex;
const z1 = new Complex;
const z2 = new Complex;

/**
 * @param {number} E energy [Ry]
 * @param {number} V0 potential [Ry]
 * @param {number} l barrier width [a.u.]
 * @returns {number} transmission coefficient
 */
export default function transmission(E, V0, l) {
    k.becomes(-E,0).exp_r(.5);     // k^2 = -E 2m/h^2 
    b.becomes(V0-E,0).exp_r(.5);   // beta^2 = (V0-E) 2m/h^2
    z1.toOne();
    
    M[0].set_a(z1).set_b(z1).set_c(k).set_d(k.toOpposite());

    M[1].set_a(z1).set_b(z1).set_c(b).set_d(b.toOpposite());

    z1.eq(b).mul(l).exponentiate();  // e^(b*l)
    
    M[2].set_a(z1).set_c(z2.eq(z1).mul(b)).set_b(z1.toReciprocal()).set_d(z2.eq(z1).mul(b).toOpposite());

    z1.eq(k).mul(l).exponentiate();  // e^(k*l)

    M[3].set_a(z1).set_c(z2.eq(z1).mul(k)).set_b(z1.toReciprocal()).set_d(z2.eq(z1).mul(k).toOpposite());

    M[0].toInverse().mul(M[1]).mul(M[2].toInverse()).mul(M[3]).get_a(z1);
    return 1/z1.squareModulus;
}