import React, { useRef } from 'react';
import { useGLTF, MeshTransmissionMaterial } from '@react-three/drei';
import { useTrimesh } from '@react-three/cannon';
import tankModel from '../assets/models/tank.gltf';

function Tank(props) {
  const { nodes } = useGLTF(tankModel);

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
    >
      <mesh geometry={nodes.Tank.geometry}>
        {/* <meshNormalMaterial wireframe /> */}
        <MeshTransmissionMaterial
          transmission={0.9}
          roughness={0.2}
          thickness={1}
          ior={1.8}
          reflectivity={0.01}
          color={0xeeeeee}
          chromaticAberration={1}
          backsideThickness={1}
          backside
          // flatShading
          envMapIntensity={1}
        />
      </mesh>
    </group>
  );
}

export default Tank;
