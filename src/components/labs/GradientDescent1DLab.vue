<script setup lang="ts">
import {computed,getCurrentInstance,onBeforeUnmount,onDeactivated,ref} from 'vue'
import {renderCopy} from '../../lib/copy'
const props=defineProps<{locale:'zh'|'en';copy:Record<string,string>}>()
const emit=defineEmits<{complete:[]}>()
const eta=ref(0.04),iterations=ref(100),initialX=ref(-2),running=ref(false),started=ref(false),visible=ref(0)
const path=ref<{x:number;y:number}[]>([])
let frame=0
const f=(x:number)=>x**4-4*x*x-x+1
const gradient=(x:number)=>4*x**3-8*x-1
const minimum=1.4729976011,leftMinimum=-1.3469974085
const ui=(key:string,params:Record<string,string|number>={})=>renderCopy(props.copy,key,params)
const clipId=`gradient1d-${getCurrentInstance()?.uid??0}`
const sx=(x:number)=>58+(x+3)/6*636
const sy=(y:number)=>332-(y+6)/51*284
const curve=Array.from({length:241},(_,i)=>{const x=-3+i/40;return `${i?'L':'M'} ${sx(x)} ${sy(f(x))}`}).join(' ')
const shown=computed(()=>path.value.slice(0,visible.value))
const trail=computed(()=>shown.value.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)).map((p,i)=>`${i?'L':'M'} ${sx(p.x)} ${sy(p.y)}`).join(' '))
const last=computed(()=>shown.value.at(-1))
const success=computed(()=>!!last.value&&Math.abs(last.value.x-minimum)<0.05&&Math.abs(gradient(last.value.x))<0.1)
const comparison=computed(()=>{if(!last.value)return '';if(success.value)return ui('gradient1d.globalMinimum',{minimumValue:f(minimum).toFixed(2)});if(Math.abs(last.value.x-leftMinimum)<0.05&&Math.abs(gradient(last.value.x))<0.1)return ui('gradient1d.localMinimum',{minimumValue:f(leftMinimum).toFixed(2)});return ui('gradient1d.notConverged')})
function start(){
  cancelAnimationFrame(frame);let x=initialX.value;const points=[{x,y:f(x)}]
  for(let i=0;i<iterations.value;i++){const next=x-eta.value*gradient(x);if(!Number.isFinite(next)||Math.abs(next)>20)break;x=next;points.push({x,y:f(x)});if(Math.abs(gradient(x))<1e-8)break}
  path.value=points;visible.value=1;started.value=true;running.value=true;let began=0
  const step=(time:number)=>{if(!began)began=time;visible.value=Math.min(points.length,1+Math.floor((time-began)/1400*(points.length-1)));if(visible.value<points.length)frame=requestAnimationFrame(step);else{running.value=false;if(success.value)emit('complete')}}
  frame=requestAnimationFrame(step)
}
function reset(){cancelAnimationFrame(frame);running.value=false;started.value=false;path.value=[];visible.value=0;initialX.value=-2;eta.value=0.04;iterations.value=100}
function stopAnimation(){cancelAnimationFrame(frame);running.value=false}
onDeactivated(stopAnimation)
onBeforeUnmount(stopAnimation)
</script>

<template>
<section class="lab gradient-lab">
  <div class="function">f(x) = x⁴ − 4x² − x + 1</div>
  <p class="description" v-html="ui('gradient1d.description')"></p>
  <div class="parameters"><label><span v-html="ui('gradient1d.learningRate',{learningRate:eta.toFixed(2)})"></span><input v-model.number="eta" type="range" min="0.01" max="0.5" step="0.01"/></label><label><span v-html="ui('gradient1d.iterations',{iterations})"></span><input v-model.number="iterations" type="range" min="10" max="500" step="10"/></label><label><span v-html="ui('gradient1d.initialPosition',{initialX:initialX.toFixed(1)})"></span><input v-model.number="initialX" type="range" min="-3" max="3" step="0.1"/></label></div>
  <div class="lab-toolbar actions"><button type="button" class="primary" :disabled="running" @click="start" v-html="ui('gradient1d.start')"></button><button type="button" @click="reset" v-html="ui('gradient1d.reset')"></button></div>
  <svg viewBox="0 0 760 380" role="img" :aria-label="locale==='zh'?'四次函数与梯度下降轨迹':'Quartic function and gradient descent trajectory'" class="plot">
    <defs><clipPath :id="clipId"><rect x="58" y="38" width="636" height="294"/></clipPath></defs>
    <g class="grid"><template v-for="x in [-3,-2,-1,0,1,2,3]" :key="x"><line :x1="sx(x)" :x2="sx(x)" y1="38" y2="332"/><text :x="sx(x)" y="354" text-anchor="middle">{{x}}</text></template><template v-for="y in [0,10,20,30,40]" :key="y"><line x1="58" x2="694" :y1="sy(y)" :y2="sy(y)"/><text x="47" :y="sy(y)+4" text-anchor="end">{{y}}</text></template></g>
    <path :d="`M 58 38 V 332 H 694`" class="axes"/>
    <g :clip-path="`url(#${clipId})`"><path :d="curve" class="curve"/><path :d="trail" class="trail"/><circle v-for="(point,i) in shown" :key="i" :cx="sx(point.x)" :cy="sy(point.y)" r="2.5" class="step"/><circle :cx="sx(last?.x??initialX)" :cy="sy(last?.y??f(initialX))" r="7" class="ball"/></g>
    <circle :cx="sx(minimum)" :cy="sy(f(minimum))" r="4" class="minimum"/>
    <text x="707" y="335" class="axis-name">x</text><text x="35" y="25" class="axis-name">f(x)</text>
  </svg>
  <div class="lab-result result" :class="{success:success&&!running}"><strong v-html="ui('gradient1d.resultTitle')"></strong><p v-if="!started" v-html="ui('gradient1d.resultEmpty')"></p><template v-else-if="last"><div class="values"><span v-html="ui('gradient1d.finalPosition',{finalX:last.x.toFixed(4)})"></span><span v-html="ui('gradient1d.finalValue',{finalValue:last.y.toFixed(4)})"></span></div><p v-if="!running" v-html="comparison"></p><p v-else>{{locale==='zh'?'正在计算下降轨迹…':'Tracing gradient descent…'}}</p></template></div>
</section>
</template>

<style scoped>
.function{text-align:center;font:italic 22px/1.4 Georgia,serif;letter-spacing:.025em}.description{text-align:center;color:#888;font-size:11px;line-height:1.6;margin:7px 0 19px}.parameters{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}.parameters label{display:flex;flex-direction:column;gap:10px;font-size:12px}.parameters input{width:100%;accent-color:#1c805b}.actions{margin:18px 0 0;justify-content:center}.primary{background:#1b7654!important;color:white!important;border-color:#1b7654!important}.plot{width:100%;display:block;max-height:38vh}.grid line{stroke:#e8e8e8}.grid text{font:11px monospace;fill:#969696}.axes{stroke:#888;fill:none}.curve{stroke:#222;fill:none;stroke-width:2.4}.trail{stroke:#d14c49;fill:none;stroke-width:2}.step{fill:#d14c49;opacity:.5}.ball{fill:#d14c49;stroke:white;stroke-width:2}.minimum{fill:#17835c}.axis-name{font:italic 13px Georgia,serif;fill:#777}.result{border:1px solid #e3e3df;background:#f7f7f4;border-radius:12px;padding:13px 16px;font-size:12px;line-height:1.6}.result strong{font-size:12px}.result p{margin:7px 0 0}.result.success{border-color:#19865d;background:#f0f8f3}.result.success p{color:#13764f}.values{display:flex;flex-wrap:wrap;gap:8px 24px;margin-top:7px;font-variant-numeric:tabular-nums}@media(orientation:portrait){.plot{max-height:none}.parameters{gap:12px}.parameters label{font-size:11px}.function{font-size:20px}}
</style>
