import { Float } from "@react-three/drei";

export function CenterAvatar() {
  return (
    <Float speed={1.6} rotationIntensity={0.08} floatIntensity={0.12}>
      <group position={[0, 0.1, 0]}>
        <mesh position={[0, 0.95, 0]} castShadow>
          <sphereGeometry args={[0.28, 24, 24]} />
          <meshStandardMaterial color="#f7c6a3" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0.45, 0]} castShadow>
          <capsuleGeometry args={[0.25, 0.65, 8, 16]} />
          <meshStandardMaterial color="#18181b" roughness={0.55} />
        </mesh>
        <mesh position={[0, 1.17, -0.03]} castShadow>
          <sphereGeometry args={[0.31, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
          <meshStandardMaterial color="#111827" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[0.55, 0.62, 48]} />
          <meshBasicMaterial color="#00f5d4" transparent opacity={0.65} />
        </mesh>
      </group>
    </Float>
  );
}
