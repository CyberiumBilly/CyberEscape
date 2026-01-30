import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { SpotLight } from 'three';
import type { Room3DColors } from '@/lib/roomThemes';
import type { Quality3D } from '@/store/slices/world3DSlice';

interface LightingProps {
  colors: Room3DColors;
  quality: Quality3D;
}

export function Lighting({ colors, quality }: LightingProps) {
  const spotLightRef = useRef<SpotLight>(null);

  useFrame(({ clock }) => {
    if (spotLightRef.current && quality !== 'low') {
      const intensity = 0.8 + Math.sin(clock.getElapsedTime() * 0.5) * 0.1;
      spotLightRef.current.intensity = intensity;
    }
  });

  return (
    <>
      {/* Ambient light for base illumination */}
      <ambientLight color={colors.ambient} intensity={0.3} />

      {/* Main directional light */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={0.5}
        color={colors.secondary}
        castShadow={quality !== 'low'}
        shadow-mapSize-width={quality === 'high' ? 2048 : 1024}
        shadow-mapSize-height={quality === 'high' ? 2048 : 1024}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />

      {/* Primary colored spotlight */}
      <spotLight
        ref={spotLightRef}
        position={[0, 15, 0]}
        angle={0.6}
        penumbra={0.5}
        intensity={0.8}
        color={colors.primary}
        castShadow={quality === 'high'}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Fill lights for atmosphere */}
      <pointLight
        position={[-10, 5, -10]}
        intensity={0.3}
        color={colors.secondary}
        distance={30}
        decay={2}
      />
      <pointLight
        position={[10, 5, 10]}
        intensity={0.3}
        color={colors.primary}
        distance={30}
        decay={2}
      />

      {/* Hemisphere light for subtle sky/ground color variation */}
      <hemisphereLight
        color={colors.primary}
        groundColor={colors.ambient}
        intensity={0.2}
      />
    </>
  );
}
