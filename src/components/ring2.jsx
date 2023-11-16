import React, { useRef, useEffect } from 'react';
import { useLockConstraint, useSphere, useBox } from '@react-three/cannon';
import { MeshTransmissionMaterial } from '@react-three/drei';

function Ring2(props) {
  const { position, rotation } = props;
  const radius = 1;
  const segments = 8;

  const bodies = [];
  const apis = [];
  const constraints = [];

  for (let i = 0; i < segments; i += 1) {
    const angle = (i / segments) * 2 * Math.PI;
    const x = position[0] + radius * Math.cos(angle);
    const y = position[1] + radius * Math.sin(angle);
    const z = position[2];


    const [body, api] = useBox(
      () => ({
        args: [0.5, 0.5, 0.5, 5],
        mass: 5,
        position: [x, y, z],
        rotation: [0, 0, ((i / segments) * 360) * (Math.PI / 180)],
      }),
      useRef(),
    );
    bodies.push(body);
    apis.push(api);

    if (i > 0) {
      console.log(apis[i])
      const constraint = useLockConstraint(apis[i - 1], apis[i], { maxForce: 0 })
      constraints.push(constraint);
    }

  }
  // const body = {
  //   mass: 1,
  //   position: [x, y, 0],
  //   args: [0.3, 0.3, 0.3],
  //   rotation: [0, 0, (i * 360) * (Math.PI / 180)],
  // };
  // bodies.push(body);

  // const [meshRef, api] = useLockConstraint(
  //   () => ({
  //     ...body,
  //   }),
  //   useRef(),
  // );

  // const meshes = useRef([]);

  // useEffect(() => {

  // bodies.forEach((body, index) => {

  // meshes.current.push(meshRef);

  // if (index > 0) {
  //   const prevMeshRef = meshes.current[index - 1];
  //   const constraint = useLockConstraint(prevMeshRef, meshRef, { maxForce: 1e6 });
  //   constraints.push(constraint);
  // }
  // });

  // const constraint = useLockConstraint(meshes.current[0], meshes.current[segments - 1], { maxForce: 1e6 });
  // constraints.push(constraint);

  // return () => {
  //   constraints.forEach((constraint) => constraint.disable());
  // };
  // }, [bodies]);

  return (
    <group>
      {
        bodies.map((body) => (
          <mesh
            scale={[.1, .1, .1]}
            position={body.current?.position || [0, 0, 0]}
          >
            <sphereGeometry />
            <meshNormalMaterial />
          </mesh>
        ))
      }
      {/* {meshes.current.map((meshRef, index) => ( */}
      <mesh
        position={position}
      >
        <torusGeometry args={[1, 0.25]} />
        <MeshTransmissionMaterial
          transmission={0.9}
          roughness={0.1}
          thickness={0.5}
          ior={1.5}
          reflectivity={0.1}
          color={0xee6688}
          backsideThickness={0.1}
        />
      </mesh>
    </group>
  );
}

export default Ring2;
