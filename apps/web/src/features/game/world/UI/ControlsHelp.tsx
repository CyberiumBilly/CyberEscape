import { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';

export function ControlsHelp() {
  const [collapsed, setCollapsed] = useState(false);
  const { isPointerLocked, cameraMode } = useSelector((state: RootState) => state.world3D);

  if (!isPointerLocked) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 pointer-events-none">
        <div className="text-center">
          <div className="text-2xl text-cyber-primary font-bold mb-4">Click to Play</div>
          <div className="text-cyber-muted text-sm">Click anywhere to start exploring</div>
        </div>
      </div>
    );
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed top-4 left-4 z-50 p-2 rounded bg-cyber-surface/80 border border-cyber-border hover:border-cyber-primary transition-colors"
      >
        <span className="text-cyber-muted text-xs">?</span>
      </button>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50 p-3 rounded-lg bg-cyber-surface/80 backdrop-blur-sm border border-cyber-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-cyber-primary text-xs font-bold">Controls</span>
        <button
          onClick={() => setCollapsed(true)}
          className="text-cyber-muted hover:text-cyber-primary text-xs ml-4"
        >
          ×
        </button>
      </div>
      <div className="space-y-1 text-xs text-cyber-muted">
        <div className="flex justify-between gap-4">
          <span>Move</span>
          <span className="font-mono text-cyber-text">WASD</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Look</span>
          <span className="font-mono text-cyber-text">Mouse</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Sprint</span>
          <span className="font-mono text-cyber-text">Shift</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Interact</span>
          <span className="font-mono text-cyber-text">E</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Camera</span>
          <span className="font-mono text-cyber-text">V</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Menu</span>
          <span className="font-mono text-cyber-text">ESC</span>
        </div>
        <div className="mt-2 pt-2 border-t border-cyber-border">
          <span className="text-cyber-primary">
            {cameraMode === 'first-person' ? '👁 First Person' : '📷 Third Person'}
          </span>
        </div>
      </div>
    </div>
  );
}
