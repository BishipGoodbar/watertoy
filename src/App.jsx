import React, { Suspense, useEffect, useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { TorusGeometry, PlaneGeometry, MeshNormalMaterial, DoubleSide, Vector3 } from 'three';
import { Geometry } from 'three-stdlib';
import { Environment, MeshTransmissionMaterial, OrbitControls, useGLTF, PerspectiveCamera } from '@react-three/drei';
import { Debug, Physics, usePlane, useBox, useConvexPolyhedron, useSphere, useTrimesh } from '@react-three/cannon';
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

function App() {
  return (
    <div className="app">
      <Canvas>
        <PerspectiveCamera
          makeDefault
          far={100}
          near={0.1}
          fov={35}
          position={[0, 0, 32]}
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
          </Debug>
        </Physics>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
