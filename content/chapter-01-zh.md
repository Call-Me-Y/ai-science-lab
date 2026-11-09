<!--
Translation source: chapter 01, Simplified Chinese.
Sources: templates/chapter1.html, templates/inter-linear.html, templates/inter-AR.html.
Translate the chapter title, narration, and UI values; keep IDs, formula notation, entities, and placeholders unchanged.
Page headings are structural markers, not narration. Keep the original five-page sequence.
The original slide IDs skip slide4; this mapping is intentional.
Canonical &nbsp; entities preserve the source heading padding and intentional blank paragraph.
UI copy below the appendix marker belongs to embedded experiments, not extra lesson pages.
-->

# 第一章：——什么？！直线拟合也是AI？！

## 1 / 5

<!-- page: ch01.page01; source-slide: slide1 -->

<!-- text: ch01.page01.p01 -->

各位——！欢迎来到AI科学实验馆——！

<!-- text: ch01.page01.p02 -->

即将到来的将是一场从线性回归到神经网络的超高速刺激旅程！！！

<!-- text: ch01.page01.p03 -->

按下左侧红色按钮以退出，中间灰色按钮以快进，右侧绿色按钮以进入下一节。

<!-- end-page -->

## 2 / 5

<!-- page: ch01.page02; source-slide: slide2 -->

<!-- text: ch01.page02.p01 -->

什么？是线性回归？？——就是下面这个东西？？？用直线拟合点的分布！

<!-- text: ch01.page02.p02 -->

图中的点$(x_i,y_i)$是训练数据，经公式计算得到的直线$y=bx+a$是模型。$x$是输入，$y$是输出。

<!-- text: ch01.page02.p03 -->

虚线是残差，$SS_{\text{res}}$是残差平方和，$SS_{\text{tot}}$是训练数据的平方和。R方越接近1模型越适合。

<!-- text: ch01.page02.p04 -->

<p> </p>

<!-- text: ch01.page02.p05 -->

调整数据点使R方大于0.9吧！

<!-- module: linear-regression; source-iframe: /inter-linear -->

<!-- end-page -->

## 3 / 5

<!-- page: ch01.page03; source-slide: slide3 -->

<!-- text: ch01.page03.p01 -->

恭喜！你已经明白了一个AI必须具备的所有东西！模型，输入输出，训练方式和评估方式。

<!-- text: ch01.page03.p02 -->

接下来我们只要不断对各个环节进行升级，就能造出所有类型的AI！

<!-- end-page -->

## 4 / 5

<!-- page: ch01.page04; source-slide: slide5 -->

<!-- text: ch01.page04.p01 -->

例如当我们把直线模型换成AR模型，AR模型类似于斐波那契数列，下一项是前两项的加权和。

<!-- text: ch01.page04.p02 -->

也就是$a_n$等于$p*a_{n-1}+q*a_{n-2}$。

<!-- text: ch01.page04.p03 -->

调整$p$和$q$的值，得到合适的AR模型吧，新人AI训练师！

<!-- module: ar-forecast; source-iframe: /inter-AR -->

<!-- end-page -->

## 5 / 5

<!-- page: ch01.page05; source-slide: slide6 -->

<!-- text: ch01.page05.p01 -->

哈哈哈，两个参数还不算太难调吧。你知道日常生活中我们用到的deepseek-v3有多少个权重参数吗？

<!-- text: ch01.page05.p02 -->

——6710亿个参数！！！这可不能手动调整。而且一般的模型可没有像线性回归那样的公式可以直接算出参数。

<!-- text: ch01.page05.p03 -->

所以，本章到这里就结束了，下一章，我们将介绍一种极其优美简便又万能的调参算法——梯度下降！！！当当当当——

<!-- end-page -->

<!-- appendix: embedded-module-copy; not part of the five lesson pages -->

## 交互模块文案

<!-- The documentTitle entries originate from the original iframe document titles, not visible panel headings. -->
<!-- {prediction} and {rSquared} are runtime numeric placeholders. Keep the braces and names unchanged. -->
<!-- Trailing spaces in the original labels are written as &#32; to keep them explicit in the translation source. -->

| ID | 中文原文 |
| --- | --- |
| `linear.documentTitle` | Interactive Linear Regression |
| `ar.documentTitle` | AR模型预测 |
| `ar.parameter.p` | p值 (-0.5 到 1.5):&#32; |
| `ar.parameter.q` | q值 (-0.5 到 1.5):&#32; |
| `ar.prediction` | 预测值 ($x=10$):&#32;{prediction} |
| `ar.fit` | 模型拟合度: $R^2$ =&#32;{rSquared} |
| `ar.series.history` | 历史数据 |
| `ar.series.fitted` | 拟合预测 |
| `ar.series.future` | 未来预测 |
| `ar.axis.time` | 时间序列 |
| `ar.axis.value` | 数值 |

### 线性回归实验公式

<!-- Source: the KaTeX formula in templates/inter-linear.html. -->
<!-- The original widget additionally substitutes live values for SS_res, SS_tot, and R_squared, each formatted to two decimal places. -->

$$
R^2 = 1 - \frac{SS_{\text{res}}}{SS_{\text{tot}}}
$$

<!-- end-appendix -->
