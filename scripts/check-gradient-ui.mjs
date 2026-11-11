import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { readFileSync } from 'node:fs'
import { parseManuscript } from '../src/lib/manuscripts.mjs'
import { functions1D } from '../src/lib/gradient-functions.mjs'

const server=await createServer({optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true},appType:'custom'})
const originalPoint=globalThis.DOMPoint, originalFrame=globalThis.requestAnimationFrame, originalCancel=globalThis.cancelAnimationFrame
try {
  for(const name of ['GradientDescent1DLab','GradientDescentSurfaceLab']) {
    const component=(await server.ssrLoadModule(`/src/components/labs/${name}.vue`)).default
    for(const locale of ['zh','en']) {
      const copy=parseManuscript(readFileSync(`content/chapter-02-${locale}.md`,'utf8')).copy
      const html=await renderToString(createSSRApp(component,{locale,copy}))
      assert(html.includes('max="0.1"'),`${name}: learning rate maximum`)
      assert(!html.includes('<select'),`${name}: no dropdown selector`)
      assert.equal((html.match(/data-function=/g)||[]).length,2)
      assert.equal((html.match(/aria-pressed="true"/g)||[]).length,1)
      assert(!html.includes('NaN'))
      assert(html.includes('class="katex"'))
      assert(!html.includes('示例参数')&&!html.includes('Example settings'),`${name}: removed example button`)
      console.log(`${name}/${locale}: component rendering passed`)
    }
  }
  const {usePlotGesture}=await server.ssrLoadModule('/src/lib/usePlotGesture.ts')
  const {useDescentRun}=await server.ssrLoadModule('/src/lib/useDescentRun.ts')
  let pan,orbit,run,completed=0,animation
  await renderToString(createSSRApp({setup(){
    pan=usePlotGesture('pan');orbit=usePlotGesture('orbit')
    run=useDescentRun(()=>functions1D[0],()=>completed++)
    return ()=>h('div')
  }}))
  pan.scale(2,{x:200,y:150})
  assert.equal((200-380-pan.offsetX.value)/pan.zoom.value,200-380,'Zoom must retain the point under the cursor')
  pan.scale(100);assert.equal(pan.zoom.value,6)
  pan.scale(.0001);assert.equal(pan.zoom.value,.5)
  pan.reset();assert.equal(pan.zoom.value,1);assert.equal(pan.offsetX.value,0)
  globalThis.DOMPoint=class{constructor(x,y){this.x=x;this.y=y}matrixTransform(){return this}}
  const svg={getScreenCTM:()=>({inverse:()=>({})}),setPointerCapture:()=>{}}
  pan.svg.value=svg;orbit.svg.value=svg
  const event=(id,x,y)=>({pointerId:id,clientX:x,clientY:y,pointerType:'touch',button:0,preventDefault(){}})
  pan.down(event(1,100,100));pan.move(event(1,145,120));pan.end(event(1,145,120))
  assert.equal(pan.offsetX.value,45);assert.equal(pan.offsetY.value,20)
  orbit.down(event(1,100,100));const yaw=orbit.yaw.value
  orbit.move(event(1,200,150));assert.notEqual(orbit.yaw.value,yaw)
  orbit.move(event(1,200,100000));assert.equal(orbit.pitch.value,1.35)
  orbit.reset();orbit.down(event(1,100,100));orbit.down(event(2,200,100));orbit.move(event(2,250,100))
  assert(Math.abs(orbit.zoom.value-1.5)<1e-9,'Pinch must scale the view')
  let prevented=false
  orbit.wheel({...event(1,200,150),deltaY:-80,preventDefault(){prevented=true}})
  assert(prevented);assert(orbit.zoom.value>1.5)
  orbit.reset();assert.equal(orbit.zoom.value,1)
  globalThis.requestAnimationFrame=callback=>{animation=callback;return 1}
  globalThis.cancelAnimationFrame=()=>{animation=null}
  run.start([2],.025,200);assert.equal(completed,0);animation(performance.now()+2000)
  assert.equal(run.success.value,true);assert.equal(completed,1)
  run.clear();assert.equal(run.success.value,false);assert.equal(run.shown.value.length,0)
  run.start([2],.025,200);run.clear();assert.equal(animation,null);assert.equal(completed,1)
  console.log('Pan, cursor-anchored zoom, rotation limits, pinch, wheel, view reset, completion, and interrupted-run cleanup passed.')
} finally {
  globalThis.DOMPoint=originalPoint;globalThis.requestAnimationFrame=originalFrame;globalThis.cancelAnimationFrame=originalCancel
  await server.close()
}
