import React, { Suspense, useEffect, forwardRef, useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { TorusGeometry, PlaneGeometry, MeshNormalMaterial, DoubleSide, Vector3, CylinderGeometry } from 'three';
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

const Actuator = forwardRef((props, ref2) => {
  // console.log({ ref2 });
  const [ref, api] = useCylinder(
    () => ({
      args: [2, 2, 4, 8],
      mass: 0,
      ...props,
    }),
    useRef(),
  );

  useEffect(() => {
    ref2.current = api;
  });

  return (
    <mesh
      ref={ref}
      position={props.position}
      geometry={new CylinderGeometry(2, 2, 4, 8)}
      material={new MeshNormalMaterial({ flatShading: true })}
    />
  );
});

function App() {
  const actuatorApi = useRef();
  const rightActuatorPosition = useRef([5, -14, 0]);

  const handleKeydown = (e) => {
    if (e.key === 'ArrowUp') {
      rightActuatorPosition.current = [rightActuatorPosition.current[0], rightActuatorPosition.current[1] + 0.25, rightActuatorPosition.current[2]];
    }
    if (e.key === 'ArrowDown') {
      rightActuatorPosition.current = [rightActuatorPosition.current[0], rightActuatorPosition.current[1] - 0.25, rightActuatorPosition.current[2]];
    }
    if (e.key.indexOf('Arrow') >= 0) {
      actuatorApi.current.position.set(rightActuatorPosition.current[0], rightActuatorPosition.current[1], rightActuatorPosition.current[2]);
    }
  };
  useEffect(() => {
    addEventListener('keydown', handleKeydown);
    return () => {
      removeEventListener('keydown', handleKeydown);
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
          <Debug color="black" scale={1.1}>
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
              position={rightActuatorPosition.current}
              ref={actuatorApi}
            />
          </Debug>
        </Physics>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
