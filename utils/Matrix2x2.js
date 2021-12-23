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
     */
    mul(m) {
        // a = (a*a') + b*c';
        // b = a*b' + (b*d');
        // c = (c*a') + d*c';
        // d = c*b' + (d*d');

        this.z1.eq(this.#b).mul(m.#c);
        this.z2.eq(this.#a).mul(m.#b);
        this.#a.mul(m.#a).add(this.z1);
        this.#b.mul(m.#d).add(this.z2);

        this.z1.eq(this.#d).mul(m.#c);
        this.z2.eq(this.#c).mul(m.#b);
        this.#c.mul(m.#a).add(this.z1);
        this.#d.mul(m.#d).add(this.z2);

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
     * Multiples multiple matrices, returning a new one
     * @param {Matrix2x2}
     */
    static multiply(...m) {
        const l = m.length;
        const res = Matrix2x2.copy(m[0]);
        for(var i=0; i<l; i++) res.mul(m[i]);
        return res;
    }
}
Matrix2x2.prototype.z1 = new Complex();
Matrix2x2.prototype.z2 = new Complex();