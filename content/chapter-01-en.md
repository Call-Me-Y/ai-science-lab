<!--
Translation target: chapter 01, English.
Source language: Simplified Chinese.
Sources: templates/chapter1.html, templates/inter-linear.html, templates/inter-AR.html.
Translate the chapter title, narration, and UI values; keep IDs, formula notation, entities, and placeholders unchanged.
Page headings are structural markers, not narration. Keep the original five-page sequence.
The original slide IDs skip slide4; this mapping is intentional.
Canonical &nbsp; entities preserve the source heading padding and intentional blank paragraph.
UI copy below the appendix marker belongs to embedded experiments, not extra lesson pages.
-->

# Chapter 1: ——What?! Line Fitting Is AI Too?!

## 1 / 5

<!-- page: ch01.page01; source-slide: slide1 -->

<!-- text: ch01.page01.p01 -->

Everyone—! Welcome to the AI Science Lab—! 

<!-- text: ch01.page01.p02 -->

Coming up is a super-fast, super-thrilling ride — from linear regression all the way to neural networks!!!

<!-- text: ch01.page01.p03 -->

Press the red button on the left to exit, the gray button in the middle to fast-forward, and the green button on the right to move on to the next section.

<!-- end-page -->

## 2 / 5

<!-- page: ch01.page02; source-slide: slide2 -->

<!-- text: ch01.page02.p01 -->

What? Linear regression?? ——This thing right here??? Fitting a straight line to a scatter of points!

<!-- text: ch01.page02.p02 -->

The points $(x_i,y_i)$ in the chart are the training data, and the straight line $y=bx+a$ computed by the formula is the model. $x$ is the input, and $y$ is the output.

<!-- text: ch01.page02.p03 -->

The dashed lines are the residuals, $SS_{\text{res}}$ is the sum of squared residuals, and $SS_{\text{tot}}$ is the total sum of squares of the training data. The closer R-squared is to 1, the better the model fits.

<!-- text: ch01.page02.p04 -->

<p> </p>

<!-- text: ch01.page02.p05 -->

Adjust the data points to get R-squared above 0.9!

<!-- module: linear-regression; source-iframe: /inter-linear -->

<!-- end-page -->

## 3 / 5

<!-- page: ch01.page03; source-slide: slide3 -->

<!-- text: ch01.page03.p01 -->

Congratulations! You now understand everything an AI needs! A model, inputs and outputs, a training method, and an evaluation method.

<!-- text: ch01.page03.p02 -->

From here on, we just keep upgrading each of these pieces, and we can build every kind of AI!

<!-- end-page -->

## 4 / 5

<!-- page: ch01.page04; source-slide: slide5 -->

<!-- text: ch01.page04.p01 -->

For example, we can swap the straight-line model for an AR model. The AR model is similar to the Fibonacci sequence: the next term is a weighted sum of the previous two terms.

<!-- text: ch01.page04.p02 -->

In other words, $a_n$ equals $p*a_{n-1}+q*a_{n-2}$.

<!-- text: ch01.page04.p03 -->

Adjust the values of $p$ and $q$ to get a good AR model, rookie AI trainer!

<!-- module: ar-forecast; source-iframe: /inter-AR -->

<!-- end-page -->

## 5 / 5

<!-- page: ch01.page05; source-slide: slide6 -->

<!-- text: ch01.page05.p01 -->

Hahaha, two parameters aren't so hard to tune, right? Do you know how many weight parameters DeepSeek-V3 — the model we use every day — has?

<!-- text: ch01.page05.p02 -->

——671 billion parameters!!! There's no way anyone could tune those by hand. And most models don't come with a formula like linear regression's that hands you the parameters directly.

<!-- text: ch01.page05.p03 -->

And that's a wrap for this chapter! Next chapter, we'll introduce an incredibly elegant, wonderfully simple, and all-powerful parameter-tuning algorithm — gradient descent!!! Dun dun dun daaah—

<!-- end-page -->

<!-- appendix: embedded-module-copy; not part of the five lesson pages -->

## Interactive Module Copy

<!-- The documentTitle entries originate from the original iframe document titles, not visible panel headings. -->
<!-- {prediction} and {rSquared} are runtime numeric placeholders. Keep the braces and names unchanged. -->
<!-- Trailing spaces in the original labels are written as &#32; to keep them explicit in the translation source. -->

| ID | English translation |
| --- | --- |
| `linear.documentTitle` | Interactive Linear Regression |
| `ar.documentTitle` | AR Model Forecast |
| `ar.parameter.p` | p value (-0.5 to 1.5):&#32; |
| `ar.parameter.q` | q value (-0.5 to 1.5):&#32; |
| `ar.prediction` | Prediction ($x=10$):&#32;{prediction} |
| `ar.fit` | Model fit: $R^2$ =&#32;{rSquared} |
| `ar.series.history` | Historical data |
| `ar.series.fitted` | Fitted prediction |
| `ar.series.future` | Future forecast |
| `ar.axis.time` | Time series |
| `ar.axis.value` | Value |

### Linear Regression Experiment Formula

<!-- Source: the KaTeX formula in templates/inter-linear.html. -->
<!-- The original widget additionally substitutes live values for SS_res, SS_tot, and R_squared, each formatted to two decimal places. -->

$$
R^2 = 1 - \frac{SS_{\text{res}}}{SS_{\text{tot}}}
$$

<!-- end-appendix -->
