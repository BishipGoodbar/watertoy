import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { TorusGeometry, PlaneGeometry, MeshNormalMaterial, DoubleSide } from 'three';
import { Environment, OrbitControls } from '@react-three/drei';
import { Physics, usePlane, useBox, useTrimesh } from '@react-three/cannon';
import tvStudio from './assets/images/tv_studio_small.hdr';

import './index.scss';

function Ground(props) {
  const [ref] = usePlane(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -5, 0],
    scale: [0.2, 0.2, 0.2],
    ...props,
  }));
  return (
    <mesh
      ref={ref}
      // rotation-x={Math.PI * 0.5}
      scale={[10, 10, 10]}
      position={[0, -5, 0]}
      // props={props}
      geometry={new PlaneGeometry()}
      material={new MeshNormalMaterial({ flatShading: true, side: DoubleSide })}
    />
  );
}

function Ring(props) {
  const torus = new TorusGeometry(2, 0.5, 8, 12);
  const vertices = torus.attributes.position.array;
  const indices = torus.index.array;

  const [ref] = useTrimesh(
    () => ({
      mass: 1,
      args: [vertices, indices],
      ...props,
    }),
  );
  return (
    <mesh
      ref={ref}
      // props={props}
      geometry={new TorusGeometry(2, 0.5, 8, 12)}
      material={new MeshNormalMaterial({ flatShading: true })}
    />
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
          <Ring
            position={[0, 2, 0]}
            rotation={[1, 0.1, 0.1]}
          />
          <Ground
            position-y={-10}
            scale={[5, 5, 5]}
          />
        </Physics>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
