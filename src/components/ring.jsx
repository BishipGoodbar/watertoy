import React, { useRef } from 'react';
import { useCompoundBody } from '@react-three/cannon';

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
      args: [0.5, 0.5, 1],
      position: [radius * Math.cos(angle), radius * Math.sin(angle), 0],
      rotation: [0, 0, (i * 360) * (Math.PI / 180)],
    });
  }

  const [ref, api] = useCompoundBody(
    () => ({
      // linearDamping: 0.001,
      // angularDamping: 0.001,
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
          args={[radius, 0.33]}
          castShadow
          receiveShadow
        />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.5}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

export default Ring;
