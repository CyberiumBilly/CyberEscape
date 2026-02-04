# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CyberEscape is a cybersecurity training platform that uses an escape-room-style game experience. It's a **Turbo monorepo** with three applications and shared packages.

## Commands

```bash
# Development
npm run dev                    # Start all services (API + Web + Media Server)
npm run build                  # Build all packages
npm run lint                   # Run ESLint
npm run test                   # Run Vitest tests

# Database (from root)
npm run db:generate            # Generate Prisma client
npm run db:migrate             # Run migrations (dev mode)
npm run db:seed                # Seed database

# Database (from apps/api)
npx prisma migrate dev --name <name>  # Create new migration
npx prisma migrate reset              # Reset database (destructive)
npx prisma studio                     # Open database GUI

# Docker infrastructure
docker-compose up -d           # Start PostgreSQL, Redis, Coturn
docker-compose down            # Stop services

# Individual app development
cd apps/api && npm run dev     # API only (port 3001)
cd apps/web && npm run dev     # Web only (port 5173)
cd apps/media-server && npm run dev  # Media server only
```

## Architecture

```
apps/
├── api/           # Fastify backend (REST + WebSocket)
├── web/           # React frontend (Vite + Three.js for 3D)
└── media-server/  # Mediasoup WebRTC server
packages/
├── shared/        # Shared TypeScript types
└── eslint-config/ # Shared ESLint config
```

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, React Three Fiber, Redux Toolkit, Socket.IO client, Tailwind CSS, Radix UI
- **Backend**: Fastify 4, TypeScript (ESM), Socket.IO, Prisma, PostgreSQL, Redis, Bull queues
- **Media**: Mediasoup (WebRTC), Coturn (TURN server)

### Backend Pattern (apps/api/src/modules/)

Each feature module follows: `controller.ts` → `schema.ts` (Zod) → `service.ts`

Key modules:
- `auth/` - JWT authentication with refresh tokens
- `game/` - Game engine, puzzles (8 types), rooms (6 themed)
- `users/`, `organizations/`, `groups/` - Multi-tenant user management
- `gamification/` - XP, badges, leaderboards, streaks
- `analytics/` - Reporting and dashboards

### Frontend Pattern (apps/web/src/)

- `features/` - Feature-based components (game, auth, admin, dashboard)
- `components/` - Shared UI components
- `hooks/` - Custom hooks (useSocket, useWebRTC, useGameState)
- `store/slices/` - Redux Toolkit slices

### Database (Prisma)

Schema at `apps/api/prisma/schema.prisma`. Key models:
- `User` with `UserRole` (SUPER_ADMIN, ORG_ADMIN, MANAGER, LEARNER)
- `Organization` → `Group` → `User` hierarchy
- `Room` (6 types) → `Puzzle` (8 types) → `PuzzleAttempt`
- `GameProgress`, `Team`, `TeamSession` for gameplay
- `Badge`, `UserStats`, `DailyChallenge` for gamification

### The Six Rooms

1. PASSWORD_AUTH - Password security, MFA (Solo)
2. PHISHING - Social engineering, email security (Team)
3. DATA_PROTECTION - Data classification, privacy (Solo)
4. NETWORK_SECURITY - Network security, VPN, malware (Team)
5. INSIDER_THREAT - Access control, least privilege (Team)
6. INCIDENT_RESPONSE - Incident triage and response (Team)

### Puzzle Types

MULTIPLE_CHOICE, PASSWORD_STRENGTH, PHISHING_CLASSIFICATION, DRAG_DROP, CODE_ENTRY, SEQUENCE, MATCHING, SIMULATION

## Environment

Environment variables loaded from root `.env`. Key variables:
- `DATABASE_URL` - PostgreSQL (default: localhost:5432)
- `REDIS_URL` - Redis (default: localhost:6379)
- `JWT_SECRET`, `JWT_REFRESH_SECRET` - Auth tokens
- `VITE_API_URL`, `VITE_WS_URL` - Frontend API endpoints (VITE_ prefix required)

## Adding New Features

**New API endpoint:**
1. Create/update `apps/api/src/modules/<module>/controller.ts`
2. Define Zod schema in `schema.ts`
3. Implement business logic in `service.ts`
4. Register routes in `apps/api/src/app.ts`

**New database model:**
1. Update `apps/api/prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_<model>`
3. Run `npm run db:generate`

**New puzzle type:**
1. Add to `PuzzleType` enum in schema.prisma
2. Implement in `apps/api/src/modules/game/puzzles/`
3. Add UI in `apps/web/src/features/game/puzzles/`

**New frontend feature:**
1. Create in `apps/web/src/features/<feature>/`
2. Add routing in `apps/web/src/App.tsx`
3. Add Redux slice if needed in `store/slices/`
