import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface FirstPersonCameraProps {
  yaw: number;
  pitch: number;
  position: THREE.Vector3;
  active: boolean;
}

export function FirstPersonCamera({ yaw, pitch, position, active }: FirstPersonCameraProps) {
  const { camera } = useThree();
  const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'));

  useFrame(() => {
    if (!active) return;

    // Update camera position to player position (eye height)
    camera.position.copy(position);

    // Update camera rotation
    euler.current.set(pitch, yaw, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler.current);
  });

  return null;
}
