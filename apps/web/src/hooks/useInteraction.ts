import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import {
  setInteractionTarget,
  startInteraction,
  endInteraction,
  setInteractionPromptText,
} from '@/store/slices/world3DSlice';

export function useInteraction() {
  const dispatch = useDispatch();
  const { interactionTarget, isInteracting, nearbyInteractables } = useSelector(
    (state: RootState) => state.world3D
  );

  const setTarget = useCallback(
    (targetId: string | null, promptText?: string) => {
      dispatch(setInteractionTarget(targetId));
      if (promptText) {
        dispatch(setInteractionPromptText(promptText));
      }
    },
    [dispatch]
  );

  const interact = useCallback(
    (targetId: string) => {
      dispatch(startInteraction(targetId));
    },
    [dispatch]
  );

  const stopInteracting = useCallback(() => {
    dispatch(endInteraction());
  }, [dispatch]);

  return {
    interactionTarget,
    isInteracting,
    nearbyInteractables,
    setTarget,
    interact,
    stopInteracting,
  };
}
