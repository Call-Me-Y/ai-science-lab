import assert from 'node:assert/strict'
import { functions1D, functions2D, MAX_LEARNING_RATE, derivative, evaluate, optimize, atGlobalMinimum } from '../src/lib/gradient-functions.mjs'
import { renderInline } from '../src/lib/manuscripts.mjs'

for(const objective of [...functions1D,...functions2D]) {
  const dimensions=objective.initial.length
  for(let sample=0;sample<12;sample++) {
    const point=Array.from({length:dimensions},(_,axis)=>objective.domain[0]+(objective.domain[1]-objective.domain[0])*((sample*7+axis*5+1)%17)/17)
    const analytical=derivative(objective,point)
    for(let axis=0;axis<dimensions;axis++) {
      const before=[...point],after=[...point],h=1e-5
      before[axis]-=h;after[axis]+=h
      const numerical=(evaluate(objective,after)-evaluate(objective,before))/(2*h)
      assert(Math.abs(numerical-analytical[axis])<1e-4,`${objective.id}: incorrect derivative, axis ${axis}`)
    }
  }
  for(const point of objective.minima) assert(atGlobalMinimum(objective,point),`${objective.id}: incorrect known minimum`)
  for(const rate of [objective.rate,MAX_LEARNING_RATE]) {
    const run=optimize(objective,objective.example,rate,objective.iterations)
    assert.equal(run.status,'global',`${objective.id}: example must converge at rate ${rate}`)
    assert(atGlobalMinimum(objective,run.path.at(-1).position))
    assert(run.path.every(point=>Number.isFinite(point.value)))
  }
  assert(renderInline(`$${objective.formula}$`).includes('katex'),`${objective.id}: formula rendering`)
  console.log(`${objective.id}: derivatives, minima, example convergence, and formula verified`)
}
const original=functions1D[0]
assert.equal(optimize(original,[-2],.04,160).status,'stationary','The original left-hand local minimum must not pass as global')
assert.equal(optimize(original,[3],.1,160).status,'diverged','Divergence must be reported, not silently clipped')
const capped=optimize(functions1D[1],functions1D[1].example,.8,200)
assert.equal(capped.rate,.1)
assert.equal(capped.status,'global')
assert.equal(optimize(functions1D[1],[-2],.001,10).status,'iterations','An incomplete run must not pass')
assert(!atGlobalMinimum(functions2D[1],[0,0]),'The center of the four-valley surface is not a global minimum')
assert.deepEqual(functions1D.map(item=>[item.rate,item.iterations,...item.initial]),[[.025,200,-3],[.025,200,-3]])
assert.deepEqual(functions1D.map(item=>item.id),['double-well','ripple'])
assert.deepEqual(functions2D.map(item=>item.id),['elliptic','himmelblau'])
console.log('Passed: four requested objectives, two-dimensional defaults (0.025, 200, -3), no false passes for local minima or short runs; learning rate capped at 0.1.')
