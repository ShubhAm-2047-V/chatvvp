import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, MeshDistortMaterial, Stars, ContactShadows } from '@react-three/drei';
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
      meshRef.current.position.x = position[0] + Math.cos(t * 2) * 1.5;
      meshRef.current.position.y = position[1] + Math.sin(t * 2) * 1.5;
      meshRef.current.rotation.z += 0.05;
    } else {
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, position[0], 0.08);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, position[1], 0.08);
      meshRef.current.rotation.x = rotation[0] + Math.sin(t) * 0.1;
      meshRef.current.rotation.y = rotation[1] + Math.cos(t) * 0.1;
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.2 : 0.8}
    >
      <icosahedronGeometry args={[0.7, 0]} />
      <MeshDistortMaterial
        color={hovered ? "#69f6b8" : "#6366f1"}
        speed={hovered ? 4 : 1.5}
        distort={hovered ? 0.4 : 0.2}
        emissive={hovered ? "#69f6b8" : "#2e1065"}
        emissiveIntensity={hovered ? 1.5 : 0.4}
      />
    </mesh>
  );
};

const HeroScene = () => {
  return (
    <div className="w-full h-[500px] relative pointer-events-auto">
      <Canvas dpr={1}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={50} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#a3a6ff" />
        
        <Stars radius={100} depth={20} count={800} factor={4} saturation={0} fade speed={1} />
        
        <group>
          <Shard position={[0, 0, 0]} rotation={[0, 0, 0]} speed={0.5} />
          <Shard position={[-2, 1.5, -1]} rotation={[0.5, 0.2, 0.1]} speed={0.7} />
          <Shard position={[2, -1.5, 1]} rotation={[-0.3, 0.5, -0.4]} speed={0.8} />
          <Shard position={[-1.5, -2, 0.5]} rotation={[0.1, -0.2, 0.6]} speed={0.6} />
          <Shard position={[1.5, 2, -0.5]} rotation={[-0.5, -0.1, -0.2]} speed={0.9} />
          <Shard position={[3, 0, -2]} rotation={[0.2, 0.8, 0.5]} speed={1} />
        </group>
        
        <ContactShadows position={[0, -3, 0]} opacity={0.3} scale={10} blur={2} far={4} />
      </Canvas>
    </div>
  );
};

export default HeroScene;
