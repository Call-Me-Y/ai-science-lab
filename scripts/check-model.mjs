import * as tf from '@tensorflow/tfjs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modelDirectory = path.join(root, 'src/assets/model');
const tolerance = 1e-5;
const artifact = JSON.parse(await readFile(path.join(modelDirectory, 'model.json'), 'utf8'));
const references = JSON.parse(await readFile(path.join(modelDirectory, 'parity-reference.json'), 'utf8'));
const bytes = await readFile(path.join(modelDirectory, 'weights.bin'));
const weightData = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

await tf.setBackend('cpu');
await tf.ready();
let model;
try {
  model = await tf.loadLayersModel(tf.io.fromMemory({
    modelTopology: artifact.modelTopology,
    weightSpecs: artifact.weightsManifest[0].weights,
    weightData,
  }));
  for (const reference of references) {
    const pixels = Buffer.from(reference.pixelsBase64, 'base64');
    if (pixels.length !== 28 * 28) throw new Error(`Invalid input fixture: ${reference.name}`);
    const input = tf.tensor4d(Float32Array.from(pixels, value => value / 255), [1, 28, 28, 1]);
    let output;
    try {
      output = model.predict(input);
      if (Array.isArray(output)) throw new Error('Expected a single softmax output tensor.');
      const actual = await output.data();
      if (actual.length !== reference.probabilities.length) throw new Error(`Output length mismatch: ${reference.name}`);
      let maximumError = 0;
      for (let index = 0; index < actual.length; index++) {
        if (!Number.isFinite(actual[index])) throw new Error(`Non-finite prediction: ${reference.name}`);
        maximumError = Math.max(maximumError, Math.abs(actual[index] - reference.probabilities[index]));
      }
      console.log(`${reference.name}: maximum absolute probability error ${maximumError.toExponential(3)}`);
      if (maximumError > tolerance) throw new Error(`${reference.name}: exceeds tolerance ${tolerance}`);
    } finally {
      input.dispose();
      if (output) tf.dispose(output);
    }
  }
  console.log(`Model parity passed: ${references.length} original Keras fixtures; tolerance ${tolerance}.`);
} finally {
  model?.dispose();
}
