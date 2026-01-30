import { useRef, useEffect, useCallback } from 'react';
import { useThree } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import {
  setPointerLocked,
  toggleCameraMode,
  setPlayerRotation,
} from '@/store/slices/world3DSlice';
import { Controls } from '../Scene';
import * as THREE from 'three';

const MOVE_SPEED = 5;
const SPRINT_MULTIPLIER = 1.8;
const MOUSE_SENSITIVITY = 0.002;
const MAX_PITCH = Math.PI / 2 - 0.1;

interface PlayerControlsOptions {
  onInteract?: () => void;
}

export function usePlayerControls(options: PlayerControlsOptions = {}) {
  const dispatch = useDispatch();
  const { gl } = useThree();

  const { isInteracting, isPointerLocked, cameraMode } = useSelector(
    (state: RootState) => state.world3D
  );

  const [, getKeys] = useKeyboardControls<Controls>();

  // Rotation state (yaw/pitch)
  const rotation = useRef({ yaw: 0, pitch: 0 });
  // Velocity for smooth movement
  const velocity = useRef(new THREE.Vector3());
  // Direction vectors
  const direction = useRef(new THREE.Vector3());
  const frontVector = useRef(new THREE.Vector3());
  const sideVector = useRef(new THREE.Vector3());

  // Handle pointer lock
  const requestPointerLock = useCallback(() => {
    if (!isInteracting) {
      gl.domElement.requestPointerLock();
    }
  }, [gl, isInteracting]);

  const exitPointerLock = useCallback(() => {
    document.exitPointerLock();
  }, []);

  // Pointer lock change handler
  useEffect(() => {
    const handlePointerLockChange = () => {
      const locked = document.pointerLockElement === gl.domElement;
      dispatch(setPointerLocked(locked));
    };

    document.addEventListener('pointerlockchange', handlePointerLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, [gl, dispatch]);

  // Mouse move handler for look controls
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked || isInteracting) return;

      rotation.current.yaw -= e.movementX * MOUSE_SENSITIVITY;
      rotation.current.pitch -= e.movementY * MOUSE_SENSITIVITY;

      // Clamp pitch to prevent flipping
      rotation.current.pitch = Math.max(
        -MAX_PITCH,
        Math.min(MAX_PITCH, rotation.current.pitch)
      );

      dispatch(setPlayerRotation([rotation.current.yaw, rotation.current.pitch]));
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isPointerLocked, isInteracting, dispatch]);

  // Click to request pointer lock
  useEffect(() => {
    const handleClick = () => {
      if (!isPointerLocked && !isInteracting) {
        requestPointerLock();
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => {
      gl.domElement.removeEventListener('click', handleClick);
    };
  }, [gl, isPointerLocked, isInteracting, requestPointerLock]);

  // Keyboard handlers for special keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // V key to toggle camera mode
      if (e.code === 'KeyV' && isPointerLocked && !isInteracting) {
        dispatch(toggleCameraMode());
      }

      // E key to interact
      if (e.code === 'KeyE' && isPointerLocked && !isInteracting) {
        options.onInteract?.();
      }

      // ESC is handled by pointer lock API
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPointerLocked, isInteracting, dispatch, options]);

  // Movement calculation (called from PlayerController's useFrame)
  const getMovement = useCallback(
    (_delta: number) => {
      if (isInteracting) {
        return { velocity: new THREE.Vector3(), rotation: rotation.current };
      }

      const keys = getKeys();

      // Calculate movement direction
      frontVector.current.set(0, 0, Number(keys.backward) - Number(keys.forward));
      sideVector.current.set(Number(keys.left) - Number(keys.right), 0, 0);

      direction.current
        .subVectors(frontVector.current, sideVector.current)
        .normalize()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation.current.yaw);

      // Apply speed
      const speed = keys.sprint ? MOVE_SPEED * SPRINT_MULTIPLIER : MOVE_SPEED;
      velocity.current.x = direction.current.x * speed;
      velocity.current.z = direction.current.z * speed;

      return {
        velocity: velocity.current.clone(),
        rotation: rotation.current,
      };
    },
    [getKeys, isInteracting]
  );

  return {
    getMovement,
    rotation: rotation.current,
    requestPointerLock,
    exitPointerLock,
    isPointerLocked,
    cameraMode,
  };
}
