<script setup lang="ts">
import {computed,ref,watch} from 'vue'
import {renderCopy} from '../../lib/copy'
import {functions2D,MAX_LEARNING_RATE,evaluate,derivative} from '../../lib/gradient-functions.mjs'
import {usePlotGesture} from '../../lib/usePlotGesture'
import {useDescentRun} from '../../lib/useDescentRun'
import PlotToolbar from './PlotToolbar.vue'
import './gradient-lab.css'
const props=defineProps<{locale:'zh'|'en',copy:Record<string,string>}>()
const emit=defineEmits<{complete:[]}>()
const selected=ref(functions2D[0].id)
const objective=computed(()=>functions2D.find(item=>item.id===selected.value)!)
const eta=ref(objective.value.rate),iterations=ref(objective.value.iterations),initialX=ref(objective.value.initial[0]),initialY=ref(objective.value.initial[1])
const plot=usePlotGesture('orbit'),{svg}=plot
const run=useDescentRun(()=>objective.value,()=>emit('complete'))
const ui=(key:string,params:Record<string,string|number>={})=>renderCopy(props.copy,key,params)
const words=computed(()=>props.locale==='zh'?{choose:'目标函数',iterations:'迭代次数',origin:'初始位置',result:'当前函数值',ready:'调整参数，寻找当前曲面的最低点。',done:'已到达一个全局最小值附近',progress:'正在优化…',again:'尚未收敛到全局最低点，可调整参数或增加迭代次数。',paused:'动画已暂停，请重新开始优化。',diverged:'本次迭代发散，请减小学习率或调整初始位置。',stationary:'已接近局部驻点，试着改变初始位置。',minimum:'全局最低点',steps:'迭代步数',plot:'三维曲面，拖动旋转、滚轮或双指缩放'}:{choose:'Objective function',iterations:'Iterations',origin:'Initial position',result:'Current function value',ready:'Adjust the parameters to find the bottom of this surface.',done:'Reached a global minimum region',progress:'Optimizing…',again:'Not at a global minimum yet. Adjust the parameters or add iterations.',paused:'Animation paused. Start again to finish.',diverged:'This run diverged. Reduce the learning rate or change the starting point.',stationary:'Near a local stationary point. Try a different starting point.',minimum:'Global minima',steps:'Steps',plot:'3D surface; drag to rotate, scroll or pinch to zoom'})
const formula=computed(()=>renderCopy({formula:`$f(x,y)=${objective.value.formula}$`},'formula'))
const mesh=computed(()=>{
  const [a,b]=objective.value.domain,lines:{position:number[],value:number}[][]=[]
  for(let i=0;i<=24;i++){
    const fixed=a+(b-a)*i/24
    for(const swap of [false,true])lines.push(Array.from({length:49},(_,j)=>{
      const t=a+(b-a)*j/48,position=swap?[t,fixed]:[fixed,t]
      return {position,value:evaluate(objective.value,position)}
    }))
  }
  return lines
})
const floor=computed(()=>Math.min(...objective.value.minima.map(point=>evaluate(objective.value,point))))
const ceiling=computed(()=>Math.max(...mesh.value.flat().map(point=>point.value)))
function project(x:number,y:number,z:number){
  const [a,b]=objective.value.domain,middle=(a+b)/2,half=(b-a)/2
  const xx=(x-middle)/half,yy=(y-middle)/half,zz=(z-floor.value)/Math.max(.001,ceiling.value-floor.value)*1.5
  const horizontal=xx*Math.cos(plot.yaw.value)-yy*Math.sin(plot.yaw.value)
  const depth=xx*Math.sin(plot.yaw.value)+yy*Math.cos(plot.yaw.value)
  return {x:380+horizontal*150*plot.zoom.value+plot.offsetX.value,y:285+(depth*Math.sin(plot.pitch.value)-zz*Math.cos(plot.pitch.value))*150*plot.zoom.value+plot.offsetY.value}
}
const line=(values:{position:number[],value:number}[])=>values.map((value,i)=>{const point=project(value.position[0],value.position[1],value.value);return `${i?'L':'M'} ${point.x} ${point.y}`}).join(' ')
const grid=computed(()=>mesh.value.map(line))
const trail=computed(()=>line(run.shown.value))
const last=computed(()=>run.last.value??{position:[initialX.value,initialY.value],value:objective.value.f(initialX.value,initialY.value)})
const ball=computed(()=>project(last.value.position[0],last.value.position[1],last.value.value))
const shadow=computed(()=>project(last.value.position[0],last.value.position[1],floor.value))
const axes=computed(()=>{
  const [a,b]=objective.value.domain,origin=project(a,a,floor.value)
  return [{name:'x',end:project(b+.3,a,floor.value)},{name:'y',end:project(a,b+.3,floor.value)},{name:'f(x,y)',end:project(a,a,ceiling.value)}].map(axis=>({...axis,path:`M ${origin.x} ${origin.y} L ${axis.end.x} ${axis.end.y}`}))
})
const base=computed(()=>{const [a,b]=objective.value.domain;return line([[a,a],[a,b],[b,b],[b,a],[a,a]].map(position=>({position,value:floor.value})))})
const message=computed(()=>{
  if(run.running.value)return words.value.progress
  if(run.interrupted.value)return words.value.paused
  if(run.success.value)return words.value.done
  if(run.result.value?.status==='diverged')return words.value.diverged
  if(!run.result.value)return words.value.ready
  if(Math.hypot(...derivative(objective.value,last.value.position))<.03)return words.value.stationary
  return words.value.again
})
const compact=(value:number)=>Math.abs(value)<1e-7?'0':Number(value.toPrecision(4)).toString()
function defaults(){run.clear();eta.value=objective.value.rate;iterations.value=objective.value.iterations;[initialX.value,initialY.value]=objective.value.initial}
watch(selected,()=>{defaults();plot.reset()})
watch([eta,iterations,initialX,initialY],()=>run.clear())
function start(){run.start([initialX.value,initialY.value],eta.value,iterations.value)}
</script>
<template><section class="lab gradient-experiment">
  <div class="objective-select"><div class="objective-choices"><span>{{words.choose}}</span><div class="function-buttons" role="group" :aria-label="words.choose"><button v-for="item in functions2D" :key="item.id" type="button" :data-function="item.id" :aria-pressed="selected===item.id" :class="{active:selected===item.id}" @click="selected=item.id">{{item.name[locale]}}</button></div></div></div>
  <div class="function" v-html="formula"></div><p class="description">{{objective.description[locale]}}</p>
  <PlotToolbar :locale="locale" :zoom="plot.zoom.value" orbit @zoom-in="plot.scale(1.25)" @zoom-out="plot.scale(.8)" @reset="plot.reset"/>
  <svg ref="svg" viewBox="0 0 760 460" role="img" :aria-label="words.plot" class="surface" @pointerdown="plot.down" @pointermove="plot.move" @pointerup="plot.end" @pointercancel="plot.end" @lostpointercapture="plot.end" @wheel.prevent="plot.wheel">
    <path :d="base" fill="#f1f4ed" opacity=".8"/>
    <g class="wireframe"><path v-for="(path,index) in grid" :key="index" :d="path" :class="{major:index%8===0}"/></g>
    <g class="surface-axes"><path v-for="axis in axes" :key="axis.name" :d="axis.path"/></g><text v-for="axis in axes" :key="axis.name" :x="axis.end.x+7" :y="axis.end.y" class="axis-name">{{axis.name}}</text>
    <path :d="trail" class="trail"/><circle v-for="(point,index) in run.shown.value" :key="index" :cx="project(point.position[0],point.position[1],point.value).x" :cy="project(point.position[0],point.position[1],point.value).y" r="2.2" class="step"/>
    <line :x1="ball.x" :y1="ball.y" :x2="shadow.x" :y2="shadow.y" class="drop"/>
    <circle v-for="(point,index) in objective.minima" :key="`minimum-${index}`" :cx="project(point[0],point[1],objective.f(...point)).x" :cy="project(point[0],point[1],objective.f(...point)).y" r="5" class="minimum"/><circle :cx="ball.x" :cy="ball.y" r="7" class="ball"/>
  </svg>
  <p class="minimum-caption"><span class="minimum-key"></span>{{words.minimum}}: {{objective.minima.map(point=>`(${point.map(compact).join(', ')})`).join(' / ')}}</p>
  <div class="controls"><label><span v-html="ui('gradientSurface.learningRate',{learningRate:eta.toFixed(3)})"></span><input v-model.number="eta" type="range" min="0.001" :max="MAX_LEARNING_RATE" step="0.001"/></label><label><span>{{words.iterations}}: {{iterations}}</span><input v-model.number="iterations" type="range" min="10" max="600" step="10"/></label></div>
  <div class="initial-caption">{{words.origin}}: ({{initialX.toFixed(1)}}, {{initialY.toFixed(1)}})</div><div class="controls"><label><span>x₀ = {{initialX.toFixed(1)}}</span><input v-model.number="initialX" type="range" :min="objective.domain[0]" :max="objective.domain[1]" step="0.1"/></label><label><span>y₀ = {{initialY.toFixed(1)}}</span><input v-model.number="initialY" type="range" :min="objective.domain[0]" :max="objective.domain[1]" step="0.1"/></label></div>
  <div class="lab-toolbar actions"><button type="button" class="primary" :disabled="run.running.value" @click="start" v-html="ui('gradientSurface.start')"></button><button type="button" @click="defaults()">{{locale==='zh'?'重置参数':'Reset parameters'}}</button></div>
  <div class="lab-result result surface-result" :class="{success:run.success.value}" aria-live="polite"><strong>{{words.result}}: {{compact(last.value)}}</strong><div class="values"><span>(x, y) = ({{last.position.map(compact).join(', ')}})</span><span>{{words.steps}}: {{Math.max(0,run.shown.value.length-1)}}</span></div><span>{{message}}</span></div>
</section></template>
