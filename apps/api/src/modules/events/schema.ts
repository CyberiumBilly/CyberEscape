import { z } from "zod";

/**
 * Valid event types.
 */
export const EventTypes = [
  "room_started",
  "room_completed",
  "room_failed",
  "room_abandoned",
  "puzzle_started",
  "puzzle_completed",
  "puzzle_failed",
  "puzzle_skipped",
  "hint_requested",
  "hint_viewed",
  "session_started",
  "session_ended",
  "session_paused",
  "session_resumed",
  "login",
  "logout",
  "team_joined",
  "team_left",
  "team_chat",
  "checkpoint_reached",
  "badge_earned",
  "level_up",
] as const;

/**
 * Event metadata schema.
 */
export const eventMetadataSchema = z.object({
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  deviceType: z.string().optional(),
});

/**
 * Single event ingestion schema.
 */
export const ingestEventSchema = z.object({
  sessionId: z.string().min(1),
  eventType: z.enum(EventTypes),
  timestamp: z.string().datetime().optional(),
  payload: z.record(z.unknown()).default({}),
  metadata: eventMetadataSchema.optional(),
});

/**
 * Batch event ingestion schema.
 */
export const ingestBatchSchema = z.object({
  events: z
    .array(ingestEventSchema)
    .min(1)
    .max(1000, "Maximum 1000 events per batch"),
});

/**
 * Event query schema.
 */
export const queryEventsSchema = z.object({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  eventType: z.union([z.enum(EventTypes), z.array(z.enum(EventTypes))]).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
});

/**
 * Event aggregates query schema.
 */
export const aggregatesQuerySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly"]).default("daily"),
  days: z.coerce.number().min(1).max(90).default(30),
});

/**
 * User activity query schema.
 */
export const userActivitySchema = z.object({
  userId: z.string(),
  days: z.coerce.number().min(1).max(90).default(30),
});

export type IngestEventInput = z.infer<typeof ingestEventSchema>;
export type IngestBatchInput = z.infer<typeof ingestBatchSchema>;
export type QueryEventsInput = z.infer<typeof queryEventsSchema>;
export type AggregatesQueryInput = z.infer<typeof aggregatesQuerySchema>;
export type UserActivityInput = z.infer<typeof userActivitySchema>;
