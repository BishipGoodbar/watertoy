import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Debug, Physics } from '@react-three/cannon';
import tvStudio from './assets/images/tv_studio_small.hdr';
import Tank from './components/tank';
import Ring from './components/ring';
import Actuator from './components/actuator';
import './index.scss';

function App() {
  const [rings, setRings] = useState([]);
  const leftActuatorPosition = useRef([-5, -16, 0]);
  const rightActuatorPosition = useRef([5, -16, 0]);
  const leftUp = useRef(false);
  const rightUp = useRef(false);
  const ringAmount = 15;
  const tankSize = { x: 14, y: 12, z: 2 };
  const tankOffset = { x: 0, y: 6, z: 0 };

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

  const createRings = () => {
    const nextRings = [];
    for (let id = 0; id < ringAmount; id += 1) {
      const position = [
        (Math.random() * tankSize.x) - (tankSize.x / 2) + tankOffset.x,
        (Math.random() * tankSize.y) - (tankSize.y / 2) + tankOffset.y,
        (Math.random() * tankSize.z) - (tankSize.z / 2) + tankOffset.z,
      ];
      const rotation = [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ];
      nextRings.push({ id, position, rotation });
    }
    setRings(nextRings);
  };

  useEffect(() => {
    addEventListener('keydown', handleKeyDown);
    addEventListener('keyup', handleKeyUp);
    createRings();
    return () => {
      removeEventListener('keydown', handleKeyDown);
      removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="app">
      <Canvas dpr={[0.2, 0.7]}>
        <PerspectiveCamera
          makeDefault
          far={200}
          near={0.1}
          fov={45}
          position={[0, 0, 50]}
        />
        <Environment
          files={tvStudio}
          blur={0.2}
        />
        <Physics
          allowSleep
        >
          {/* <Debug color="black" scale={1.0}> */}
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
          {/* </Debug> */}
        </Physics>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
