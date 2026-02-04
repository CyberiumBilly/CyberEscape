# CyberSafe Escape

A web-based cybersecurity training platform that transforms mandatory security awareness into an engaging escape-room-style game experience.

## 📋 Overview

CyberSafe Escape is designed to make cybersecurity training effective through:
- **6 themed rooms**: Progressive difficulty from personal security to incident response
- **Interactive puzzles**: Sorting, forensics, simulations, and role-based team play
- **Team collaboration**: Multiplayer rooms with real-time WebRTC communication
- **Analytics & Reporting**: Admin dashboards for compliance tracking and readiness metrics
- **Gamification**: Points, badges, leaderboards, and progression systems

See [CyberSafe Escape - 5 pager.md](./CyberSafe%20Escape%20-%205%20pager.md) for full product documentation.

## 🏗️ Architecture

This is a monorepo using Turbo with the following structure:

```
├── apps/
│   ├── api/          # Fastify backend (REST API + WebSocket)
│   ├── web/          # React frontend (Vite + Three.js)
│   └── media-server/ # Mediasoup WebRTC server
├── packages/
│   ├── shared/       # Shared types and utilities
│   └── eslint-config/
└── docker-compose.yml # PostgreSQL, Redis, TURN server
```

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite
- React Three Fiber (3D environments)
- Redux Toolkit (state management)
- Socket.IO client
- Mediasoup client (WebRTC)
- Tailwind CSS + Radix UI

**Backend:**
- Fastify (API server)
- Socket.IO (WebSocket)
- Prisma (ORM)
- PostgreSQL (database)
- Redis (caching, sessions, pub/sub)
- Bull (job queues)
- Mediasoup (WebRTC media server)

**Infrastructure:**
- Docker Compose (local development)
- Turbo (monorepo build system)
- TURN server (NAT traversal)

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker Desktop** (for PostgreSQL, Redis, TURN server)
- **Git**

### Quick Start (Automated)

For a quick automated setup, run the setup script:

```powershell
.\setup.ps1
```

This will:
- Check all prerequisites
- Verify Docker services
- Install dependencies
- Generate Prisma client
- Verify ports and configuration

Then follow the prompts to run migrations and start the dev servers.

### Manual Setup

1. **Clone the repository**
   ```powershell
   git clone <repository-url>
   cd CyberEscape
   ```

2. **Install dependencies**
   ```powershell
   npm install
   ```

3. **Environment configuration**
   
   The `.env` file has been created with default development settings. Review and update as needed:
   - JWT secrets will be auto-generated on first run
   - Database URL points to `localhost:5433` (mapped from Docker)
   - All services configured for local development

4. **Start infrastructure services**
   ```powershell
   docker-compose up -d
   ```

   This starts:
   - PostgreSQL on port `5432`
   - Redis on port `6379`
   - TURN server on port `3478`

5. **Database setup**
   ```powershell
   # Generate Prisma client
   npm run db:generate

   # Run migrations
   npm run db:migrate

   # Seed database with initial data
   npm run db:seed
   ```

6. **Start development servers**
   ```powershell
   npm run dev
   ```

   This starts all services in parallel:
   - **API**: http://localhost:3001
   - **Web**: http://localhost:5173
   - **Media Server**: Runs on dynamic ports for WebRTC

## 🎮 Development Workflow

### Running Individual Services

```powershell
# API only
cd apps/api
npm run dev

# Frontend only
cd apps/web
npm run dev

# Media server only
cd apps/media-server
npm run dev
```

### Database Commands

```powershell
# Create a new migration
npm run db:migrate

# Reset database
cd apps/api
npx prisma migrate reset

# Open Prisma Studio (database GUI)
cd apps/api
npx prisma studio
```

### Building for Production

```powershell
npm run build
```

### Linting

```powershell
npm run lint
```

## 📁 Key Directories

### Backend (`apps/api/src/`)

- `modules/` - Feature modules (auth, game, users, organizations, etc.)
  - `game/engine/` - Core game logic
  - `game/puzzles/` - Puzzle implementations
  - `game/rooms/` - Room configurations
- `middleware/` - Auth, RBAC, validation
- `websocket/` - Real-time handlers
- `media/` - Mediasoup signaling

### Frontend (`apps/web/src/`)

- `features/` - Feature-based components
  - `game/` - Game UI components
  - `admin/` - Admin dashboards
  - `auth/` - Authentication flows
- `components/` - Shared UI components
- `hooks/` - Custom React hooks
- `store/` - Redux state management
- `lib/` - Utilities and API clients

### Shared (`packages/shared/src/`)

- `types/` - TypeScript types shared between frontend and backend
- `constants/` - Shared constants
- `validation/` - Zod schemas

## 🎯 The Six Rooms

1. **Password Fortress** (Solo) - Password security, MFA, credential management
2. **Phishing Waters** (Team) - Social engineering, email security
3. **Data Dungeon** (Solo) - Data classification, privacy, handling
4. **Network Maze** (Team) - Network security, VPN, malware awareness
5. **Insider Threat Theater** (Team) - Access control, least privilege
6. **Incident Response Command** (Team) - Incident triage and response

## 🔧 Configuration

### Environment Variables

See `.env` file for all configuration options. Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing secret
- `API_PORT` / `WEB_PORT` - Service ports
- `MEDIASOUP_*` - WebRTC configuration
- `TURN_*` - TURN server credentials

### Docker Services

The `docker-compose.yml` provides:

- **PostgreSQL** - Database on port 5432
- **Redis** - Cache/pub-sub on port 6379
- **Coturn** - TURN server for WebRTC NAT traversal

To manage services:
```powershell
docker-compose up -d      # Start all services
docker-compose down       # Stop all services
docker-compose logs -f    # View logs
docker-compose ps         # Check status
```

## 🧪 Testing

```powershell
npm run test
```

## 📊 Admin Features

Default admin credentials (created by seed):
- Email: `admin@cyberescape.com`
- Password: Check seed file at `apps/api/prisma/seed.ts`

Admin capabilities:
- User and organization management
- Campaign creation and tracking
- Analytics dashboards
- Completion and readiness reporting
- Role-based access control (RBAC)

## 🎨 Gamification System

- **XP & Levels** - Earned through puzzle completion and accuracy
- **Badges** - Achievement system with multiple tiers
- **Leaderboards** - Individual and team rankings
- **Streaks** - Consecutive completion bonuses
- **Team Scoring** - Collaborative performance metrics

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting
- Helmet security headers
- TLS/SSL in production
- Secure WebSocket connections
- TURN server for secure WebRTC

## 📈 Analytics & Reporting

Administrators can track:
- Completion rates per room and overall
- Time-to-completion metrics
- Topic-level strengths/weaknesses
- Team performance analysis
- Organizational readiness scores
- Exportable reports (CSV, PDF)

## 🚢 Deployment

### Production Checklist

- [ ] Update JWT secrets with strong random values
- [ ] Configure production database URL
- [ ] Set up Redis cluster for production
- [ ] Configure TURN server with proper credentials
- [ ] Set up SSL certificates
- [ ] Configure CORS for production domains
- [ ] Enable production logging and monitoring
- [ ] Set up backup strategy for PostgreSQL
- [ ] Configure email service (SendGrid)
- [ ] Set up OAuth providers (Google, SAML)

### Environment-Specific Variables

Production `.env` should have:
- `NODE_ENV=production`
- Strong `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Production database credentials
- Production Redis URL
- Production TURN server
- Production `FRONTEND_URL`

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and tests
4. Submit a pull request

## 📝 License

[Add your license here]

## 📞 Support

For issues or questions:
- Check the PRD: [CyberSafe Escape - 5 pager.md](./CyberSafe%20Escape%20-%205%20pager.md)
- Review the code documentation
- Contact the development team

## 🗺️ Roadmap

**Phase 1 (Current)**: MVP with auth, 2 solo rooms, basic admin
**Phase 2**: Team collaboration, WebRTC, team rooms
**Phase 3**: All 6 rooms, full gamification, analytics
**Phase 4**: Enterprise SSO, LMS integration
**Phase 5**: Performance optimization, content localization

---

Built with ❤️ for better cybersecurity awareness
