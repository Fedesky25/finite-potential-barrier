import Complex from "./Complex";

const t1 = new Complex();
const t2 = new Complex();

export default class Matrix2x2 {
    #a = new Complex();
    #b = new Complex();
    #c = new Complex();
    #d = new Complex();
    /**
     * Constructs a new 2x2 complex matrix of the form [a, b; c, d]
     * @constructor
     */
    constructor() {}
    /**
     * Sets the a component of the matrix
     * @param {Complex} z 
     * @returns 
     */
    set_a(z) {
        this.#a.eq(z);
        return this;
    }
    /**
     * Sets the b component of the matrix
     * @param {Complex} z 
     * @returns 
     */
    set_b(z) {
        this.#b.eq(z);
        return this;
    }
    /**
     * Sets the c component of the matrix
     * @param {Complex} z 
     * @returns 
     */
    set_c(z) {
        this.#c.eq(z);
        return this;
    }
    /**
     * Sets the d component of the matrix
     * @param {Complex} z 
     * @returns 
     */
    set_d(z) {
        this.#d.eq(z);
        return this;
    }
    /**
     * Sets the value of z equal to the component a
     * @param {Complex} z 
     * @returns 
     */
    get_a(z) { 
        z.eq(this.#a);
        return this;
    }
    /**
     * Sets the value of z equal to the component a
     * @param {Complex} z 
     * @returns 
     */
    get_b(z) { 
        z.eq(this.#b);
        return this;
    }
    /**
     * Sets the value of z equal to the component a
     * @param {Complex} z 
     * @returns 
     */
    get_c(z) { 
        z.eq(this.#c);
        return this;
    }
    /**
     * Sets the value of z equal to the component a
     * @param {Complex} z 
     * @returns 
     */
    get_d(z) { 
        z.eq(this.#d);
        return this;
    }
    /**
     * Multiplies another matrix by overwriting itself
     * @param {Matrix2x2} m 
     * @returns
     */
    mul(m) {
        this.z1.eq(this.#b).mul(m.#c);  // b*c'
        this.z2.eq(this.#a).mul(m.#b);  // a*b'
        this.#a.mul(m.#a).add(this.z1); // a*a' + b*c'
        this.#b.mul(m.#d).add(this.z2); // b*d' + a*b'

        this.z1.eq(this.#d).mul(m.#c);  // d*c'
        this.z2.eq(this.#c).mul(m.#b);  // c*b'
        this.#c.mul(m.#a).add(this.z1); // c*a' + d*c'
        this.#d.mul(m.#d).add(this.z2); // d*d' + c*b'

        return this;
    }
    /**
     * Transforms the matrix into its inverse
     * @returns 
     */
    toInverse() {
        this.z1.eq(this.#b).mul(this.#c);
        this.z2.eq(this.#a).mul(this.#d).sub(this.z1); // determinant

        var t = this.#a.div(det);
        this.#a = this.#d.div(det);
        this.#d = t;
        t = this.#c.div(det).toOpposite();
        this.#c = this.#d.div(det).toOpposite();
        this.#d = t;

        return this;
    }
    /**
     * Copies a matrix into a new one
     * @param {Matrix2x2} m 
     */
    static copy(m) { return new Matrix2x2().set_a(m.#a).set_b(m.#b).set_c(m.#c).set_d(m.#d) }
    /**
     * Multiplies several matrices, returning a new one
     * @param {Matrix2x2}
     */
    static multiply(...m) {
        const l = m.length;
        const res = Matrix2x2.copy(m[0]);
        for(var i=0; i<l; i++) res.mul(m[i]);
        return res;
    }
}
/**
 * Utility complex number: do not use.\
 * Defined inside prototype to save marginal lookup time
 */
Matrix2x2.prototype.z1 = new Complex();
/**
 * Utility complex number: do not use.\
 * Defined inside prototype to save marginal lookup time
 */
Matrix2x2.prototype.z2 = new Complex();