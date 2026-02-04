import Queue from "bull";
import { config } from "../config/index.js";
import { eventIngestionService, EventInput } from "../services/event-ingestion.js";
import { QUEUE_NAMES, EVENT_INGESTION_JOB_TYPES } from "./index.js";

/**
 * Redis configuration.
 */
const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
};

/**
 * Job data types.
 */
interface IngestEventJobData {
  eventId: string;
  event: EventInput;
}

interface IngestBatchJobData {
  events: EventInput[];
}

/**
 * Event ingestion queue instance.
 */
let eventQueue: Queue.Queue | null = null;

/**
 * Process event ingestion jobs.
 */
async function processJob(job: Queue.Job): Promise<unknown> {
  console.log(`[EventIngestion] Processing job ${job.id}: ${job.name}`);

  try {
    switch (job.name) {
      case EVENT_INGESTION_JOB_TYPES.INGEST_EVENT:
        return await processIngestEvent(job as Queue.Job<IngestEventJobData>);

      case EVENT_INGESTION_JOB_TYPES.INGEST_BATCH:
        return await processIngestBatch(job as Queue.Job<IngestBatchJobData>);

      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  } catch (error) {
    console.error(`[EventIngestion] Job ${job.id} failed:`, error);
    throw error;
  }
}

/**
 * Process single event ingestion.
 */
async function processIngestEvent(job: Queue.Job<IngestEventJobData>): Promise<{ eventId: string }> {
  const { eventId, event } = job.data;

  const insertedId = await eventIngestionService.writeEvent(event);

  console.log(`[EventIngestion] Event ${eventId} written with id ${insertedId}`);

  return { eventId: insertedId };
}

/**
 * Process batch event ingestion.
 */
async function processIngestBatch(job: Queue.Job<IngestBatchJobData>): Promise<{ count: number }> {
  const { events } = job.data;

  if (events.length === 0) {
    return { count: 0 };
  }

  // Process in chunks of 100 for large batches
  const CHUNK_SIZE = 100;
  let totalInserted = 0;

  for (let i = 0; i < events.length; i += CHUNK_SIZE) {
    const chunk = events.slice(i, i + CHUNK_SIZE);
    const inserted = await eventIngestionService.writeBatch(chunk);
    totalInserted += inserted;

    // Update progress
    await job.progress(Math.round(((i + chunk.length) / events.length) * 100));
  }

  console.log(`[EventIngestion] Batch of ${totalInserted} events written`);

  return { count: totalInserted };
}

/**
 * Start the event ingestion worker.
 */
export function startEventIngestionWorker(): Queue.Queue {
  if (eventQueue) {
    console.warn("[EventIngestion] Worker already running");
    return eventQueue;
  }

  console.log("[EventIngestion] Starting worker...");

  eventQueue = new Queue(QUEUE_NAMES.EVENT_INGESTION, {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: 1000,
      removeOnFail: 500,
    },
  });

  // Process all job types
  eventQueue.process(EVENT_INGESTION_JOB_TYPES.INGEST_EVENT, 10, processJob); // 10 concurrent
  eventQueue.process(EVENT_INGESTION_JOB_TYPES.INGEST_BATCH, 2, processJob); // 2 concurrent

  eventQueue.on("completed", (job) => {
    console.log(`[EventIngestion] Job ${job.id} completed`);
  });

  eventQueue.on("failed", (job, err) => {
    console.error(`[EventIngestion] Job ${job?.id} failed:`, err.message);
  });

  eventQueue.on("error", (err) => {
    console.error("[EventIngestion] Worker error:", err);
  });

  console.log("[EventIngestion] Worker started");
  return eventQueue;
}

/**
 * Stop the event ingestion worker.
 */
export async function stopEventIngestionWorker(): Promise<void> {
  if (eventQueue) {
    console.log("[EventIngestion] Stopping worker...");
    await eventQueue.close();
    eventQueue = null;
    console.log("[EventIngestion] Worker stopped");
  }
}
