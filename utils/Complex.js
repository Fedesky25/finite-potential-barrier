export default class Complex {
    constructor(real=0, imag=0) {
        this.real = real;
        this.imag = imag;
    }
    /**
     * Equivalent to: z = real + imag*i
     * @param {number} real 
     * @param {number} imag 
     * @returns 
     */
    becomes(real=0, imag=0) {
        this.real = real;
        this.imag = imag;
        return this;
    }
    /**
     * Assignment: z = c
     * @param {Complex} c
     * @returns
     */
    eq(c) {
        this.real = c.real;
        this.imag = c.imag;
        return this;
    }
    /**
     * Addition: z = z+c
     * @param {Complex} c 
     * @returns
     */
    add(c) {
        this.real += c.real;
        this.imag += c.imag;
        return this;
    }
    /**
     * Subtraction: z = z-c
     * @param {Complex} c 
     * @returns
     */
    sub(c) {
        this.real -= c.real;
        this.imag -= c.imag;
        return this;
    }
    /**
     * Multiplication: z = z*c
     * @param {Complex} c 
     * @returns
     */
    mul(c) {
        var i = this.imag*c.real + this.real*c.imag;
        this.real = this.real*c.real - this.imag*c.imag;
        this.imag = i;
        return this;
    }
    /**
     * Multiplication by a real: z = z*r
     * @param {Number} r 
     */
    mul_r(r) {
        this.real *= r;
        this.imag *= r;
        return this;
    }
    /**@param {...Complex} cs*/
    mul$(...cs) {
        var t;
        for(var i=cs.length-1; i>=0; i--) {
            t = this.imag*cs[i].real + this.real*cs[i].imag;
            this.real = this.real*cs[i].real - this.imag*cs[i].imag;
            this.imag = t;
        }
        return this;
    }
    /**
     * Division: z = z/c
     * @param {Complex} c 
     * @returns
     */
    div(c) {
        var m2 = c.real*c.real + c.imag*c.imag;
        var r = (this.real*c.real + this.imag*c.imag) / m2;
        var i = (this.imag*c.real - this.real*c.imag) / m2;
        this.real = r;
        this.imag = i;
        return this;
    }
    /**
     * Exponentiation: z = z^c
     * @param {Complex} c complex power
     * @param {Number} [k=0] determines angle
     */
    pow(c, k=0) { return this.intoLog(k).mul(c).intoExp(); }
    /**
     * Exponentiation: z = z^r
     * @param {Complex} r real power
     * @param {Number} [k=0] determines angle
     */
    pow_r(r, k=0) {
        var mod = Math.pow(this.real*this.real + this.imag*this.imag, r/2); 
        var arg = Math.atan2(this.imag, this.real) + k*2*Math.PI;
        this.real = mod * Math.cos(r * arg);
        this.imag = mod * Math.sin(r * arg);
        return this;
    }
    /**@param {Number} n integer power */
    pow_n(n) {
        if(n == 0) return this.toOne();
        const real = this.real;
        const imag = this.imag;
        var end = n
        var t;
        if(n<0) {
            end = -n;
            this.toReciprocal();
        }
        for(var i=0; i<end; i++) {
            t = this.imag*real + this.real*imag;
            this.real = this.real*real - this.imag*imag;
            this.imag = t;
        }
        return this;
    }
    intoExp() {
        var mod = Math.exp(this.real);
        this.real = mod * Math.cos(this.imag);
        this.imag = mod * Math.sin(this.imag);
        return this;
    }
    intoLog(k=0) {
        var r = Math.log(this.real*this.real + this.imag*this.imag);
        var i = Math.atan2(this.imag, this.real) + k*2*Math.PI;
        this.real = r * .5;
        this.imag = i;
        return this;
    }
    intoSin() {
        var i = Math.cos(this.real)*Math.sinh(this.imag);
        this.real = Math.sin(this.real)*Math.cosh(this.imag);
        this.imag = i;
        return this;
    }
    intoCos() {
        var i = -Math.sin(this.real)*Math.sinh(this.imag);
        this.real = Math.cos(this.real)*Math.cosh(this.imag);
        this.imag = i;
        return this;
    }
    toOne() {
        this.real = 1;
        this.imag = 0;
        return this;
    }
    toZero() {
        this.real = 0;
        this.imag = 0;
        return this;
    }
    toConjugate() {
        this.imag = -this.imag;
        return this;
    }
    toReciprocal() {
        var m2 = this.real*this.real + this.imag*this.imag;
        this.real /= m2;
        this.imag = -this.imag/m2;
        return this;
    }
    toOpposite() {
        this.real = -this.real;
        this.imag = -this.imag;
        return this;
    }
    toString() {
        if(this.real == 0) return this.imag ? nf(this.imag)+'i' : '0';
        if(this.imag == 0) return nf(this.real);
        let r = ['(', nf(this.real)];
        if(this.imag > 0) {
            if(this.imag === 1) r.push('+i)');
            else r.push('+', nf(this.imag), 'i)');
        } else {
            if(this.imag === -1) r.push('-i)');
            else r.push(nf(this.imag), 'i)');
        }
        return r.join('');
    }
    get squareModulus() { return this.real*this.real + this.imag*this.imag }
    /**
     * Copies a complex number into a new one
     * @param {Complex} z 
     * @returns 
     */
    static copy(z) {return new Complex(z.real, z.imag) }
    /**
     * Creates a new complex number
     * @param {number} real real part
     * @param {number} imag imaginary part
     * @returns 
     */
    static ReIm(real, imag) { return new Complex(real, imag) }
    /**
     * Creates a new complex number
     * @param {number} mod modulus
     * @param {number} arg argument
     * @returns 
     */
    static ModArg(mod, arg) { return new Complex(mod * Math.cos(arg), mod * Math.sin(arg)) }
    /**
     * Finds the all the n-th roots of a complex number
     * @param {Complex} c complex numbers
     * @param {number} n integer root
     */
    static roots(c, n) {
        var mod = Math.pow(this.real*this.real + this.imag*this.imag, r/2); 
        var arg = Math.atan2(this.imag, this.real);
        const res = new Array(n);
        for(var i=0; i<n; i++) res[i] = Complex.ModArg(mod, arg+2*Math.PI*i); 
        return res;
    }
}
function nf(n) { return Number.isInteger(n) ? n.toString() : n.toPrecision(3) } 
if(typeof window !== "undefined") Object.defineProperty(window, "Complex", {value: Complex});