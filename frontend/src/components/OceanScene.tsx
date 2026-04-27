import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, PerspectiveCamera, Stars } from "@react-three/drei";
import * as THREE from "three";

const WavePlane = ({ amplitude = 0.4 }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const { geometry } = meshRef.current;
    const position = geometry.attributes.position;
    const time = clock.getElapsedTime();

    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      
      // Layered sines and cosines displacement
      const z = Math.sin(x * 0.2 + time) * amplitude + 
                Math.cos(y * 0.15 + time * 0.8) * (amplitude * 0.6) +
                Math.sin((x + y) * 0.1 + time * 0.5) * (amplitude * 0.4);
      
      position.setZ(i, z);
    }
    position.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -1, 0]}>
      <planeGeometry args={[60, 60, 120, 120]} />
      <meshStandardMaterial 
        color="#001529" 
        wireframe 
        transparent 
        opacity={0.2} 
        emissive="#00f2ff"
        emissiveIntensity={0.5}
      />
    </mesh>
  );
};

const GlowOrb = () => {
  return (
    <mesh position={[0, 2, -10]}>
      <icosahedronGeometry args={[2, 15]} />
      <MeshDistortMaterial 
        color="#00f2ff" 
        emissive="#00f2ff" 
        emissiveIntensity={2} 
        speed={2} 
        distort={0.4} 
        radius={1}
      />
    </mesh>
  );
};

const Particles = ({ count = 400 }) => {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 50;
      p[i * 3 + 1] = (Math.random() - 0.5) * 50;
      p[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return p;
  }, [count]);

  const ref = useRef<THREE.Points>(null!);
  useFrame((state) => {
    ref.current.rotation.y += 0.001;
    ref.current.rotation.x += 0.0005;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length / 3}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#00f2ff" transparent opacity={0.4} sizeAttenuation />
    </points>
  );
};

interface OceanSceneProps {
  predictionValue?: number;
}

export const OceanScene = ({ predictionValue = 0 }: OceanSceneProps) => {
  // amplitude prop driven by latest prediction: 0.4 + value*0.25, capped 1.6
  const amplitude = Math.min(0.4 + predictionValue * 0.25, 1.6);

  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#050a0f] to-[#0a192f]">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 5, 20]} fov={50} />
        <fog attach="fog" args={["#050a0f", 10, 50]} />
        
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#00f2ff" />
        <pointLight position={[-10, 5, -5]} intensity={2} color="#00f2ff" />
        <pointLight position={[10, -5, 5]} intensity={1} color="#00d4ff" />

        <WavePlane amplitude={amplitude} />
        <GlowOrb />
        <Particles count={400} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
    </div>
  );
};
