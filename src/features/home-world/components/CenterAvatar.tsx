import { Float } from "@react-three/drei";
import { ConnieAvatar } from "./ConnieAvatar";

export function CenterAvatar() {
  return (
    <Float speed={1.6} rotationIntensity={0.08} floatIntensity={0.12}>
      <group>
        <ConnieAvatar />
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <ringGeometry args={[0.55, 0.62, 48]} />
          <meshBasicMaterial color="#00f5d4" transparent opacity={0.65} />
        </mesh>
      </group>
    </Float>
  );
}
