import React, { useRef, useEffect, useState } from 'react';
import { useCompoundBody } from '@react-three/cannon';
import { Color, Vector3 } from 'three';

const distanceBetween = (a, b) => Math.sqrt(
  (a[0] - b[0]) ** 2
  + (a[1] - b[1]) ** 2
  + (a[2] - b[2]) ** 2,
);

function Ring({ position, rotation, color, targets }) {
  const radius = 1.5;
  const segments = 10;
  const shapes = [];

  for (let i = 0; i < 1; i += 1 / segments) {
    const angle = i * 2 * Math.PI;
    shapes.push({
      type: 'Sphere',
      args: [0.33, 0.33],
      position: [radius * Math.cos(angle), radius * Math.sin(angle), 0],
      rotation: [0, 0, angle],
    });
  }

  const [ref, api] = useCompoundBody(
    () => ({
      mass: 1,
      position,
      rotation,
      shapes,
      linearDamping: 0.5,
      material: {
        friction: 0.01,
        restitution: 0.9,
      },
    }),
    useRef(),
  );

  const [isAsleep, setIsAsleep] = useState(false);
  const sleepTimer = useRef(null);
  const originalColor = useRef(new Color(color));

  useEffect(() => {
    const unsubVelocity = api.velocity.subscribe((v) => {
      const speed = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);

      if (speed < 1) {
        if (!sleepTimer.current) {
          sleepTimer.current = setTimeout(() => {
            const unsubscribe = api.position.subscribe((pos) => {
              const isNearTarget = targets.some((target) => distanceBetween(target, pos) < 1);
              setIsAsleep(isNearTarget); // <-- cleanly update asleep state
              unsubscribe();
            });
          }, 100);
        }
      } else {
        if (sleepTimer.current) {
          clearTimeout(sleepTimer.current);
          sleepTimer.current = null;
        }
        // Even if it wasn't asleep yet, cancel any transition
        setIsAsleep(false);
      }
    });

    return () => {
      unsubVelocity();
      if (sleepTimer.current) clearTimeout(sleepTimer.current);
    };
  }, [api]);

  return (
    <group>
      <mesh ref={ref} castShadow receiveShadow>
        <torusGeometry args={[radius, 0.33]} />
        <meshStandardMaterial
          color={isAsleep ? 'gold' : originalColor.current}
          transparent
          opacity={isAsleep ? 1 : 0.5}
          metalness={0.5}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

export default Ring;
