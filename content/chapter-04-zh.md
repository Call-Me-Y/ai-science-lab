<!--
Translation source: chapter 04, Simplified Chinese.
Source: templates/chapter4.html and its original embedded pages and SVG labels.
Translate the chapter title, narration, and UI values; preserve IDs, formulas, and runtime placeholders.
Page headings and resource comments are structural markers, not narration.
Layout padding is omitted; spacing inside source text is represented by ordinary spaces.
The appendices contain embedded UI and illustration copy, not additional lesson pages.
-->

# 第四章：——AI服用了6000张图片，这是它发生的变化

## 1 / 16

<!-- page: ch04.page01; source-slide: slide1 -->

<!-- text: ch04.page01.p01 -->

本章的内容是卷积神经网络！

<!-- text: ch04.page01.p02 -->

本章的内容是超细致的卷积神经网络讲解！

<!-- text: ch04.page01.p03 -->

本章的内容是卷积神经网络的输入输出层卷积层池化层全连接层！

<!-- text: ch04.page01.p04 -->

欢迎来到本章！

<!-- end-page -->

## 2 / 16

<!-- page: ch04.page02; source-slide: slide2 -->

<!-- text: ch04.page02.p01 -->

在先前的手写数字识别中，我们得到了一张黑底白字的手写数字图像。

<!-- text: ch04.page02.p02 -->

接下来我们会把这张图片变成$28\times28$像素，然后我们就得到了$28\times28$个排列成方阵的亮度数字，所有数字介于0~255。把这个方阵喂给计算机，这就完成输入啦！

<!-- illustration: svg/digital.svg -->

<!-- end-page -->

## 3 / 16

<!-- page: ch04.page03; source-slide: slide3 -->

<!-- text: ch04.page03.p01 -->

好简单啊……输入层……

<!-- text: ch04.page03.p02 -->

那么接下来登场的是第一层卷积层！！！

<!-- end-page -->

## 4 / 16

<!-- page: ch04.page04; source-slide: slide3.5 -->

<!-- text: ch04.page04.p01 -->

我们准备了一些九宫格排列的数字，这些是卷积核。知道为什么叫卷积吗，因为这个东西的运作原理就是两个九宫格对应的数字两两相乘再全部加起来！

<!-- text: ch04.page04.p02 -->

两两计算出积，再卷起来！卷成原来的$\frac{1}{9}$大小！（有时卷积核是$5\times5$大小，我们这个是$3\times3$大小）

<!-- illustration: svg/conv1.svg -->

<!-- end-page -->

## 5 / 16

<!-- page: ch04.page05; source-slide: slide4 -->

<!-- text: ch04.page05.p01 -->

卷积的两个九宫格，一个是我们预先准备的这些卷积核，另一个来自于输入的方阵！

<!-- text: ch04.page05.p02 -->

输入的方阵大小是$28\times28$，怎么变成$3\times3$呢？

<!-- text: ch04.page05.p03 -->

我们把$28\times28$个格子全部遍历一遍，每个格子加上周围的8个格子就是一个九宫格（周围没有格子时用黑色空格填补），这样就有了$28\times28$个九宫格！

<!-- illustration: svg/digital-animated.svg -->

<!-- end-page -->

## 6 / 16

<!-- page: ch04.page06; source-slide: slide5 -->

<!-- text: ch04.page06.p01 -->

材料齐全了！$28\times28$个九宫格，每一个都和卷积核进行卷积运算，得到$28\times28$个结果，又可以拼成一个$28\times28$的新方阵。

<!-- illustration: svg/output.svg -->

<!-- end-page -->

## 7 / 16

<!-- page: ch04.page07; source-slide: slide5.5 -->

<!-- text: ch04.page07.p01 -->

这样的计算有什么作用呢？

<!-- text: ch04.page07.p02 -->

在卷积神经网络中，输出的值反映的是对应位置对于特定图案的得分。

<!-- text: ch04.page07.p03 -->

例如检测竖线的卷积核计算结果是竖线的得分，经过这个卷积核的计算,有竖线的位置会得分高，生成的图片颜色亮。

<!-- text: ch04.page07.p04 -->

除了进行图像识别以外，卷积还有很多其他效果！比如当我们用高斯函数来计算卷积核……

<!-- text: ch04.page07.p05 -->

……等等……高斯？……难道……这就是“高斯模糊”？！

<!-- text: ch04.page07.p06 -->

对啦！

<!-- end-page -->

## 8 / 16

<!-- page: ch04.page08; source-slide: slide6 -->

<!-- text: ch04.page08.p01 -->

在这里画图，再选择不同的卷积核来看看效果吧！（默认的是轮廓检测）

<!-- text: ch04.page08.p02 -->

也可以自己写哦！！

<!-- module: hand-drawn-convolution; source-iframe: /inter-diy -->

<!-- end-page -->

## 9 / 16

<!-- page: ch04.page09; source-slide: slide7 -->

<!-- text: ch04.page09.p01 -->

很好！我们已经得到了卷积计算后的输出图像，接下来为了节省计算量，我们可以对数据进行压缩。

<!-- text: ch04.page09.p02 -->

我们把得到的$28\times28$方阵，切割成$14\times14$个$2\times2$小方块。每个方块中都只留下那些最大的结果，因为只有这些数据是有用的，这就是最大池化层啦！

<!-- text: ch04.page09.p03 -->

方阵变成$14\times14$了！

<!-- illustration: svg/pooled.svg -->

<!-- end-page -->

## 10 / 16

<!-- page: ch04.page10; source-slide: slide8 -->

<!-- text: ch04.page10.p01 -->

因为有很多不同的局部图像需要识别，所以一个图像要经过很多不同卷积的计算，对于识别手写数字，我们一般在第一层卷积层选32个不同的卷积核。

<!-- text: ch04.page10.p02 -->

这些小的卷积核通过组合，可以形成更复杂的图像，比如靠上的上下边缘和靠右的左右边缘形成数字“7”。

<!-- text: ch04.page10.p03 -->

接下来我们要制作第二层卷积核来识别图像的排列组合了！

<!-- illustration: svg/conv3.svg -->

<!-- end-page -->

## 11 / 16

<!-- page: ch04.page11; source-slide: slide9 -->

<!-- text: ch04.page11.p01 -->

第二层卷积核，一个卷积核要有多个平行的九宫格组成，每个九宫格接收不同的图像和位置，然后就能识别复杂的图像组合了。

<!-- text: ch04.page11.p02 -->

图像组合比图像更多，我们这里选择用64个新卷积核，每个卷积核包含32个九宫格，32个九宫格对应32个$14\times14$图像。最后得到的64个$14\times14$图像再次池化，变成64个$7\times7$的图像。

<!-- end-page -->

## 12 / 16

<!-- page: ch04.page12; source-slide: slide9.5 -->

<!-- text: ch04.page12.p01 -->

值得一提的是，多个平行的九宫格组成的卷积核——或者说多通道的卷积核还可以检测不同颜色的图像，R，G，B三个通道对应着不同的矩阵。

<!-- text: ch04.page12.p02 -->

你可以在这里试试多个卷积核的计算效果！

<!-- module: multi-kernel-convolution; source-iframe: /inter-diy3 -->

<!-- end-page -->

## 13 / 16

<!-- page: ch04.page13; source-slide: slide10 -->

<!-- text: ch04.page13.p01 -->

最终，我们把它们全部展开，得到$64\times7\times7=3136$个数值，反映了各个位置特定图形的得分。由这3136个数值通过一定的比例，或者说按权重进行相加。

<!-- text: ch04.page13.p02 -->

例如横线数值大说明绝对不可能是1，那横线到1的权重会为负数。而如果有横线且横线在画布下半部分，那么是2的可能性就增加，这里的权重是正数。我们将反映各个位置特定图形的得分乘以对应权重得到0~9这10个结果的打分。

<!-- text: ch04.page13.p03 -->

这10个打分有正数也有负数，为了得到最终10个数字可能性的结果，因为可能性都是正数且和为1，我们对得分进行指数运算并计算占比。最终选择数值最大的结果输出。

<!-- illustration: svg/net-end.svg -->

<!-- end-page -->

## 14 / 16

<!-- page: ch04.page14; source-slide: slide11 -->

<!-- text: ch04.page14.p01 -->

那问题来了，这里面总共有$32\times3\times3+64\times32\times3\times3+3136\times10=50080$个参数，包括每个卷积核里面的数字，还有最终加权的权重。这些数字怎么算呢？

<!-- text: ch04.page14.p02 -->

·

<!-- text: ch04.page14.p03 -->

·

<!-- text: ch04.page14.p04 -->

·

<!-- text: ch04.page14.p05 -->

梯 度 下 降 ！

<!-- end-page -->

## 15 / 16

<!-- page: ch04.page15; source-slide: slide12 -->

<!-- text: ch04.page15.p01 -->

我们已经了解到梯度下降要有初始值，所以我们在最开始可以对这些参数进行随机均匀的初始化。

<!-- text: ch04.page15.p02 -->

然后，给AI喂上6000张标有对应数字的手写图片（这里用到的是mnist数据集），将这6000张中拿出4000张重复用随机出来的模型进行预测。

<!-- text: ch04.page15.p03 -->

再通过与标签比对用损失函数（对应的是AR和线性回归中的残差平方和，但我们这里因为是分类问题所以用的交叉熵）计算误差大小，然后靠梯度下降法调整参数。

<!-- text: ch04.page15.p04 -->

这4000张用完之后，我们再用剩下的2000张图片进行预测，就能得到模型的准确度了。至此模型训练完成，可以使用了。

<!-- end-page -->

## 16 / 16

<!-- page: ch04.page16; source-slide: slide13 -->

<!-- text: ch04.page16.p01 -->

以上便是最经典的，预测mnist手写数字数据集的卷积神经网络。

<!-- text: ch04.page16.p02 -->

不论是现在随处可见的文字识别、物品识别、人脸识别，还是新兴的智能驾驶等都以此为基础。

<!-- text: ch04.page16.p03 -->

就此，本次导览到此结束。然而，我们刚刚介绍到的不过是千万繁星中寥寥数颗……

<!-- text: ch04.page16.p04 -->

——请开始你自己的探索吧！

<!-- end-page -->

<!-- appendix: embedded-module-copy; not part of the lesson pages -->

## 交互模块文案

<!-- documentTitle entries are original iframe document titles, not added panel headings. -->
<!-- Values in braces are runtime placeholders. Preserve their names and braces. -->

| ID | 中文原文 |
| --- | --- |
| `convolution.documentTitle` | 手绘卷积处理器 |
| `convolution.compute` | 计算 |
| `convolution.clear` | 清除 |
| `convolution.sobelVertical` | Sobel竖 |
| `convolution.sobelHorizontal` | Sobel横 |
| `convolution.gaussianBlur` | 高斯模糊 |
| `convolution.sharpen` | 锐化 |
| `multiKernel.documentTitle` | 多层卷积处理器 |
| `multiKernel.kernel1` | 卷积核1 |
| `multiKernel.kernel2` | 卷积核2 |
| `multiKernel.kernel3` | 卷积核3 |
| `multiKernel.compute` | 计算 |
| `multiKernel.clear` | 清除 |
| `svg.unsupported` | 您的浏览器不支持SVG动画 |

<!-- end-appendix -->
