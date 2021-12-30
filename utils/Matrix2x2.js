import Complex from "./Complex.js";

export default class Matrix2x2 {
    /**
     * Constructs a new 2x2 complex matrix of the form [a, b; c, d]
     * @constructor
     */
    constructor() {
        this.a = new Complex();
        this.b = new Complex();
        this.c = new Complex();
        this.d = new Complex();
    }
    /**
     * Multiplies matrix on the left by overwriting itself
     * @param {Matrix2x2} m 
     * @returns
     */
    mul_right(m) {
        this.z1.eq(this.b).mul(m.c);  // b*c'
        this.z2.eq(this.a).mul(m.b);  // a*b'
        this.a.mul(m.a).add(this.z1); // a*a' + b*c'
        this.b.mul(m.d).add(this.z2); // b*d' + a*b'

        this.z1.eq(this.d).mul(m.c);  // d*c'
        this.z2.eq(this.c).mul(m.b);  // c*b'
        this.c.mul(m.a).add(this.z1); // c*a' + d*c'
        this.d.mul(m.d).add(this.z2); // d*d' + c*b'

        return this;
    }
    /**
     * Multiplies matrix on the left by overwriting itself
     * @param {Matrix2x2} m 
     * @returns
     */
    mul_left(m) {
        this.z1.eq(m.b).mul(this.c);
        this.z2.eq(m.c).mul(this.a);
        this.a.mul(m.a).add(this.z1);
        this.c.mul(m.d).add(this.z2);

        this.z1.eq(m.b).mul(this.d);
        this.z2.eq(m.c).mul(this.b);
        this.b.mul(m.a).add(this.z1);
        this.d.mul(m.d).add(this.z2);

        return this;
    }
    /**
     * Transforms the matrix into its inverse
     * @returns 
     */
    toInverse() {
        this.z1.eq(this.b).mul(this.c);
        this.z2.eq(this.a).mul(this.d).sub(this.z1); // determinant

        var t = this.a.div(this.z2);
        this.a = this.d.div(this.z2);
        this.d = t;
        this.b.toOpposite().div(this.z2);
        this.c.toOpposite().div(this.z2);

        return this;
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

if(typeof window !== "undefined") Object.defineProperty(window, 'Matrix2x2', {value: Matrix2x2});