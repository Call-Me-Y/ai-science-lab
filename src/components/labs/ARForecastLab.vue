<script setup lang="ts">
import { computed, ref } from 'vue'
import { renderCopy } from '../../lib/copy'
const props=defineProps<{locale:'zh'|'en';copy:Record<string,string>}>()
const emit=defineEmits<{complete:[]}>()
const p=ref(0.5),q=ref(0.5)
const historical=[4,5,4.3,5.57,4.603,6.2237,4.90123,6.97832,5.18364]
const fitted=computed(()=>historical.map((value,i)=>i<2?value:p.value*historical[i-1]+q.value*historical[i-2]))
const prediction=computed(()=>p.value*historical[8]+q.value*historical[7])
const r2=computed(()=>{const actual=historical.slice(2),mean=actual.reduce((s,v)=>s+v,0)/actual.length,total=actual.reduce((s,v)=>s+(v-mean)**2,0);return 1-actual.reduce((s,v,i)=>s+(v-fitted.value[i+2])**2,0)/total})
const ui=(key:string,params:Record<string,string|number>={})=>renderCopy(props.copy,key,params)
const limits=computed(()=>{const values=[...historical,...fitted.value,prediction.value];const min=Math.floor(Math.min(...values,0)),max=Math.ceil(Math.max(...values,1));return {min,max}})
const sx=(x:number)=>56+(x-1)*71.33
const sy=(y:number)=>332-(y-limits.value.min)/(limits.value.max-limits.value.min)*284
const path=(data:number[])=>data.map((v,i)=>`${i?'L':'M'} ${sx(i+1)} ${sy(v)}`).join(' ')
function changed(){emit('complete')}
</script>

<template>
<section class="lab ar-lab">
  <div class="parameter-grid"><label><span v-html="ui('ar.parameter.p')"></span><output>{{p.toFixed(2)}}</output><input v-model.number="p" type="range" min="-0.5" max="1.5" step="0.01" @input="changed"/></label><label><span v-html="ui('ar.parameter.q')"></span><output>{{q.toFixed(2)}}</output><input v-model.number="q" type="range" min="-0.5" max="1.5" step="0.01" @input="changed"/></label></div>
  <svg viewBox="0 0 760 397" role="img" :aria-label="locale==='zh'?'AR模型历史数据与预测图':'AR historical and predicted values'" class="forecast">
    <g class="grid"><template v-for="i in [0,1,2,3,4]" :key="i"><line x1="56" x2="698" :y1="48+i*71" :y2="48+i*71"/><text x="44" :y="52+i*71" text-anchor="end">{{(limits.max-(limits.max-limits.min)*i/4).toFixed(1)}}</text></template><text v-for="x in 10" :key="x" :x="sx(x)" y="355" text-anchor="middle">{{x}}</text></g>
    <path d="M 56 48 V 332 H 698" class="axes"/>
    <path :d="path(historical)" class="history-line"/><path :d="path(fitted)" class="fit-line"/><path :d="`M ${sx(9)} ${sy(fitted[8])} L ${sx(10)} ${sy(prediction)}`" class="future-line"/>
    <circle v-for="(v,i) in historical" :key="i" :cx="sx(i+1)" :cy="sy(v)" r="5" class="history-point"/>
    <circle :cx="sx(10)" :cy="sy(prediction)" r="7" class="future-point"/>
    <text x="375" y="385" text-anchor="middle" class="axis-name" v-html="ui('ar.axis.time')"></text>
    <text transform="translate(14 190) rotate(-90)" text-anchor="middle" class="axis-name" v-html="ui('ar.axis.value')"></text>
  </svg>
  <div class="legend"><span><i class="history"></i><span v-html="ui('ar.series.history')"></span></span><span><i class="fitted"></i><span v-html="ui('ar.series.fitted')"></span></span><span><i class="future"></i><span v-html="ui('ar.series.future')"></span></span></div>
  <div class="results"><p v-html="ui('ar.prediction',{prediction:prediction.toFixed(4)})"></p><p v-html="ui('ar.fit',{rSquared:r2.toFixed(4)})"></p></div>
</section>
</template>

<style scoped>
.parameter-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.parameter-grid label{font-size:12px;display:grid;grid-template-columns:1fr auto;align-items:center;gap:12px}.parameter-grid output{font:600 15px monospace}.parameter-grid input{grid-column:1/-1;width:100%;accent-color:#1d7c59}.forecast{display:block;width:100%;max-height:43vh}.grid line{stroke:#e6e6e6}.grid text{fill:#888;font:11px monospace}.axes{stroke:#888;fill:none}.history-line{stroke:#242727;stroke-width:2;fill:none}.fit-line{stroke:#148157;stroke-width:2;fill:none}.future-line{stroke:#d34a47;stroke-width:2;stroke-dasharray:5 4}.history-point{fill:white;stroke:#242727;stroke-width:2}.future-point{fill:#d34a47;stroke:white;stroke-width:2}.axis-name{fill:#999;font:11px sans-serif}.legend{display:flex;flex-wrap:wrap;justify-content:center;gap:18px;color:#676767;font-size:11px}.legend>span{display:flex;align-items:center;gap:6px}.legend i{display:inline-block;width:17px;border-top:2px solid #242727}.legend .fitted{border-color:#148157}.legend .future{border-color:#d34a47;border-top-style:dashed}.results{margin-top:18px;display:grid;grid-template-columns:1fr 1fr;background:#f6f6f3;border:1px solid #e3e3df;border-radius:12px;padding:5px 16px;gap:14px;font-size:13px}.results p{overflow-wrap:anywhere}@media(orientation:portrait){.forecast{max-height:none}.parameter-grid{gap:14px}.results{grid-template-columns:1fr;gap:0}.results p{margin:8px 0}}
</style>
