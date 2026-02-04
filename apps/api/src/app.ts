import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import multipart from "@fastify/multipart";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";
import { AppError } from "./utils/errors.js";
import { authRoutes } from "./modules/auth/controller.js";
import { userRoutes } from "./modules/users/controller.js";
import { organizationRoutes } from "./modules/organizations/controller.js";
import { groupRoutes } from "./modules/groups/controller.js";
import { roomRoutes } from "./modules/game/rooms/room.controller.js";
import { puzzleRoutes } from "./modules/game/puzzles/puzzle.controller.js";
import { teamRoutes } from "./modules/teams/controller.js";
import { gamificationRoutes } from "./modules/gamification/controller.js";
import { analyticsRoutes } from "./modules/analytics/controller.js";
import { alertRoutes } from "./modules/alerts/controller.js";
import { integrationRoutes } from "./modules/integrations/controller.js";
import { eventRoutes } from "./modules/events/controller.js";

export async function buildApp() {
  const app = Fastify({ logger: false });

  await app.register(cors, { origin: config.cors.origin, credentials: true });
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });
  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });

  app.get("/api/v1/health", async () => ({ status: "ok", timestamp: new Date().toISOString() }));

  await app.register(authRoutes);
  await app.register(userRoutes);
  await app.register(organizationRoutes);
  await app.register(groupRoutes);
  await app.register(roomRoutes);
  await app.register(puzzleRoutes);
  await app.register(teamRoutes);
  await app.register(gamificationRoutes);
  await app.register(analyticsRoutes);
  await app.register(alertRoutes);
  await app.register(integrationRoutes);
  await app.register(eventRoutes);

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: error.code, message: error.message, details: error.details });
    }
    logger.error({ err: error, url: request.url }, "Unhandled error");
    return reply.status(500).send({ error: "INTERNAL_ERROR", message: "An unexpected error occurred" });
  });

  return app;
}
