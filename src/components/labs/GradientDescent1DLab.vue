<script setup lang="ts">
import { computed, getCurrentInstance, ref, watch } from 'vue'
import { renderCopy } from '../../lib/copy'
import { functions1D, MAX_LEARNING_RATE, derivative, evaluate } from '../../lib/gradient-functions.mjs'
import { usePlotGesture } from '../../lib/usePlotGesture'
import { useDescentRun } from '../../lib/useDescentRun'
import PlotToolbar from './PlotToolbar.vue'
import './gradient-lab.css'
const props=defineProps<{locale:'zh'|'en',copy:Record<string,string>}>()
const emit=defineEmits<{complete:[]}>()
const selected=ref(functions1D[0].id)
const objective=computed(()=>functions1D.find(item=>item.id===selected.value)!)
const eta=ref(objective.value.rate),iterations=ref(objective.value.iterations),initialX=ref(objective.value.initial[0])
const plot=usePlotGesture('pan'),{svg}=plot
const run=useDescentRun(()=>objective.value,()=>emit('complete'))
const ui=(key:string,params:Record<string,string|number>={})=>renderCopy(props.copy,key,params)
const extra=computed(()=>props.locale==='zh'?{choose:'目标函数',minimum:'全局最低点',paused:'动画已暂停，请重新开始优化。',diverged:'本次迭代发散，请减小学习率或改变初始位置。',stationary:'已接近局部驻点，但尚未到达全局最低点。',steps:'迭代步数',plot:'函数图像，可拖动平移与缩放'}:{choose:'Objective function',minimum:'Global minimum',paused:'Animation paused. Start again to finish.',diverged:'This run diverged. Lower the learning rate or change the starting position.',stationary:'Near a local stationary point, but not the global minimum.',steps:'Steps',plot:'Function plot; drag to pan and zoom'})
const formula=computed(()=>renderCopy({formula:`$f(x)=${objective.value.formula}$`},'formula'))
const clipId=`gradient1d-${getCurrentInstance()?.uid??0}`
const yRange=computed(()=>{
  const [a,b]=objective.value.domain,values=Array.from({length:181},(_,i)=>objective.value.f(a+(b-a)*i/180))
  const low=Math.min(...values),high=Math.max(...values),pad=Math.max(.2,(high-low)*.08)
  return [low-pad,high+pad]
})
const sx=(x:number)=>380+(58+(x-objective.value.domain[0])/(objective.value.domain[1]-objective.value.domain[0])*636-380)*plot.zoom.value+plot.offsetX.value
const sy=(y:number)=>205+(332-(y-yRange.value[0])/(yRange.value[1]-yRange.value[0])*284-205)*plot.zoom.value+plot.offsetY.value
const inverseX=(x:number)=>objective.value.domain[0]+((x-380-plot.offsetX.value)/plot.zoom.value+380-58)/636*(objective.value.domain[1]-objective.value.domain[0])
const inverseY=(y:number)=>yRange.value[0]+(332-((y-205-plot.offsetY.value)/plot.zoom.value+205))/284*(yRange.value[1]-yRange.value[0])
const xTicks=computed(()=>Array.from({length:7},(_,i)=>inverseX(58+i*106)))
const yTicks=computed(()=>Array.from({length:6},(_,i)=>inverseY(332-i*56.8)))
const compact=(value:number)=>Math.abs(value)<1e-9?'0':Number(value.toPrecision(3)).toString()
const curve=computed(()=>Array.from({length:361},(_,i)=>{const x=inverseX(58+i*636/360);return `${i?'L':'M'} ${sx(x)} ${sy(objective.value.f(x))}`}).join(' '))
const trail=computed(()=>run.shown.value.map((point,i)=>`${i?'L':'M'} ${sx(point.position[0])} ${sy(point.value)}`).join(' '))
const last=computed(()=>run.last.value??{position:[initialX.value],value:objective.value.f(initialX.value)})
const comparison=computed(()=>{
  if(run.interrupted.value)return extra.value.paused
  if(run.success.value)return ui('gradient1d.globalMinimum',{minimumValue:evaluate(objective.value,objective.value.minima[0]).toFixed(2)})
  if(run.result.value?.status==='diverged')return extra.value.diverged
  if(Math.hypot(...derivative(objective.value,last.value.position))<.03)return extra.value.stationary
  return ui('gradient1d.notConverged')
})
function defaults(){run.clear();eta.value=objective.value.rate;iterations.value=objective.value.iterations;initialX.value=objective.value.initial[0]}
watch(selected,()=>{defaults();plot.reset()})
watch([eta,iterations,initialX],()=>run.clear())
function start(){run.start([initialX.value],eta.value,iterations.value)}
</script>
<template><section class="lab gradient-experiment">
  <div class="objective-select"><div class="objective-choices"><span>{{extra.choose}}</span><div class="function-buttons" role="group" :aria-label="extra.choose"><button v-for="item in functions1D" :key="item.id" type="button" :data-function="item.id" :aria-pressed="selected===item.id" :class="{active:selected===item.id}" @click="selected=item.id">{{item.name[locale]}}</button></div></div></div>
  <div class="function" v-html="formula"></div><p class="description">{{objective.description[locale]}}</p>
  <div class="parameters"><label><span v-html="ui('gradient1d.learningRate',{learningRate:eta.toFixed(3)})"></span><input v-model.number="eta" type="range" min="0.001" :max="MAX_LEARNING_RATE" step="0.001"/></label><label><span v-html="ui('gradient1d.iterations',{iterations})"></span><input v-model.number="iterations" type="range" min="10" max="600" step="10"/></label><label><span v-html="ui('gradient1d.initialPosition',{initialX:initialX.toFixed(1)})"></span><input v-model.number="initialX" type="range" :min="objective.domain[0]" :max="objective.domain[1]" step="0.1"/></label></div>
  <div class="lab-toolbar actions"><button type="button" class="primary" :disabled="run.running.value" @click="start" v-html="ui('gradient1d.start')"></button><button type="button" @click="defaults()" v-html="ui('gradient1d.reset')"></button></div>
  <PlotToolbar :locale="locale" :zoom="plot.zoom.value" @zoom-in="plot.scale(1.25)" @zoom-out="plot.scale(.8)" @reset="plot.reset"/>
  <svg ref="svg" viewBox="0 0 760 380" role="img" :aria-label="extra.plot" class="plot" @pointerdown="plot.down" @pointermove="plot.move" @pointerup="plot.end" @pointercancel="plot.end" @lostpointercapture="plot.end" @wheel.prevent="plot.wheel">
    <defs><clipPath :id="clipId"><rect x="58" y="38" width="636" height="294"/></clipPath></defs>
    <g class="grid"><template v-for="(x,i) in xTicks" :key="i"><line :x1="sx(x)" :x2="sx(x)" y1="38" y2="332"/><text :x="sx(x)" y="354" text-anchor="middle">{{compact(x)}}</text></template><template v-for="(y,i) in yTicks" :key="i"><line x1="58" x2="694" :y1="sy(y)" :y2="sy(y)"/><text x="47" :y="sy(y)+4" text-anchor="end">{{compact(y)}}</text></template></g>
    <path d="M 58 38 V 332 H 694" class="axes"/>
    <g :clip-path="`url(#${clipId})`"><path :d="curve" class="curve"/><path :d="trail" class="trail"/><circle v-for="(point,i) in run.shown.value" :key="i" :cx="sx(point.position[0])" :cy="sy(point.value)" r="2.5" class="step"/><circle v-for="(point,i) in objective.minima" :key="`minimum-${i}`" :cx="sx(point[0])" :cy="sy(objective.f(point[0]))" r="5" class="minimum"/><circle :cx="sx(last.position[0])" :cy="sy(last.value)" r="7" class="ball"/></g>
    <text x="707" y="335" class="axis-name">x</text><text x="35" y="25" class="axis-name">f(x)</text>
  </svg>
  <p class="minimum-caption"><span class="minimum-key"></span>{{extra.minimum}}: x = {{objective.minima.map(point=>compact(point[0])).join(', ')}}</p>
  <div class="lab-result result" :class="{success:run.success.value}" aria-live="polite"><strong v-html="ui('gradient1d.resultTitle')"></strong><p v-if="!run.result.value" v-html="ui('gradient1d.resultEmpty')"></p><template v-else><div class="values"><span v-html="ui('gradient1d.finalPosition',{finalX:compact(last.position[0])})"></span><span v-html="ui('gradient1d.finalValue',{finalValue:compact(last.value)})"></span><span>{{extra.steps}}: {{Math.max(0,run.shown.value.length-1)}}</span></div><p v-if="!run.running.value" v-html="comparison"></p><p v-else>{{locale==='zh'?'正在计算下降轨迹…':'Tracing gradient descent…'}}</p></template></div>
</section></template>
