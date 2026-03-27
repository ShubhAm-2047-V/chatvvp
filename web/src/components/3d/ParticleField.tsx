import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshDistortMaterial, Float, Sphere } from '@react-three/drei';
import * as THREE from 'three';

const SwarmParticles = ({ count = 2000 }) => {
  const points = useRef<THREE.Points>(null!);
  const { mouse, viewport } = useThree();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return { positions, velocities };
  }, [count]);

  useFrame(() => {
    if (!points.current) return;
    const pos = points.current.geometry.attributes.position.array as Float32Array;
    
    // Mouse target in 3D space
    const targetX = (mouse.x * viewport.width) / 2;
    const targetY = (mouse.y * viewport.height) / 2;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;

      // Accelerate toward mouse
      const dx = targetX - pos[ix];
      const dy = targetY - pos[iy];
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 5) {
        pos[ix] += dx * 0.02;
        pos[iy] += dy * 0.02;
      } else {
        // Drift slowly
        pos[ix] += (Math.random() - 0.5) * 0.01;
        pos[iy] += (Math.random() - 0.5) * 0.01;
      }
    }
    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.rotation.z += 0.0005;
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
        size={0.03}
        color="#a3a6ff"
        transparent
        opacity={0.3}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const LiquidCore = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const { mouse, viewport } = useThree();

  useFrame(() => {
    if (meshRef.current) {
      const targetX = (mouse.x * viewport.width) / 6;
      const targetY = (mouse.y * viewport.height) / 6;
      
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, targetX, 0.05);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, targetY, 0.05);
      
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Sphere
        ref={meshRef}
        args={[1.2, 64, 64]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <MeshDistortMaterial
          color="#6366f1"
          speed={hovered ? 15 : 2}
          distort={hovered ? 0.9 : 0.3}
          radius={1}
          emissive="#4338ca"
          emissiveIntensity={hovered ? 2 : 0.5}
        />
      </Sphere>
    </Float>
  );
};

const ParticleField = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <color attach="background" args={['#060e20']} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#a3a6ff" />
        <SwarmParticles />
        <LiquidCore />
      </Canvas>
    </div>
  );
};

export default ParticleField;
