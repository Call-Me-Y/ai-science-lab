<!--
Translation target: chapter 02, English.
Source language: Simplified Chinese.
Source: templates/chapter2.html and its original embedded pages and SVG labels.
Translate the chapter title, narration, and UI values; preserve IDs, formulas, and runtime placeholders.
Page headings and resource comments are structural markers, not narration.
Layout padding is omitted; spacing inside source text is represented by ordinary spaces.
The appendices contain embedded UI and illustration copy, not additional lesson pages.
The source repeats slide7; the sequential page IDs below distinguish both pages.
-->

# Chapter 2: ——Roll All the Way Down~

## 1 / 8

<!-- page: ch02.page01; source-slide: slide1 -->

<!-- text: ch02.page01.p01 -->

Here we are at Chapter 2—! In this chapter we're learning gradient descent—!

<!-- text: ch02.page01.p02 -->

As everyone knows—people climb higher, but balls roll lower (wait, is something off here?). When we place a small ball on a slope, it automatically rolls downhill. The direction it rolls is determined by which way the slope faces, and its speed depends on the steepness of the slope and the strength of gravity.

<!-- end-page -->

## 2 / 8

<!-- page: ch02.page02; source-slide: slide2 -->

<!-- text: ch02.page02.p01 -->

If we swap height for the sum of squared residuals, positions for parameter values, and treat the model as the slope, then the ball's rolling can find the minimum for us!

<!-- text: ch02.page02.p02 -->

If we assume each move of the ball takes one unit of time, then the number of iterations is the duration of the motion. And the step size is the velocity, obtained by multiplying the derivative (slope? gradient!) by the learning rate (gravity??).

<!-- text: ch02.page02.p03 -->

And that is the little-ball-rolling-downhill method (scratch that) gradient descent!

<!-- illustration: svg/roll.svg -->

<!-- end-page -->

## 3 / 8

<!-- page: ch02.page03; source-slide: slide3 -->

<!-- text: ch02.page03.p01 -->

But this method has a flaw: the ball might get stuck in a shallow pit and never get out.

<!-- text: ch02.page03.p02 -->

Tune the parameters just right to reach the global optimum!

<!-- module: gradient-descent-1d; source-iframe: /inter-grad2 -->

<!-- end-page -->

## 4 / 8

<!-- page: ch02.page04; source-slide: slide4 -->

<!-- text: ch02.page04.p01 -->

The above is the case where we only need to optimize one parameter, but the AR model we built before has two parameters. In that case, we just swap the curve for a surface.

<!-- text: ch02.page04.p02 -->

Here the gradient is no longer equal to a single derivative. We cut the surface along the $x$ and $y$ axis directions to get two curves, take the derivative of each curve, and add them together as vectors.

<!-- text: ch02.page04.p03 -->

In other words, two adjacent edges give you the diagonal of a parallelogram.

<!-- illustration: svg/roll3d.svg -->

<!-- end-page -->

## 5 / 8

<!-- page: ch02.page05; source-slide: slide5 -->

<!-- text: ch02.page05.p01 -->

Let's roll our little ball down the surface!

<!-- text: ch02.page05.p02 -->

Find the lowest point of this surface!

<!-- module: gradient-descent-surface; source-iframe: /inter-grad3 -->

<!-- end-page -->

## 6 / 8

<!-- page: ch02.page06; source-slide: slide6 -->

<!-- text: ch02.page06.p01 -->

Hehe, have you ever wondered what we'd do with more than two parameters?

<!-- text: ch02.page06.p02 -->

A 3D shape? A 4D shape? 5D? ...

<!-- text: ch02.page06.p03 -->

That's right—surfaces in 3D, 4D, 5D...! Still surfaces, mind you!

<!-- end-page -->

## 7 / 8

<!-- page: ch02.page07; source-slide: slide7 -->

<!-- text: ch02.page07.p01 -->

These are called hypersurfaces—impossible for humans to create in the real world. But for a computer, it's just one more parameter: compute three or more derivatives and assemble them into a high-dimensional vector. Isn't that amazing?

<!-- embedded-content: gradient-calculation; source: templates/inter-grad4.html -->

<!-- text: ch02.page07.embedded01 -->

For the function $f(x, y, z) = x^2y + y\sin(z) + e^{xz}$,

<!-- text: ch02.page07.embedded02 -->

taking the partial derivatives with respect to $x, \, y, \, z$ gives

<!-- text: ch02.page07.embedded03 -->

$$
\frac{\partial f}{\partial x} = 2xy + ze^{xz},
$$

<!-- text: ch02.page07.embedded04 -->

$$
\frac{\partial f}{\partial y} = x^2 + \sin(z),
$$

<!-- text: ch02.page07.embedded05 -->

$$
\frac{\partial f}{\partial z} = y\cos(z) + xe^{xz}.
$$

<!-- text: ch02.page07.embedded06 -->

Finally, we get the gradient $\nabla f = \left( \frac{\partial f}{\partial x}, \frac{\partial f}{\partial y}, \frac{\partial f}{\partial z} \right)$

<!-- text: ch02.page07.embedded07 -->

$$
= \left( 2xy + ze^{xz}, \, x^{2} + \sin(z), \, y\cos(z) + xe^{xz} \right)
$$

<!-- end-page -->

## 8 / 8

<!-- page: ch02.page08; source-slide: slide7 -->

<!-- text: ch02.page08.p01 -->

That's all for this chapter—with this method, you can tune even ten trillion parameters (though your computer might not survive it).

<!-- text: ch02.page08.p02 -->

Next chapter, we'll introduce the long-awaited neural networks! ——Which are really just very complicated function expressions, lol.

<!-- text: ch02.page08.p03 -->

And computer vision! ——Which is really just feeding pixels into a computer one by one, lol.

<!-- end-page -->

<!-- appendix: embedded-module-copy; not part of the lesson pages -->

## Interactive Module Copy

<!-- documentTitle entries are original iframe document titles, not added panel headings. -->
<!-- Values in braces are runtime placeholders. Preserve their names and braces. -->
<!-- The surface initial-values label is retained verbatim; its original control actually changes the iteration count. -->

| ID | English translation |
| --- | --- |
| `gradient1d.documentTitle` | Two-Minima Optimization Demo |
| `gradient1d.description` | Contains two minima: a local minimum $(-1.35, -1.62)$ and a global minimum $(1.47, -4.44)$ |
| `gradient1d.learningRate` | Learning rate $\eta$: {learningRate} |
| `gradient1d.iterations` | Iterations: {iterations} |
| `gradient1d.initialPosition` | Initial position: {initialX} |
| `gradient1d.start` | Start optimization |
| `gradient1d.reset` | Reset |
| `gradient1d.resultTitle` | Optimization result |
| `gradient1d.resultEmpty` | Press start to see the result |
| `gradient1d.finalPosition` | Final position: $x =$ {finalX} |
| `gradient1d.finalValue` | Function value: $f(x) =$ {finalValue} |
| `gradient1d.localMinimum` | Reached the local minimum region on the left (theoretical value: {minimumValue}) |
| `gradient1d.globalMinimum` | Found the global minimum! (theoretical value: {minimumValue}) |
| `gradient1d.notConverged` | Not fully converged; try adjusting the learning rate or the number of iterations |
| `gradientSurface.documentTitle` | Gradient Descent Visualizer |
| `gradientSurface.learningRate` | Learning rate: {learningRate} |
| `gradientSurface.initialValues` | Initial values of $x$ and $y$: {iterations} |
| `gradientSurface.start` | Start optimization |
| `gradientCalculation.documentTitle` | Gradient Calculation |
| `svg.unsupported` | Your browser does not support SVG animations |

### 1D Gradient Descent Experiment Formula

<!-- Source: templates/inter-grad2.html. -->

$$
f(x)=x^4-4x^2-x+1
$$

### Surface Gradient Descent Experiment Formula

<!-- Source: templates/inter-grad3.html. -->

$$
f(x,y)=x^2+2y^2
$$

## SVG Illustration Copy

<!-- Each row preserves a source SVG text element; line breaks use <br>. Numeric-only labels are language independent. -->

| ID | English translation |
| --- | --- |
| `svg.roll3d.text01` | Perpendicular<br>to<br>x-axis |
| `svg.roll3d.text02` | Perpendicular<br>to<br>y-axis |
| `svg.roll3d.text03` | Perpendicular<br>to<br>z-axis |
| `svg.roll3d.text04` | Slope |

<!-- end-appendix -->
