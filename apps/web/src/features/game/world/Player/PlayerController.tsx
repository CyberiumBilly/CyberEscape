import { useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider, type RapierRigidBody } from '@react-three/rapier';
import { useDispatch, useSelector } from 'react-redux';
import * as THREE from 'three';
import type { RootState } from '@/store/store';
import { setPlayerPosition, startInteraction } from '@/store/slices/world3DSlice';
import { usePlayerControls } from './usePlayerControls';
import { FirstPersonCamera } from './FirstPersonCamera';
import { ThirdPersonCamera } from './ThirdPersonCamera';

const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.3;

export function PlayerController() {
  const dispatch = useDispatch();
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const positionRef = useRef(new THREE.Vector3(0, PLAYER_HEIGHT, 0));

  const { interactionTarget, cameraMode, isInteracting } = useSelector(
    (state: RootState) => state.world3D
  );

  const handleInteract = useCallback(() => {
    if (interactionTarget) {
      dispatch(startInteraction(interactionTarget));
    }
  }, [dispatch, interactionTarget]);

  const { getMovement, rotation } = usePlayerControls({
    onInteract: handleInteract,
  });

  useFrame((_, delta) => {
    if (!rigidBodyRef.current) return;

    // Get current position
    const position = rigidBodyRef.current.translation();
    positionRef.current.set(position.x, position.y + PLAYER_HEIGHT / 2, position.z);

    // Update Redux with player position (throttled)
    dispatch(setPlayerPosition([position.x, position.y, position.z]));

    // Get movement from controls
    const { velocity } = getMovement(delta);

    // Apply velocity to rigid body
    const currentVel = rigidBodyRef.current.linvel();
    rigidBodyRef.current.setLinvel(
      { x: velocity.x, y: currentVel.y, z: velocity.z },
      true
    );
  });

  return (
    <>
      <RigidBody
        ref={rigidBodyRef}
        position={[0, 2, 5]}
        enabledRotations={[false, false, false]}
        linearDamping={0.5}
        mass={1}
        type="dynamic"
        colliders={false}
        lockRotations
      >
        <CapsuleCollider args={[PLAYER_HEIGHT / 2 - PLAYER_RADIUS, PLAYER_RADIUS]} />

        {/* Player mesh (visible in third person) */}
        {cameraMode === 'third-person' && (
          <mesh castShadow>
            <capsuleGeometry args={[PLAYER_RADIUS, PLAYER_HEIGHT - PLAYER_RADIUS * 2, 8, 16]} />
            <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.2} />
          </mesh>
        )}
      </RigidBody>

      {/* Camera controllers */}
      <FirstPersonCamera
        yaw={rotation.yaw}
        pitch={rotation.pitch}
        position={positionRef.current}
        active={cameraMode === 'first-person' && !isInteracting}
      />
      <ThirdPersonCamera
        yaw={rotation.yaw}
        pitch={rotation.pitch}
        position={positionRef.current}
        active={cameraMode === 'third-person' && !isInteracting}
      />
    </>
  );
}
