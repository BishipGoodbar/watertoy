import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Debug, Physics } from '@react-three/cannon';
import {
  Euler,
  Quaternion,
  Vector3,
  MathUtils,
} from 'three';
import GyroCameraController from './components/gyroCamera';

import tvStudio from './assets/images/tv_studio_small.hdr';
import Tank from './components/tank';
import Ring from './components/ring';
import Actuator from './components/actuator';
import GravityArrow from './components/gravityArrow';

import './index.scss';

const isOrientationAvailable = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';

function App() {
  const [rings, setRings] = useState([]);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [gravity, setGravity] = useState([0, -50, 0]);
  const leftActuatorPosition = useRef([-5, -16, 0]);
  const rightActuatorPosition = useRef([5, -16, 0]);
  const leftUp = useRef(false);
  const rightUp = useRef(false);
  const cameraGroup = useRef();
  const ringAmount = 10;
  const tankSize = { x: 14, y: 12, z: 2 };
  const tankOffset = { x: 0, y: 6, z: 0 };

  const handleKeyDown = (e) => {
    if (e.key === 'j') rightUp.current = true;
    if (e.key === 'f') leftUp.current = true;
  };

  const handleKeyUp = (e) => {
    if (e.key === 'j') rightUp.current = false;
    if (e.key === 'f') leftUp.current = false;
  };

  const createRings = () => {
    const nextRings = [];
    for (let id = 0; id < ringAmount; id += 1) {
      const position = [
        Math.random() * tankSize.x - tankSize.x / 2 + tankOffset.x,
        Math.random() * tankSize.y - tankSize.y / 2 + tankOffset.y,
        Math.random() * tankSize.z - tankSize.z / 2 + tankOffset.z,
      ];
      const rotation = [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ];
      const colors = [0xee6688, 0x00dd44, 0x1122ff];
      const color = colors[Math.floor(Math.random() * colors.length)];
      nextRings.push({ id, position, rotation, color });
    }
    setRings(nextRings);
  };

  const handleOrientationForGravity = ({ alpha, beta, gamma }) => {
    const zee = new Vector3(0, 0, 1);
    const euler = new Euler();
    const q0 = new Quaternion();
    const q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // -PI/2 around X

    const orient = window.orientation ? MathUtils.degToRad(window.orientation) : 0;

    const a = alpha ? MathUtils.degToRad(alpha) : 0;
    const b = beta ? MathUtils.degToRad(beta) : 0;
    const g = gamma ? MathUtils.degToRad(gamma) : 0;

    // Note the NEGATIVE gamma to correct left/right inversion
    euler.set(b, -a, -g, 'YXZ');
    const orientationQuat = new Quaternion().setFromEuler(euler);

    orientationQuat.multiply(q1);
    orientationQuat.multiply(q0.setFromAxisAngle(zee, -orient));

    const gravityVec = new Vector3(0, -45, 0).applyQuaternion(orientationQuat);
    setGravity([gravityVec.x, gravityVec.y, gravityVec.z]);
  };

  const enableGyro = async () => {
    try {
      if (
        typeof DeviceOrientationEvent !== 'undefined'
        && typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientationForGravity);
          setGyroEnabled(true);
        } else {
          alert('Gyroscope permission denied.');
        }
      } else {
        window.addEventListener('deviceorientation', handleOrientationForGravity);
        setGyroEnabled(true);
      }
    } catch (err) {
      console.error('Gyroscope permission error:', err);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    createRings();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('deviceorientation', handleOrientationForGravity);
    };
  }, []);

  return (
    <div className="app">
      <Canvas dpr={isOrientationAvailable ? 0.3 : 1} shadows>
        <group ref={cameraGroup}>
          <PerspectiveCamera makeDefault far={200} near={0.1} fov={35} position={[0, 0, 10]} />
        </group>
        <GyroCameraController cameraGroup={cameraGroup} useOrientation={gyroEnabled} />
        <Environment files={tvStudio} blur={0.1} background />
        <directionalLight
          intensity={1}
          castShadow
          shadow-mapSize={512}
          shadow-bias={0.0001}
          position={[0, 4, -2]}
        // target-position={[0, -1, 0]}
        />
        <GravityArrow gravity={gravity} />
        <Physics
          gravity={gravity}
          broadphase="SAP"
          quatNormalizeFast
          iterations={6}
          allowSleep={false}
          tolerance={0.01}
        >
          {rings.map((ring) => (
            <Ring
              key={ring.id}
              position={ring.position}
              rotation={ring.rotation}
              color={ring.color}
            />
          ))}
          <Tank />
          <Actuator position={leftActuatorPosition.current} up={leftUp} />
          <Actuator position={rightActuatorPosition.current} up={rightUp} />
        </Physics>
        <OrbitControls />
      </Canvas>

      <div className="mobile-controls">
        <div
          // type="button"
          className="control-button left"
          onPointerDown={() => { leftUp.current = true; }}
          onPointerUp={() => { leftUp.current = false; }}
        />
        <div
          // type="button"
          className="control-button right"
          onPointerDown={() => { rightUp.current = true; }}
          onPointerUp={() => { rightUp.current = false; }}
        />
      </div>

      {isOrientationAvailable && !gyroEnabled && (
        <button
          type="button"
          className="enable-gyro"
          onClick={enableGyro}
        >
          Enable Gyroscope
        </button>
      )}
    </div>
  );
}

export default App;
