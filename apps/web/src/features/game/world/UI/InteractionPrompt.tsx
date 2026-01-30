import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

export function InteractionPrompt() {
  const { showInteractionPrompt, interactionPromptText, isPointerLocked } = useSelector(
    (state: RootState) => state.world3D
  );

  if (!showInteractionPrompt || !isPointerLocked) return null;

  return (
    <div className="fixed inset-x-0 bottom-32 pointer-events-none flex items-center justify-center z-50">
      <div
        className="
          px-4 py-2 rounded-lg
          bg-cyber-surface/80 backdrop-blur-sm
          border border-cyber-primary/50
          shadow-[0_0_20px_rgba(0,212,255,0.2)]
          animate-pulse
        "
      >
        <span className="text-cyber-primary font-mono text-sm">
          <span className="inline-block w-6 h-6 mr-2 rounded border border-cyber-primary/50 text-center leading-6 text-xs">
            E
          </span>
          {interactionPromptText}
        </span>
      </div>
    </div>
  );
}
