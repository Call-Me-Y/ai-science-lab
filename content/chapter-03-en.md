<!--
Translation target: chapter 03, English.
Source language: Simplified Chinese.
Source: templates/chapter3.html and its original embedded pages and SVG labels.
Translate the chapter title, narration, and UI values; preserve IDs, formulas, and runtime placeholders.
Page headings and resource comments are structural markers, not narration.
Layout padding is omitted; spacing inside source text is represented by ordinary spaces.
The appendices contain embedded UI and illustration copy, not additional lesson pages.
-->

# Chapter 3: ——A Very Weak Gomoku AI

## 1 / 7

<!-- page: ch03.page01; source-slide: slide1 -->

<!-- text: ch03.page01.p01 -->

You already know what this chapter is about— but hold on—

<!-- text: ch03.page01.p02 -->

Let's play a game first!

<!-- end-page -->

## 2 / 7

<!-- page: ch03.page02; source-slide: slide2 -->

<!-- text: ch03.page02.p01 -->

Everyone knows how to play Gomoku, right? It's a race to connect five stones in a row—horizontal, vertical, and both diagonals count. I'll take black, and you take white, hehe~

<!-- module: gomoku-play; source-iframe: /inter-chess1 -->

<!-- end-page -->

## 3 / 7

<!-- page: ch03.page03; source-slide: slide3 -->

<!-- text: ch03.page03.p01 -->

Want to know how I play? I check every empty square on the board and calculate how many patterns of "five in a row", "four in a row", "three in a row", or "two in a row" a black stone at that square would complete, and whether the pattern can still be extended at either end. Then I score each square based on the patterns and their counts.

<!-- text: ch03.page03.p02 -->

Then I also check what score white would get by playing there. Finally, I add the two scores together in a certain ratio, and subtract the distance from the center multiplied by a weight (so squares farther from the center score lower)—that gives the score for each empty square.

<!-- text: ch03.page03.p03 -->

And I pick the empty square with the highest score. Play another game with me now, and I'll tell you how many points each square is worth in my eyes.

<!-- module: gomoku-scores; source-iframe: /inter-chess2 -->

<!-- end-page -->

## 4 / 7

<!-- page: ch03.page04; source-slide: slide4 -->

<!-- text: ch03.page04.p01 -->

That simple trick just now is actually the foundation of computer vision. And if we upgrade it so it can recognize basic shapes and combine them, we get really powerful machine vision!

<!-- text: ch03.page04.p02 -->

Try writing a digit from 0 to 9 here and see if I can recognize it!

<!-- module: handwritten-digit-recognition; source-iframe: /inter-digital -->

<!-- end-page -->

## 5 / 7

<!-- page: ch03.page05; source-slide: slide5 -->

<!-- text: ch03.page05.p01 -->

This kind of digit recognition also scans the whole canvas looking for patterns, but the patterns here are far more complex than in Gomoku. We need a more powerful model! We need a convolutional neural network!!!!!

<!-- end-page -->

## 6 / 7

<!-- page: ch03.page06; source-slide: slide6 -->

<!-- text: ch03.page06.p01 -->

A so-called neural network just computes new values and feeds them into other computations until a final result comes out. These functions are the neurons, and parallel neurons lined up in a row form layers.

<!-- text: ch03.page06.p02 -->

Every neural network has an input layer and an output layer, and all the layers in between are called hidden layers.

<!-- text: ch03.page06.p03 -->

That still sounds a bit abstract, so look at the network below—it's exactly the same structure as $2\times(3\times(5+0)+7\times(5+0+1))=114$. Every output can be understood as a "score", and the number you multiply by is a "weight".

<!-- illustration: svg/net.svg -->

<!-- end-page -->

## 7 / 7

<!-- page: ch03.page07; source-slide: slide7 -->

<!-- text: ch03.page07.p01 -->

The only difference between neural networks is how many layers and neurons they have and what computations they perform.

<!-- text: ch03.page07.p02 -->

Convolutional neural networks are characterized by having convolutional layers (and usually pooling layers too, going through multiple convolution + pooling layer pairs).

<!-- text: ch03.page07.p03 -->

But no matter how complex it gets, it's still the same idea of "scoring" and "weighting".

<!-- text: ch03.page07.p04 -->

Next chapter, we'll go through the layers of a convolutional neural network one by one~

<!-- illustration: svg/CNN.svg -->

<!-- end-page -->

<!-- appendix: embedded-module-copy; not part of the lesson pages -->

## Interactive Module Copy

<!-- documentTitle entries are original iframe document titles, not added panel headings. -->
<!-- Values in braces are runtime placeholders. Preserve their names and braces. -->

| ID | English translation |
| --- | --- |
| `gomoku.documentTitle` | Gomoku |
| `gomoku.playerWin` | Player wins! |
| `gomoku.aiWin` | AI wins! |
| `gomoku.draw` | Draw! |
| `gomoku.nextGame` | Next game |
| `mnist.documentTitle` | MNIST Handwriting Recognition |
| `mnist.clear` | Clear |
| `mnist.recognize` | Recognize |
| `mnist.result` | Result: {digit} (confidence: {confidence}%) |
| `svg.unsupported` | Your browser does not support SVG animations |

## SVG Illustration Copy

<!-- Each row preserves a source SVG text element; line breaks use <br>. Numeric-only labels are language independent. -->

| ID | English translation |
| --- | --- |
| `svg.net.text01` | Input<br>5 |
| `svg.net.text02` | Input<br>0 |
| `svg.net.text03` | Input<br>1 |
| `svg.net.text04` | Compute<br>×3 |
| `svg.net.text05` | Compute<br>×7 |
| `svg.net.text06` | Compute<br>×2 |
| `svg.net.text07` | Output<br>114 |
| `svg.net.text08` | Input layer |
| `svg.net.text09` | Hidden layer<br>1 |
| `svg.net.text10` | Hidden layer<br>2 |
| `svg.net.text11` | Output layer |
| `svg.CNN.text01` | Output layer |
| `svg.CNN.text02` | Flatten layer |
| `svg.CNN.text03` | Pooling layer |
| `svg.CNN.text04` | Input layer |
| `svg.CNN.text05` | Convolution layer |

<!-- end-appendix -->
