"""Export this project's trained Keras H5 model as TFJS Layers artifacts.

Only the existing, supported Sequential CNN layer types are handled here. The
export copies float32 inference tensors exactly; optimizer state is excluded.
"""
from pathlib import Path
import argparse
import copy
import hashlib
import json
import h5py
import numpy as np


def convert(source: Path, destination: Path):
    destination.mkdir(parents=True, exist_ok=True)
    with h5py.File(source, 'r') as file:
        keras_config = json.loads(file.attrs['model_config'])
        layers = copy.deepcopy(keras_config['config']['layers'])
        supported = {'InputLayer', 'Conv2D', 'MaxPooling2D', 'Flatten', 'Dense'}
        manifest = []
        binary = bytearray()
        for layer in layers:
            name = layer['class_name']
            if name not in supported:
                raise ValueError(f'Unsupported layer: {name}')
            config = layer['config']
            config['dtype'] = 'float32'
            if name == 'InputLayer':
                config['batch_input_shape'] = config.pop('batch_shape')
                config.pop('ragged', None)
            config.pop('groups', None)
            for key in ['kernel_initializer', 'bias_initializer']:
                if config.get(key):
                    config[key] = {k: v for k, v in config[key].items() if k in ('class_name', 'config')}
            if name in ('Conv2D', 'Dense'):
                layer_name = config['name']
                group = file[f'model_weights/{layer_name}/sequential/{layer_name}']
                for weight in ('kernel', 'bias'):
                    array = np.asarray(group[weight], dtype='<f4')
                    manifest.append({'name': f'{layer_name}/{weight}', 'shape': list(array.shape), 'dtype': 'float32'})
                    binary.extend(array.tobytes(order='C'))
        topology = {'class_name': 'Sequential', 'config': {'name': keras_config['config']['name'], 'layers': layers},
                    'keras_version': str(file.attrs['keras_version']), 'backend': 'tensorflow'}
    artifact = {'format': 'layers-model', 'generatedBy': 'AI Learning Lab H5 inference exporter',
                'convertedBy': 'scripts/convert-model.py', 'modelTopology': topology,
                'weightsManifest': [{'paths': ['weights.bin'], 'weights': manifest}]}
    (destination/'model.json').write_text(json.dumps(artifact, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    (destination/'weights.bin').write_bytes(binary)
    provenance = {'source': source.name, 'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                  'weightsSha256': hashlib.sha256(binary).hexdigest(), 'inputShape': [None,28,28,1],
                  'outputShape': [None,10], 'preprocessing': '28x28 grayscale, white strokes on black background, divide pixel values by 255',
                  'inferenceWeightBytes': len(binary), 'inferenceParameters': len(binary)//4,
                  'training': 'Not retrained. Original inference tensors copied exactly; optimizer state omitted.'}
    (destination/'provenance.json').write_text(json.dumps(provenance,indent=2)+'\n',encoding='utf-8')
    print(f'Exported {len(manifest)} tensors, {len(binary)//4} parameters, {len(binary)} bytes.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('destination', type=Path)
    args = parser.parse_args()
    convert(args.source, args.destination)
