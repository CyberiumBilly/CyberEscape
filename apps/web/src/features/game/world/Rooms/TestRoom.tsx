import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { RoomBase } from './RoomBase';

function FloatingCube({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];
  const phase = Math.random() * Math.PI * 2;

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.3;
      meshRef.current.position.y = initialY + Math.sin(clock.getElapsedTime() + phase) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
    </mesh>
  );
}

function ServerRack({ position }: { position: [number, number, number] }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <group>
        {/* Main rack body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 3, 0.8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.5} />
        </mesh>

        {/* Server slots */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={i} position={[0, 1.2 - i * 0.35, 0.35]} castShadow>
            <boxGeometry args={[1.3, 0.25, 0.1]} />
            <meshStandardMaterial color="#0a0a0a" />
          </mesh>
        ))}

        {/* LED lights */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh key={`led-${i}`} position={[-0.55, 1.2 - i * 0.35, 0.41]}>
            <boxGeometry args={[0.05, 0.05, 0.02]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#00ff00' : '#00d4ff'}
              emissive={i % 3 === 0 ? '#00ff00' : '#00d4ff'}
              emissiveIntensity={1}
            />
          </mesh>
        ))}
      </group>
    </RigidBody>
  );
}

function Terminal({ position }: { position: [number, number, number] }) {
  const screenRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (screenRef.current) {
      const material = screenRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.3 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
    }
  });

  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <group>
        {/* Desk */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.05, 0.8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.3} roughness={0.7} />
        </mesh>

        {/* Monitor stand */}
        <mesh position={[0, 0.55, -0.2]} castShadow>
          <boxGeometry args={[0.1, 0.3, 0.1]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>

        {/* Monitor */}
        <mesh position={[0, 0.9, -0.25]} castShadow>
          <boxGeometry args={[0.8, 0.5, 0.05]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>

        {/* Screen */}
        <mesh ref={screenRef} position={[0, 0.9, -0.22]}>
          <planeGeometry args={[0.7, 0.4]} />
          <meshStandardMaterial color="#001a22" emissive="#00d4ff" emissiveIntensity={0.3} />
        </mesh>

        {/* Keyboard */}
        <mesh position={[0, 0.44, 0.15]} castShadow>
          <boxGeometry args={[0.5, 0.02, 0.2]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
      </group>
    </RigidBody>
  );
}

function Pillar({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 4, 0.5]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      {/* Accent rings */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, i - 0.5, 0]}>
          <boxGeometry args={[0.55, 0.1, 0.55]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
      ))}
    </RigidBody>
  );
}

export function TestRoom() {
  return (
    <RoomBase width={24} depth={24} height={6} accentColor="#00d4ff">
      {/* Server racks along back wall */}
      <ServerRack position={[-6, 1.5, -10]} />
      <ServerRack position={[-3, 1.5, -10]} />
      <ServerRack position={[3, 1.5, -10]} />
      <ServerRack position={[6, 1.5, -10]} />

      {/* Terminals */}
      <Terminal position={[-5, 0, 0]} />
      <Terminal position={[5, 0, 0]} />
      <Terminal position={[0, 0, 5]} />

      {/* Decorative pillars */}
      <Pillar position={[-8, 2, -8]} color="#00d4ff" />
      <Pillar position={[8, 2, -8]} color="#00d4ff" />
      <Pillar position={[-8, 2, 8]} color="#00ff88" />
      <Pillar position={[8, 2, 8]} color="#00ff88" />

      {/* Floating cubes */}
      <FloatingCube position={[-3, 2.5, -3]} color="#00d4ff" />
      <FloatingCube position={[3, 3, 3]} color="#ff3355" />
      <FloatingCube position={[0, 2.8, -5]} color="#00ff88" />
      <FloatingCube position={[-5, 2.2, 5]} color="#a855f7" />
      <FloatingCube position={[5, 3.2, -5]} color="#ffaa00" />

      {/* Central platform */}
      <RigidBody type="fixed" colliders="cuboid" position={[0, 0.15, 0]}>
        <mesh receiveShadow>
          <cylinderGeometry args={[3, 3.2, 0.3, 32]} />
          <meshStandardMaterial color="#0f0f0f" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* Platform accent ring */}
        <mesh position={[0, 0.16, 0]}>
          <ringGeometry args={[2.8, 3, 64]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00d4ff"
            emissiveIntensity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      </RigidBody>

      {/* Ambient floating particles effect - simple version */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const radius = 5 + Math.random() * 5;
        const height = 1 + Math.random() * 3;
        return (
          <mesh key={`particle-${i}`} position={[Math.cos(angle) * radius, height, Math.sin(angle) * radius]}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color="#00d4ff" transparent opacity={0.5} />
          </mesh>
        );
      })}
    </RoomBase>
  );
}
