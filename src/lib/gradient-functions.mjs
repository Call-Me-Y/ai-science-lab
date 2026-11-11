// Objective definitions keep plotting, derivatives, examples, and completion tests aligned.
export const MAX_LEARNING_RATE = 0.1
export const functions1D = [
  { id: 'double-well', name: { zh: '双极小值', en: 'Double well' }, formula: 'x^4-4x^2-x+1',
    description: { zh: '有一个局部最小值和一个更低的全局最小值，比较不同初始位置的结果。', en: 'A local minimum and a lower global minimum: compare different starting positions.' },
    f: x => x ** 4 - 4*x*x - x + 1, gradient: x => 4*x**3-8*x-1, domain: [-3,3], minima: [[1.472997601114]], localMinima: [[-1.346997408528]], initial: [-3], example: [2], rate: 0.025, iterations: 200 },
  { id: 'ripple', name: { zh: '带波纹的碗形', en: 'Rippled bowl' }, formula: '0.5x^2+1-\\cos(3x)',
    description: { zh: '波纹会产生局部最小值，原点仍是全局最低点。试着改变初始位置。', en: 'Ripples create local minima; the origin is the global minimum. Try different starts.' },
    f: x => 0.5*x*x+1-Math.cos(3*x), gradient: x => x+3*Math.sin(3*x), domain: [-3,3], minima: [[0]], initial: [-3], example: [0.8], rate: 0.025, iterations: 200 }
]
export const functions2D = [
  { id: 'elliptic', name: { zh: '椭圆碗面', en: 'Elliptic bowl' }, formula: 'x^2+2y^2',
    description: { zh: '两个方向的坡度不同，最低点在原点。', en: 'Different slopes along the two axes, with the minimum at the origin.' },
    f: (x,y) => x*x+2*y*y, gradient: (x,y) => [2*x,4*y], domain: [-3,3], minima: [[0,0]], initial: [2.6,-2], example: [2.6,-2], rate: 0.08, iterations: 140 },
  { id: 'himmelblau', name: { zh: '四谷曲面', en: 'Four-valley surface' }, formula: '\\frac{(x^2+y-11)^2+(x+y^2-7)^2}{50}',
    description: { zh: '有四个同样低的全局最小值；改变初始位置可落入不同谷底。除以 50 用于减缓坡度。', en: 'Four equally low global minima. Different starts reach different valleys; division by 50 moderates the slopes.' },
    f: (x,y) => ((x*x+y-11)**2+(x+y*y-7)**2)/50,
    gradient: (x,y) => [(4*x*(x*x+y-11)+2*(x+y*y-7))/50,(2*(x*x+y-11)+4*y*(x+y*y-7))/50], domain: [-4.5,4.5], minima: [[3,2],[-2.80511808695,3.13131251825],[-3.77931025338,-3.28318599129],[3.58442834033,-1.84812652696]], initial: [0,0], example: [0,0], rate: 0.08, iterations: 400 }
]

export function evaluate(objective, position) { return objective.f(...position) }
export function derivative(objective, position) {
  const result = objective.gradient(...position)
  return Array.isArray(result) ? result : [result]
}
export function atGlobalMinimum(objective, position) {
  const target = Math.min(...objective.minima.map(point=>evaluate(objective,point)))
  return position.every(Number.isFinite) && Math.abs(evaluate(objective,position)-target) < 0.002 && Math.hypot(...derivative(objective,position)) < 0.03 && objective.minima.some(point=>Math.hypot(...point.map((value,index)=>value-position[index]))<0.04)
}
export function optimize(objective, initial, learningRate, iterations) {
  const rate = Math.max(0.001,Math.min(MAX_LEARNING_RATE,learningRate))
  let position = [...initial]
  const path = [{ position, value: evaluate(objective,position) }]
  let status = 'iterations'
  for(let index=0;index<iterations;index++) {
    const gradient = derivative(objective,position)
    if(Math.hypot(...gradient)<1e-8) { status='stationary'; break }
    const next=position.map((value,axis)=>value-rate*gradient[axis])
    const value=evaluate(objective,next)
    if(!next.every(Number.isFinite)||next.some(value=>Math.abs(value)>1e6)||!Number.isFinite(value)) { status='diverged'; break }
    position=next; path.push({position,value})
  }
  if(atGlobalMinimum(objective,position)) status='global'
  else if(status!=='diverged' && Math.hypot(...derivative(objective,position))<0.03) status='stationary'
  return {path,status,rate}
}
