import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  PerspectiveCamera, 
  MeshDistortMaterial, 
  Stars, 
  ContactShadows, 
  Environment 
} from '@react-three/drei';
import * as THREE from 'three';

const Shard = ({ position, rotation, speed }: { 
  position: [number, number, number], 
  rotation: [number, number, number], 
  speed: number 
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    if (hovered) {
      // "Explode" or drift away intensely on hover
      meshRef.current.position.x = position[0] + Math.cos(t * 2) * 2;
      meshRef.current.position.y = position[1] + Math.sin(t * 2) * 2;
      meshRef.current.rotation.z += 0.05;
    } else {
      // Re-form or orbit gently
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, position[0], 0.05);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1], 0.05);
      meshRef.current.rotation.x = rotation[0] + Math.sin(t) * 0.1;
      meshRef.current.rotation.y = rotation[1] + Math.cos(t) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.4 : 1}
      position={position}
    >
      <icosahedronGeometry args={[0.6, 0]} />
      <MeshDistortMaterial
        color={hovered ? "#69f6b8" : "#6366f1"}
        speed={hovered ? 10 : 2}
        distort={hovered ? 0.7 : 0.3}
        emissive={hovered ? "#69f6b8" : "#2e1065"}
        emissiveIntensity={hovered ? 2 : 0.5}
      />
    </mesh>
  );
};

const HeroScene = () => {
  return (
    <div className="w-full h-[600px] relative cursor-pointer">
      <Canvas dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1.5} color="#a3a6ff" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#6366f1" />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1.5} />
        
        <group>
          {/* Central shard cluster */}
          <Shard position={[0, 0, 0]} rotation={[0, 0, 0]} speed={0.5} />
          <Shard position={[-1.8, 1.2, -1]} rotation={[0.5, 0.2, 0.1]} speed={0.7} />
          <Shard position={[1.8, -1.2, 1]} rotation={[-0.3, 0.5, -0.4]} speed={0.8} />
          <Shard position={[-1.2, -1.8, 0.5]} rotation={[0.1, -0.2, 0.6]} speed={0.6} />
          <Shard position={[1.2, 1.8, -0.5]} rotation={[-0.5, -0.1, -0.2]} speed={0.9} />
          <Shard position={[2.5, 0, -2]} rotation={[0.2, 0.8, 0.5]} speed={1.1} />
          <Shard position={[-2.5, 0, 2]} rotation={[-0.4, -0.6, -0.2]} speed={1.2} />
        </group>
        
        <ContactShadows position={[0, -3, 0]} opacity={0.5} scale={15} blur={2.5} far={4.5} />
        <Environment preset="city" />
      </Canvas>
      {/* Interactive Overlay for depth */}
      <div className="absolute inset-0 pointer-events-none bg-radial-gradient from-transparent to-[#060e20]/40"></div>
    </div>
  );
};

export default HeroScene;
