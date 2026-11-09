<script setup lang="ts">
import { computed, getCurrentInstance, ref } from 'vue'
import { renderCopy } from '../../lib/copy'
const props = defineProps<{ locale: 'zh' | 'en'; copy: Record<string, string> }>()
const emit = defineEmits<{ complete: [] }>()
const original = [[8,20],[18,30],[28,25],[38,46],[48,33],[58,60],[68,50],[78,83],[88,54],[96,90]]
const points = ref(original.map(([x,y]) => ({x,y})))
const chart = ref<SVGSVGElement | null>(null)
const active = ref<number | null>(null)
const interacted = ref(false)
const clipId = `regression-${getCurrentInstance()?.uid ?? 0}`
const words = computed(() => props.locale === 'zh' ? { drag:'拖动数据点，观察拟合直线和残差。', reset:'重置数据', goal:'目标', done:'已达到目标', point:'数据点', line:'拟合直线', residual:'残差' } : { drag:'Drag the points to explore the fitted line and residuals.', reset:'Reset data', goal:'Target', done:'Target reached', point:'Data point', line:'Fitted line', residual:'Residual' })
const stats = computed(() => {
  const n=points.value.length, mx=points.value.reduce((s,p)=>s+p.x,0)/n, my=points.value.reduce((s,p)=>s+p.y,0)/n
  const variance=points.value.reduce((s,p)=>s+(p.x-mx)**2,0)
  const b=variance>1e-10?points.value.reduce((s,p)=>s+(p.x-mx)*(p.y-my),0)/variance:0
  const a=my-b*mx
  const residual=points.value.reduce((s,p)=>s+(p.y-(b*p.x+a))**2,0)
  const total=points.value.reduce((s,p)=>s+(p.y-my)**2,0)
  return {a,b,residual,total,r2:total>1e-10&&variance>1e-10?1-residual/total:null}
})
const sx=(x:number)=>56+x*6.42
const sy=(y:number)=>354-y*3.08
const passed=computed(()=>interacted.value&&stats.value.r2!==null&&stats.value.r2>0.9)
function notify(){interacted.value=true;if(passed.value)emit('complete')}
function start(i:number,event:PointerEvent){active.value=i;chart.value?.setPointerCapture(event.pointerId);event.preventDefault()}
function move(event:PointerEvent){
  if(active.value===null||!chart.value)return
  const matrix=chart.value.getScreenCTM();if(!matrix)return
  const cursor=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse())
  points.value[active.value]={x:Math.max(1,Math.min(99,(cursor.x-56)/6.42)),y:Math.max(1,Math.min(99,(354-cursor.y)/3.08))}
  notify()
}
function end(){active.value=null}
function keyMove(index:number,event:KeyboardEvent){
  const delta:Record<string,[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,1],ArrowDown:[0,-1]}
  if(!delta[event.key])return;event.preventDefault();const [dx,dy]=delta[event.key];const p=points.value[index]
  points.value[index]={x:Math.max(1,Math.min(99,p.x+dx)),y:Math.max(1,Math.min(99,p.y+dy))};notify()
}
function reset(){points.value=original.map(([x,y])=>({x,y}));interacted.value=false}
</script>

<template>
<section class="lab regression-lab">
  <div class="lab-toolbar"><span class="lab-hint">{{ words.drag }}</span><button type="button" @click="reset">{{ words.reset }}</button></div>
  <svg ref="chart" class="scatterplot" viewBox="0 0 760 410" role="group" :aria-label="renderCopy(copy,'linear.documentTitle').replace(/<[^>]+>/g,'')" @pointermove="move" @pointerup="end" @pointercancel="end" @lostpointercapture="end">
    <defs><clipPath :id="clipId"><rect x="56" y="46" width="642" height="308" /></clipPath></defs>
    <g class="grid"><template v-for="tick in [0,20,40,60,80,100]" :key="tick"><path :d="`M ${sx(tick)} 46 V 354 M 56 ${sy(tick)} H 698`"/><text :x="sx(tick)" y="376" text-anchor="middle">{{tick}}</text><text x="43" :y="sy(tick)+4" text-anchor="end">{{tick}}</text></template></g>
    <path d="M 56 46 V 354 H 698" class="axes"/><text x="713" y="359" class="axis-name">x</text><text x="51" y="31" class="axis-name">y</text>
    <g :clip-path="`url(#${clipId})`"><line v-for="(point,i) in points" :key="`r${i}`" :x1="sx(point.x)" :x2="sx(point.x)" :y1="sy(point.y)" :y2="sy(stats.b*point.x+stats.a)" class="residual"/><line :x1="sx(0)" :y1="sy(stats.a)" :x2="sx(100)" :y2="sy(stats.b*100+stats.a)" class="fit"/></g>
    <g v-for="(point,i) in points" :key="i"><circle class="point-hit" :cx="sx(point.x)" :cy="sy(point.y)" r="18" tabindex="0" role="slider" :aria-label="`${words.point} ${i+1}`" :aria-valuemin="0" :aria-valuemax="100" :aria-valuenow="point.y" :aria-valuetext="`x: ${point.x.toFixed(1)}, y: ${point.y.toFixed(1)}`" @pointerdown="start(i,$event)" @keydown="keyMove(i,$event)"/><circle :cx="sx(point.x)" :cy="sy(point.y)" :r="active===i?8:6" class="point"/></g>
  </svg>
  <div class="score-strip" :class="{passed}"><div><span>R²</span><strong>{{ stats.r2===null?'—':stats.r2.toFixed(3) }}</strong></div><span class="target">{{passed?words.done:`${words.goal}: R² > 0.9`}}</span></div>
  <div class="equation">R² = 1 − SS<sub>res</sub> / SS<sub>tot</sub> = 1 − {{stats.residual.toFixed(2)}} / {{stats.total.toFixed(2)}}</div>
  <div class="equation">y = {{stats.b.toFixed(3)}}x {{stats.a<0?'−':'+'}} {{Math.abs(stats.a).toFixed(3)}}</div>
  <div class="plot-key"><span class="line-key"></span>{{words.line}}<span class="residual-key"></span>{{words.residual}}</div>
</section>
</template>

<style scoped>
.scatterplot{display:block;width:100%;max-height:48vh;touch-action:none;user-select:none}.grid path{fill:none;stroke:#e9e9e9;stroke-width:1}.grid text{fill:#929292;font-size:12px;font-family:monospace}.axes{fill:none;stroke:#858585;stroke-width:1.2}.axis-name{fill:#666;font-family:serif;font-style:italic}.residual{stroke:#999;stroke-dasharray:4 5;stroke-width:1.3}.fit{stroke:#d14343;stroke-width:2.5}.point{fill:#202323;stroke:white;stroke-width:2;pointer-events:none}.point-hit{fill:transparent;cursor:grab;outline:none}.point-hit:focus{stroke:#15916a;stroke-width:2}.point-hit:active{cursor:grabbing}.score-strip{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border:1px solid #dedede;border-radius:12px;background:#f7f7f5;gap:14px}.score-strip>div{display:flex;gap:14px;align-items:baseline}.score-strip strong{font:600 31px/1 monospace}.score-strip.passed{border-color:#15916a;background:#f0f8f3}.score-strip.passed strong{color:#12734f}.target{font-size:13px}.equation{text-align:center;margin-top:10px;font:13px/1.5 monospace;color:#727272;overflow-wrap:anywhere}.plot-key{display:flex;justify-content:center;align-items:center;gap:8px;color:#777;font-size:11px;margin-top:12px}.line-key{width:20px;border-top:2px solid #d14343}.residual-key{width:20px;border-top:2px dashed #999;margin-left:16px}@media(orientation:portrait){.scatterplot{max-height:none}.score-strip{padding:12px}.score-strip strong{font-size:27px}}
</style>
