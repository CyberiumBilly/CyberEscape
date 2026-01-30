import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import gameReducer from './slices/gameSlice';
import teamReducer from './slices/teamSlice';
import gamificationReducer from './slices/gamificationSlice';
import adminReducer from './slices/adminSlice';
import chatReducer from './slices/chatSlice';
import uiReducer from './slices/uiSlice';
import settingsReducer from './slices/settingsSlice';
import world3DReducer from './slices/world3DSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
    team: teamReducer,
    gamification: gamificationReducer,
    admin: adminReducer,
    chat: chatReducer,
    ui: uiReducer,
    settings: settingsReducer,
    world3D: world3DReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
