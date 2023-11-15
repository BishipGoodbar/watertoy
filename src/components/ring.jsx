import React, { useRef } from 'react';
import { useCompoundBody } from '@react-three/cannon';

function Ring(props) {
  const { position } = props;
  const shapes = [];
  const radius = 1;
  const segments = 8;
  for (let i = 0; i < 1; i += (1 / segments)) {
    const angle = i * 2 * Math.PI;
    shapes.push({
      args: [0.4], position: [radius * Math.cos(angle), radius * Math.sin(angle), 0], type: 'Sphere',
    });
  }
  const [ref, api] = useCompoundBody(
    () => ({
      mass: 1,
      position,
      shapes,
    }),
    useRef(),
  );

  return (
    <group>
      <mesh
        ref={ref}
      // castShadow
      // receiveShadow
      >
        {/* <cylinderGeometry args={[0.25, 0.25, 1.5]} /> */}
        <torusGeometry />
        <meshStandardMaterial wireframe />
        {/* <mesh rotation={[0, 0, -Math.PI / 2]} castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.25, 4]} />
        <meshStandardMaterial wireframe />
      </mesh> */}
      </mesh>
    </group>
  );
}

export default Ring;
