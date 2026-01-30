import type { AmbientType } from '@/lib/audio/AudioManager';

export interface Room3DColors {
  primary: string;       // Hex color for main lights/emissives
  secondary: string;     // Hex color for accent lights
  ambient: string;       // Hex color for ambient light
  fog: string;           // Hex color for fog/atmosphere
  floor: string;         // Hex color for floor grid lines
}

export interface RoomTheme {
  accentColor: string;
  bgGradient: string;
  borderGlow: string;
  particleColor: string;
  ambientSound: AmbientType;
  colors3D: Room3DColors;
}

// Map room types/names to visual themes
const roomThemes: Record<string, RoomTheme> = {
  // Password/Authentication themed rooms
  'password-auth': {
    accentColor: 'cyber-primary',
    bgGradient: 'from-cyber-bg via-cyber-surface to-cyber-bg',
    borderGlow: 'shadow-[0_0_20px_rgba(0,212,255,0.3)]',
    particleColor: 'cyber-primary',
    ambientSound: 'terminal-hum',
    colors3D: {
      primary: '#00d4ff',
      secondary: '#0088aa',
      ambient: '#001a22',
      fog: '#000a0f',
      floor: '#00d4ff',
    },
  },

  // Phishing/Email themed rooms
  'phishing': {
    accentColor: 'cyber-warning',
    bgGradient: 'from-cyber-bg via-amber-950/10 to-cyber-bg',
    borderGlow: 'shadow-[0_0_20px_rgba(255,170,0,0.3)]',
    particleColor: 'cyber-warning',
    ambientSound: 'email-office',
    colors3D: {
      primary: '#ffaa00',
      secondary: '#ff6600',
      ambient: '#1a1100',
      fog: '#0a0800',
      floor: '#ffaa00',
    },
  },

  // Network security themed rooms
  'network-security': {
    accentColor: 'cyber-accent',
    bgGradient: 'from-cyber-bg via-emerald-950/10 to-cyber-bg',
    borderGlow: 'shadow-[0_0_20px_rgba(0,255,136,0.3)]',
    particleColor: 'cyber-accent',
    ambientSound: 'network-buzz',
    colors3D: {
      primary: '#00ff88',
      secondary: '#00aa55',
      ambient: '#001a0f',
      fog: '#000a05',
      floor: '#00ff88',
    },
  },

  // Incident response themed rooms
  'incident-response': {
    accentColor: 'cyber-danger',
    bgGradient: 'from-cyber-bg via-red-950/10 to-cyber-bg',
    borderGlow: 'shadow-[0_0_20px_rgba(255,51,85,0.3)]',
    particleColor: 'cyber-danger',
    ambientSound: 'alert-room',
    colors3D: {
      primary: '#ff3355',
      secondary: '#aa0022',
      ambient: '#1a0008',
      fog: '#0a0004',
      floor: '#ff3355',
    },
  },

  // Data protection themed rooms
  'data-protection': {
    accentColor: 'cyber-primary',
    bgGradient: 'from-cyber-bg via-blue-950/10 to-cyber-bg',
    borderGlow: 'shadow-[0_0_20px_rgba(0,136,170,0.3)]',
    particleColor: 'cyber-primary-dim',
    ambientSound: 'data-center',
    colors3D: {
      primary: '#0088ff',
      secondary: '#0044aa',
      ambient: '#000a1a',
      fog: '#00050f',
      floor: '#0088ff',
    },
  },

  // Insider threat themed rooms
  'insider-threat': {
    accentColor: 'purple-400',
    bgGradient: 'from-cyber-bg via-purple-950/10 to-cyber-bg',
    borderGlow: 'shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    particleColor: 'purple-400',
    ambientSound: 'quiet-tension',
    colors3D: {
      primary: '#a855f7',
      secondary: '#7c3aed',
      ambient: '#0f0a1a',
      fog: '#08050f',
      floor: '#a855f7',
    },
  },

  // Default theme
  'default': {
    accentColor: 'cyber-primary',
    bgGradient: 'from-cyber-bg via-cyber-surface to-cyber-bg',
    borderGlow: 'shadow-[0_0_15px_rgba(0,212,255,0.2)]',
    particleColor: 'cyber-primary',
    ambientSound: 'cyber-loop',
    colors3D: {
      primary: '#00d4ff',
      secondary: '#0088aa',
      ambient: '#001a22',
      fog: '#000a0f',
      floor: '#00d4ff',
    },
  },
};

export function getRoomTheme(roomName: string): RoomTheme {
  const lowerName = roomName.toLowerCase();

  // Match by keywords in room name
  if (lowerName.includes('password') || lowerName.includes('auth')) {
    return roomThemes['password-auth'];
  }
  if (lowerName.includes('phishing') || lowerName.includes('email')) {
    return roomThemes['phishing'];
  }
  if (lowerName.includes('network') || lowerName.includes('firewall')) {
    return roomThemes['network-security'];
  }
  if (lowerName.includes('incident') || lowerName.includes('breach') || lowerName.includes('response')) {
    return roomThemes['incident-response'];
  }
  if (lowerName.includes('data') || lowerName.includes('privacy') || lowerName.includes('protect')) {
    return roomThemes['data-protection'];
  }
  if (lowerName.includes('insider') || lowerName.includes('threat')) {
    return roomThemes['insider-threat'];
  }

  return roomThemes['default'];
}

export function getRoomThemeByType(roomType: string): RoomTheme {
  return roomThemes[roomType] || roomThemes['default'];
}
