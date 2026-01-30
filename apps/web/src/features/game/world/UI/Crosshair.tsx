import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

export function Crosshair() {
  const { showCrosshair, isPointerLocked, interactionTarget } = useSelector(
    (state: RootState) => state.world3D
  );

  if (!showCrosshair || !isPointerLocked) return null;

  const hasTarget = interactionTarget !== null;

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div
        className={`
          w-6 h-6 flex items-center justify-center
          transition-all duration-150
          ${hasTarget ? 'scale-125' : 'scale-100'}
        `}
      >
        {/* Crosshair lines */}
        <div
          className={`
            absolute w-0.5 h-3
            ${hasTarget ? 'bg-cyber-primary' : 'bg-white/70'}
            transition-colors duration-150
          `}
        />
        <div
          className={`
            absolute w-3 h-0.5
            ${hasTarget ? 'bg-cyber-primary' : 'bg-white/70'}
            transition-colors duration-150
          `}
        />

        {/* Center dot */}
        <div
          className={`
            absolute w-1 h-1 rounded-full
            ${hasTarget ? 'bg-cyber-primary shadow-[0_0_8px_rgba(0,212,255,0.8)]' : 'bg-white/50'}
            transition-all duration-150
          `}
        />

        {/* Interaction indicator ring */}
        {hasTarget && (
          <div className="absolute w-8 h-8 border border-cyber-primary rounded-full animate-ping opacity-50" />
        )}
      </div>
    </div>
  );
}
