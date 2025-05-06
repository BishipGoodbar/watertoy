import React, { useRef, useState } from 'react';
import { useGLTF, MeshTransmissionMaterial } from '@react-three/drei';
import { useTrimesh, useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import tankModel from '../assets/models/tank.gltf';

function Tank() {
  const gltf = useGLTF(tankModel);
  const { nodes } = gltf;
  const bodies = [];
  const button1 = useRef();
  const button2 = useRef();

  const buttons = [button1, button2];
  const buttonStates = useRef([0, 0]);

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

  return (
    <group>
      {
        bodies.map((body) => (
          <mesh
            key={body.name}
            visible={false}
            position={[body.position]}
            rotation={[body.rotation]}
          >
            <boxGeometry />
          </mesh>
        ))
      }
      <primitive
        key="scene"
        object={nodes.Scene}
      />
      {
        nodes.Interactive.children.map((button, index) => (
          <primitive
            // scale={[1, 1, buttonLeftDown.current ? 2 : 1]}
            key={button.name}
            ref={buttons[index]}
            object={button}
            onPointerDown={() => {
              buttonStates.current[index] = 1;
            }}
            onPointerUp={() => {
              buttonStates.current[index] = 0;
            }}
          />
        ))
      }
    </group>
  );
}

export default Tank;
