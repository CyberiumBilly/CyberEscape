import { MongoClient, Db, Collection, ObjectId } from "mongodb";
import { config } from "../config/index.js";

/**
 * MongoDB client singleton.
 */
let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Event document schema for MongoDB.
 */
export interface GameEventDocument {
  _id?: ObjectId;
  organizationId: string;
  userId: string;
  sessionId: string;
  eventType: string;
  timestamp: Date;
  payload: Record<string, unknown>;
  metadata: {
    userAgent?: string;
    ipAddress?: string;
    deviceType?: string;
  };
  createdAt: Date;
  expiresAt: Date; // TTL field for 30-day retention
}

/**
 * Event aggregate document for pre-computed stats.
 */
export interface EventAggregateDocument {
  _id?: ObjectId;
  organizationId: string;
  period: string; // "daily", "weekly", "monthly"
  date: Date;
  eventCounts: Record<string, number>;
  uniqueUsers: number;
  totalEvents: number;
  avgSessionDuration?: number;
  updatedAt: Date;
}

/**
 * Collection names.
 */
export const COLLECTIONS = {
  EVENTS: "events",
  EVENT_AGGREGATES: "eventAggregates",
} as const;

/**
 * Connect to MongoDB.
 */
export async function connectMongo(): Promise<Db> {
  if (db) return db;

  console.log("[MongoDB] Connecting...");

  client = new MongoClient(config.mongo.url);
  await client.connect();

  db = client.db();

  // Create indexes
  await createIndexes();

  console.log("[MongoDB] Connected successfully");
  return db;
}

/**
 * Create indexes for efficient queries.
 */
async function createIndexes(): Promise<void> {
  if (!db) throw new Error("MongoDB not connected");

  const eventsCollection = db.collection(COLLECTIONS.EVENTS);
  const aggregatesCollection = db.collection(COLLECTIONS.EVENT_AGGREGATES);

  // Events indexes
  await eventsCollection.createIndex({ organizationId: 1, timestamp: -1 });
  await eventsCollection.createIndex({ userId: 1, timestamp: -1 });
  await eventsCollection.createIndex({ eventType: 1, timestamp: -1 });
  await eventsCollection.createIndex({ sessionId: 1 });
  await eventsCollection.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 } // TTL index - auto-delete after 30 days
  );

  // Aggregates indexes
  await aggregatesCollection.createIndex({ organizationId: 1, period: 1, date: -1 });

  console.log("[MongoDB] Indexes created");
}

/**
 * Get the database instance.
 */
export function getDb(): Db {
  if (!db) throw new Error("MongoDB not connected. Call connectMongo() first.");
  return db;
}

/**
 * Get the events collection.
 */
export function getEventsCollection(): Collection<GameEventDocument> {
  return getDb().collection(COLLECTIONS.EVENTS);
}

/**
 * Get the event aggregates collection.
 */
export function getAggregatesCollection(): Collection<EventAggregateDocument> {
  return getDb().collection(COLLECTIONS.EVENT_AGGREGATES);
}

/**
 * Disconnect from MongoDB.
 */
export async function disconnectMongo(): Promise<void> {
  if (client) {
    console.log("[MongoDB] Disconnecting...");
    await client.close();
    client = null;
    db = null;
    console.log("[MongoDB] Disconnected");
  }
}

/**
 * Check if MongoDB is connected.
 */
export function isMongoConnected(): boolean {
  return client !== null && db !== null;
}
