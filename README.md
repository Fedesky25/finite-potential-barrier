# Finite potential barrier
Part of a Physics 2 assignement that involves the study of a wave function in 1D where a potential barrier is present. In order to achieve the task, here's a Svelte page to visualize the trasmission coefficient in dependece of:
- barrier width
- barrier potential
- particle mass
- particle energy

# To the reviewer
The files of major interest regarding the computation are found in [utils folder](utils). In particular:
- [Complex.js](utils/Complex.js) defines the class complex number with many useful methods for calculation;
- [Matrix2x2.js](utils/Matrix2x2.js) defines the class for matrices of dimension 2 by 2 with complex entries;
- [linear.js](utils/linear.js) defines (among other functions) the class `LinearScale` which constructs an array of equispaced points of a numeric interval, with method `indexOf(x)` which return the index of `x` inside the array (if present) with order of complexity O(1);
- [transmission.js](utils/transmission.js) defines the two functions used to compute the coefficient T:
    - `transmission(E,V0,l,m)` computes T when energy `E` and potential `V0` (both in Rydberg) are different; `l` and `m` are, respectively, the barrier length in Angstrom and the particle mass as multiple of electrom masses.
    - `transmission_pot(E,l,m)` computes T when energy and potential are the same.

The [public](public) folder contains the release static files of the web page hosted [here](https://federicoguglielmi.it/wave-transmission-coefficient).
There is also Node script ([main.js](main.js)) which, starting from a json file in the [data folder](data) having structure defined in [schema.json](schema.json) and specifying plot characteristics, generates a .dat file having the same name with the values of energies and transmission coefficients in a table-like format. For example `node main lengths` will parse [data/lengths.json](data/lengths.json), compute the trasmission coefficients, and write the file [data/lengths.dat](data/lengths.dat).


# Code explanation

## Fundamental `Complex` and `Matrix2x2` use

Both classes have chainable methods to express on one line multiple steps. For example the code to evaluate k is:
```javascript
k.becomes(-m*E, 0).pow_r(.5);
``` 
Which translates to the math passages: k = -mE and  k = sqrt(k). The method `pow_r` elevates the complex number to a **r**eal **pow**er: by running some test `pow_r(.5)` turned out to be surprisingly more performant than a `intoSqrt()` method which resorted only to `Math.sqrt`.

Matrix assignement are more cumbersome, but the base principle is that each `Matrix2x2` instance has four complex propeties (`a b c d`) which represent the for components of a 2 by 2 matrix. By treating them exactly as `Complex` instances, it is possible to assign values to the matrices; for example:
```javascript
const M = new Matrix2x2();
M.a.eq(k).mul_r(l).intoExp();
M.b.eq(M.a).toReciprocal();
M.c.eq(M.a).mul(k);
M.d.eq(M.b).mul(k).toOpposite();
```
In math language, translates into the matrix:

![Matrix definition](img/matrix.svg)

## Transmission function

In order to minimize (relatively expensive) memory allocation during computation, all the objects used inside `transmission` (and `transmission_pot`) are declared globally. In the function body, after calculating k and beta, values are assigned to all needed matrices, they are multiplied (with assignement, like a `*=` operator), and the `a` component of the resulting matrix is used to find the transmission coefficient.
```javascript
const M = [new Matrix2x2(), new Matrix2x2(), new Matrix2x2(), new Matrix2x2()];

function transmission(E, V0, l, m) {
    k.becomes(-m*E, 0).pow_r(.5);
    b.becomes(m*(V0-E), 0).pow_r(.5);

    // matrix assignment code

    M[0].toInverse().mul_right(M[1]).mul_right(M[2].toInverse()).mul_right(M[3]);
    return 1 / M[0].a.squareModulus;
}
```

## Graph values computation

To obtain a graph of T as a function of energy, we need to sample `transmission` on many `E` values belonging to an interval (the one visible in the viewbox, between `minE` and `maxE`), once the values of potential, barrier width and mass are fixed. To achieve that, a `LinearSpace` instance is used to divide an interval in equispaced values. Special caution must be taken when energy and potential are equal, since at this point another way of computing T must be used: luckily the method `indexOf` of `LinearSpace` returns the index of a specified value among the equispaced points (or -1 if not present) with complexity O(1) (leveraging the order of the array).

```javascript
// fix potential V0, barrier width l, mass m

const x = new LinearSpace(minE, maxE, 500, minE == 0);
const y = new Array(500);

var i=0;
const potential_index = x.indexOf(V0)
if(potential_index !== -1) {
    for(; i < potential_index; i++) y[i] = transmission(x[i], V0, l, m);
    y[potential_index] = transmission_pot(V0, l, m);
    i = potential_index + 1;
}
for(; i < potential_index; i++) y[i] = transmission(x[i], V0, l, m);

// all T values associated to the x values are now in y
```

## Overflow and underflow cases

When the values of barrier length and mass are high (for expample a proton, which has ~1836 electron masses, with barrier length 10A and potential 11eV), some matrices' components that depends exponentially on them become very high or very low (order of 10^200 or 10^-200): in these cases, further calculation such as matrix inversion lead to over- or under- flow, which in turns means that in edge cases the graph in the [web page](https://federicoguglielmi.it/wave-transmission-coefficient) will not render.

