// Normal fits use vertical residuals. Constant x requires the separate x = k model.
// For constant targets with a perfect fit, report the finite R² convention of 1,
// rather than evaluating 0/0. A coincident cloud cannot define a unique line.
export function fitLine(points) {
  if(points.length<2||points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return {kind:'degenerate',axis:null,a:null,b:null,k:null,residual:0,total:0,r2:null,constantTarget:false}
  const n=points.length,mx=points.reduce((sum,p)=>sum+p.x/n,0),my=points.reduce((sum,p)=>sum+p.y/n,0)
  const sx=points.reduce((sum,p)=>sum+(p.x-mx)**2,0),sy=points.reduce((sum,p)=>sum+(p.y-my)**2,0)
  const xScale=Math.max(1,...points.map(p=>Math.abs(p.x))),yScale=Math.max(1,...points.map(p=>Math.abs(p.y)))
  const xConstant=Math.max(...points.map(p=>p.x))-Math.min(...points.map(p=>p.x))<=64*Number.EPSILON*xScale
  const yConstant=Math.max(...points.map(p=>p.y))-Math.min(...points.map(p=>p.y))<=64*Number.EPSILON*yScale
  if(xConstant&&yConstant)return {kind:'degenerate',axis:null,a:null,b:null,k:null,residual:0,total:0,r2:null,constantTarget:false}
  if(xConstant)return {kind:'vertical',axis:'x',a:null,b:null,k:mx,residual:sx,total:sx,r2:1,constantTarget:true}
  if(yConstant)return {kind:'horizontal',axis:'y',a:my,b:0,k:null,residual:0,total:sy,r2:1,constantTarget:true}
  const covariance=points.reduce((sum,p)=>sum+(p.x-mx)*(p.y-my),0),b=covariance/sx,a=my-b*mx
  const residual=points.reduce((sum,p)=>sum+(p.y-(b*p.x+a))**2,0)
  return {kind:'regular',axis:'y',a,b,k:null,residual,total:sy,r2:Math.min(1,1-residual/sy),constantTarget:false}
}
export function regressionFoot(fit,point) {
  if(fit.kind==='vertical')return {x:fit.k,y:point.y}
  if(fit.kind==='degenerate')return null
  return {x:point.x,y:fit.b*point.x+fit.a}
}
export function visibleFitSegment(fit,minimum=0,maximum=100) {
  if(fit.kind==='degenerate')return null
  if(fit.kind==='vertical')return fit.k>=minimum&&fit.k<=maximum?[{x:fit.k,y:minimum},{x:fit.k,y:maximum}]:null
  if(fit.b===0)return fit.a>=minimum&&fit.a<=maximum?[{x:minimum,y:fit.a},{x:maximum,y:fit.a}]:null
  // Clip in data coordinates to keep nearly vertical finite-slope lines numerically drawable.
  const candidates=[{x:minimum,y:fit.b*minimum+fit.a},{x:maximum,y:fit.b*maximum+fit.a},{x:(minimum-fit.a)/fit.b,y:minimum},{x:(maximum-fit.a)/fit.b,y:maximum}]
  const inside=candidates.filter(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=minimum-1e-9&&p.x<=maximum+1e-9&&p.y>=minimum-1e-9&&p.y<=maximum+1e-9)
  const unique=inside.filter((p,index)=>inside.findIndex(q=>Math.hypot(q.x-p.x,q.y-p.y)<1e-9)===index)
  return unique.length>=2?[unique[0],unique[1]]:null
}
