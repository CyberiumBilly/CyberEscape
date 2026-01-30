import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Stats, KeyboardControls, KeyboardControlsEntry } from '@react-three/drei';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { getRoomThemeByType, type Room3DColors } from '@/lib/roomThemes';
import { Lighting } from './Environment/Lighting';
import { FloorGrid } from './Environment/FloorGrid';
import { CyberSkybox } from './Environment/CyberSkybox';
import { PlayerController } from './Player/PlayerController';

export enum Controls {
  forward = 'forward',
  backward = 'backward',
  left = 'left',
  right = 'right',
  jump = 'jump',
  sprint = 'sprint',
  interact = 'interact',
  toggleCamera = 'toggleCamera',
}

const keyboardMap: KeyboardControlsEntry<Controls>[] = [
  { name: Controls.forward, keys: ['KeyW', 'ArrowUp'] },
  { name: Controls.backward, keys: ['KeyS', 'ArrowDown'] },
  { name: Controls.left, keys: ['KeyA', 'ArrowLeft'] },
  { name: Controls.right, keys: ['KeyD', 'ArrowRight'] },
  { name: Controls.jump, keys: ['Space'] },
  { name: Controls.sprint, keys: ['ShiftLeft', 'ShiftRight'] },
  { name: Controls.interact, keys: ['KeyE'] },
  { name: Controls.toggleCamera, keys: ['KeyV'] },
];

interface SceneProps {
  roomType?: string;
  children?: React.ReactNode;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#00d4ff" wireframe />
    </mesh>
  );
}

export function Scene({ roomType = 'default', children }: SceneProps) {
  const { quality, showFPS } = useSelector((state: RootState) => state.world3D);
  const theme = getRoomThemeByType(roomType);
  const colors = theme.colors3D;

  const pixelRatio = quality === 'low' ? 0.75 : quality === 'medium' ? 1 : window.devicePixelRatio;
  const shadows = quality !== 'low';

  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas
        shadows={shadows}
        dpr={pixelRatio}
        camera={{ fov: 75, near: 0.1, far: 1000 }}
        style={{ background: colors.fog }}
        gl={{
          antialias: quality !== 'low',
          powerPreference: quality === 'low' ? 'low-power' : 'high-performance',
        }}
      >
        {showFPS && <Stats />}

        <fog attach="fog" args={[colors.fog, 10, 50]} />

        <Suspense fallback={<LoadingFallback />}>
          <Physics gravity={[0, -20, 0]} debug={false}>
            <Lighting colors={colors} quality={quality} />
            <CyberSkybox colors={colors} />
            <FloorGrid colors={colors} size={100} />

            <PlayerController />

            {children}
          </Physics>
        </Suspense>
      </Canvas>
    </KeyboardControls>
  );
}

export type { Room3DColors };
