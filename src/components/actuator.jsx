import React, { useRef } from 'react';
import { useBox } from '@react-three/cannon';
import { BoxGeometry } from 'three';
import { MeshTransmissionMaterial } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

function Actuator(props) {
  const sp = useRef(props.position);
  const { up } = props;
  const size = 10;

  const [ref, api] = useBox(
    () => ({
      args: [size, size, size],
      mass: 0,
      ...props,
    }),
    useRef(),
  );

  useFrame((state, delta) => {
    sp.current[1] += ((up.current ? -10 : -16) - sp.current[1]) / (20 * (delta * 10));
    api.position.set(sp.current[0], sp.current[1], sp.current[2]);
  });

  return (
    <mesh
      ref={ref}
      visible={false}
      position={props.position}
      geometry={new BoxGeometry(size, size, size, 1, 1, 1)}
    >
      <meshStandardMaterial wireframe />
    </mesh>
  );
}

export default Actuator;
