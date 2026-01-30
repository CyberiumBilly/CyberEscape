import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { setCameraMode, toggleCameraMode, type CameraMode } from '@/store/slices/world3DSlice';

export function useCameraMode() {
  const dispatch = useDispatch();
  const { cameraMode, isInteracting } = useSelector((state: RootState) => state.world3D);

  const setMode = useCallback(
    (mode: CameraMode) => {
      if (!isInteracting) {
        dispatch(setCameraMode(mode));
      }
    },
    [dispatch, isInteracting]
  );

  const toggle = useCallback(() => {
    if (!isInteracting) {
      dispatch(toggleCameraMode());
    }
  }, [dispatch, isInteracting]);

  return {
    cameraMode,
    setMode,
    toggle,
    isFirstPerson: cameraMode === 'first-person',
    isThirdPerson: cameraMode === 'third-person',
  };
}
