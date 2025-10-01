import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useRef, useEffect } from "react";
import * as THREE from "three";

const Earth = ({ mouse, scroll, bgRef }) => {
  const earthRef = useRef();
  const atmosphereRef = useRef();

  // Online texture URLs
  const earthTexture = "https://raw.githubusercontent.com/turban/webgl-earth/master/images/earth-day.jpg";
  const earthBumpMap = "https://raw.githubusercontent.com/turban/webgl-earth/master/images/earth-bump.jpg";
  const earthSpecMap = "https://raw.githubusercontent.com/turban/webgl-earth/master/images/earth-specular.gif";

  useFrame((state, delta) => {
    const [mouseX, mouseY] = mouse.current;

    // Rotate Earth
    earthRef.current.rotation.y += delta * 1;

    // Atmosphere rotation opposite to mouse
    atmosphereRef.current.rotation.y = (mouseX - 0.5) * Math.PI * -0.1;

    // Scale Earth based on scroll
    const baseScale = 2;
    const scaleFactor = baseScale + scroll.current * -0.001;
    earthRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    atmosphereRef.current.scale.set(scaleFactor + 0.025, scaleFactor + 0.025, scaleFactor + 0.025);

    // Move background group for parallax (horizontal + vertical)
    if (bgRef.current) {
      bgRef.current.position.x = (mouseX - 0.5) * 20;
      bgRef.current.position.y = (mouseY - 0.5) * 20;
    }
  });

  return (
    <>
      {/* Earth Mesh */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={new THREE.TextureLoader().load(earthTexture)}
          bumpMap={new THREE.TextureLoader().load(earthBumpMap)}
          bumpScale={0.05}
          specularMap={new THREE.TextureLoader().load(earthSpecMap)}
          specular={new THREE.Color("grey")}
        />
      </mesh>

      {/* Atmosphere Glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.05, 64, 64]} />
        <meshBasicMaterial color="gray" transparent opacity={0.15} side={THREE.BackSide} />
      </mesh>
    </>
  );
};

const Background3D = () => {
  const mouse = useRef([0.5, 0.5]);
  const scroll = useRef(0);
  const bgRef = useRef();

  const handleMouseMove = (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    mouse.current = [x, y];
  };

  const handleScroll = () => {
    scroll.current = window.scrollY;
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Canvas
      className="w-full h-full absolute inset-0 z-0"
      camera={{ position: [0, 0, 6], fov: 50 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />

      {/* Background group for parallax */}
      <group ref={bgRef}>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
      </group>

      <Earth mouse={mouse} scroll={scroll} bgRef={bgRef} />
      <OrbitControls enableZoom={true} enablePan={false} enableRotate={false} />
    </Canvas>
  );
};

export default Background3D;


