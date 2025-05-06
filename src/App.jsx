import React, { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Debug, Physics } from '@react-three/cannon';
import { Euler, Vector3 } from 'three';
import tvStudio from './assets/images/tv_studio_small.hdr';
import Tank from './components/tank';
import Ring from './components/ring';
import Actuator from './components/actuator';
import GravityArrow from './components/gravityArrow';
import './index.scss';

const degToRad = (degrees) => degrees * Math.PI / 180;

function App() {
  const [rings, setRings] = useState([]);
  const [gyroEnabled, setGyroEnabled] = useState(false);
  const [gravity, setGravity] = useState([0, -90, 0]);
  const leftActuatorPosition = useRef([-5, -16, 0]);
  const rightActuatorPosition = useRef([5, -16, 0]);
  const leftUp = useRef(false);
  const rightUp = useRef(false);
  const ringAmount = 10;
  const tankSize = { x: 14, y: 12, z: 2 };
  const tankOffset = { x: 0, y: 6, z: 0 };
  const cameraRotation = useRef([0, 0, 0]);

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

  const handleOrientation = ({ alpha, beta, gamma }) => {
    const deviceEuler = new Euler(
      degToRad(beta),
      degToRad(alpha),
      -degToRad(gamma),
      'YXZ',
    );

    // Apply a correction so the phone being upright makes gravity point down the screen
    const correctionEuler = new Euler(degToRad(80), 0, 0, 'XYZ');

    const gravityVector = new Vector3(0, 90, 0);
    gravityVector.applyEuler(deviceEuler);
    gravityVector.applyEuler(correctionEuler); // apply the device orientation fix

    const { x, y, z } = gravityVector;
    setGravity([x, y, z]);

    cameraRotation.current = [
      degToRad(beta) * 0.01, // slight tilt up/down
      degToRad(gamma) * 0.01, // slight pan left/right
      0, // no roll for now
    ];
  };

  const handleMotion = (e) => {
    console.log('motion', e);
  };

  const enableGyro = async () => {
    try {
      if (
        typeof DeviceOrientationEvent !== 'undefined'
        && typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          window.addEventListener('devicemotion', handleMotion);
          setGyroEnabled(true);
        } else {
          alert('Gyroscope permission denied.');
        }
      } else {
        // Non-iOS
        window.addEventListener('deviceorientation', handleOrientation);
        window.addEventListener('devicemotion', handleMotion);
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
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

  return (
    <div className="app">
      <Canvas dpr={0.5}>
        <PerspectiveCamera makeDefault far={200} near={0.1} fov={45} position={[0, 0, 50]} />
        <Environment files={tvStudio} blur={0.2} />
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
          // broadphase="Naive"
          broadphase="SAP"
          quatNormalizeFast
          iterations={6}
          allowSleep={false}
          tolerance={0.01}
        // defaultContactMaterial={{ contactEquationRelaxation: 4, contactEquationStiffness: 1e7 }}
        >
          <Debug color="black" scale={0.25}>
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
          </Debug>
        </Physics>
        {/* <OrbitControls /> */}
      </Canvas>

      <div className="mobile-controls">
        <button
          type="button"
          className="control-button left"
          onPointerDown={() => { leftUp.current = true; }}
          onPointerUp={() => { leftUp.current = false; }}
        >
          Left
        </button>
        <button
          type="button"
          className="control-button right"
          onPointerDown={() => { rightUp.current = true; }}
          onPointerUp={() => { rightUp.current = false; }}
        >
          Right
        </button>
      </div>
      {!gyroEnabled && (
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
