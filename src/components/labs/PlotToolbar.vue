<script setup lang="ts">
defineProps<{locale:'zh'|'en',zoom:number,orbit?:boolean}>()
defineEmits<{zoomIn:[],zoomOut:[],reset:[]}>()
</script>
<template><div class="plot-toolbar"><div class="plot-buttons"><button type="button" :disabled="zoom>=6" :aria-label="locale==='zh'?'放大图表':'Zoom in'" @click="$emit('zoomIn')">＋</button><span>{{Math.round(zoom*100)}}%</span><button type="button" :disabled="zoom<=.5" :aria-label="locale==='zh'?'缩小图表':'Zoom out'" @click="$emit('zoomOut')">−</button><button type="button" @click="$emit('reset')">{{locale==='zh'?'重置视图':'Reset view'}}</button></div><small>{{locale==='zh'?(orbit?'拖动旋转 · 滚轮 / 双指缩放 · Shift 拖动平移':'拖动平移 · 滚轮 / 双指缩放'):(orbit?'Drag to rotate · Scroll / pinch to zoom · Shift-drag to pan':'Drag to pan · Scroll / pinch to zoom')}}</small></div></template>
