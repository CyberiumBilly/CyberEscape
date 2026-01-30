import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Room3DColors } from '@/lib/roomThemes';

interface CyberSkyboxProps {
  colors: Room3DColors;
}

export function CyberSkybox({ colors: themeColors }: CyberSkyboxProps) {
  const particlesRef = useRef<THREE.Points>(null);

  // Create starfield particles
  const [positions, particleColors] = useMemo(() => {
    const count = 500;
    const positions = new Float32Array(count * 3);
    const vertexColors = new Float32Array(count * 3);
    const primaryColor = new THREE.Color(themeColors.primary);
    const secondaryColor = new THREE.Color(themeColors.secondary);

    for (let i = 0; i < count; i++) {
      // Distribute particles in a sphere around the scene
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 40 + Math.random() * 20;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(radius * Math.cos(phi)) + 5; // Keep above ground
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      // Mix between primary and secondary colors
      const mixFactor = Math.random();
      const color = primaryColor.clone().lerp(secondaryColor, mixFactor);
      vertexColors[i * 3] = color.r;
      vertexColors[i * 3 + 1] = color.g;
      vertexColors[i * 3 + 2] = color.b;
    }

    return [positions, vertexColors];
  }, [themeColors.primary, themeColors.secondary]);

  // Slowly rotate the starfield
  useFrame(({ clock }) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = clock.getElapsedTime() * 0.01;
    }
  });

  return (
    <group>
      {/* Dark dome for the sky */}
      <mesh>
        <sphereGeometry args={[80, 32, 32]} />
        <meshBasicMaterial color={themeColors.fog} side={THREE.BackSide} />
      </mesh>

      {/* Particle starfield */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleColors.length / 3}
            array={particleColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.5}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Horizon glow */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[30, 80, 64]} />
        <meshBasicMaterial
          color={themeColors.primary}
          transparent
          opacity={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
