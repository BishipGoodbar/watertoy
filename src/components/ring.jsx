import React, { useRef } from 'react';
import { useCompoundBody, useLockConstraint } from '@react-three/cannon';
import { MeshTransmissionMaterial } from '@react-three/drei';

function Ring(props) {
  const { position, rotation } = props;
  const colors = [
    0xee6688,
    0x00dd44,
    0x1122ff,
  ];
  const randomColor = () => colors[Math.floor(Math.random() * colors.length)];

  const shapes = [];
  const radius = 1;
  const segments = 4;
  for (let i = 0; i < 1; i += (1 / segments)) {
    const angle = i * 2 * Math.PI;
    shapes.push({
      // type: 'Sphere',
      type: 'Box',
      args: [0.3, 0.3, 0.3],
      position: [radius * Math.cos(angle), radius * Math.sin(angle), 0],
      rotation: [0, 0, (i * 360) * (Math.PI / 180)],
    });
  }
  const [ref, api] = useCompoundBody(
    () => ({
      mass: 1,
      position,
      rotation,
      shapes,
    }),
    useRef(),
  );

  return (
    <group>
      <mesh ref={ref}>
        <torusGeometry args={[1, 0.25]} />
        <MeshTransmissionMaterial
          transmission={0.9}
          roughness={0.1}
          thickness={0.5}
          ior={1.5}
          reflectivity={0.1}
          color={randomColor()}
          backsideThickness={0.1}
        // wireframe
        />
      </mesh>
    </group>
  );
}

export default Ring;
