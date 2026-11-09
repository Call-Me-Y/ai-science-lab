<!--
Translation source: chapter 03, Simplified Chinese.
Source: templates/chapter3.html and its original embedded pages and SVG labels.
Translate the chapter title, narration, and UI values; preserve IDs, formulas, and runtime placeholders.
Page headings and resource comments are structural markers, not narration.
Layout padding is omitted; spacing inside source text is represented by ordinary spaces.
The appendices contain embedded UI and illustration copy, not additional lesson pages.
-->

# 第三章：——很弱的五子棋AI

## 1 / 7

<!-- page: ch03.page01; source-slide: slide1 -->

<!-- text: ch03.page01.p01 -->

你们已经知道这章要讲什么啦——不过别急——

<!-- text: ch03.page01.p02 -->

让我们先来玩个游戏吧！

<!-- end-page -->

## 2 / 7

<!-- page: ch03.page02; source-slide: slide2 -->

<!-- text: ch03.page02.p01 -->

五子棋都会玩的吧？就是比谁先连成五个子，横竖撇捺4个方向都算数。我先下黑棋，你下白的，嘿嘿~

<!-- module: gomoku-play; source-iframe: /inter-chess1 -->

<!-- end-page -->

## 3 / 7

<!-- page: ch03.page03; source-slide: slide3 -->

<!-- text: ch03.page03.p01 -->

知道我是怎么下棋的吗？我会检查棋盘所有空格，并计算在这个位置下棋能跟黑棋连成多少个“五子””四子“”三子““二子”的阵型，以及阵型的开头和末尾是否还能下棋。按照阵型和数量进行打分。

<!-- text: ch03.page03.p02 -->

然后我还会检查如果是白棋在这里下会打几分。最后把两种得分按照一定比例加起来，减去离中心的距离乘以权重（使得越远的格子分越低），就得到了每个空格的分数。

<!-- text: ch03.page03.p03 -->

而我会尽量选得分高的空格下棋。你可以现在再跟我下一盘，我告诉你我眼中这些空格都有多少分。

<!-- module: gomoku-scores; source-iframe: /inter-chess2 -->

<!-- end-page -->

## 4 / 7

<!-- page: ch03.page04; source-slide: slide4 -->

<!-- text: ch03.page04.p01 -->

刚刚那种简单的原理其实就是计算机视觉的基础。而如果我们对刚刚那种简单的原理进行升级，使其能识别基础的图形并进行组合，就可以实现很强大的机器视觉了！

<!-- text: ch03.page04.p02 -->

你试试在这里写0~9的数字，看我能不能认出来！

<!-- module: handwritten-digit-recognition; source-iframe: /inter-digital -->

<!-- end-page -->

## 5 / 7

<!-- page: ch03.page05; source-slide: slide5 -->

<!-- text: ch03.page05.p01 -->

进行这种数字识别，也是遍历整个画布来找图案，不过这里的图案要远比五子棋中的复杂。我们需要更加强大的模型！我们需要卷积神经网络！！！！！

<!-- end-page -->

## 6 / 7

<!-- page: ch03.page06; source-slide: slide6 -->

<!-- text: ch03.page06.p01 -->

所谓神经网络，就是计算得到新的值然后再代入其他计算，最终算出来个结果。这些函数就是神经元，排成一列的平行神经元形成层级结构。

<!-- text: ch03.page06.p02 -->

所有的神经网络都有输入和输出层，中间所有其他的层都叫隐藏层。

<!-- text: ch03.page06.p03 -->

这么讲听起来还是有点不直观，来你看下面这个网络，其实就跟$2\times(3\times(5+0)+7\times(5+0+1))=114$是一样的结构。每一次输出都可以理解为“打分”，而乘以的数则是“权重”。

<!-- illustration: svg/net.svg -->

<!-- end-page -->

## 7 / 7

<!-- page: ch03.page07; source-slide: slide7 -->

<!-- text: ch03.page07.p01 -->

不同神经网络之间的区别也就是里面的层级和神经元数量不同，以及进行的计算不同罢了。

<!-- text: ch03.page07.p02 -->

卷积神经网络的特点在于有卷积层（以及通常会有池化层，并经过多组卷积层+池化层）。

<!-- text: ch03.page07.p03 -->

不过再怎么复杂，也是一样的“打分”和“加权”的思想。

<!-- text: ch03.page07.p04 -->

下一章我们将逐个介绍卷积神经网络的神经网络层~

<!-- illustration: svg/CNN.svg -->

<!-- end-page -->

<!-- appendix: embedded-module-copy; not part of the lesson pages -->

## 交互模块文案

<!-- documentTitle entries are original iframe document titles, not added panel headings. -->
<!-- Values in braces are runtime placeholders. Preserve their names and braces. -->

| ID | 中文原文 |
| --- | --- |
| `gomoku.documentTitle` | 五子棋 |
| `gomoku.playerWin` | 玩家胜利! |
| `gomoku.aiWin` | AI胜利! |
| `gomoku.draw` | 平局! |
| `gomoku.nextGame` | 下一局 |
| `mnist.documentTitle` | MNIST手写识别 |
| `mnist.clear` | 清除 |
| `mnist.recognize` | 识别 |
| `mnist.result` | 识别结果：{digit} (置信度：{confidence}%) |
| `svg.unsupported` | 您的浏览器不支持SVG动画 |

## SVG 插图文案

<!-- Each row preserves a source SVG text element; line breaks use <br>. Numeric-only labels are language independent. -->

| ID | 中文原文 |
| --- | --- |
| `svg.net.text01` | 输入<br>5 |
| `svg.net.text02` | 输入<br>0 |
| `svg.net.text03` | 输入<br>1 |
| `svg.net.text04` | 计算<br>×3 |
| `svg.net.text05` | 计算<br>×7 |
| `svg.net.text06` | 计算<br>×2 |
| `svg.net.text07` | 输出<br>114 |
| `svg.net.text08` | 输入层 |
| `svg.net.text09` | 隐藏层<br>1 |
| `svg.net.text10` | 隐藏层<br>2 |
| `svg.net.text11` | 输出层 |
| `svg.CNN.text01` | 输出层 |
| `svg.CNN.text02` | 展平层 |
| `svg.CNN.text03` | 池化层 |
| `svg.CNN.text04` | 输入层 |
| `svg.CNN.text05` | 卷积层 |

<!-- end-appendix -->
