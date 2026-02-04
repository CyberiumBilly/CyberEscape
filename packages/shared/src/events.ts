/**
 * Event types for game telemetry.
 */
export const EventType = {
  // Room events
  ROOM_STARTED: "room_started",
  ROOM_COMPLETED: "room_completed",
  ROOM_FAILED: "room_failed",
  ROOM_ABANDONED: "room_abandoned",

  // Puzzle events
  PUZZLE_STARTED: "puzzle_started",
  PUZZLE_COMPLETED: "puzzle_completed",
  PUZZLE_FAILED: "puzzle_failed",
  PUZZLE_SKIPPED: "puzzle_skipped",

  // Hint events
  HINT_REQUESTED: "hint_requested",
  HINT_VIEWED: "hint_viewed",

  // Session events
  SESSION_STARTED: "session_started",
  SESSION_ENDED: "session_ended",
  SESSION_PAUSED: "session_paused",
  SESSION_RESUMED: "session_resumed",

  // Auth events
  LOGIN: "login",
  LOGOUT: "logout",

  // Team events
  TEAM_JOINED: "team_joined",
  TEAM_LEFT: "team_left",
  TEAM_CHAT: "team_chat",

  // Progress events
  CHECKPOINT_REACHED: "checkpoint_reached",
  BADGE_EARNED: "badge_earned",
  LEVEL_UP: "level_up",
} as const;

export type EventTypeValue = (typeof EventType)[keyof typeof EventType];

/**
 * Base event payload.
 */
export interface BaseEventPayload {
  [key: string]: unknown;
}

/**
 * Room event payload.
 */
export interface RoomEventPayload extends BaseEventPayload {
  roomId: string;
  roomType?: string;
  score?: number;
  timeSpent?: number;
  puzzlesCompleted?: number;
  hintsUsed?: number;
}

/**
 * Puzzle event payload.
 */
export interface PuzzleEventPayload extends BaseEventPayload {
  puzzleId: string;
  roomId: string;
  puzzleType?: string;
  score?: number;
  timeSpent?: number;
  attempts?: number;
  hintsUsed?: number;
  correct?: boolean;
}

/**
 * Hint event payload.
 */
export interface HintEventPayload extends BaseEventPayload {
  puzzleId: string;
  roomId: string;
  hintIndex: number;
  hintLevel?: number;
}

/**
 * Session event payload.
 */
export interface SessionEventPayload extends BaseEventPayload {
  duration?: number;
  roomsVisited?: string[];
  puzzlesAttempted?: number;
}

/**
 * Team event payload.
 */
export interface TeamEventPayload extends BaseEventPayload {
  teamId: string;
  teamName?: string;
  memberCount?: number;
}

/**
 * Event metadata.
 */
export interface EventMetadata {
  userAgent?: string;
  ipAddress?: string;
  deviceType?: string;
  screenResolution?: string;
  language?: string;
}

/**
 * Game event for ingestion.
 */
export interface GameEvent {
  organizationId: string;
  userId: string;
  sessionId: string;
  eventType: EventTypeValue;
  timestamp?: Date | string;
  payload: BaseEventPayload;
  metadata?: EventMetadata;
}

/**
 * Batch of events for bulk ingestion.
 */
export interface EventBatch {
  events: GameEvent[];
}

/**
 * Event query filters.
 */
export interface EventQueryFilters {
  organizationId: string;
  userId?: string;
  sessionId?: string;
  eventType?: EventTypeValue | EventTypeValue[];
  startDate?: Date | string;
  endDate?: Date | string;
  limit?: number;
  offset?: number;
}

/**
 * Event aggregation result.
 */
export interface EventAggregation {
  organizationId: string;
  period: "hourly" | "daily" | "weekly" | "monthly";
  date: Date;
  eventCounts: Record<string, number>;
  uniqueUsers: number;
  totalEvents: number;
  avgSessionDuration?: number;
}
