import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import tankModel from '../assets/models/tank.glb';

function Tank({ setTargets, leftUp, rightUp, setTankLoaded }) {
  const gltf = useGLTF(tankModel);
  const { nodes, scene } = gltf;
  const bodies = [];
  const buttonLeft = useRef();
  const buttonRight = useRef();

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

  useEffect(() => {
    if (!nodes?.Physics) return;
    setTankLoaded(true);

    buttonLeft.current = scene.getObjectByName('Button_Left');
    buttonRight.current = scene.getObjectByName('Button_Right');
    if (nodes?.Targets?.children?.length) {
      const targets = nodes.Targets.children.map((t) => [
        t.position.x,
        t.position.y,
        t.position.z,
      ]);
      setTargets(targets);
    }

    if (nodes?.BaseScene) {
      nodes.BaseScene.children.forEach((obj) => {
        obj.castShadow = true;
        obj.receiveShadow = true;
      })
    }
  }, [nodes, setTargets]);

  useEffect(() => {
    buttonLeft.current.position.z = leftUp.current ? 2 : 3;
    buttonRight.current.position.z = rightUp.current ? 2 : 3;
  }, [leftUp.current, rightUp.current])

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
