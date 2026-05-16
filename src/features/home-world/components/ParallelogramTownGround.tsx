import { Shape, Vector2 } from "three";

const halfWidth = 4.25;
const halfDepth = 3.35;

const groundShape = new Shape([
  new Vector2(0, -halfDepth),
  new Vector2(halfWidth, 0),
  new Vector2(0, halfDepth),
  new Vector2(-halfWidth, 0),
]);

type ParallelogramTownGroundProps = {
  color: string;
  y: number;
  thickness: number;
  roughness?: number;
  metalness?: number;
};

export function ParallelogramTownGround({ color, y, thickness, roughness = 0.86, metalness = 0 }: ParallelogramTownGroundProps) {
  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <extrudeGeometry args={[groundShape, { depth: thickness, bevelEnabled: false }]} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} />
    </mesh>
  );
}
