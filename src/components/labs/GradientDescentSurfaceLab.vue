<script setup lang="ts">
import {computed,onBeforeUnmount,onDeactivated,ref} from 'vue'
import {renderCopy} from '../../lib/copy'
const props=defineProps<{locale:'zh'|'en';copy:Record<string,string>}>()
const emit=defineEmits<{complete:[]}>()
const eta=ref(0.1),iterations=ref(80),initialX=ref(2.6),initialY=ref(-2),visible=ref(0),running=ref(false)
const points=ref<{x:number;y:number;z:number}[]>([])
let frame=0
const ui=(key:string,params:Record<string,string|number>={})=>renderCopy(props.copy,key,params)
const f=(x:number,y:number)=>x*x+2*y*y
const project=(x:number,y:number,z:number)=>({x:380+(x-y)*52,y:355+(x+y)*20-z*7})
const line=(values:{x:number;y:number;z:number}[])=>values.map((v,i)=>{const p=project(v.x,v.y,v.z);return `${i?'L':'M'} ${p.x} ${p.y}`}).join(' ')
const grid=Array.from({length:25},(_,i)=>{
 const fixed=-3+i/4
 return [line(Array.from({length:61},(_,j)=>{const t=-3+j/10;return {x:fixed,y:t,z:f(fixed,t)}})),line(Array.from({length:61},(_,j)=>{const t=-3+j/10;return {x:t,y:fixed,z:f(t,fixed)}}))]
}).flat()
const shown=computed(()=>points.value.slice(0,visible.value))
const trail=computed(()=>line(shown.value))
const last=computed(()=>shown.value.at(-1)??{x:initialX.value,y:initialY.value,z:f(initialX.value,initialY.value)})
const ball=computed(()=>project(last.value.x,last.value.y,last.value.z))
const success=computed(()=>points.value.length>0&&last.value.z<0.01&&!running.value)
const extra=computed(()=>props.locale==='zh'?{iterations:'迭代次数',origin:'初始位置',result:'当前函数值',ready:'调整初始位置，寻找曲面的最低点。',done:'已到达最低点附近',progress:'正在优化…',again:'可继续调整参数，观察收敛情况。'}:{iterations:'Iterations',origin:'Initial position',result:'Current function value',ready:'Choose a starting position and find the bottom of the surface.',done:'Reached the minimum region',progress:'Optimizing…',again:'Adjust the parameters to explore convergence.'})
function start(){
 cancelAnimationFrame(frame);let x=initialX.value,y=initialY.value;const path=[{x,y,z:f(x,y)}]
 for(let i=0;i<iterations.value;i++){x-=eta.value*2*x;y-=eta.value*4*y;path.push({x,y,z:f(x,y)});if(f(x,y)<1e-9)break}
 points.value=path;visible.value=1;running.value=true;let beginning=0
 const step=(time:number)=>{if(!beginning)beginning=time;visible.value=Math.min(path.length,1+Math.floor((time-beginning)/1500*(path.length-1)));if(visible.value<path.length)frame=requestAnimationFrame(step);else{running.value=false;if(success.value)emit('complete')}}
 frame=requestAnimationFrame(step)
}
function stopAnimation(){cancelAnimationFrame(frame);running.value=false}
onDeactivated(stopAnimation)
onBeforeUnmount(stopAnimation)
</script>

<template>
<section class="lab surface-lab">
  <div class="function">f(x, y) = x² + 2y²</div>
  <svg viewBox="0 0 760 460" role="img" :aria-label="locale==='zh'?'三维曲面及梯度下降路径':'Three-dimensional surface and gradient descent path'" class="surface">
    <path d="M 68 355 L 380 235 L 692 355 L 380 475 Z" fill="#fafaf7" opacity=".55"/>
    <g class="wireframe"><path v-for="(path,index) in grid" :key="index" :d="path" :class="{'major':index%8===0}"/></g>
    <g class="axes"><path :d="`M 380 355 L ${project(3.7,0,0).x} ${project(3.7,0,0).y}`"/><path :d="`M 380 355 L ${project(0,3.7,0).x} ${project(0,3.7,0).y}`"/><path d="M 380 355 V 35"/></g>
    <text :x="project(3.85,0,0).x" :y="project(3.85,0,0).y" class="axis-name">x</text><text :x="project(0,3.85,0).x" :y="project(0,3.85,0).y" class="axis-name">y</text><text x="390" y="34" class="axis-name">f(x, y)</text>
    <path :d="trail" class="trail"/><circle v-for="(point,index) in shown" :key="index" :cx="project(point.x,point.y,point.z).x" :cy="project(point.x,point.y,point.z).y" r="2.3" class="path-point"/>
    <line :x1="ball.x" :x2="project(last.x,last.y,0).x" :y1="ball.y" :y2="project(last.x,last.y,0).y" class="drop"/>
    <circle cx="380" cy="355" r="5" class="minimum"/><circle :cx="ball.x" :cy="ball.y" r="8" class="ball"/>
  </svg>
  <div class="controls"><label><span v-html="ui('gradientSurface.learningRate',{learningRate:eta.toFixed(2)})"></span><input v-model.number="eta" type="range" min="0.01" max="0.5" step="0.01"/></label><label><span>{{extra.iterations}}: {{iterations}}</span><input v-model.number="iterations" type="range" min="10" max="200" step="10"/></label></div>
  <div class="initial-caption" v-html="ui('gradientSurface.initialValues',{iterations:`(${initialX.toFixed(1)}, ${initialY.toFixed(1)})`})"></div>
  <div class="controls initial"><label><span>x₀ = {{initialX.toFixed(1)}}</span><input v-model.number="initialX" type="range" min="-3" max="3" step="0.1"/></label><label><span>y₀ = {{initialY.toFixed(1)}}</span><input v-model.number="initialY" type="range" min="-3" max="3" step="0.1"/></label></div>
  <div class="lab-toolbar actions"><button type="button" class="primary" :disabled="running" @click="start" v-html="ui('gradientSurface.start')"></button></div>
  <div class="lab-result result" :class="{success}"><strong>{{extra.result}}: {{last.z.toFixed(5)}}</strong><span>{{running?extra.progress:success?extra.done:points.length?extra.again:extra.ready}}</span></div>
</section>
</template>

<style scoped>
.function{text-align:center;font:italic 22px/1.5 Georgia,serif}.surface{display:block;width:100%;max-height:42vh;margin:0 auto}.wireframe path{fill:none;stroke:#c9cfca;stroke-width:.8;opacity:.8}.wireframe path.major{stroke:#8c9c91;stroke-width:1}.axes path{stroke:#aaa;stroke-width:1;fill:none;stroke-dasharray:4 4}.axis-name{font:italic 14px Georgia,serif;fill:#777}.trail{fill:none;stroke:#d04a48;stroke-width:3;stroke-linejoin:round}.path-point{fill:#d04a48;opacity:.7}.ball{fill:#d04a48;stroke:#fff;stroke-width:2.5}.minimum{fill:#197f57;stroke:white;stroke-width:2}.drop{stroke:#d04a48;stroke-dasharray:3 5;opacity:.5}.controls{display:grid;grid-template-columns:1fr 1fr;gap:24px}.controls label{display:flex;flex-direction:column;gap:9px;font-size:12px;font-variant-numeric:tabular-nums}.controls input{width:100%;accent-color:#197c57}.initial-caption{margin-top:14px;color:#777;font-size:11px}.initial{margin-top:9px}.initial label{font-size:11px}.actions{justify-content:center;margin-top:16px}.primary{background:#1b7654!important;border-color:#1b7654!important;color:white!important}.result{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px 16px;border:1px solid #deded8;background:#f6f7f3;padding:13px 16px;border-radius:12px;font-size:12px;line-height:1.5;margin-top:14px}.result span{color:#777}.result.success{background:#eef8f1;border-color:#15845a}.result.success span{color:#13734f}@media(orientation:portrait){.surface{max-height:none}.function{font-size:20px}.controls{gap:14px}}
</style>
