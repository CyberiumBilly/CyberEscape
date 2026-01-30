import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import type { Room3DColors } from '@/lib/roomThemes';

interface FloorGridProps {
  colors: Room3DColors;
  size?: number;
  divisions?: number;
}

export function FloorGrid({ colors, size = 100, divisions = 50 }: FloorGridProps) {
  const gridRef = useRef<THREE.LineSegments>(null);

  const gridMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      color: colors.floor,
      transparent: true,
      opacity: 0.3,
    });
  }, [colors.floor]);

  const gridGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const vertices: number[] = [];
    const halfSize = size / 2;
    const step = size / divisions;

    for (let i = 0; i <= divisions; i++) {
      const pos = -halfSize + i * step;
      // Lines along X axis
      vertices.push(-halfSize, 0, pos, halfSize, 0, pos);
      // Lines along Z axis
      vertices.push(pos, 0, -halfSize, pos, 0, halfSize);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    return geometry;
  }, [size, divisions]);

  // Subtle pulse animation
  useFrame(({ clock }) => {
    if (gridRef.current) {
      const material = gridRef.current.material as THREE.LineBasicMaterial;
      material.opacity = 0.2 + Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <group>
      {/* Visual grid */}
      <lineSegments
        ref={gridRef}
        geometry={gridGeometry}
        material={gridMaterial}
        position={[0, 0.01, 0]}
      />

      {/* Floor plane with subtle glow effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          color="#0a0a0a"
          roughness={0.9}
          metalness={0.1}
          envMapIntensity={0.1}
        />
      </mesh>

      {/* Physics collider for the floor */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[0, -0.5, 0]}>
          <boxGeometry args={[size, 1, size]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </RigidBody>
    </group>
  );
}
