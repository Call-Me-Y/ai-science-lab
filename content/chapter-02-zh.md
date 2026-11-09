<!--
Translation source: chapter 02, Simplified Chinese.
Source: templates/chapter2.html and its original embedded pages and SVG labels.
Translate the chapter title, narration, and UI values; preserve IDs, formulas, and runtime placeholders.
Page headings and resource comments are structural markers, not narration.
Layout padding is omitted; spacing inside source text is represented by ordinary spaces.
The appendices contain embedded UI and illustration copy, not additional lesson pages.
The source repeats slide7; the sequential page IDs below distinguish both pages.
-->

# 第二章：——滚动到底~

## 1 / 8

<!-- page: ch02.page01; source-slide: slide1 -->

<!-- text: ch02.page01.p01 -->

这里是第二节——！这里我们会学梯度下降——！

<!-- text: ch02.page01.p02 -->

众所周知——人往高处走，球往低处滚（是不是有哪里不对劲）。当我们将一个小球放在坡面上，它就会自动向更低处滚去。滚动的方向由坡面朝向决定，滚动速度受坡面的坡度和所受重力大小影响。

<!-- end-page -->

## 2 / 8

<!-- page: ch02.page02; source-slide: slide2 -->

<!-- text: ch02.page02.p01 -->

如果我们将高度换成残差平方和，位置改为参数取值，以模型为坡面。就可以靠小球的滚动来寻找最小值了！

<!-- text: ch02.page02.p02 -->

如果我们假设小球每次移动消耗单位时间，那么迭代次数就是运动时长。而步长则是速度，由导数（坡度？梯度！）和学习率（重力？？）相乘得到。

<!-- text: ch02.page02.p03 -->

这就是小球下滚法（划掉）梯度下降法！

<!-- illustration: svg/roll.svg -->

<!-- end-page -->

## 3 / 8

<!-- page: ch02.page03; source-slide: slide3 -->

<!-- text: ch02.page03.p01 -->

不过这个方法有个缺陷，小球可能陷入一个较浅的坑里出不来。

<!-- text: ch02.page03.p02 -->

调整合适的参数，得到全局最优解吧！

<!-- module: gradient-descent-1d; source-iframe: /inter-grad2 -->

<!-- end-page -->

## 4 / 8

<!-- page: ch02.page04; source-slide: slide4 -->

<!-- text: ch02.page04.p01 -->

以上是当我们只需要求一个参数时的情况，而我们之前做的AR模型是用了两个参数的。这时我们只需把曲线换成曲面。

<!-- text: ch02.page04.p02 -->

此时梯度不再等于导数。我们需将曲面沿$x$和$y$轴方向切割，得到两条曲线，分别求出两条曲线的导数后，进行矢量相加。

<!-- text: ch02.page04.p03 -->

也就是由两条相邻的边得到平行四边形对角线。

<!-- illustration: svg/roll3d.svg -->

<!-- end-page -->

## 5 / 8

<!-- page: ch02.page05; source-slide: slide5 -->

<!-- text: ch02.page05.p01 -->

让我们的小球在曲面上滚动吧！

<!-- text: ch02.page05.p02 -->

找到这个曲面的最低点！

<!-- module: gradient-descent-surface; source-iframe: /inter-grad3 -->

<!-- end-page -->

## 6 / 8

<!-- page: ch02.page06; source-slide: slide6 -->

<!-- text: ch02.page06.p01 -->

嘿嘿，你有没有想过，如果是多于两个参数的话该怎么办呢？

<!-- text: ch02.page06.p02 -->

三维图形？四维图形？五维？……

<!-- text: ch02.page06.p03 -->

对，是三维、四维、五维……的曲面！还是曲面哦！

<!-- end-page -->

## 7 / 8

<!-- page: ch02.page07; source-slide: slide7 -->

<!-- text: ch02.page07.p01 -->

这叫超曲面，作为人类来说是无法在现实中创造的。但是对于计算机来说，也就是多一个参数罢了，计算时求三个或者更多导数再拼成高维向量。是不是很神奇呢？

<!-- embedded-content: gradient-calculation; source: templates/inter-grad4.html -->

<!-- text: ch02.page07.embedded01 -->

对于函数 $f(x, y, z) = x^2y + y\sin(z) + e^{xz}$,

<!-- text: ch02.page07.embedded02 -->

分别对 $x, \, y, \, z$ 求偏导得到

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

最终得到梯度 $\nabla f = \left( \frac{\partial f}{\partial x}, \frac{\partial f}{\partial y}, \frac{\partial f}{\partial z} \right)$

<!-- text: ch02.page07.embedded07 -->

$$
= \left( 2xy + ze^{xz}, \, x^{2} + \sin(z), \, y\cos(z) + xe^{xz} \right)
$$

<!-- end-page -->

## 8 / 8

<!-- page: ch02.page08; source-slide: slide7 -->

<!-- text: ch02.page08.p01 -->

本章的内容就到这里啦——用这个方法，哪怕是99999亿个参数也能调出来喔（虽然你的计算机不一定受得了）。

<!-- text: ch02.page08.p02 -->

下一章我们将会介绍各位期待已久的神经网络！——其实也就是个很复杂的函数式子罢了，乐。

<!-- text: ch02.page08.p03 -->

还有计算机视觉！——其实也就是一个一个像素输入计算机罢了，乐。

<!-- end-page -->

<!-- appendix: embedded-module-copy; not part of the lesson pages -->

## 交互模块文案

<!-- documentTitle entries are original iframe document titles, not added panel headings. -->
<!-- Values in braces are runtime placeholders. Preserve their names and braces. -->
<!-- The surface initial-values label is retained verbatim; its original control actually changes the iteration count. -->

| ID | 中文原文 |
| --- | --- |
| `gradient1d.documentTitle` | 双极小值优化演示 |
| `gradient1d.description` | 包含两个极小值点：局部最小值 $(-1.35, -1.62)$ 和全局最小值 $(1.47, -4.44)$ |
| `gradient1d.learningRate` | 学习率 $\eta$: {learningRate} |
| `gradient1d.iterations` | 迭代次数: {iterations} |
| `gradient1d.initialPosition` | 初始位置: {initialX} |
| `gradient1d.start` | 开始优化 |
| `gradient1d.reset` | 重置 |
| `gradient1d.resultTitle` | 优化结果 |
| `gradient1d.resultEmpty` | 点击开始查看结果 |
| `gradient1d.finalPosition` | 最终位置: $x =$ {finalX} |
| `gradient1d.finalValue` | 函数值: $f(x) =$ {finalValue} |
| `gradient1d.localMinimum` | 到达左侧局部最小值区域 (理论值: {minimumValue}) |
| `gradient1d.globalMinimum` | 找到全局最小值! (理论值: {minimumValue}) |
| `gradient1d.notConverged` | 未完全收敛，建议调整学习率或迭代次数 |
| `gradientSurface.documentTitle` | Gradient Descent Visualizer |
| `gradientSurface.learningRate` | 学习率: {learningRate} |
| `gradientSurface.initialValues` | $x$和$y$的初始值: {iterations} |
| `gradientSurface.start` | 开始优化 |
| `gradientCalculation.documentTitle` | 梯度计算 |
| `svg.unsupported` | 您的浏览器不支持SVG动画 |

### 一元梯度下降实验公式

<!-- Source: templates/inter-grad2.html. -->

$$
f(x)=x^4-4x^2-x+1
$$

### 曲面梯度下降实验公式

<!-- Source: templates/inter-grad3.html. -->

$$
f(x,y)=x^2+2y^2
$$

## SVG 插图文案

<!-- Each row preserves a source SVG text element; line breaks use <br>. Numeric-only labels are language independent. -->

| ID | 中文原文 |
| --- | --- |
| `svg.roll3d.text01` | 垂直于<br>x<br>轴 |
| `svg.roll3d.text02` | 垂直于<br>y<br>轴 |
| `svg.roll3d.text03` | 垂直于<br>z<br>轴 |
| `svg.roll3d.text04` | 坡面 |

<!-- end-appendix -->
