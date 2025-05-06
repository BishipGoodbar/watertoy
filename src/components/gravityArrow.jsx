import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

function GravityArrow({ gravity }) {
  const ref = useRef();

  useEffect(() => {
    ref.current.setDirection(new THREE.Vector3(...gravity).normalize());
  }, [gravity]);

  return (
    <primitive
      ref={ref}
      object={new THREE.ArrowHelper(
        new THREE.Vector3(...gravity).normalize(),
        new THREE.Vector3(0, 0, 0),
        10,
        0xff0000,
      )}
    />
  );
}

export default GravityArrow;
