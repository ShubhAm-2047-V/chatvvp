import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const SwarmParticles = ({ count = 500 }) => {
  const points = useRef<THREE.Points>(null!);
  const { mouse, viewport } = useThree();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return { positions };
  }, [count]);

  useFrame(() => {
    if (!points.current) return;
    const pos = points.current.geometry.attributes.position.array as Float32Array;
    
    const targetX = (mouse.x * viewport.width) / 2;
    const targetY = (mouse.y * viewport.height) / 2;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      pos[ix] = THREE.MathUtils.lerp(pos[ix], targetX + (Math.random() - 0.5) * 2, 0.02);
      pos[iy] = THREE.MathUtils.lerp(pos[iy], targetY + (Math.random() - 0.5) * 2, 0.02);
    }
    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.rotation.z += 0.001;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#a3a6ff"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const LiquidCore = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const { mouse, viewport } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      const tX = (mouse.x * viewport.width) / 10;
      const tY = (mouse.y * viewport.height) / 10;
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, tX, 0.05);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, tY, 0.05);
      meshRef.current.rotation.x += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 32, 32]}>
        <MeshDistortMaterial
          color="#6366f1"
          speed={2}
          distort={0.4}
          radius={1}
          emissive="#4338ca"
          emissiveIntensity={0.5}
        />
      </Sphere>
    </Float>
  );
};

const ParticleField = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 12] }} dpr={1}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#a3a6ff" />
        <SwarmParticles />
        <LiquidCore />
      </Canvas>
    </div>
  );
};

export default ParticleField;
