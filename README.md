# Finite potential barrier
Part of a Physics 2 assignement that involves the study of a wave function in 1D where a potential barrier is present. In order to achieve the task, here's a Svelte page to visualize the trasmission coefficient in dependece of:
- barrier width
- barrier potential
- particle mass
- particle energy

# To the reviewer
The files of major interest regarding the computation are found in [utils folder](utils/). In particular:
- [Complex.js](utils/Comples.js) defines the class complex number with many methods to use them in calculation;
- [Matrix2x2.js](utils/Matrix2x2.js) defines the class for matrices of dimension 2 by 2 with complex entries;
- [linear.js](utils/linea.js) defines (among other functions) the class `LinearScale` which constructs an array of equispaced points of a numeric interval, with method `indexOf(x)` of order $O(1)$ that return the index of `x` inside the array (if present);
- [transmission.js](utils/transmission.js) defines the two functions used to compute the coefficient $T$:
    - `transmission(E,V0,l,m)` computes $T$ when energy `E` and potential `V0` (both in measure in $Ry$) are different; `l` and `m` are, respectively, the barrier length in $\mathring{A}$ and the particle mass as multiple of electrom masses $m_{e^-}$
    - `transmission_pot(E,l,m)` computes $T$ when energy and potential are the same.

The [public](public/) folder contains the release static files of the web page hosted [here](https://federicogulielmi.it/wave-transmission-coefficient).


# From math to code

In order to minimize (relatively expensive) memory allocation during computation, all the objects used inside `transmission` and `transmission_pot` are declared globally. After this passage, it is possible to define the two function body.

## Fundamental `Complex` and `Matrix2x2` use

Both classes have chainable methods to express on one line a multiple steps. For example the code to evaluate $k$ is:
```javascript
k.becomes(-m*E, 0).pow_r(.5);
``` 
Which translates to the math passages: $k = -mE$ and  $k = \sqrt{k}$. The method `pow_r` elevates the complex number to a **r**eal **pow**er: by running some test `pow_r(.5)` turned out to be surprisingly more performant than a `intoSqrt()` method which resorts only to `Math.sqrt`.

Matrix assignement are more cumbersome, but the base principle is that each `Matrix2x2` instance has four complex propeties (`a b c d`) which represent the for components of a 2 by 2 matrix. By treating them exactly as `Complex` instances, it is possible to assign values to the matrices; for example:
```javascript
M = new Matrix2x2();
M.a.eq(k).mul_r(l).intoExp();
M.b.eq(M[3].a).toReciprocal();
M.c.eq(M[3].a).mul(k);
M.d.eq(M[3].b).mul(k).toOpposite();
```
In math language, translates into a matrix $M$
$$
M = \begin{bmatrix} a & b \\ c & d \end{bmatrix}
\qquad \text{such that} \qquad
\begin{cases}
a = e^{kl} \\
b = a^{-1} = e^{-kl} \\
c = ka = ke^{kl} \\
d = -kb = -ke^{-kl}
\end{cases}
$$

Once all matrices needed for the computation are assigned their values, they are multiplied (with assignement, like a `*=` operator) to obtain a final matrix, which has as $a$ component the complex value whose reciprocal of square modulus is the transmission coefficient.
```javascript
M[0].toInverse().mul_right(M[1]).mul_right(M[2].toInverse()).mul_right(M[3]);
// M[0].toInverse().mul_right(M[1]).mul_right(M[3]); // in case of equal energy and potential
return 1 / M[0].a.squareModulus;
```

## Graph values computation

To obtain a graph of $T$ as a function of energy, we need to sample `transmission` on many `E` values belonging to an interval (the one visible in the viewbox, between `minE` and `maxE`), once the values of potential, barrier width and mass are fixed. To achieve that it is used a `LinearSpace` instance which divides an interval in equispaced values. Special caution must be taken when energy and potential are equal, since at this point another way of computing $T$ must be used: luckily the method `indexOf` of `LinearSpace` returns the index of a specified value among the equispaced points (or -1 if not present) with complexity $O(1)$ (leveraging that the array is ordered and his values have a fixed distance between them).

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

