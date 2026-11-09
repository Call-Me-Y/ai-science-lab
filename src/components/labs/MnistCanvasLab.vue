<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { renderCopy } from '../../lib/copy'
import { recognize } from '../../lib/model'
const props = defineProps<{ locale: 'zh'|'en', copy: Record<string,string> }>()
const emit = defineEmits<{ complete: [] }>()
const canvas = ref<HTMLCanvasElement>()
const busy = ref(false), error = ref(''), backend = ref(''), probabilities = ref<number[]>([])
let drawing = false, previous: [number,number] | null = null
const labels = computed(() => props.locale === 'zh' ? { hint:'在画布上写下 0–9', loading:'正在准备本地模型…', empty:'请先写一个数字', retry:'识别暂不可用，请重试', local:'本地推理', result:'各数字的预测概率' } : { hint:'Write a digit from 0 to 9', loading:'Preparing the local model…', empty:'Draw a digit first', retry:'Recognition unavailable. Please retry.', local:'Local inference', result:'Prediction probabilities' })
const digit = computed(() => probabilities.value.indexOf(Math.max(...probabilities.value)))
const result = computed(() => renderCopy(props.copy,'mnist.result',{ digit: digit.value, confidence: (Math.max(...probabilities.value)*100).toFixed(1) }))
function clear() {
  const ctx = canvas.value?.getContext('2d'); if (!ctx) return
  ctx.fillStyle='#000'; ctx.fillRect(0,0,280,280); probabilities.value=[]; error.value=''
}
function point(event:PointerEvent):[number,number] { const box=canvas.value!.getBoundingClientRect(); return [(event.clientX-box.left)*280/box.width,(event.clientY-box.top)*280/box.height] }
function stroke(event:PointerEvent) {
  if (!drawing) return
  const current=point(event),ctx=canvas.value!.getContext('2d')!
  ctx.strokeStyle='#fff';ctx.lineWidth=19;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(...(previous || current));ctx.lineTo(current[0]+.01,current[1]+.01);ctx.stroke();previous=current
}
function down(event:PointerEvent) { if(busy.value)return;drawing=true;previous=null;canvas.value!.setPointerCapture(event.pointerId);probabilities.value=[];error.value='';stroke(event) }
function up() { drawing=false;previous=null }
async function predict() {
  if(busy.value)return
  const small=document.createElement('canvas');small.width=small.height=28
  const ctx=small.getContext('2d')!;ctx.drawImage(canvas.value!,0,0,28,28)
  const bytes=ctx.getImageData(0,0,28,28).data,pixels=new Float32Array(784)
  for(let i=0;i<784;i++) pixels[i]=bytes[i*4]/255
  if(!pixels.some(value=>value>0)){error.value=labels.value.empty;return}
  busy.value=true;error.value=''
  try { const prediction=await recognize(pixels);probabilities.value=prediction.values;backend.value=prediction.backend;emit('complete') } catch(err) { console.error(err);error.value=labels.value.retry } finally { busy.value=false }
}
onMounted(clear)
</script>
<template><section class="lab mnist-lab"><div class="digit-input"><div class="canvas-wrap"><canvas ref="canvas" width="280" height="280" :aria-label="labels.hint" @pointerdown="down" @pointermove="stroke" @pointerup="up" @pointercancel="up" @lostpointercapture="up"></canvas><span v-if="!probabilities.length" class="canvas-hint">{{ labels.hint }}</span></div><div class="lab-toolbar"><button :disabled="busy" @click="clear" v-html="renderCopy(copy,'mnist.clear')"></button><button :disabled="busy" @click="predict" v-html="renderCopy(copy,'mnist.recognize')"></button></div><p class="lab-hint">{{ labels.local }} <span v-if="backend">/ {{ backend.toUpperCase() }}</span></p></div><div class="digit-results" :aria-label="labels.result"><div v-for="i in 10" :key="i" class="probability"><span>{{ i-1 }}</span><div><i :style="{width:`${(probabilities[i-1] || 0)*100}%`}" :class="{winner:digit===i-1}"></i></div><span>{{ probabilities.length ? `${(probabilities[i-1]*100).toFixed(1)}%` : '—' }}</span></div></div><div class="lab-result" aria-live="polite"><span v-if="busy">{{labels.loading}}</span><span v-else-if="error">{{error}}</span><span v-else-if="probabilities.length" v-html="result"></span><span v-else>{{labels.hint}}</span></div></section></template>
<style scoped>.mnist-lab{display:grid;grid-template-columns:minmax(180px,1fr) minmax(120px,1fr);gap:22px}.canvas-wrap{position:relative;max-width:280px;margin:auto}canvas{display:block;width:100%;aspect-ratio:1;border-radius:6px;cursor:crosshair}.canvas-hint{position:absolute;left:0;right:0;bottom:12px;text-align:center;font-size:11px;color:#777;pointer-events:none}.digit-input .lab-toolbar{justify-content:center}.digit-input .lab-hint{text-align:center;margin:0}.digit-results{align-self:center}.probability{display:grid;grid-template-columns:15px 1fr 41px;align-items:center;gap:8px;margin:10px 0;font-size:11px;color:#777}.probability>div{height:7px;background:#f0f2ec;border-radius:4px;overflow:hidden}.probability i{display:block;height:100%;background:#bac2b2;transition:width .3s}.probability i.winner{background:#19834d}.probability>span:last-child{text-align:right;font-size:9px}.lab-result{grid-column:1/-1;margin:0}@media(max-width:500px){.mnist-lab{grid-template-columns:1fr;gap:10px}.canvas-wrap{max-width:245px}.digit-results{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}.probability{margin:5px 0}}</style>
