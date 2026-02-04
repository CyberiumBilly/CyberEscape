# CyberEscape Development Guide

## Quick Reference Commands

### Project Setup (First Time)

```powershell
# Automated setup
.\setup.ps1

# OR Manual setup:
# 1. Install dependencies
npm install

# 2. Start Docker services
docker-compose up -d

# 3. Generate Prisma client
npm run db:generate

# 4. Run migrations
npm run db:migrate

# 5. Seed database (optional)
npm run db:seed

# 6. Start development servers
npm run dev
```

## Development Workflow

### Starting Development

```powershell
# Start all services (API + Web + Media Server)
npm run dev

# OR start services individually:

# Start API only
cd apps/api
npm run dev

# Start Web only
cd apps/web
npm run dev

# Start Media Server only
cd apps/media-server
npm run dev
```

### Docker Management

```powershell
# Start all Docker services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Restart a specific service
docker-compose restart postgres

# Remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Database Operations

```powershell
# Create a new migration
cd apps/api
npx prisma migrate dev --name <migration_name>

# Apply migrations
npm run db:migrate

# Reset database (WARNING: deletes all data)
cd apps/api
npx prisma migrate reset

# Generate Prisma client
npm run db:generate

# Seed database
npm run db:seed

# Open Prisma Studio (database GUI)
cd apps/api
npx prisma studio
```

### Code Quality

```powershell
# Run linter
npm run lint

# Run tests
npm run test

# Run tests in watch mode
cd apps/api
npm run test -- --watch

# Build all packages
npm run build

# Clean build artifacts
npm run clean
```

## Project Structure

```
CyberEscape/
├── apps/
│   ├── api/               # Backend API
│   │   ├── src/
│   │   │   ├── modules/   # Feature modules
│   │   │   │   ├── auth/
│   │   │   │   ├── game/
│   │   │   │   │   ├── engine/     # Game logic
│   │   │   │   │   ├── puzzles/    # Puzzle implementations
│   │   │   │   │   └── rooms/      # Room configurations
│   │   │   │   ├── users/
│   │   │   │   └── ...
│   │   │   ├── middleware/
│   │   │   ├── websocket/
│   │   │   └── utils/
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── migrations/
│   ├── web/               # Frontend
│   │   └── src/
│   │       ├── features/  # Feature components
│   │       ├── components/
│   │       ├── hooks/
│   │       └── store/
│   └── media-server/      # WebRTC Media Server
└── packages/
    ├── shared/            # Shared types & utilities
    └── eslint-config/
```

## Common Tasks

### Adding a New API Endpoint

1. Create controller in `apps/api/src/modules/<module>/controller.ts`
2. Define schema in `apps/api/src/modules/<module>/schema.ts`
3. Implement service in `apps/api/src/modules/<module>/service.ts`
4. Register routes in `apps/api/src/app.ts`

### Adding a New Database Model

1. Update `apps/api/prisma/schema.prisma`
2. Create migration:
   ```powershell
   cd apps/api
   npx prisma migrate dev --name add_<model_name>
   ```
3. Generate client:
   ```powershell
   npm run db:generate
   ```

### Adding a New Frontend Feature

1. Create feature folder in `apps/web/src/features/<feature>/`
2. Add components, hooks, and types
3. Update routing in `apps/web/src/App.tsx`
4. Add Redux slice if needed in `apps/web/src/store/slices/`

### Adding a New Puzzle Type

1. Define puzzle type in `apps/api/prisma/schema.prisma`
2. Create puzzle implementation in `apps/api/src/modules/game/puzzles/<puzzle_name>.ts`
3. Add puzzle UI in `apps/web/src/features/game/puzzles/<PuzzleName>.tsx`
4. Register puzzle in game engine

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://cyber:cyber@localhost:5432/cyberescape

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secrets
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Server Ports
API_PORT=3001
MEDIA_PORT=3002
WEB_PORT=5173

# OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Email (optional)
SENDGRID_API_KEY=
```

### Frontend (VITE_ prefix required)

Variables are automatically loaded from root `.env`:

```bash
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## API Endpoints

Base URL: `http://localhost:3001/api/v1`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

### Users
- `GET /users/me` - Get current user
- `PUT /users/me` - Update profile
- `GET /users/:id` - Get user by ID

### Game
- `GET /rooms` - List all rooms
- `GET /rooms/:id` - Get room details
- `POST /game/start` - Start game session
- `POST /game/submit` - Submit puzzle answer

### Organizations
- `GET /organizations` - List organizations
- `POST /organizations` - Create organization
- `GET /organizations/:id` - Get organization

### Analytics
- `GET /analytics/overview` - Dashboard overview
- `GET /analytics/users/:id` - User analytics
- `GET /analytics/rooms/:id` - Room analytics

## WebSocket Events

### Client → Server
- `room:join` - Join a game room
- `room:leave` - Leave a room
- `puzzle:submit` - Submit puzzle answer
- `team:action` - Perform team action

### Server → Client
- `room:joined` - Confirmation of room join
- `room:update` - Room state update
- `puzzle:feedback` - Puzzle result
- `team:update` - Team state update

## Testing Strategy

### Unit Tests
- Test individual functions and components
- Located next to source files with `.test.ts` extension
- Run with: `npm run test`

### Integration Tests
- Test API endpoints and database operations
- Located in `apps/api/src/__tests__/`

### E2E Tests (Future)
- Test complete user flows
- Will use Playwright or Cypress

## Debugging

### Backend Debugging

Add breakpoints in VS Code:
1. Open `apps/api/src/` files
2. Set breakpoints
3. Press F5 or use "Run and Debug" panel
4. Select "Debug API Server" configuration

### Frontend Debugging

Use Browser DevTools:
1. Open http://localhost:5173
2. Press F12 for DevTools
3. Use Console, Network, and React DevTools tabs

### Database Debugging

Use Prisma Studio:
```powershell
cd apps/api
npx prisma studio
```
Access at: http://localhost:5555

## Performance Tips

### Development Speed

```powershell
# Increase Node.js memory
$env:NODE_OPTIONS="--max-old-space-size=4096"

# Use faster terminal
# Windows Terminal > PowerShell > CMD
```

### Build Optimization

```powershell
# Use Turbo caching
npm run build

# Clear cache if needed
Remove-Item -Recurse -Force .turbo
```

## Git Workflow

```powershell
# Create feature branch
git checkout -b feature/puzzle-sorting

# Make changes and commit
git add .
git commit -m "feat: add sorting puzzle"

# Push to remote
git push origin feature/puzzle-sorting

# Create pull request
```

## Deployment

### Production Build

```powershell
# Build all packages
npm run build

# Output locations:
# - apps/api/dist/
# - apps/web/dist/
# - apps/media-server/dist/
```

### Docker Production (Future)

```powershell
# Build images
docker build -f Dockerfile.api -t cyberescape-api .
docker build -f Dockerfile.web -t cyberescape-web .

# Run production containers
docker-compose -f docker-compose.prod.yml up -d
```

## Useful Resources

- [Fastify Documentation](https://www.fastify.io/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React Documentation](https://react.dev/)
- [Three.js Documentation](https://threejs.org/docs/)
- [MediaSoup Documentation](https://mediasoup.org/documentation/)
- [Socket.IO Documentation](https://socket.io/docs/)

## Troubleshooting

For common issues and solutions, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

## Team Communication

### Code Reviews
- Review PRs promptly
- Provide constructive feedback
- Test changes locally before approving

### Documentation
- Update README when adding features
- Document complex logic with comments
- Keep API documentation up to date

---

Happy coding! 🚀
