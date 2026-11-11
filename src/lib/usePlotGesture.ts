import { onDeactivated, onBeforeUnmount, ref } from 'vue'

// Positions are measured in SVG units so touch and mouse work at any CSS size.
export function usePlotGesture(mode: 'pan'|'orbit') {
  const svg=ref<SVGSVGElement|null>(null)
  const zoom=ref(1), offsetX=ref(0), offsetY=ref(0), yaw=ref(-0.65), pitch=ref(0.72)
  const pointers=new Map<number,{x:number,y:number}>()
  const center={x:380,y:mode==='pan'?205:260}
  const position=(event:PointerEvent|WheelEvent)=>{
    const matrix=svg.value?.getScreenCTM()
    if(!matrix)return {x:center.x,y:center.y}
    const point=new DOMPoint(event.clientX,event.clientY).matrixTransform(matrix.inverse())
    return {x:point.x,y:point.y}
  }
  function scale(factor:number, anchor=center) {
    const next=Math.max(0.5,Math.min(6,zoom.value*factor)),ratio=next/zoom.value
    offsetX.value=(anchor.x-center.x)*(1-ratio)+offsetX.value*ratio
    offsetY.value=(anchor.y-center.y)*(1-ratio)+offsetY.value*ratio
    zoom.value=next
  }
  function down(event:PointerEvent) {
    if(event.pointerType==='mouse'&&event.button!==0)return
    event.preventDefault(); svg.value?.setPointerCapture(event.pointerId)
    pointers.set(event.pointerId,position(event))
  }
  function move(event:PointerEvent) {
    const before=pointers.get(event.pointerId)
    if(!before)return
    const point=position(event)
    if(pointers.size===2) {
      const other=[...pointers.entries()].find(([id])=>id!==event.pointerId)![1]
      const oldDistance=Math.hypot(before.x-other.x,before.y-other.y)
      const newDistance=Math.hypot(point.x-other.x,point.y-other.y)
      if(oldDistance>2)scale(newDistance/oldDistance,{x:(before.x+other.x)/2,y:(before.y+other.y)/2})
      offsetX.value+=(point.x-before.x)/2;offsetY.value+=(point.y-before.y)/2
    } else if(pointers.size===1) {
      const dx=point.x-before.x,dy=point.y-before.y
      if(mode==='orbit'&&!event.shiftKey){yaw.value+=dx*0.007;pitch.value=Math.max(0.18,Math.min(1.35,pitch.value+dy*0.005))}
      else {offsetX.value+=dx;offsetY.value+=dy}
    }
    pointers.set(event.pointerId,point)
  }
  function end(event:PointerEvent){pointers.delete(event.pointerId)}
  function wheel(event:WheelEvent){event.preventDefault();scale(Math.exp(-Math.max(-160,Math.min(160,event.deltaY))*0.002),position(event))}
  function reset(){zoom.value=1;offsetX.value=0;offsetY.value=0;yaw.value=-0.65;pitch.value=0.72;pointers.clear()}
  function stop(){pointers.clear()}
  onDeactivated(stop);onBeforeUnmount(stop)
  return {svg,zoom,offsetX,offsetY,yaw,pitch,scale,down,move,end,wheel,reset}
}
