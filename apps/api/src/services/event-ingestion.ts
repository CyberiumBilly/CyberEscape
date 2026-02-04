import { ObjectId } from "mongodb";
import {
  getEventsCollection,
  getAggregatesCollection,
  GameEventDocument,
} from "../lib/mongodb.js";
import { getEventIngestionQueue } from "../jobs/index.js";

/**
 * Event retention period in days.
 */
const RETENTION_DAYS = 30;

/**
 * Calculate expiration date for TTL.
 */
function getExpirationDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + RETENTION_DAYS);
  return date;
}

/**
 * Event input for ingestion.
 */
export interface EventInput {
  organizationId: string;
  userId: string;
  sessionId: string;
  eventType: string;
  timestamp?: Date | string;
  payload: Record<string, unknown>;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
  };
}

/**
 * Query filters for events.
 */
export interface EventQueryFilters {
  organizationId: string;
  userId?: string;
  sessionId?: string;
  eventType?: string | string[];
  startDate?: Date | string;
  endDate?: Date | string;
  limit?: number;
  offset?: number;
}

/**
 * Event ingestion service.
 */
export const eventIngestionService = {
  /**
   * Queue a single event for async ingestion.
   * Returns immediately with HTTP 202.
   */
  async ingestEvent(event: EventInput): Promise<{ queued: true; eventId: string }> {
    const eventId = new ObjectId().toString();

    const queue = getEventIngestionQueue();
    await queue.add("ingest-event", {
      eventId,
      event,
    });

    return { queued: true, eventId };
  },

  /**
   * Queue multiple events for async batch ingestion.
   */
  async ingestBatch(events: EventInput[]): Promise<{ queued: true; count: number }> {
    const queue = getEventIngestionQueue();
    await queue.add("ingest-batch", { events });

    return { queued: true, count: events.length };
  },

  /**
   * Write event directly to MongoDB (called by job processor).
   */
  async writeEvent(event: EventInput): Promise<string> {
    const collection = getEventsCollection();

    const doc: GameEventDocument = {
      organizationId: event.organizationId,
      userId: event.userId,
      sessionId: event.sessionId,
      eventType: event.eventType,
      timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
      payload: event.payload,
      metadata: event.metadata || {},
      createdAt: new Date(),
      expiresAt: getExpirationDate(),
    };

    const result = await collection.insertOne(doc);
    return result.insertedId.toString();
  },

  /**
   * Write batch of events directly to MongoDB (called by job processor).
   */
  async writeBatch(events: EventInput[]): Promise<number> {
    if (events.length === 0) return 0;

    const collection = getEventsCollection();
    const now = new Date();
    const expiresAt = getExpirationDate();

    const docs: GameEventDocument[] = events.map((event) => ({
      organizationId: event.organizationId,
      userId: event.userId,
      sessionId: event.sessionId,
      eventType: event.eventType,
      timestamp: event.timestamp ? new Date(event.timestamp) : now,
      payload: event.payload,
      metadata: event.metadata || {},
      createdAt: now,
      expiresAt,
    }));

    const result = await collection.insertMany(docs);
    return result.insertedCount;
  },

  /**
   * Query events with filters and pagination.
   */
  async queryEvents(filters: EventQueryFilters): Promise<{
    events: GameEventDocument[];
    total: number;
    hasMore: boolean;
  }> {
    const collection = getEventsCollection();
    const limit = Math.min(filters.limit || 100, 1000);
    const offset = filters.offset || 0;

    // Build query
    const query: Record<string, unknown> = {
      organizationId: filters.organizationId,
    };

    if (filters.userId) query.userId = filters.userId;
    if (filters.sessionId) query.sessionId = filters.sessionId;

    if (filters.eventType) {
      query.eventType = Array.isArray(filters.eventType)
        ? { $in: filters.eventType }
        : filters.eventType;
    }

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) {
        (query.timestamp as Record<string, Date>).$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        (query.timestamp as Record<string, Date>).$lte = new Date(filters.endDate);
      }
    }

    // Execute query
    const [events, total] = await Promise.all([
      collection
        .find(query)
        .sort({ timestamp: -1 })
        .skip(offset)
        .limit(limit + 1)
        .toArray(),
      collection.countDocuments(query),
    ]);

    const hasMore = events.length > limit;
    if (hasMore) events.pop();

    return { events, total, hasMore };
  },

  /**
   * Get event counts by type for an organization.
   */
  async getEventCounts(
    organizationId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Record<string, number>> {
    const collection = getEventsCollection();

    const match: Record<string, unknown> = { organizationId };
    if (startDate || endDate) {
      match.timestamp = {};
      if (startDate) (match.timestamp as Record<string, Date>).$gte = startDate;
      if (endDate) (match.timestamp as Record<string, Date>).$lte = endDate;
    }

    const result = await collection
      .aggregate<{ _id: string; count: number }>([
        { $match: match },
        { $group: { _id: "$eventType", count: { $sum: 1 } } },
      ])
      .toArray();

    return result.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>
    );
  },

  /**
   * Get aggregated stats for an organization.
   */
  async getAggregates(
    organizationId: string,
    period: "daily" | "weekly" | "monthly" = "daily",
    days: number = 30
  ): Promise<
    Array<{
      date: Date;
      eventCounts: Record<string, number>;
      uniqueUsers: number;
      totalEvents: number;
    }>
  > {
    const collection = getEventsCollection();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateFormat =
      period === "daily"
        ? { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } }
        : period === "weekly"
          ? {
              $dateToString: {
                format: "%Y-W%V",
                date: "$timestamp",
              },
            }
          : { $dateToString: { format: "%Y-%m", date: "$timestamp" } };

    const result = await collection
      .aggregate<{
        _id: string;
        eventCounts: Array<{ type: string; count: number }>;
        uniqueUsers: string[];
        totalEvents: number;
      }>([
        {
          $match: {
            organizationId,
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: dateFormat,
            eventCounts: {
              $push: { type: "$eventType", count: 1 },
            },
            uniqueUsers: { $addToSet: "$userId" },
            totalEvents: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    return result.map((item) => ({
      date: new Date(item._id),
      eventCounts: item.eventCounts.reduce(
        (acc, { type }) => {
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
      uniqueUsers: item.uniqueUsers.length,
      totalEvents: item.totalEvents,
    }));
  },

  /**
   * Get user activity summary.
   */
  async getUserActivity(
    organizationId: string,
    userId: string,
    days: number = 30
  ): Promise<{
    totalEvents: number;
    sessionsCount: number;
    roomsVisited: string[];
    puzzlesCompleted: number;
    lastActive: Date | null;
  }> {
    const collection = getEventsCollection();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await collection
      .aggregate<{
        totalEvents: number;
        sessions: string[];
        rooms: string[];
        puzzlesCompleted: number;
        lastActive: Date;
      }>([
        {
          $match: {
            organizationId,
            userId,
            timestamp: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: null,
            totalEvents: { $sum: 1 },
            sessions: { $addToSet: "$sessionId" },
            rooms: {
              $addToSet: {
                $cond: [{ $eq: ["$eventType", "room_started"] }, "$payload.roomId", null],
              },
            },
            puzzlesCompleted: {
              $sum: { $cond: [{ $eq: ["$eventType", "puzzle_completed"] }, 1, 0] },
            },
            lastActive: { $max: "$timestamp" },
          },
        },
      ])
      .toArray();

    if (result.length === 0) {
      return {
        totalEvents: 0,
        sessionsCount: 0,
        roomsVisited: [],
        puzzlesCompleted: 0,
        lastActive: null,
      };
    }

    const data = result[0];
    return {
      totalEvents: data.totalEvents,
      sessionsCount: data.sessions.length,
      roomsVisited: data.rooms.filter(Boolean) as string[],
      puzzlesCompleted: data.puzzlesCompleted,
      lastActive: data.lastActive,
    };
  },
};
