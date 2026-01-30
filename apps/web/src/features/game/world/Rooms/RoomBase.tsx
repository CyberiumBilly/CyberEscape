import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useMemo } from 'react';

interface WallProps {
  position: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  emissive?: string;
  emissiveIntensity?: number;
  opacity?: number;
}

export function Wall({
  position,
  size,
  rotation = [0, 0, 0],
  color = '#0a0a0a',
  emissive = '#000000',
  emissiveIntensity = 0,
  opacity = 1,
}: WallProps) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          transparent={opacity < 1}
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>
    </RigidBody>
  );
}

interface RoomBaseProps {
  width?: number;
  depth?: number;
  height?: number;
  wallThickness?: number;
  wallColor?: string;
  accentColor?: string;
  children?: React.ReactNode;
}

export function RoomBase({
  width = 20,
  depth = 20,
  height = 5,
  wallThickness = 0.3,
  wallColor = '#0a0a0a',
  accentColor = '#00d4ff',
  children,
}: RoomBaseProps) {
  const halfWidth = width / 2;
  const halfDepth = depth / 2;
  const halfHeight = height / 2;

  // Create accent strips for walls
  const AccentStrip = useMemo(
    () =>
      function AccentStripComponent({
        position,
        size,
        rotation = [0, 0, 0] as [number, number, number],
      }: {
        position: [number, number, number];
        size: [number, number, number];
        rotation?: [number, number, number];
      }) {
        return (
          <mesh position={position} rotation={rotation}>
            <boxGeometry args={size} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      },
    [accentColor]
  );

  return (
    <group>
      {/* Back wall (negative Z) */}
      <Wall
        position={[0, halfHeight, -halfDepth]}
        size={[width, height, wallThickness]}
        color={wallColor}
      />
      <AccentStrip
        position={[0, 0.1, -halfDepth + wallThickness / 2 + 0.01]}
        size={[width - 1, 0.05, 0.02]}
      />

      {/* Front wall (positive Z) */}
      <Wall
        position={[0, halfHeight, halfDepth]}
        size={[width, height, wallThickness]}
        color={wallColor}
      />
      <AccentStrip
        position={[0, 0.1, halfDepth - wallThickness / 2 - 0.01]}
        size={[width - 1, 0.05, 0.02]}
      />

      {/* Left wall (negative X) */}
      <Wall
        position={[-halfWidth, halfHeight, 0]}
        size={[wallThickness, height, depth]}
        color={wallColor}
      />
      <AccentStrip
        position={[-halfWidth + wallThickness / 2 + 0.01, 0.1, 0]}
        size={[0.02, 0.05, depth - 1]}
      />

      {/* Right wall (positive X) */}
      <Wall
        position={[halfWidth, halfHeight, 0]}
        size={[wallThickness, height, depth]}
        color={wallColor}
      />
      <AccentStrip
        position={[halfWidth - wallThickness / 2 - 0.01, 0.1, 0]}
        size={[0.02, 0.05, depth - 1]}
      />

      {/* Corner accents */}
      {[
        [-halfWidth + 0.5, -halfDepth + 0.5],
        [halfWidth - 0.5, -halfDepth + 0.5],
        [-halfWidth + 0.5, halfDepth - 0.5],
        [halfWidth - 0.5, halfDepth - 0.5],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, halfHeight, z]}>
          <boxGeometry args={[0.1, height - 0.5, 0.1]} />
          <meshStandardMaterial
            color={accentColor}
            emissive={accentColor}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}

      {/* Children (room contents) */}
      {children}
    </group>
  );
}
