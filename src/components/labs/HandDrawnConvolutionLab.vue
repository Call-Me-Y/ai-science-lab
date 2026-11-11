<script setup lang="ts">
import { computed, onDeactivated, onMounted, ref } from 'vue'
import { renderCopy } from '../../lib/copy'
import FiniteNumberInput from './FiniteNumberInput.vue'
import { parseKernel } from '../../lib/numeric-input.mjs'
const props = defineProps<{ locale: 'zh' | 'en'; copy: Record<string, string> }>()
const emit = defineEmits<{ complete: [] }>()
const canvas = ref<HTMLCanvasElement | null>(null)
const kernel = ref<(number|string)[]>([-1,-1,-1,-1,8,-1,-1,-1,-1])
const output = ref<number[] | null>(null)
const ink = ref(false)
const error = ref(false)
const rangeError = ref(false)
const parsedKernel = computed(() => parseKernel(kernel.value))
const numericText = computed(() => props.locale==='zh' ? {invalid:'请完成卷积核数值输入，可使用负数和小数。',overflow:'卷积结果超出数值范围，请减小卷积核数值。'} : {invalid:'Complete all kernel values; negatives and decimals are allowed.',overflow:'The convolution overflowed. Use smaller kernel values.'})
function invalidate() {output.value=null;rangeError.value=false}
let drawing = false
let previous: [number, number] | null = null
const text = computed(() => props.locale === 'zh' ? { input: '手绘输入', kernel: '3 × 3 卷积核', result: '卷积输出', draw: '在这里画图', empty: '画一笔，再点计算', example: '载入示例', blank: '请先在画布上画图。', range: '原始响应范围', after: '参数已更改，请重新计算。', note: '黑色补边，步长为 1。图像显示截断到 0–255，保留原始卷积响应。' } : { input: 'Draw an input', kernel: '3 × 3 kernel', result: 'Convolution output', draw: 'Draw here', empty: 'Draw, then calculate', example: 'Load example', blank: 'Draw on the canvas first.', range: 'Raw response range', after: 'Parameters changed. Calculate again.', note: 'Zero padding, stride 1. Display is clipped to 0–255; raw convolution responses are retained.' })
const ui = (key: string) => renderCopy(props.copy,key)
const extrema = computed(() => output.value ? [Math.min(...output.value), Math.max(...output.value)] : [0,0])
function context() { return canvas.value?.getContext('2d') }
function initialize() { const ctx=context(); if(ctx){ctx.fillStyle='#000';ctx.fillRect(0,0,280,280);ctx.strokeStyle='#fff';ctx.fillStyle='#fff';ctx.lineWidth=18;ctx.lineCap='round';ctx.lineJoin='round'} }
function point(event: PointerEvent): [number,number] { const rect=canvas.value!.getBoundingClientRect();return [(event.clientX-rect.left)*280/rect.width,(event.clientY-rect.top)*280/rect.height] }
function start(event: PointerEvent) { if(event.button!==0 && event.pointerType==='mouse')return;event.preventDefault();canvas.value!.setPointerCapture(event.pointerId);drawing=true;previous=point(event); const ctx=context();if(ctx){ctx.beginPath();ctx.arc(previous[0],previous[1],9,0,Math.PI*2);ctx.fill()}ink.value=true;error.value=false;invalidate() }
function draw(event: PointerEvent) { if(!drawing || !previous)return; const next=point(event),ctx=context();if(ctx){ctx.beginPath();ctx.moveTo(...previous);ctx.lineTo(...next);ctx.stroke()}previous=next }
function stop() { drawing=false;previous=null }
function clear() { stop();initialize();ink.value=false;output.value=null;error.value=false;rangeError.value=false }
function example() { clear();const ctx=context();if(!ctx)return;ctx.beginPath();ctx.moveTo(75,70);ctx.lineTo(210,70);ctx.lineTo(115,222);ctx.stroke();ink.value=true }
function setKernel(values: number[], divisor=1) { kernel.value=values.map(v=>v/divisor);invalidate() }
function compute() {
  if(!parsedKernel.value){invalidate();return}
  if(!ink.value){error.value=true;return}
  const mini=document.createElement('canvas');mini.width=mini.height=28
  const ctx=mini.getContext('2d')!;ctx.drawImage(canvas.value!,0,0,28,28)
  const pixels=ctx.getImageData(0,0,28,28).data
  const input=Array.from({length:784},(_,i)=>pixels[i*4])
  const weights=parsedKernel.value
  const calculated=Array.from({length:784},(_,i)=>{
    const x=i%28,y=Math.floor(i/28);let sum=0
    for(let ky=0;ky<3;ky++)for(let kx=0;kx<3;kx++){
      const cx=x+kx-1,cy=y+ky-1
      if(cx>=0 && cx<28 && cy>=0 && cy<28)sum+=input[cy*28+cx]*weights[ky*3+kx]
    }
    return sum
  })
  if(!calculated.every(Number.isFinite)){rangeError.value=true;output.value=null;return}
  output.value=calculated;rangeError.value=false;error.value=false;emit('complete')
}
function shade(value: number) { const gray=Math.round(Math.min(255,Math.max(0,value)));return `rgb(${gray},${gray},${gray})` }
onDeactivated(stop)
onMounted(initialize)
</script>

<template>
  <section class="lab convolution-lab">
    <div class="processing-grid">
      <div class="image-panel"><div class="panel-heading"><span>{{ text.input }}</span><small>28 × 28</small></div><div class="canvas-wrap"><canvas ref="canvas" width="280" height="280" :aria-label="text.input" @pointerdown="start" @pointermove="draw" @pointerup="stop" @pointercancel="stop" @lostpointercapture="stop"></canvas><span v-if="!ink" class="canvas-placeholder">{{ text.draw }}<span>✎</span></span></div></div>
      <div class="kernel-panel"><div class="panel-heading">{{ text.kernel }}</div><div class="kernel-grid"><FiniteNumberInput v-for="(_,i) in kernel" :key="i" v-model="kernel[i]" :locale="locale" :label="`${text.kernel} ${Math.floor(i/3)+1}, ${i%3+1}`" @update:model-value="invalidate" /></div><div class="presets"><button type="button" @click="setKernel([-1,0,1,-2,0,2,-1,0,1])" v-html="ui('convolution.sobelVertical')"></button><button type="button" @click="setKernel([-1,-2,-1,0,0,0,1,2,1])" v-html="ui('convolution.sobelHorizontal')"></button><button type="button" @click="setKernel([1,2,1,2,4,2,1,2,1],16)" v-html="ui('convolution.gaussianBlur')"></button><button type="button" @click="setKernel([0,-1,0,-1,5,-1,0,-1,0])" v-html="ui('convolution.sharpen')"></button></div></div>
      <div class="image-panel"><div class="panel-heading"><span>{{ text.result }}</span><small>28 × 28</small></div><div class="output-wrap"><svg v-if="output" viewBox="0 0 28 28" role="img" :aria-label="text.result" shape-rendering="crispEdges"><rect v-for="(value,i) in output" :key="i" :x="i%28" :y="Math.floor(i/28)" width="1" height="1" :fill="shade(value)" /></svg><div v-else class="empty-output">{{ text.empty }}</div></div></div>
    </div>
    <div class="lab-toolbar"><button class="compute-button" type="button" :disabled="!parsedKernel" @click="compute" v-html="ui('convolution.compute')"></button><button type="button" @click="clear" v-html="ui('convolution.clear')"></button><button type="button" @click="example">{{ text.example }}</button></div>
    <p v-if="!parsedKernel" class="input-error" role="status">{{numericText.invalid}}</p>
    <p v-if="rangeError" class="input-error" role="status">{{numericText.overflow}}</p>
    <p v-if="error" class="input-error" role="status">{{ text.blank }}</p>
    <p v-if="output" class="lab-result">{{ text.range }} <strong>{{ extrema[0].toFixed(1) }} → {{ extrema[1].toFixed(1) }}</strong></p>
    <p class="lab-hint">{{ text.note }}</p>
  </section>
</template>

<style scoped>
.processing-grid{display:grid;grid-template-columns:minmax(130px,1fr) minmax(145px,.85fr) minmax(130px,1fr);gap:18px;align-items:start}.panel-heading{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;font-weight:650;min-height:32px;color:#404541}.panel-heading small{font-size:10px;font-weight:400;color:#8b918c}.canvas-wrap,.output-wrap{position:relative;aspect-ratio:1;border-radius:7px;overflow:hidden;border:1px solid #303531;background:#050706}.canvas-wrap canvas{display:block;width:100%;height:100%;touch-action:none;cursor:crosshair}.canvas-placeholder{pointer-events:none;position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;font-size:13px;color:#8c9790}.canvas-placeholder span{font-size:30px;font-weight:300;color:#b1c0b6}.kernel-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px;padding:10px 0}.kernel-grid input{min-width:0;width:100%;box-sizing:border-box;padding:9px 0;text-align:center;border:1px solid #d8ddd8;border-radius:4px;background:#fafbf9;font-size:12px;font-variant-numeric:tabular-nums}.presets{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:7px}.presets button{font-size:10px;padding:7px 3px;white-space:normal;min-height:32px}.output-wrap svg{width:100%;height:100%;display:block}.empty-output{height:100%;display:grid;place-items:center;text-align:center;color:#77847c;font-size:12px;padding:15px;box-sizing:border-box}.lab-toolbar{margin-top:18px;display:flex;flex-wrap:wrap;gap:7px}.compute-button{background:#1d7950!important;border-color:#1d7950!important;color:white!important}.input-error{font-size:13px;color:#a43c35}.lab-result{font-variant-numeric:tabular-nums;font-size:12px}.lab-result strong{margin-left:10px}@media(max-width:640px){.processing-grid{grid-template-columns:1fr 1fr;gap:14px}.kernel-panel{grid-row:2;grid-column:1/-1;display:grid;grid-template-columns:1fr 1.4fr;gap:0 16px;align-items:center}.kernel-panel>.panel-heading{grid-column:1/-1}.kernel-grid{padding:2px 0}.presets{margin:0}.presets button{font-size:11px}.panel-heading{font-size:11px}.panel-heading small{font-size:9px}}@media(orientation:landscape) and (max-height:650px){.processing-grid{gap:12px}.panel-heading{min-height:26px}.kernel-grid input{padding:5px 0}.lab-toolbar{margin-top:10px}}
</style>
