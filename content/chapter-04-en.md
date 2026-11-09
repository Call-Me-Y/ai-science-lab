<!--
Translation target: chapter 04, English.
Source language: Simplified Chinese.
Source: templates/chapter4.html and its original embedded pages and SVG labels.
Translate the chapter title, narration, and UI values; preserve IDs, formulas, and runtime placeholders.
Page headings and resource comments are structural markers, not narration.
Layout padding is omitted; spacing inside source text is represented by ordinary spaces.
The appendices contain embedded UI and illustration copy, not additional lesson pages.
-->

# Chapter 4: ——An AI Took 6,000 Pictures. This Is What Happened to It

## 1 / 16

<!-- page: ch04.page01; source-slide: slide1 -->

<!-- text: ch04.page01.p01 -->

This chapter is about convolutional neural networks!

<!-- text: ch04.page01.p02 -->

This chapter is an ultra-detailed explanation of convolutional neural networks!

<!-- text: ch04.page01.p03 -->

This chapter covers the input, output, convolution, pooling, and fully connected layers of convolutional neural networks!

<!-- text: ch04.page01.p04 -->

Welcome to this chapter!

<!-- end-page -->

## 2 / 16

<!-- page: ch04.page02; source-slide: slide2 -->

<!-- text: ch04.page02.p01 -->

In the earlier handwritten digit recognition, we got an image of a handwritten digit—white strokes on a black background.

<!-- text: ch04.page02.p02 -->

Next, we shrink this image to $28\times28$ pixels, which gives us $28\times28$ brightness values arranged in a square grid, each between 0 and 255. Feed this grid into the computer, and the input is done!

<!-- illustration: svg/digital.svg -->

<!-- end-page -->

## 3 / 16

<!-- page: ch04.page03; source-slide: slide3 -->

<!-- text: ch04.page03.p01 -->

So simple... the input layer...

<!-- text: ch04.page03.p02 -->

Now, up next: the first convolutional layer!!!

<!-- end-page -->

## 4 / 16

<!-- page: ch04.page04; source-slide: slide3.5 -->

<!-- text: ch04.page04.p01 -->

We've prepared some numbers arranged in 3×3 grids—these are the convolution kernels. Want to know why it's called convolution? Because the way it works is multiplying the corresponding numbers of two 3×3 grids pairwise and then adding them all up!

<!-- text: ch04.page04.p02 -->

Multiply them pairwise, then roll it up! Rolled down to $\frac{1}{9}$ of the original size! (Sometimes kernels are $5\times5$; ours are $3\times3$.)

<!-- illustration: svg/conv1.svg -->

<!-- end-page -->

## 5 / 16

<!-- page: ch04.page05; source-slide: slide4 -->

<!-- text: ch04.page05.p01 -->

The two 3×3 grids in a convolution: one is the kernel we prepared in advance, and the other comes from the input grid!

<!-- text: ch04.page05.p02 -->

The input grid is $28\times28$—how does it become $3\times3$?

<!-- text: ch04.page05.p03 -->

We sweep through all $28\times28$ cells; each cell plus the 8 cells around it forms a 3×3 grid (padding with black cells where there's nothing around the edges). That gives us $28\times28$ little 3×3 grids!

<!-- illustration: svg/digital-animated.svg -->

<!-- end-page -->

## 6 / 16

<!-- page: ch04.page06; source-slide: slide5 -->

<!-- text: ch04.page06.p01 -->

All the ingredients are ready! Each of the $28\times28$ little 3×3 grids goes through a convolution with the kernel, producing $28\times28$ results, which can be assembled into a brand-new $28\times28$ grid.

<!-- illustration: svg/output.svg -->

<!-- end-page -->

## 7 / 16

<!-- page: ch04.page07; source-slide: slide5.5 -->

<!-- text: ch04.page07.p01 -->

What is this computation good for?

<!-- text: ch04.page07.p02 -->

In a convolutional neural network, the output values are scores telling how strongly a specific pattern matches each position.

<!-- text: ch04.page07.p03 -->

For example, the output of a vertical-edge-detecting kernel is the score for vertical edges—after this kernel runs, positions with vertical edges score high and appear bright in the resulting image.

<!-- text: ch04.page07.p04 -->

Convolution does much more than image recognition! For example, when we build a kernel from a Gaussian function...

<!-- text: ch04.page07.p05 -->

...Wait... Gaussian? ...Could it be... this is "Gaussian blur"?!

<!-- text: ch04.page07.p06 -->

Exactly!

<!-- end-page -->

## 8 / 16

<!-- page: ch04.page08; source-slide: slide6 -->

<!-- text: ch04.page08.p01 -->

Draw something here and try different kernels to see the effects! (The default is edge detection.)

<!-- text: ch04.page08.p02 -->

You can even write your own!!

<!-- module: hand-drawn-convolution; source-iframe: /inter-diy -->

<!-- end-page -->

## 9 / 16

<!-- page: ch04.page09; source-slide: slide7 -->

<!-- text: ch04.page09.p01 -->

Great! We now have the output image from the convolution. To save computation, we can compress the data next.

<!-- text: ch04.page09.p02 -->

We cut the $28\times28$ grid into $14\times14$ little $2\times2$ blocks. In each block we keep only the largest value, because those are the only ones that matter—and that's the max pooling layer!

<!-- text: ch04.page09.p03 -->

The grid is now $14\times14$!

<!-- illustration: svg/pooled.svg -->

<!-- end-page -->

## 10 / 16

<!-- page: ch04.page10; source-slide: slide8 -->

<!-- text: ch04.page10.p01 -->

Since there are many different local patterns to recognize, an image goes through many different convolutions. For handwritten digit recognition, we typically use 32 different kernels in the first convolutional layer.

<!-- text: ch04.page10.p02 -->

These small kernels can combine to form more complex shapes—for example, an upper horizontal edge and a right vertical edge combine into the digit "7".

<!-- text: ch04.page10.p03 -->

Next, we'll make the second-layer kernels to recognize combinations of patterns!

<!-- illustration: svg/conv3.svg -->

<!-- end-page -->

## 11 / 16

<!-- page: ch04.page11; source-slide: slide9 -->

<!-- text: ch04.page11.p01 -->

Second-layer kernels: each kernel is made of multiple parallel 3×3 grids, and each grid receives a different image at a different position, letting the kernel recognize complex pattern combinations.

<!-- text: ch04.page11.p02 -->

There are more pattern combinations than patterns, so here we use 64 new kernels, each containing 32 grids—one for each of the 32 $14\times14$ images. The resulting 64 $14\times14$ images are then pooled again into 64 $7\times7$ images.

<!-- end-page -->

## 12 / 16

<!-- page: ch04.page12; source-slide: slide9.5 -->

<!-- text: ch04.page12.p01 -->

Worth mentioning: kernels made of multiple parallel grids—also called multi-channel kernels—can also process color images, where the R, G, and B channels correspond to different matrices.

<!-- text: ch04.page12.p02 -->

You can try multi-kernel convolution here!

<!-- module: multi-kernel-convolution; source-iframe: /inter-diy3 -->

<!-- end-page -->

## 13 / 16

<!-- page: ch04.page13; source-slide: slide10 -->

<!-- text: ch04.page13.p01 -->

Finally, we flatten everything out to get $64\times7\times7=3136$ values, reflecting the score for a specific pattern at each position. These 3136 values are then added up in certain proportions—or in other words, weighted.

<!-- text: ch04.page13.p02 -->

For example, a strong horizontal-stroke score rules out a "1", so the weight from the horizontal stroke to "1" would be negative. But if there's a horizontal stroke in the lower half of the canvas, the likelihood of a "2" goes up, so that weight is positive. We multiply the pattern scores at each position by their corresponding weights to get scores for the ten digits 0–9.

<!-- text: ch04.page13.p03 -->

These ten scores can be positive or negative. To turn them into final probabilities—probabilities are positive and sum to 1—we exponentiate the scores and compute their share of the total. The largest one wins, and that's the output.

<!-- illustration: svg/net-end.svg -->

<!-- end-page -->

## 14 / 16

<!-- page: ch04.page14; source-slide: slide11 -->

<!-- text: ch04.page14.p01 -->

So here's the question: this whole thing has $32\times3\times3+64\times32\times3\times3+3136\times10=50080$ parameters in total, including the numbers inside every kernel and the final weights. How do we figure out these numbers?

<!-- text: ch04.page14.p02 -->

·

<!-- text: ch04.page14.p03 -->

·

<!-- text: ch04.page14.p04 -->

·

<!-- text: ch04.page14.p05 -->

G r a d i e n t   d e s c e n t !

<!-- end-page -->

## 15 / 16

<!-- page: ch04.page15; source-slide: slide12 -->

<!-- text: ch04.page15.p01 -->

We know gradient descent needs initial values, so at the start we can initialize these parameters randomly and uniformly.

<!-- text: ch04.page15.p02 -->

Then we feed the AI 6,000 handwritten images labeled with their digits (from the MNIST dataset), take 4,000 of the 6,000, and repeatedly have the randomly initialized model make predictions on them.

<!-- text: ch04.page15.p03 -->

Then we compare the predictions with the labels and use a loss function to measure the error (this corresponds to the sum of squared residuals in AR and linear regression, but since this is a classification problem we use cross-entropy), and adjust the parameters with gradient descent.

<!-- text: ch04.page15.p04 -->

After those 4,000 images are used up, we make predictions with the remaining 2,000 images to measure the model's accuracy. And with that, training is complete and the model is ready to use.

<!-- end-page -->

## 16 / 16

<!-- page: ch04.page16; source-slide: slide13 -->

<!-- text: ch04.page16.p01 -->

That's the most classic convolutional neural network—the one that predicts handwritten digits from the MNIST dataset.

<!-- text: ch04.page16.p02 -->

Everything from the text, object, and face recognition we see everywhere today, to emerging self-driving technology, is built on this foundation.

<!-- text: ch04.page16.p03 -->

And so our tour comes to an end. Yet what we've just covered is only a few stars among millions in the sky...

<!-- text: ch04.page16.p04 -->

——Now, begin your own exploration!

<!-- end-page -->

<!-- appendix: embedded-module-copy; not part of the lesson pages -->

## Interactive Module Copy

<!-- documentTitle entries are original iframe document titles, not added panel headings. -->
<!-- Values in braces are runtime placeholders. Preserve their names and braces. -->

| ID | English translation |
| --- | --- |
| `convolution.documentTitle` | Hand-drawn Convolution Processor |
| `convolution.compute` | Compute |
| `convolution.clear` | Clear |
| `convolution.sobelVertical` | Sobel Vertical |
| `convolution.sobelHorizontal` | Sobel Horizontal |
| `convolution.gaussianBlur` | Gaussian Blur |
| `convolution.sharpen` | Sharpen |
| `multiKernel.documentTitle` | Multi-layer Convolution Processor |
| `multiKernel.kernel1` | Kernel 1 |
| `multiKernel.kernel2` | Kernel 2 |
| `multiKernel.kernel3` | Kernel 3 |
| `multiKernel.compute` | Compute |
| `multiKernel.clear` | Clear |
| `svg.unsupported` | Your browser does not support SVG animations |

<!-- end-appendix -->
