import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Physics, Debug } from '@react-three/cannon';
import { Euler, Quaternion, Vector3, MathUtils } from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import GyroCameraController from './components/gyroCamera';

import tvStudio from './assets/images/tv_studio_small.hdr';
import beach from './assets/images/pool_2k.hdr';
import Tank from './components/tank';
import Ring from './components/ring';
import Actuator from './components/actuator';
import GravityArrow from './components/gravityArrow';

import './index.scss';

const gyroAvailable = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function';
// const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

function App() {
  const [tankLoaded, setTankLoaded] = useState(false);
  const [rings, setRings] = useState([]);
  const [targets, setTargets] = useState([]);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [disableGyro, setDisableGyro] = useState(false);
  const [gravity, setGravity] = useState([0, -10, 0]);
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

    euler.set(b, -a, -g, 'YXZ');
    const orientationQuat = new Quaternion().setFromEuler(euler);

    orientationQuat.multiply(q1);
    orientationQuat.multiply(q0.setFromAxisAngle(zee, -orient));

    // Tilt gravity 20 degrees backward around the X-axis
    const tiltX = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), MathUtils.degToRad(20));
    const gravityVec = new Vector3(0, -10, 0).applyQuaternion(tiltX).applyQuaternion(orientationQuat);
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
      {!tankLoaded && (
        <div className="loading">
          <p>Loading...</p>
        </div>
      )}
      <Canvas dpr={gyroAvailable ? 0.3 : 1} shadows>
        <group ref={cameraGroup}>
          <PerspectiveCamera makeDefault far={200} near={0.1} fov={35} position={[0, 0, gyroEnabled ? 20 : 60]} />
        </group>
        {gyroEnabled && (<GyroCameraController cameraGroup={cameraGroup} useOrientation={gyroEnabled} />)}
        <Environment files={tvStudio} intensity={1} blur={0.1} background />

        <directionalLight
          intensity={4}
          castShadow
          shadow-bias={0.0001}
          shadow-mapSize-width={512}
          shadow-mapSize-height={512}
          shadow-camera-near={1}
          shadow-camera-far={50}
          shadow-camera-left={-50}
          shadow-camera-right={50}
          shadow-camera-top={50}
          shadow-camera-bottom={-50}
          position={[2, 4, -2]}
        />
        <GravityArrow gravity={gravity} />
        <Physics
          gravity={gravity}
          broadphase="SAP"
          quatNormalizeFast
          iterations={6}
          // maxSubSteps={1}
          // shouldInvalidate?: boolean;
          // stepSize={2}
          // allowSleep={false}
          tolerance={0.01}
        >
          {targets.length > 0 && rings.map((ring) => (
            <Ring
              key={ring.id}
              position={ring.position}
              rotation={ring.rotation}
              color={ring.color}
              targets={targets}
            />
          ))}
          <Tank setTargets={setTargets} leftUp={leftUp} rightUp={rightUp} setTankLoaded={setTankLoaded} />
          <Actuator position={leftActuatorPosition.current} up={leftUp} />
          <Actuator position={rightActuatorPosition.current} up={rightUp} />
        </Physics>
        <OrbitControls
          enabled={!gyroEnabled}
          enableZoom={false}
        />
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
            intensity={0.5}
          />
        </EffectComposer>
      </Canvas>

      <div className="mobile-controls">
        <div
          className="control-button left"
          onPointerDown={() => { leftUp.current = true; }}
          onPointerUp={() => { leftUp.current = false; }}
        />
        <div
          className="control-button right"
          onPointerDown={() => { rightUp.current = true; }}
          onPointerUp={() => { rightUp.current = false; }}
        />
      </div>

      <div className={`gyro ${gyroEnabled || disableGyro || !gyroAvailable ? 'hidden' : ''}`}>
        <button
          type="button"
          onClick={enableGyro}
        >
          Enable Gyroscope
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => { setDisableGyro(true); }}
        >
          Use Without Gyroscope
        </button>
      </div>
    </div>
  );
}

export default App;
