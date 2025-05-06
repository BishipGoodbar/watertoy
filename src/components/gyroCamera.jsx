import React, { useRef, useEffect } from 'react'
import {
  Euler,
  Quaternion,
  Vector3,
  MathUtils,
} from 'three';
import { useFrame } from '@react-three/fiber';


export default function GyroCameraController({ cameraGroup, useOrientation }) {
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