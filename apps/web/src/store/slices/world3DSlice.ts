import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CameraMode = 'first-person' | 'third-person';
export type Quality3D = 'low' | 'medium' | 'high';

interface World3DState {
  // Camera
  cameraMode: CameraMode;

  // Interaction
  interactionTarget: string | null;
  isInteracting: boolean;
  nearbyInteractables: string[];

  // Player
  playerPosition: [number, number, number];
  playerRotation: [number, number];
  isPointerLocked: boolean;

  // Settings
  quality: Quality3D;
  showFPS: boolean;

  // UI
  showCrosshair: boolean;
  showInteractionPrompt: boolean;
  interactionPromptText: string;
}

const STORAGE_KEY = 'cyberescape-world3d-settings';

function loadSettings(): Partial<Pick<World3DState, 'cameraMode' | 'quality' | 'showFPS'>> {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {};
}

function saveSettings(state: World3DState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      cameraMode: state.cameraMode,
      quality: state.quality,
      showFPS: state.showFPS,
    }));
  } catch {}
}

const storedSettings = loadSettings();

const initialState: World3DState = {
  cameraMode: storedSettings.cameraMode ?? 'first-person',
  interactionTarget: null,
  isInteracting: false,
  nearbyInteractables: [],
  playerPosition: [0, 1.7, 0],
  playerRotation: [0, 0],
  isPointerLocked: false,
  quality: storedSettings.quality ?? 'medium',
  showFPS: storedSettings.showFPS ?? false,
  showCrosshair: true,
  showInteractionPrompt: false,
  interactionPromptText: 'Press E to interact',
};

const world3DSlice = createSlice({
  name: 'world3D',
  initialState,
  reducers: {
    setCameraMode(state, action: PayloadAction<CameraMode>) {
      state.cameraMode = action.payload;
      saveSettings(state);
    },
    toggleCameraMode(state) {
      state.cameraMode = state.cameraMode === 'first-person' ? 'third-person' : 'first-person';
      saveSettings(state);
    },

    setInteractionTarget(state, action: PayloadAction<string | null>) {
      state.interactionTarget = action.payload;
      state.showInteractionPrompt = action.payload !== null && !state.isInteracting;
    },

    startInteraction(state, action: PayloadAction<string>) {
      state.isInteracting = true;
      state.interactionTarget = action.payload;
      state.showInteractionPrompt = false;
      state.showCrosshair = false;
    },

    endInteraction(state) {
      state.isInteracting = false;
      state.showCrosshair = true;
      state.showInteractionPrompt = state.interactionTarget !== null;
    },

    setNearbyInteractables(state, action: PayloadAction<string[]>) {
      state.nearbyInteractables = action.payload;
    },

    setPlayerPosition(state, action: PayloadAction<[number, number, number]>) {
      state.playerPosition = action.payload;
    },

    setPlayerRotation(state, action: PayloadAction<[number, number]>) {
      state.playerRotation = action.payload;
    },

    setPointerLocked(state, action: PayloadAction<boolean>) {
      state.isPointerLocked = action.payload;
    },

    setQuality(state, action: PayloadAction<Quality3D>) {
      state.quality = action.payload;
      saveSettings(state);
    },

    setShowFPS(state, action: PayloadAction<boolean>) {
      state.showFPS = action.payload;
      saveSettings(state);
    },

    setInteractionPromptText(state, action: PayloadAction<string>) {
      state.interactionPromptText = action.payload;
    },

    reset3DWorld() {
      return {
        ...initialState,
        cameraMode: storedSettings.cameraMode ?? 'first-person',
        quality: storedSettings.quality ?? 'medium',
        showFPS: storedSettings.showFPS ?? false,
      };
    },
  },
});

export const {
  setCameraMode,
  toggleCameraMode,
  setInteractionTarget,
  startInteraction,
  endInteraction,
  setNearbyInteractables,
  setPlayerPosition,
  setPlayerRotation,
  setPointerLocked,
  setQuality,
  setShowFPS,
  setInteractionPromptText,
  reset3DWorld,
} = world3DSlice.actions;

export default world3DSlice.reducer;
