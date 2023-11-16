import React, { useRef } from 'react';
import { useGLTF, MeshTransmissionMaterial } from '@react-three/drei';
import { useTrimesh } from '@react-three/cannon';
import tankModel from '../assets/models/tank2.gltf';

function Tank(props) {
  const gltf = useGLTF(tankModel);
  const { nodes, scene } = gltf;

  // nodes.Tank.material = new MeshTransmissionMaterial();

  const [ref, api] = useTrimesh(
    () => ({
      args: [
        nodes.Tank.geometry.attributes.position.array,
        nodes.Tank.geometry.index.array],
      mass: 0,
      ...props,
    }),
    useRef(),
  );
  // }

  return (
    <group
      ref={ref}
      {...props}
      dispose={null}
      visible
    >
      <primitive object={scene} />
    </group>
  );
}

export default Tank;
