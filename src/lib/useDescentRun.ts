import { computed, onBeforeUnmount, onDeactivated, ref } from 'vue'
import { atGlobalMinimum, optimize } from './gradient-functions.mjs'

export function useDescentRun(objective:()=>any, onComplete:()=>void) {
  const running=ref(false),visible=ref(0),result=ref<ReturnType<typeof optimize>|null>(null),interrupted=ref(false)
  let frame=0
  const shown=computed(()=>result.value?.path.slice(0,visible.value)||[])
  const last=computed(()=>shown.value.at(-1))
  const success=computed(()=>!!result.value&&!running.value&&!interrupted.value&&visible.value===result.value.path.length&&!!last.value&&atGlobalMinimum(objective(),last.value.position))
  function stop(){cancelAnimationFrame(frame);if(running.value)interrupted.value=true;running.value=false}
  function clear(){stop();result.value=null;visible.value=0;interrupted.value=false}
  function start(initial:number[],rate:number,iterations:number){
    clear();result.value=optimize(objective(),initial,rate,iterations);visible.value=1;running.value=true
    const began=performance.now(),length=result.value.path.length
    const step=(time:number)=>{
      visible.value=Math.min(length,1+Math.floor((time-began)/1400*Math.max(1,length-1)))
      if(visible.value<length)frame=requestAnimationFrame(step)
      else {running.value=false;if(success.value)onComplete()}
    }
    frame=requestAnimationFrame(step)
  }
  onDeactivated(stop);onBeforeUnmount(stop)
  return {running,shown,last,result,success,interrupted,clear,start}
}
