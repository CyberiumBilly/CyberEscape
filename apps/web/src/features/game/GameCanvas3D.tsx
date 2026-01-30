import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import type { RootState } from '@/store/store';
import { reset3DWorld } from '@/store/slices/world3DSlice';
import { Scene } from './world/Scene';
import { Crosshair, InteractionPrompt, ControlsHelp } from './world/UI';
import { TestRoom } from './world/Rooms/TestRoom';

export function GameCanvas3D() {
  const dispatch = useDispatch();
  const { roomId } = useParams<{ roomId: string }>();
  const { roomType } = useSelector((state: RootState) => state.game);

  // Reset 3D world state on mount
  useEffect(() => {
    dispatch(reset3DWorld());
  }, [dispatch]);

  // Determine which room component to render
  const roomComponent = roomId === 'test' ? <TestRoom /> : <TestRoom />;

  return (
    <div className="w-full h-screen relative overflow-hidden bg-cyber-bg">
      {/* 3D Canvas */}
      <Scene roomType={roomType || 'default'}>
        {roomComponent}
      </Scene>

      {/* UI Overlays */}
      <Crosshair />
      <InteractionPrompt />
      <ControlsHelp />

      {/* Room info */}
      <div className="fixed top-4 right-4 z-50 p-3 rounded-lg bg-cyber-surface/80 backdrop-blur-sm border border-cyber-border">
        <div className="text-cyber-primary text-sm font-bold">
          {roomId === 'test' ? 'Test Room' : `Room: ${roomId}`}
        </div>
        <div className="text-cyber-muted text-xs mt-1">3D Mode</div>
      </div>
    </div>
  );
}

export default GameCanvas3D;
