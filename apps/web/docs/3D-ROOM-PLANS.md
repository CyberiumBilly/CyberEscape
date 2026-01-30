# 3D Room Environment Plans

This document outlines the detailed 3D environment plans for each escape room in CyberEscape. These plans are designed to create immersive, thematic experiences that reinforce the cybersecurity learning objectives.

## Overview

Each room has:
- **Theme**: The overall visual style and atmosphere
- **Environment**: Physical 3D space layout
- **Props**: Interactive and decorative objects
- **Puzzle Integration**: How puzzles map to 3D interactions
- **Color Palette**: From `roomThemes.ts`

---

## Room 1: Password Authentication

### Theme: Server Room / Data Center
A high-security server room with rows of blinking server racks, cable management systems, and terminal stations. Cold blue lighting with cyan accents.

### Environment
- **Dimensions**: 24m x 24m x 6m
- **Layout**: Rectangular room with server racks along walls
- **Atmosphere**: Cool, sterile, tech-heavy

### Color Palette
```typescript
colors3D: {
  primary: '#00d4ff',    // Cyan - main accents
  secondary: '#0088aa',  // Dark cyan - secondary elements
  ambient: '#001a22',    // Very dark cyan - ambient
  fog: '#000a0f',        // Near black - fog
  floor: '#00d4ff',      // Cyan grid lines
}
```

### Props & Objects
| Object | Description | Interactive? |
|--------|-------------|--------------|
| Server Racks | 4 tall server cabinets with blinking LEDs | Yes - access password vault |
| Terminal Stations | 3 computer desks with monitors | Yes - enter passwords |
| Central Platform | Circular raised platform with ring light | No - spawn point |
| Floating Data Cubes | Rotating cubes representing data packets | Yes - collect hints |
| Security Pillars | Corner pillars with accent lighting | No - decorative |
| Cable Trays | Overhead cable management | No - atmosphere |

### Puzzle-to-3D Mapping
| Puzzle | 3D Interaction |
|--------|----------------|
| Password Strength Meter | Terminal screen shows real-time strength analysis |
| MFA Setup | Server rack panel with code display |
| Brute Force Demo | Visual representation of attack attempts on screens |

---

## Room 2: Phishing Detection

### Theme: Corporate Email Office
A modern corporate office environment with multiple workstations, email notifications, and suspicious elements. Warm amber/orange warning colors.

### Environment
- **Dimensions**: 20m x 20m x 4m
- **Layout**: Open office floor plan with cubicles
- **Atmosphere**: Busy, alert, cautionary

### Color Palette
```typescript
colors3D: {
  primary: '#ffaa00',    // Amber - warning elements
  secondary: '#ff6600',  // Orange - danger indicators
  ambient: '#1a1100',    // Dark warm - ambient
  fog: '#0a0800',        // Near black warm - fog
  floor: '#ffaa00',      // Amber grid lines
}
```

### Props & Objects
| Object | Description | Interactive? |
|--------|-------------|--------------|
| Workstation Cubicles | 6 office desks with computers | Yes - review emails |
| Email Hologram Displays | Floating email previews | Yes - classify as phishing/safe |
| Warning Sirens | Ceiling-mounted alert lights | No - trigger on wrong answer |
| Suspicious USB Drives | Scattered on desks | Yes - identify as threat |
| Printer Station | Office printer with documents | Yes - examine printed phishing |
| Coffee Machine | Break area element | No - atmosphere |
| Filing Cabinets | Document storage | Yes - find company policies |

### Puzzle-to-3D Mapping
| Puzzle | 3D Interaction |
|--------|----------------|
| Email Classification | Click floating emails, drag to Safe/Phishing bins |
| URL Analysis | Magnifying glass tool reveals true URLs |
| Attachment Scanner | Drop files into scanner device |
| Sender Verification | Compare sender info on hologram display |

---

## Room 3: Network Security

### Theme: Network Operations Center (NOC)
A cyberpunk-style network monitoring center with live traffic visualizations, firewall controls, and network topology displays. Green matrix-style aesthetics.

### Environment
- **Dimensions**: 30m x 20m x 5m
- **Layout**: Central monitoring hub with surrounding network nodes
- **Atmosphere**: High-tech, vigilant, flowing data

### Color Palette
```typescript
colors3D: {
  primary: '#00ff88',    // Bright green - secure elements
  secondary: '#00aa55',  // Dark green - network paths
  ambient: '#001a0f',    // Very dark green - ambient
  fog: '#000a05',        // Near black green - fog
  floor: '#00ff88',      // Green grid lines
}
```

### Props & Objects
| Object | Description | Interactive? |
|--------|-------------|--------------|
| Central Control Console | Main monitoring station | Yes - manage firewall |
| Network Topology Display | 3D floating network map | Yes - trace connections |
| Firewall Gates | Physical barrier representations | Yes - configure rules |
| Data Packet Streams | Visible data flowing through pipes | No - visual indicator |
| Router Towers | Networking equipment stacks | Yes - configure routing |
| IDS/IPS Monitors | Intrusion detection screens | Yes - review alerts |
| VPN Tunnel | Visible encrypted tunnel path | Yes - establish connections |

### Puzzle-to-3D Mapping
| Puzzle | 3D Interaction |
|--------|----------------|
| Firewall Configuration | Physical gate controls with rule settings |
| Port Management | Numbered doors that open/close |
| Network Segmentation | Arrange network nodes in zones |
| Traffic Analysis | Watch and flag suspicious data streams |

---

## Room 4: Data Protection

### Theme: Secure Data Vault
A futuristic data vault combining physical and digital security. Encrypted data visualizations, classification systems, and secure storage. Deep blue tones.

### Environment
- **Dimensions**: 22m x 22m x 8m
- **Layout**: Central vault with tiered security rings
- **Atmosphere**: Secure, classified, layered protection

### Color Palette
```typescript
colors3D: {
  primary: '#0088ff',    // Blue - encryption elements
  secondary: '#0044aa',  // Dark blue - secure storage
  ambient: '#000a1a',    // Very dark blue - ambient
  fog: '#00050f',        // Near black blue - fog
  floor: '#0088ff',      // Blue grid lines
}
```

### Props & Objects
| Object | Description | Interactive? |
|--------|-------------|--------------|
| Central Vault Door | Massive circular vault entrance | Yes - final puzzle unlock |
| Data Classification Podiums | Pedestals for sorting data | Yes - classify data types |
| Encryption Cylinders | Rotating cipher machines | Yes - encrypt/decrypt data |
| Security Clearance Gates | Tiered access barriers | Yes - match clearance levels |
| Backup Storage Arrays | Redundant storage visualization | Yes - configure backups |
| Shredder Station | Document/data destruction | Yes - secure deletion |
| Access Logs Terminal | Audit trail display | Yes - review access history |

### Puzzle-to-3D Mapping
| Puzzle | 3D Interaction |
|--------|----------------|
| Data Classification | Sort data objects into correct tiers |
| Encryption Challenge | Rotate cipher rings to correct positions |
| Access Control Lists | Configure who can access what |
| Data Retention | Move data to archive/delete zones |

---

## Room 5: Insider Threat

### Theme: Corporate Investigation Room
A dimly lit investigation environment combining office surveillance with detective elements. Purple/violet tones suggesting hidden threats and investigation.

### Environment
- **Dimensions**: 25m x 20m x 4m
- **Layout**: Investigation center with evidence boards
- **Atmosphere**: Tense, investigative, shadowy

### Color Palette
```typescript
colors3D: {
  primary: '#a855f7',    // Purple - investigation elements
  secondary: '#7c3aed',  // Violet - clue highlights
  ambient: '#0f0a1a',    // Very dark purple - ambient
  fog: '#08050f',        // Near black purple - fog
  floor: '#a855f7',      // Purple grid lines
}
```

### Props & Objects
| Object | Description | Interactive? |
|--------|-------------|--------------|
| Evidence Board | Large investigation board with connections | Yes - link evidence |
| Employee Profiles | Holographic personnel files | Yes - review suspects |
| Surveillance Monitors | CCTV footage displays | Yes - watch behavior |
| Access Log Terminal | Badge-in/out records | Yes - analyze patterns |
| Document Scanner | Review sensitive documents | Yes - find policy violations |
| Behavioral Analysis Display | Anomaly detection graphs | Yes - identify red flags |
| Interview Room | Glass-walled interrogation space | Yes - question suspects |

### Puzzle-to-3D Mapping
| Puzzle | 3D Interaction |
|--------|----------------|
| Behavioral Analysis | Connect dots on employee behavior patterns |
| Access Anomalies | Match unusual access with employee IDs |
| Evidence Correlation | Drag evidence to correct suspect profiles |
| Risk Assessment | Rate employees on threat indicators |

---

## Room 6: Incident Response

### Theme: Security Operations Center (SOC) Under Attack
An active crisis environment with alerts, countdowns, and response protocols. Red emergency lighting with status dashboards. High-pressure atmosphere.

### Environment
- **Dimensions**: 28m x 24m x 5m
- **Layout**: War room style with central command
- **Atmosphere**: Urgent, crisis mode, controlled chaos

### Color Palette
```typescript
colors3D: {
  primary: '#ff3355',    // Red - alert/danger
  secondary: '#aa0022',  // Dark red - critical systems
  ambient: '#1a0008',    // Very dark red - ambient
  fog: '#0a0004',        // Near black red - fog
  floor: '#ff3355',      // Red grid lines
}
```

### Props & Objects
| Object | Description | Interactive? |
|--------|-------------|--------------|
| Command Center Console | Main incident coordination desk | Yes - issue commands |
| Incident Timeline | Linear display of attack progression | Yes - document events |
| System Status Board | Grid of system health indicators | Yes - isolate systems |
| Communications Array | Internal/external comms setup | Yes - notify stakeholders |
| Forensics Station | Evidence collection tools | Yes - preserve evidence |
| Containment Controls | Emergency shutdown switches | Yes - contain breach |
| Recovery Dashboard | System restoration progress | Yes - initiate recovery |
| Countdown Timer | Visible threat timer | No - pressure element |

### Puzzle-to-3D Mapping
| Puzzle | 3D Interaction |
|--------|----------------|
| Incident Classification | Categorize attack type on command console |
| Containment Actions | Physically isolate affected systems |
| Communication Protocol | Send alerts through proper channels |
| Evidence Preservation | Collect and secure forensic artifacts |
| Recovery Sequence | Restore systems in correct order |

---

## Implementation Notes

### Shared Components (from `world/Rooms/`)
- `RoomBase`: Base room structure with walls, floor accents, corner pillars
- `Wall`: Collision-enabled wall segments
- `ServerRack`: Reusable server cabinet with LED lights
- `Terminal`: Computer desk with animated screen
- `Pillar`: Decorative pillars with accent rings
- `FloatingCube`: Animated floating objects

### Technical Considerations
1. **Physics**: All interactive objects need `RigidBody` components from `@react-three/rapier`
2. **Performance**: Use instancing for repeated objects (particles, LEDs)
3. **Accessibility**: Ensure adequate contrast for interactive elements
4. **Mobile**: Consider simplified geometry for mobile devices

### Future Enhancements
- [ ] Add particle systems for data flow visualization
- [ ] Implement room-specific ambient sounds
- [ ] Create animated transitions between rooms
- [ ] Add NPC guides for tutorial elements
- [ ] Implement multiplayer visibility for team rooms
