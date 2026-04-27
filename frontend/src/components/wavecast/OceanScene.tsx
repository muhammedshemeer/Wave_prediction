import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, MeshDistortMaterial } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";

/** Animated wave plane built from a displaced PlaneGeometry. */
function WavePlane({ amplitude = 0.6 }: { amplitude?: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const geomRef = useRef<THREE.PlaneGeometry>(null!);
  const original = useRef<Float32Array | null>(null);

  useFrame(({ clock }) => {
    const geom = geomRef.current;
    if (!geom) return;
    const pos = geom.attributes.position as THREE.BufferAttribute;
    if (!original.current) {
      original.current = new Float32Array(pos.array.length);
      original.current.set(pos.array as Float32Array);
    }
    const t = clock.getElapsedTime();
    const arr = pos.array as Float32Array;
    const base = original.current;
    for (let i = 0; i < arr.length; i += 3) {
      const x = base[i];
      const y = base[i + 1];
      const wave =
        Math.sin(x * 0.6 + t * 0.9) * 0.35 +
        Math.cos(y * 0.5 + t * 0.7) * 0.3 +
        Math.sin((x + y) * 0.25 + t * 0.4) * 0.4;
      arr[i + 2] = wave * amplitude;
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2.2, 0, 0]} position={[0, -1.6, 0]}>
      <planeGeometry ref={geomRef} args={[40, 40, 120, 120]} />
      <meshStandardMaterial
        color={new THREE.Color("#0a3a55")}
        emissive={new THREE.Color("#0e6e8a")}
        emissiveIntensity={0.25}
        metalness={0.6}
        roughness={0.25}
        wireframe={false}
      />
    </mesh>
  );
}

function GlowOrb() {
  return (
    <Float speed={1.2} rotationIntensity={0.6} floatIntensity={1.4}>
      <mesh position={[0, 1.6, 0]}>
        <icosahedronGeometry args={[1.1, 6]} />
        <MeshDistortMaterial
          color="#22d3ee"
          emissive="#0891b2"
          emissiveIntensity={0.6}
          roughness={0.15}
          metalness={0.4}
          distort={0.45}
          speed={1.6}
        />
      </mesh>
    </Float>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null!);
  const { positions } = useMemo(() => {
    const count = 400;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 8 - 1;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return { positions };
  }, []);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.02;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#a5f3fc" transparent opacity={0.7} />
    </points>
  );
}

export default function OceanScene({ amplitude = 0.6 }: { amplitude?: number }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 2.8, 7], fov: 55 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: "absolute", inset: 0 }}
    >
      <Suspense fallback={null}>
        <color attach="background" args={["#04111f"]} />
        <fog attach="fog" args={["#04111f", 8, 28]} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[5, 8, 4]} intensity={1.2} color="#7dd3fc" />
        <pointLight position={[-6, 3, -2]} intensity={1.5} color="#22d3ee" />
        <pointLight position={[6, 2, 4]} intensity={1.2} color="#14b8a6" />
        <WavePlane amplitude={amplitude} />
        <GlowOrb />
        <Particles />
        <Environment preset="night" />
      </Suspense>
    </Canvas>
  );
}
