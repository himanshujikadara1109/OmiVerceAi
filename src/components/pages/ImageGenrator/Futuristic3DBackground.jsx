import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useRef } from "react";

// Orbiting 3D spheres that react to mouse
const OrbitingSpheres = () => {
  const groupRef = useRef();
  const spheres = [...Array(8)];
  const sphereRefs = useRef([]);
  const { mouse } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      // Rotate the whole group based on mouse position
      groupRef.current.rotation.y = mouse.x * Math.PI;
      groupRef.current.rotation.x = mouse.y * Math.PI * 0.5;
    }

    // Rotate each sphere individually
    sphereRefs.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.rotation.y += 0.02 + i * 0.005;
        mesh.rotation.x += 0.01 + i * 0.003;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {spheres.map((_, i) => {
        const positions = [
          [5 + i, 0, 0],
          [-5 - i, 0, 0],
          [0, 5 + i, 0],
          [0, -5 - i, 0],
          [0, 0, 5 + i],
          [0, 0, -5 - i],
          [i, i, i],
          [-i, -i, -i],
        ];
        const pos = positions[i];
        const size = 0.8 + i * 0.2;
        const color = `hsl(${i * 45}, 80%, 60%)`;

        return (
          <mesh
            key={i}
            position={pos}
            ref={el => (sphereRefs.current[i] = el)}
          >
            <sphereGeometry args={[size, 32, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              metalness={0.4}
              roughness={0.2}
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}
    </group>
  );
};

// Central glowing sun
const Sun = () => (
  <mesh>
    <sphereGeometry args={[2, 64, 64]} />
    <meshStandardMaterial
      color="#FFD700"
      emissive="#FFD700"
      emissiveIntensity={2}
      metalness={0.2}
      roughness={0.1}
    />
  </mesh>
);

// Moving stars in background
const GalaxyParticles = () => {
  const particlesRef = useRef();
  const count = 2000;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
  }

  useFrame(() => {
    if (particlesRef.current) {
      const positionsArray = particlesRef.current.geometry.attributes.position.array;

      for (let i = 0; i < count; i++) {
        positionsArray[i * 3 + 2] += 0.1;
        if (positionsArray[i * 3 + 2] > 50) positionsArray[i * 3 + 2] = -50;
      }

      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          array={positions}
          count={count}
          itemSize={3}
          attach="attributes-position"
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        color="#ffffff"
        sizeAttenuation
        transparent
        opacity={0.5}
      />
    </points>
  );
};

// Mouse-controlled camera for smooth parallax
const CameraController = () => {
  const { camera, mouse } = useThree();
  useFrame(() => {
    camera.position.x += (mouse.x * 20 - camera.position.x) * 0.05;
    camera.position.y += (mouse.y * 20 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);
  });
  return null;
};

// Main scene
export default function FuturisticGalaxyBackground() {
  return (
    <Canvas className="fixed inset-0 -z-10" camera={{ position: [0, 15, 40], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade />
      <GalaxyParticles />
      <Sun />
      <OrbitingSpheres />
      <CameraController />
    </Canvas>
  );
}
