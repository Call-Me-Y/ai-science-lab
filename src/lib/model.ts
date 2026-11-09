import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgpu'
import artifacts from '../assets/model/model.json'
import weightsUrl from '../assets/model/weights.bin?url'
let loaded: Promise<tf.LayersModel> | undefined
export async function digitModel() {
  if (!loaded) loaded = (async () => {
    let ready = false
    for (const backend of ['webgpu', 'webgl', 'cpu']) {
      if (backend === 'webgpu' && !(navigator as any).gpu) continue
      try { ready = await tf.setBackend(backend); if (ready) { await tf.ready(); break } } catch {}
    }
    if (!ready) throw new Error('No TensorFlow.js backend is available')
    const response = await fetch(weightsUrl)
    if (!response.ok) throw new Error('Unable to read embedded model weights')
    return tf.loadLayersModel(tf.io.fromMemory({ modelTopology: artifacts.modelTopology, weightSpecs: artifacts.weightsManifest[0].weights as tf.io.WeightsManifestEntry[], weightData: await response.arrayBuffer() }))
  })().catch(error => { loaded = undefined; throw error })
  return loaded
}
export async function recognize(pixels: Float32Array) {
  const model = await digitModel()
  const output = tf.tidy(() => model.predict(tf.tensor4d(pixels, [1,28,28,1])) as tf.Tensor)
  try { return { values: Array.from(await output.data()), backend: tf.getBackend() } } finally { output.dispose() }
}
