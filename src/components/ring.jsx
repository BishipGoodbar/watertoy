import React, { useRef } from 'react';
import { useCompoundBody, useLockConstraint } from '@react-three/cannon';
import { MeshTransmissionMaterial } from '@react-three/drei';
import { MeshStandardMaterial } from 'three';

function Ring(props) {
  const { position, rotation, color } = props;

  const shapes = [];
  const radius = 1.5;
  const segments = 10;
  for (let i = 0; i < 1; i += (1 / segments)) {
    const angle = i * 2 * Math.PI;
    shapes.push({
      type: 'Sphere',
      // type: 'Box',
      args: [0.5, 0.5],
      position: [radius * Math.cos(angle), radius * Math.sin(angle), 0],
      rotation: [0, 0, (i * 360) * (Math.PI / 180)],
    });
  }
  const [ref, api] = useCompoundBody(
    () => ({
      linearDamping: 0.001,
      angularDamping: 0.001,
      mass: 1,
      position,
      rotation,
      shapes,
      material: {
        friction: 0.01,
        restitution: 0.9,
      },
    }),
    useRef(),
  );

  return (
    <group>
      <mesh ref={ref}>
        <torusGeometry
          args={[radius, 0.25]}
          castShadow
          receiveShadow
        />
        <meshStandardMaterial wireframe />
      </mesh>
    </group>
  );
}

export default Ring;
