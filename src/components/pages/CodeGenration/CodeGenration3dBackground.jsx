// src/components/Codegenration3dBackground.jsx
import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

/**
 * Persistent 3D background for the app.
 * This Canvas mounts once and sits behind the UI.
 */

const OrbitingSpheres = () => {
  const groupRef = useRef();
  const sphereRefs = useRef([]);
  const { mouse } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = mouse.x * Math.PI;
      groupRef.current.rotation.x = mouse.y * Math.PI * 0.5;
    }

    (sphereRefs.current || []).forEach((mesh, i) => {
      if (mesh) {
        mesh.rotation.y += 0.02 + i * 0.005;
        mesh.rotation.x += 0.01 + i * 0.003;
      }
    });
  });

  const positions = [
    [8, 0, 0],
    [-8, 0, 0],
    [0, 8, 0],
    [0, -8, 0],
    [0, 0, 8],
    [0, 0, -8],
    [6, 6, 6],
    [-6, -6, -6],
  ];

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => {
        const size = 0.9 + i * 0.15;
        const color = `hsl(${i * 42}, 75%, 60%)`;
        return (
          <mesh
            key={i}
            position={pos}
            ref={(el) => (sphereRefs.current[i] = el)}
            castShadow
          >
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              metalness={0.3}
              roughness={0.25}
              transparent
              opacity={0.65}
            />
          </mesh>
        );
      })}
    </group>
  );
};

const Sun = () => (
  <mesh>
    <sphereGeometry args={[2.5, 64, 64]} />
    <meshStandardMaterial
      color="#ffd166"
      emissive="#ffd166"
      emissiveIntensity={2}
      metalness={0.2}
      roughness={0.05}
    />
  </mesh>
);

const GalaxyParticles = () => {
  const pointsRef = useRef();
  const count = 1200;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 160;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 90;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 160;
  }

  useFrame(() => {
    if (!pointsRef.current) return;
    const arr = pointsRef.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 2] += 0.15;
      if (arr[i * 3 + 2] > 80) arr[i * 3 + 2] = -80;
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={count} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.25} sizeAttenuation={true} opacity={0.5} transparent />
    </points>
  );
};

const CameraController = () => {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.x * 20 - camera.position.x) * 0.03;
    camera.position.y += (mouse.y * 12 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return null;
};

export default function Codegenration3dBackground() {
  return (
    <Canvas
      className="fixed inset-0 -z-10 pointer-events-none"
      camera={{ position: [0, 10, 30], fov: 60 }}
      gl={{ antialias: false }}
      dpr={[1, 1.4]}
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 5]} intensity={1} />
      <Stars radius={120} depth={50} count={800} factor={4} saturation={0} fade />
      <GalaxyParticles />
      <Sun />
      <OrbitingSpheres />
      <CameraController />
    </Canvas>
  );
}
