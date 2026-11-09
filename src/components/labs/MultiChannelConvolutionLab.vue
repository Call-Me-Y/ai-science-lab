<script setup lang="ts">
import { computed, onDeactivated, onMounted, ref } from 'vue'
import { renderCopy } from '../../lib/copy'
const props=defineProps<{locale:'zh'|'en';copy:Record<string,string>}>()
const emit=defineEmits<{complete:[]}>()
const canvas=ref<HTMLCanvasElement|null>(null)
const kernels=ref([[-1,0,1,-2,0,2,-1,0,1],[-1,-2,-1,0,0,0,1,2,1],[0,-1,0,-1,5,-1,0,-1,0]])
const color=ref('#ffffff')
const ink=ref(false)
const error=ref(false)
const responses=ref<number[][]|null>(null)
const pooled=ref<number[]|null>(null)
let drawing=false
let previous:[number,number]|null=null
const text=computed(()=>props.locale==='zh'?{input:'RGB 手绘输入',draw:'在这里画图',result:'合并响应 → 最大池化',kernel:'卷积核',channel:'通道',example:'载入彩色示例',blank:'请先在画布上画图。',empty:'画一笔，再点计算',note:'R、G、B 三个通道各自卷积，响应相加后经过 ReLU，再进行 2 × 2 最大池化。',range:'池化结果范围',colors:['白色','红色','绿色','蓝色']}:{input:'RGB drawing',draw:'Draw here',result:'Summed response → max pooling',kernel:'Kernel',channel:'channel',example:'Load color example',blank:'Draw on the canvas first.',empty:'Draw, then calculate',note:'Convolve R, G and B separately, sum the responses, apply ReLU, then perform 2 × 2 max pooling.',range:'Pooled response range',colors:['White','Red','Green','Blue']})
const palette=['#ffffff','#ed5d55','#55bd79','#5e91ee']
const channels=['R','G','B']
const ui=(key:string)=>renderCopy(props.copy,key)
const extrema=computed(()=>pooled.value?[Math.min(...pooled.value),Math.max(...pooled.value)]:[0,0])
function ctx(){return canvas.value?.getContext('2d')}
function initialize(){const c=ctx();if(c){c.fillStyle='#000';c.fillRect(0,0,280,280);c.lineWidth=18;c.lineCap='round';c.lineJoin='round'}}
function invalidate(){responses.value=null;pooled.value=null}
function position(e:PointerEvent):[number,number]{const rect=canvas.value!.getBoundingClientRect();return[(e.clientX-rect.left)*280/rect.width,(e.clientY-rect.top)*280/rect.height]}
function start(e:PointerEvent){if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();canvas.value!.setPointerCapture(e.pointerId);drawing=true;previous=position(e);const c=ctx();if(c){c.fillStyle=color.value;c.strokeStyle=color.value;c.beginPath();c.arc(previous[0],previous[1],9,0,Math.PI*2);c.fill()}ink.value=true;error.value=false;invalidate()}
function draw(e:PointerEvent){if(!drawing||!previous)return;const next=position(e),c=ctx();if(c){c.beginPath();c.moveTo(...previous);c.lineTo(...next);c.stroke()}previous=next}
function stop(){drawing=false;previous=null}
function clear(){stop();initialize();ink.value=false;error.value=false;invalidate()}
function example(){clear();const c=ctx();if(!c)return;const strokes=[{color:palette[1],a:[70,45],b:[70,235]},{color:palette[2],a:[45,140],b:[235,140]},{color:palette[3],a:[100,55],b:[230,225]}];for(const s of strokes){c.strokeStyle=s.color;c.beginPath();c.moveTo(s.a[0],s.a[1]);c.lineTo(s.b[0],s.b[1]);c.stroke()}ink.value=true}
function convolve(input:number[],kernel:number[]){return Array.from({length:784},(_,i)=>{const x=i%28,y=Math.floor(i/28);let sum=0;for(let ky=0;ky<3;ky++)for(let kx=0;kx<3;kx++){const xx=x+kx-1,yy=y+ky-1;if(xx>=0&&xx<28&&yy>=0&&yy<28)sum+=input[yy*28+xx]*(Number(kernel[ky*3+kx])||0)}return sum})}
function compute(){
  if(!ink.value){error.value=true;return}
  const mini=document.createElement('canvas');mini.width=mini.height=28
  const c=mini.getContext('2d')!;c.drawImage(canvas.value!,0,0,28,28)
  const image=c.getImageData(0,0,28,28).data
  const planes=channels.map((_,channel)=>Array.from({length:784},(_,i)=>image[i*4+channel]))
  const features=planes.map((plane,i)=>convolve(plane,kernels.value[i]))
  const combined=Array.from({length:784},(_,i)=>Math.max(0,features[0][i]+features[1][i]+features[2][i]))
  responses.value=features
  pooled.value=Array.from({length:196},(_,i)=>{const x=(i%14)*2,y=Math.floor(i/14)*2;return Math.max(combined[y*28+x],combined[y*28+x+1],combined[(y+1)*28+x],combined[(y+1)*28+x+1])})
  error.value=false;emit('complete')
}
function shade(value:number){const n=Math.round(Math.min(255,Math.max(0,value)));return `rgb(${n},${n},${n})`}
onDeactivated(stop)
onMounted(initialize)
</script>

<template>
  <section class="lab multi-convolution-lab">
    <div class="image-grid">
      <div class="image-panel"><div class="panel-heading"><span>{{text.input}}</span><small>28 × 28</small></div><div class="image-box"><canvas ref="canvas" width="280" height="280" :aria-label="text.input" @pointerdown="start" @pointermove="draw" @pointerup="stop" @pointercancel="stop" @lostpointercapture="stop"></canvas><span v-if="!ink" class="drawing-placeholder">{{text.draw}}<span>✎</span></span></div><div class="palette" role="group" :aria-label="locale==='zh'?'画笔颜色':'Brush color'"><button v-for="(value,i) in palette" :key="value" type="button" :style="{background:value}" :class="{chosen:color===value}" :aria-label="text.colors[i]" :aria-pressed="color===value" @click="color=value"></button></div></div>
      <div class="image-panel"><div class="panel-heading"><span>{{text.result}}</span><small>14 × 14</small></div><div class="image-box"><svg v-if="pooled" viewBox="0 0 14 14" role="img" :aria-label="text.result" shape-rendering="crispEdges"><rect v-for="(value,i) in pooled" :key="i" :x="i%14" :y="Math.floor(i/14)" width="1" height="1" :fill="shade(value)"/></svg><div v-else class="empty-output">{{text.empty}}</div></div></div>
    </div>
    <div class="kernel-panels"><div v-for="(kernel,k) in kernels" :key="k" class="kernel-panel"><div class="kernel-heading"><span v-html="ui(`multiKernel.kernel${k+1}`)"></span><span class="channel-badge" :class="`channel-${k}`">{{channels[k]}}</span></div><div class="kernel-grid"><input v-for="(_,i) in kernel" :key="i" v-model.number="kernels[k][i]" type="number" step="any" :aria-label="`${text.kernel} ${k+1}, ${Math.floor(i/3)+1}, ${i%3+1}`" @input="invalidate"/></div><svg v-if="responses" class="feature-map" viewBox="0 0 28 28" role="img" :aria-label="`${channels[k]} ${text.channel}`" shape-rendering="crispEdges"><rect v-for="(value,i) in responses[k]" :key="i" :x="i%28" :y="Math.floor(i/28)" width="1" height="1" :fill="shade(value)"/></svg></div></div>
    <div class="lab-toolbar"><button type="button" class="compute-button" @click="compute" v-html="ui('multiKernel.compute')"></button><button type="button" @click="clear" v-html="ui('multiKernel.clear')"></button><button type="button" @click="example">{{text.example}}</button></div>
    <p v-if="error" class="input-error" role="status">{{text.blank}}</p>
    <p v-if="pooled" class="lab-result">{{text.range}} <strong>{{extrema[0].toFixed(1)}} → {{extrema[1].toFixed(1)}}</strong></p>
    <p class="lab-hint">{{text.note}}</p>
  </section>
</template>

<style scoped>
.image-grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;max-width:590px;margin:auto}.panel-heading{display:flex;justify-content:space-between;align-items:center;gap:8px;min-height:32px;font-size:12px;font-weight:650;color:#404541}.panel-heading small{white-space:nowrap;font-size:10px;font-weight:400;color:#8b918c}.image-box{position:relative;aspect-ratio:1;overflow:hidden;background:#050706;border:1px solid #303531;border-radius:7px}.image-box canvas,.image-box svg{display:block;width:100%;height:100%}.image-box canvas{touch-action:none;cursor:crosshair}.drawing-placeholder{pointer-events:none;position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;font-size:13px;color:#8c9790}.drawing-placeholder span{font-size:30px;color:#b1c0b6}.empty-output{height:100%;display:grid;place-items:center;color:#77847c;text-align:center;font-size:12px;padding:15px;box-sizing:border-box}.palette{display:flex;gap:8px;margin-top:10px}.palette button{width:23px;height:23px;min-height:0;border:1px solid #888;border-radius:50%;padding:0;box-shadow:inset 0 0 0 2px #fff;outline-offset:3px}.palette button.chosen{outline:1px solid #222}.kernel-panels{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin-top:19px}.kernel-panel{min-width:0}.kernel-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;font-size:12px;color:#555;font-weight:600}.channel-badge{display:inline-grid;place-items:center;width:19px;height:19px;border-radius:3px;font-size:10px;font-weight:700}.channel-0{color:#a13a32;background:#f8e7e5}.channel-1{color:#28704b;background:#e5f1e8}.channel-2{color:#496a8e;background:#e9eef5}.kernel-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px}.kernel-grid input{min-width:0;width:100%;box-sizing:border-box;padding:7px 0;text-align:center;border:1px solid #d8ddd8;border-radius:4px;background:#fafbf9;font-size:12px;font-variant-numeric:tabular-nums}.feature-map{display:block;width:100%;max-height:110px;background:#000;border:1px solid #ccd0cb;margin-top:10px;border-radius:3px}.lab-toolbar{display:flex;flex-wrap:wrap;gap:7px;margin-top:18px}.compute-button{background:#1d7950!important;border-color:#1d7950!important;color:white!important}.input-error{color:#a43c35;font-size:13px}.lab-result{font-size:12px;font-variant-numeric:tabular-nums}.lab-result strong{margin-left:10px}@media(max-width:480px){.image-grid{gap:12px}.panel-heading{font-size:10px}.panel-heading small{font-size:9px}.kernel-panels{gap:9px}.kernel-heading{font-size:11px}.kernel-grid input{font-size:11px;padding:7px 0}.kernel-grid{gap:2px}.channel-badge{width:15px;height:15px;font-size:9px}.lab-toolbar button{font-size:11px}.image-grid .image-panel:last-child .panel-heading span{max-width:105px}}@media(orientation:landscape) and (max-height:650px){.image-grid{max-width:450px}.kernel-panels{margin-top:10px}.kernel-grid input{padding:4px 0}.feature-map{max-height:70px}.lab-toolbar{margin-top:12px}}
</style>
