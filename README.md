# Finite potential barrier
Part of a Physics 2 assignement that involves the study of a wave function in 1D where a potential barrier is present.
In order to achieve the task, here's a Svelte page to visualize the trasmission coefficient in dependece of:
- barrier width
- barrier potential
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

In order to minimize (relatively expensive) memory allocation during computation, all the objects used inside `transmission` and `transmission_pot` are declared globally. After this passage, it is possible to define the two function body. Math and code expressions are compared side by side.

## Energy different from potential: `transmission`

|             |                |
|-------------|----------------|


## Energy equal to potential: `transmission_pot`

## Graph values computation


$$ \begin{bmatrix} 1 & 1 \\ 2 & 2 \end{bmatrix} $$
