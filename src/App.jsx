import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { TorusGeometry, PlaneGeometry, MeshNormalMaterial, DoubleSide, Vector3 } from 'three';
import { Geometry } from 'three-stdlib';
import { Environment, MeshTransmissionMaterial, OrbitControls, useGLTF } from '@react-three/drei';
import { Debug, Physics, usePlane, useBox, useConvexPolyhedron, useSphere } from '@react-three/cannon';
import tvStudio from './assets/images/tv_studio_small.hdr';
import tankModel from './assets/models/tank.gltf';

import './index.scss';

const rings = [
  {
    id: 0,
    rotation: [0.1, 0.1, 0.1],
    position: [1.43, 2, -2],
  },
  {
    id: 1,
    rotation: [0.2, 0.2, 0.2],
    position: [0.2, 6, 0.8],
  },
  {
    id: 2,
    rotation: [0.4, 0.3, 0.3],
    position: [-0.3, 12, 0.1],
  },
  {
    id: 3,
    rotation: [0.4, 0.3, 0.3],
    position: [0, 20, 0.2],
  },
  {
    id: 4,
    rotation: [0.4, 0.3, 0.3],
    position: [0, 25, 0.1],
  },
];

function Ground(props) {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0.1, -9, 0],
    scale: [0.2, 0.2, 0.2],
    ...props,
  }));

  return (
    <mesh
      ref={ref}
      visible={false}
      // rotation-x={Math.PI * 0.5}
      scale={[10, 10, 10]}
      position={[0, -7, 0]}
      // props={props}
      geometry={new PlaneGeometry()}
      material={new MeshNormalMaterial({ flatShading: true, side: DoubleSide })}
    />
  );
}

function toConvexProps(bufferGeometry) {
  // const geo = new Geometry().fromBufferGeometry(bufferGeometry);
  // Merge duplicate vertices resulting from glTF export.
  // Cannon assumes contiguous, closed meshes to work
  // bufferGeometry.mergeVertices();
  return [bufferGeometry.vertices.map((v) => [v.x, v.y, v.z]), bufferGeometry.faces.map((f) => [f.a, f.b, f.c]), []];
}

function Ring(props) {
  // const torus = new TorusGeometry(0.5, 0.15, 8, 12);
  // const vertices = torus.attributes.position.array;
  // const indices = torus.index.array;
  // const args = useMemo(() => toConvexProps(torus.geometry), [torus.geometry]);
  // console.log({ args });
  // const shape = [];
  // for (let i = 0; i < vertices.length; i += 3) {
  //   shape.push(new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]));
  // }

  // const [ref] = useConvexPolyhedron(
  //   () => ({
  //     mass: 1,
  //     args,
  //     // args: [shape],
  //     // rotation: [1, 0, 0],
  //     ...props,
  //   }),
  // );

  const [ref] = useSphere(() => ({
    mass: 1,
    ...props,
  }));

  return (
    <mesh
      ref={ref}
      // props={props}
      position={props.position}
      geometry={new TorusGeometry(1, 0.25, 8, 12)}
      material={new MeshNormalMaterial({ flatShading: true })}
    />
  );
}

function Tank() {
  const gltf = useGLTF(tankModel);
  // const { scene } = gltf;
  const object = gltf.scene.getObjectByName('Tank');
  // const glass = new MeshTransmissionMaterial();
  // scene.traverse((obj) => {
  //   console.log(obj);
  //   if (obj.isMesh) obj.material = glass;
  // });
  return (
    <primitive object={object}>
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
    </primitive>
  );
}

function App() {
  return (
    <div className="app">
      <Canvas>
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
            <Ground
              position-y={-10}
              scale={[5, 5, 5]}
            />
            <Tank />
          </Debug>
        </Physics>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
