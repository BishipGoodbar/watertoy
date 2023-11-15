import React, { useRef } from 'react';
import { useBox } from '@react-three/cannon';
import { BoxGeometry, MeshNormalMaterial } from 'three';
import { useFrame } from '@react-three/fiber';

function Actuator(props) {
  const sp = useRef(props.position);
  const { up } = props;
  const size = 8;

  const [ref, api] = useBox(
    () => ({
      args: [size, size, size, 4, 4, 4],
      mass: 0,
      ...props,
    }),
    useRef(),
  );

  useFrame((state, delta) => {
    sp.current[1] += ((up.current ? -10 : -16) - sp.current[1]) / (20 * (delta * 100));
    api.position.set(sp.current[0], sp.current[1], sp.current[2]);
  });

  return (
    <mesh
      ref={ref}
      visible
      position={props.position}
      geometry={new BoxGeometry(size, size, size, 4, 1, 4)}
      material={new MeshNormalMaterial({ flatShading: true, wireframe: true })}
    />
  );
}

export default Actuator;
