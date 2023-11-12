import React, { Suspense, useEffect, forwardRef, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { TorusGeometry, PlaneGeometry, MeshNormalMaterial, DoubleSide, Vector3, CylinderGeometry, BoxGeometry } from 'three';
import { Geometry } from 'three-stdlib';
import { Environment, MeshTransmissionMaterial, OrbitControls, useGLTF, PerspectiveCamera } from '@react-three/drei';
import { Debug, Physics, usePlane, useBox, useConvexPolyhedron, useSphere, useTrimesh, useCylinder } from '@react-three/cannon';
import tvStudio from './assets/images/tv_studio_small.hdr';
import tankModel from './assets/models/tank.gltf';
import rings from './rings.json';
import './index.scss';

function Ring(props) {
  const [ref] = useSphere(() => ({
    mass: 1,
    ...props,
  }));

  return (
    <mesh
      ref={ref}
      position={props.position}
      geometry={new TorusGeometry(1, 0.25, 8, 12)}
      material={new MeshNormalMaterial({ flatShading: true })}
    />
  );
}

function Ring2(props) {
  const geometry = new TorusGeometry(1, 0.5, 6, 12);
  console.log(geometry);
  const [ref, api] = useTrimesh(
    () => ({
      args: [
        geometry.attributes.position.array,
        geometry.index.array,
      ],
      mass: 1,
      ...props,
    }),
    useRef(),
  );

  return (
    <group
      ref={ref}
      {...props}
      dispose={null}
    >
      <mesh geometry={geometry}>
        <meshNormalMaterial />
      </mesh>
    </group>
  );
}

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

function Actuator(props) {
  const sp = useRef(props.position);
  const { up } = props;

  const [ref, api] = useBox(
    () => ({
      args: [5, 5, 5, 4, 1, 4],
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
      geometry={new BoxGeometry(5, 5, 5, 4, 1, 4)}
      material={new MeshNormalMaterial({ flatShading: true, wireframe: true })}
    />
  );
}

function App() {
  const leftActuatorPosition = useRef([-5, -16, 0]);
  const rightActuatorPosition = useRef([5, -16, 0]);
  const leftUp = useRef(false);
  const rightUp = useRef(false);

  const handleKeyDown = (e) => {
    if (e.key === 'j') {
      rightUp.current = true;
    }
    if (e.key === 'f') {
      leftUp.current = true;
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'j') {
      rightUp.current = false;
    }
    if (e.key === 'f') {
      leftUp.current = false;
    }
  };

  useEffect(() => {
    addEventListener('keydown', handleKeyDown);
    addEventListener('keyup', handleKeyUp);
    return () => {
      removeEventListener('keydown', handleKeyDown);
      removeEventListener('keyup', handleKeyUp);
    };
  });

  return (
    <div className="app">
      <Canvas>
        <PerspectiveCamera
          makeDefault
          far={200}
          near={0.1}
          fov={45}
          position={[0, 0, 40]}
        />
        <Environment
          files={tvStudio}
          blur={0.2}
        />
        <Physics>
          <Debug color="white" scale={1}>
            {
              rings.map((ring) => (
                <Ring
                  key={ring.id}
                  position={ring.position}
                  rotation={ring.rotation}
                />
              ))
            }
            <Tank />
            <Actuator
              position={leftActuatorPosition.current}
              up={leftUp}
            />
            <Actuator
              position={rightActuatorPosition.current}
              up={rightUp}
            />
          </Debug>
        </Physics>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
