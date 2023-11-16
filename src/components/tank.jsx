import React, { useRef } from 'react';
import { useGLTF, MeshTransmissionMaterial } from '@react-three/drei';
import { useTrimesh, useBox } from '@react-three/cannon';
import tankModel from '../assets/models/tank3.gltf';

function Tank(props) {
  const gltf = useGLTF(tankModel);
  const { nodes, scene } = gltf;
  const bodies = [];

  nodes.Physics.children.forEach((obj) => {
    obj.visible = false;
    const [body, api] = useBox(
      () => ({
        args: [obj.scale.x * 2, obj.scale.y * 2, obj.scale.z * 2],
        mass: 0,
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotation: [obj.rotation._x, obj.rotation._y, obj.rotation._z],
      }),
      useRef(),
    );

    bodies.push(body);
  });

  // console.log({ bodies });

  return (
    <group
      {...props}
    >
      {
        bodies.map((body) => (
          <mesh
            visible={false}
            position={[body.position]}
            rotation={[body.rotation]}
          >
            <boxGeometry />
          </mesh>
        ))
      }
      <primitive object={scene} />
    </group>
  );
}

export default Tank;
