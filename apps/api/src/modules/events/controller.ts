import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { authenticate } from "../../middleware/auth.js";
import { requireRole } from "../../middleware/rbac.js";
import { validateBody, validateQuery } from "../../middleware/validate.js";
import { eventIngestionService } from "../../services/event-ingestion.js";
import {
  ingestEventSchema,
  ingestBatchSchema,
  queryEventsSchema,
  aggregatesQuerySchema,
  userActivitySchema,
  type IngestEventInput,
  type IngestBatchInput,
  type QueryEventsInput,
  type AggregatesQueryInput,
  type UserActivityInput,
} from "./schema.js";

/**
 * Rate limit tracking per organization (100 req/sec).
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 100;
const RATE_WINDOW_MS = 1000;

function checkRateLimit(orgId: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(orgId);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(orgId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function eventRoutes(app: FastifyInstance) {
  /**
   * POST /api/v1/ingest - Ingest single event.
   * Returns 202 Accepted immediately, event processed async.
   */
  app.post<{ Body: IngestEventInput }>(
    "/api/v1/ingest",
    {
      preHandler: [authenticate, validateBody(ingestEventSchema)],
    },
    async (req: FastifyRequest<{ Body: IngestEventInput }>, rep: FastifyReply) => {
      const orgId = req.user!.organizationId;

      // Rate limiting
      if (!checkRateLimit(orgId)) {
        return rep.status(429).send({
          error: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Limit: 100 events/second per organization.",
        });
      }

      const result = await eventIngestionService.ingestEvent({
        organizationId: orgId,
        userId: req.user!.userId,
        sessionId: req.body.sessionId,
        eventType: req.body.eventType,
        timestamp: req.body.timestamp,
        payload: req.body.payload,
        metadata: req.body.metadata,
      });

      return rep.status(202).send(result);
    }
  );

  /**
   * POST /api/v1/ingest/batch - Ingest multiple events.
   * Returns 202 Accepted immediately, events processed async.
   */
  app.post<{ Body: IngestBatchInput }>(
    "/api/v1/ingest/batch",
    {
      preHandler: [authenticate, validateBody(ingestBatchSchema)],
    },
    async (req: FastifyRequest<{ Body: IngestBatchInput }>, rep: FastifyReply) => {
      const orgId = req.user!.organizationId;

      // Rate limiting (count as 1 request regardless of batch size)
      if (!checkRateLimit(orgId)) {
        return rep.status(429).send({
          error: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Limit: 100 events/second per organization.",
        });
      }

      const events = req.body.events.map((event) => ({
        organizationId: orgId,
        userId: req.user!.userId,
        sessionId: event.sessionId,
        eventType: event.eventType,
        timestamp: event.timestamp,
        payload: event.payload,
        metadata: event.metadata,
      }));

      const result = await eventIngestionService.ingestBatch(events);

      return rep.status(202).send(result);
    }
  );

  /**
   * GET /api/v1/events - Query events (admin only).
   */
  app.get<{ Querystring: QueryEventsInput }>(
    "/api/v1/events",
    {
      preHandler: [
        authenticate,
        requireRole("ORG_ADMIN", "MANAGER"),
        validateQuery(queryEventsSchema),
      ],
    },
    async (req: FastifyRequest<{ Querystring: QueryEventsInput }>, rep: FastifyReply) => {
      const result = await eventIngestionService.queryEvents({
        organizationId: req.user!.organizationId,
        userId: req.query.userId,
        sessionId: req.query.sessionId,
        eventType: req.query.eventType,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        limit: req.query.limit,
        offset: req.query.offset,
      });

      return rep.send(result);
    }
  );

  /**
   * GET /api/v1/events/aggregates - Get event aggregates (admin only).
   */
  app.get<{ Querystring: AggregatesQueryInput }>(
    "/api/v1/events/aggregates",
    {
      preHandler: [
        authenticate,
        requireRole("ORG_ADMIN", "MANAGER"),
        validateQuery(aggregatesQuerySchema),
      ],
    },
    async (req: FastifyRequest<{ Querystring: AggregatesQueryInput }>, rep: FastifyReply) => {
      const result = await eventIngestionService.getAggregates(
        req.user!.organizationId,
        req.query.period,
        req.query.days
      );

      return rep.send({ aggregates: result });
    }
  );

  /**
   * GET /api/v1/events/counts - Get event counts by type (admin only).
   */
  app.get(
    "/api/v1/events/counts",
    {
      preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")],
    },
    async (req: FastifyRequest, rep: FastifyReply) => {
      const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };

      const counts = await eventIngestionService.getEventCounts(
        req.user!.organizationId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      return rep.send({ counts });
    }
  );

  /**
   * GET /api/v1/events/user/:userId - Get user activity (admin only).
   */
  app.get<{ Params: { userId: string }; Querystring: { days?: string } }>(
    "/api/v1/events/user/:userId",
    {
      preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")],
    },
    async (
      req: FastifyRequest<{ Params: { userId: string }; Querystring: { days?: string } }>,
      rep: FastifyReply
    ) => {
      const days = req.query.days ? parseInt(req.query.days, 10) : 30;

      const activity = await eventIngestionService.getUserActivity(
        req.user!.organizationId,
        req.params.userId,
        days
      );

      return rep.send(activity);
    }
  );
}
