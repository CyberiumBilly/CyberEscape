import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface ThirdPersonCameraProps {
  yaw: number;
  pitch: number;
  position: THREE.Vector3;
  active: boolean;
  distance?: number;
  height?: number;
}

export function ThirdPersonCamera({
  yaw,
  pitch,
  position,
  active,
  distance = 5,
  height = 2,
}: ThirdPersonCameraProps) {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3());
  const currentPosition = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!active) return;

    // Calculate camera offset based on yaw and pitch
    const offsetX = Math.sin(yaw) * Math.cos(pitch) * distance;
    const offsetY = Math.sin(pitch) * distance + height;
    const offsetZ = Math.cos(yaw) * Math.cos(pitch) * distance;

    // Target position is behind and above the player
    targetPosition.current.set(
      position.x + offsetX,
      position.y + offsetY,
      position.z + offsetZ
    );

    // Smooth camera movement
    currentPosition.current.lerp(targetPosition.current, 1 - Math.exp(-10 * delta));
    camera.position.copy(currentPosition.current);

    // Look at player
    camera.lookAt(position.x, position.y, position.z);
  });

  return null;
}
