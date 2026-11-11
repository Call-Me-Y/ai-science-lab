import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { createSSRApp, h, reactive } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { fitLine, regressionFoot, visibleFitSegment } from '../src/lib/linear-regression.mjs'
import { parseFiniteDecimal, formatFiniteDecimal, parseKernel } from '../src/lib/numeric-input.mjs'
import { parseManuscript } from '../src/lib/manuscripts.mjs'

for(const [input,value] of [['0',0],['-2',-2],['.25',.25],['-.25',-.25],['-0.',-0],['1.',1],['+3.5',3.5]]) assert.equal(parseFiniteDecimal(input),value)
for(const input of ['', '-', '.', '-.', 'NaN','Infinity','1e3','2abc','1.2.3',' 2 ','1,000','１２','9'.repeat(400)]) assert.equal(parseFiniteDecimal(input),null,`Reject invalid coefficient: ${input}`)
for(const value of [Number.MIN_VALUE,1e-22,1e21,-1e25,Number.MAX_VALUE,.0625]) assert.equal(parseFiniteDecimal(formatFiniteDecimal(value)),value)
assert.equal(parseKernel(['-',0,0,0,1,0,0,0,0]),null)
assert.deepEqual(parseKernel(['.5',0,0,0,'-2.5',0,0,0,0]),[.5,0,0,0,-2.5,0,0,0,0])
const vertical=fitLine([{x:5,y:1},{x:5,y:10},{x:5,y:90}])
assert.equal(vertical.kind,'vertical');assert.equal(vertical.r2,1);assert.equal(vertical.axis,'x')
assert.deepEqual(visibleFitSegment(vertical),[{x:5,y:0},{x:5,y:100}])
assert.deepEqual(regressionFoot(vertical,{x:5,y:17}),{x:5,y:17})
const horizontal=fitLine([{x:1,y:7},{x:30,y:7},{x:90,y:7}])
assert.equal(horizontal.kind,'horizontal');assert.equal(horizontal.r2,1)
const regular=fitLine([{x:1,y:1},{x:2,y:2},{x:3,y:2}])
assert(Math.abs(regular.r2-.75)<1e-12)
const coincident=fitLine([{x:5,y:5},{x:5,y:5}])
assert.equal(coincident.r2,null);assert.equal(visibleFitSegment(coincident),null)
const near=fitLine([{x:50,y:10},{x:50.000001,y:20},{x:50.000002,y:30}])
assert.equal(near.kind,'regular');assert(Math.abs(near.r2-1)<1e-12)
assert(visibleFitSegment(near).flatMap(p=>[p.x,p.y]).every(Number.isFinite))
assert.equal(fitLine([]).r2,null)
assert.equal(fitLine([{x:NaN,y:1},{x:2,y:3}]).r2,null)
console.log('Numeric parsing and vertical, horizontal, ordinary, near-vertical, and coincident regression cases passed.')

const server=await createServer({optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true},appType:'custom'})
const originalDocument=globalThis.document
try {
  const inputComponent=(await server.ssrLoadModule('/src/components/labs/FiniteNumberInput.vue')).default
  async function setup(component,props,emit=()=>{}) {
    let state
    await renderToString(createSSRApp({setup(){state=component.setup(props,{emit,expose(){}});return()=>h('div')}}))
    return state
  }
  const props=reactive({modelValue:0,locale:'zh',label:'test coefficient'})
  const field=await setup(inputComponent,props,(_,value)=>{props.modelValue=value})
  for(const draft of ['-','-0.','-0.25']) field.input({target:{value:draft}})
  assert.equal(props.modelValue,'-0.25');assert.equal(field.parsed.value,-.25)
  const pasted={target:{value:'12abc'}};field.input(pasted)
  assert.equal(pasted.target.value,'-0.25');assert.equal(props.modelValue,'-0.25')
  let blocked=false
  field.beforeInput({target:{value:'2',selectionStart:1,selectionEnd:1},inputType:'insertText',data:'e',preventDefault(){blocked=true}})
  assert(blocked)
  field.input({target:{value:'-'}});assert.equal(field.parsed.value,null)
  const blurred={target:{value:'-'}};field.commit(blurred)
  assert.equal(props.modelValue,-.25);assert.equal(blurred.target.value,'-0.25')
  globalThis.document={createElement:()=>({getContext:()=>({drawImage(){},getImageData:()=>({data:new Uint8ClampedArray(28*28*4).fill(255)})})})}
  for(const [name,count] of [['HandDrawnConvolutionLab',9],['MultiChannelConvolutionLab',27]]) {
    const component=(await server.ssrLoadModule(`/src/components/labs/${name}.vue`)).default
    const copy=parseManuscript(readFileSync('content/chapter-04-zh.md','utf8')).copy
    let emissions=0
    const state=await setup(component,reactive({locale:'zh',copy}),()=>emissions++)
    state.ink.value=true
    if(name==='HandDrawnConvolutionLab') {
      state.kernel.value[0]='-';state.compute();assert.equal(state.output.value,null);assert.equal(emissions,0)
      state.kernel.value=Array(9).fill(1e308);state.compute();assert.equal(state.rangeError.value,true);assert.equal(emissions,0)
      state.setKernel([0,0,0,0,1,0,0,0,0]);state.compute();assert(state.output.value.every(value=>value===255));assert.equal(emissions,1)
    } else {
      state.kernels.value[0][0]='-';state.compute();assert.equal(state.pooled.value,null);assert.equal(emissions,0)
      state.kernels.value=Array.from({length:3},()=>Array(9).fill(1e308));state.compute();assert.equal(state.rangeError.value,true);assert.equal(emissions,0)
      state.kernels.value=[[0,0,0,0,1,0,0,0,0],Array(9).fill(0),Array(9).fill(0)];state.compute();assert(state.pooled.value.every(value=>value===255));assert.equal(emissions,1)
    }
    for(const locale of ['zh','en']) {
      const html=await renderToString(createSSRApp(component,{locale,copy}))
      assert.equal((html.match(/inputmode="decimal"/g)||[]).length,count)
      assert(!html.includes('type="number"'))
    }
  }
  console.log('Actual input event handling, invalid-kernel guards, overflow rejection, and valid convolution results passed.')
} finally {globalThis.document=originalDocument;await server.close()}
