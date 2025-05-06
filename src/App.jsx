import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { Debug, Physics } from '@react-three/cannon';
import {
  Euler,
  Quaternion,
  Vector3,
  MathUtils
} from 'three';

import tvStudio from './assets/images/tv_studio_small.hdr';
import Tank from './components/tank';
import Ring from './components/ring';
import Actuator from './components/actuator';
import GravityArrow from './components/gravityArrow';

import './index.scss';

const isOrientationAvailable = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';

const degToRad = (degrees) => degrees * Math.PI / 180;

function GyroCameraController({ cameraGroup, useOrientation }) {
  const deviceOrientation = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const screenOrientation = useRef(window.orientation || 0);

  const _zee = new Vector3(0, 0, 1);
  const _euler = new Euler();
  const _q0 = new Quaternion();
  const _q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
  const _orientationQuat = new Quaternion();
  const _targetPosition = new Vector3();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (useOrientation) {
      const handleOrientation = (event) => {
        deviceOrientation.current = event;
      };
      const handleScreenOrientation = () => {
        screenOrientation.current = window.orientation || 0;
      };

      window.addEventListener('deviceorientation', handleOrientation, true);
      window.addEventListener('orientationchange', handleScreenOrientation);

      return () => {
        window.removeEventListener('deviceorientation', handleOrientation, true);
        window.removeEventListener('orientationchange', handleScreenOrientation);
      };
    } else {
      const handleMouseMove = (event) => {
        mouse.current.x = (event.clientX / window.innerWidth - 0.5) * 2;
        mouse.current.y = (event.clientY / window.innerHeight - 0.5) * -2;
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [useOrientation]);

  useFrame(() => {
    if (!cameraGroup.current) return;

    if (useOrientation) {
      const { alpha, beta, gamma } = deviceOrientation.current;
      const orient = MathUtils.degToRad(screenOrientation.current || 0);

      const a = alpha ? MathUtils.degToRad(alpha) : 0;
      const b = beta ? MathUtils.degToRad(beta) : 0;
      const g = gamma ? MathUtils.degToRad(gamma) : 0;

      _euler.set(b, a, -g, 'YXZ');
      _orientationQuat.setFromEuler(_euler);
      _orientationQuat.multiply(_q1);
      _orientationQuat.multiply(_q0.setFromAxisAngle(_zee, -orient));

      const forward = new Vector3(0, 0, 1).applyQuaternion(_orientationQuat);
      _targetPosition.copy(forward).multiplyScalar(50);
    } else {
      _targetPosition.set(mouse.current.x * 10, mouse.current.y * 10, 50);
    }

    cameraGroup.current.position.lerp(_targetPosition, 0.1);
    cameraGroup.current.children[0]?.lookAt(0, 0, 0);
  });

  return null;
}

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
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
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
      <Canvas dpr={0.5}>
        <group ref={cameraGroup}>
          <PerspectiveCamera makeDefault far={200} near={0.1} fov={45} position={[0, 0, 10]} />
        </group>
        <GyroCameraController cameraGroup={cameraGroup} useOrientation={gyroEnabled} />
        <Environment files={tvStudio} blur={0.1} background />
        <directionalLight
          intensity={1}
          castShadow
          shadow-mapSize={2048}
          shadow-bias={0.0001}
          position={[0, 0, 0]}
          target-position={[0, -1, 0]}
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
      </Canvas>

      <div className="mobile-controls">
        <button
          type="button"
          className="control-button left"
          onPointerDown={() => { leftUp.current = true; }}
          onPointerUp={() => { leftUp.current = false; }}
        >
        </button>
        <button
          type="button"
          className="control-button right"
          onPointerDown={() => { rightUp.current = true; }}
          onPointerUp={() => { rightUp.current = false; }}
        >
        </button>
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
