import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import tankModel from '../assets/models/tank2.gltf';

function Tank({ setTargets }) {
  const gltf = useGLTF(tankModel);
  const { nodes } = gltf;
  const bodies = [];

  nodes.Physics.children.forEach((obj) => {
    obj.visible = false;
    const [body] = useBox(
      () => ({
        args: [obj.scale.x * 2, obj.scale.y * 2, obj.scale.z * 2],
        mass: 0,
        position: [obj.position.x, obj.position.y, obj.position.z],
        rotation: [obj.rotation._x, obj.rotation._y, obj.rotation._z],
        material: {
          friction: 0.01, // lower friction for smoother sliding
          restitution: 0.2, // optional: some bounciness
        },
      }),
      useRef(),
    );

    body.name = obj.name;
    bodies.push(body);
  });

  setTargets(nodes.Targets.children.map((t) => [t.position.x, t.position.y, t.position.z]));

  return (
    <group>
      {
        bodies.map((body) => (
          <mesh
            key={body.name}
            visible={false}
            position={[body.position]}
            rotation={[body.rotation]}
            receiveShadow
          >
            <boxGeometry />
          </mesh>
        ))
      }
      <primitive
        key="scene"
        object={nodes.Scene}
      />
    </group>
  );
}

export default Tank;
