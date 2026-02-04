import Queue from "bull";
import { config } from "../config/index.js";

/**
 * Redis connection configuration for Bull queues.
 */
const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
};

/**
 * Job queue names.
 */
export const QUEUE_NAMES = {
  RESILIENCE_SCORE: "resilience-score",
  REPORTS: "reports",
  ALERTS: "alerts",
  NOTIFICATIONS: "notifications",
  EVENT_INGESTION: "event-ingestion",
} as const;

/**
 * Job types for resilience score queue.
 */
export const RESILIENCE_JOB_TYPES = {
  CALCULATE_ORG_SCORE: "calculate-org-score",
  CALCULATE_GROUP_SCORE: "calculate-group-score",
  CALCULATE_USER_RISK: "calculate-user-risk",
  CALCULATE_ALL_USER_RISKS: "calculate-all-user-risks",
  DAILY_CALCULATION: "daily-calculation",
} as const;

/**
 * Job types for reports queue.
 */
export const REPORT_JOB_TYPES = {
  GENERATE_REPORT: "generate-report",
  SCHEDULED_REPORT: "scheduled-report",
} as const;

/**
 * Job types for alerts queue.
 */
export const ALERT_JOB_TYPES = {
  CHECK_ALERTS: "check-alerts",
  SEND_ALERT: "send-alert",
} as const;

/**
 * Job types for event ingestion queue.
 */
export const EVENT_INGESTION_JOB_TYPES = {
  INGEST_EVENT: "ingest-event",
  INGEST_BATCH: "ingest-batch",
} as const;

// Queue instances
let resilienceQueue: Queue.Queue | null = null;
let reportQueue: Queue.Queue | null = null;
let alertQueue: Queue.Queue | null = null;
let notificationQueue: Queue.Queue | null = null;
let eventIngestionQueue: Queue.Queue | null = null;

/**
 * Initialize all job queues.
 */
export async function initializeQueues() {
  console.log("[Jobs] Initializing job queues...");

  // Create queues
  resilienceQueue = new Queue(QUEUE_NAMES.RESILIENCE_SCORE, {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: 1000,
      removeOnFail: 500,
    },
  });

  reportQueue = new Queue(QUEUE_NAMES.REPORTS, {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 10000,
      },
      removeOnComplete: 500,
      removeOnFail: 100,
    },
  });

  alertQueue = new Queue(QUEUE_NAMES.ALERTS, {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 5,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
      removeOnComplete: 500,
    },
  });

  notificationQueue = new Queue(QUEUE_NAMES.NOTIFICATIONS, {
    redis: redisConfig,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: true,
    },
  });

  eventIngestionQueue = new Queue(QUEUE_NAMES.EVENT_INGESTION, {
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

  // Set up repeating jobs
  await setupRepeatingJobs();

  console.log("[Jobs] Job queues initialized successfully");
}

/**
 * Set up recurring/scheduled jobs.
 */
async function setupRepeatingJobs() {
  if (!resilienceQueue || !alertQueue) {
    console.warn("[Jobs] Queues not initialized, skipping repeating jobs setup");
    return;
  }

  // Daily resilience score calculation at 2:00 AM
  await resilienceQueue.add(
    RESILIENCE_JOB_TYPES.DAILY_CALCULATION,
    { type: "daily" },
    {
      repeat: {
        cron: "0 2 * * *", // 2:00 AM daily
      },
      jobId: "daily-resilience-calculation",
    }
  );

  // Hourly alert check
  await alertQueue.add(
    ALERT_JOB_TYPES.CHECK_ALERTS,
    { type: "hourly" },
    {
      repeat: {
        cron: "0 * * * *", // Every hour
      },
      jobId: "hourly-alert-check",
    }
  );

  console.log("[Jobs] Repeating jobs scheduled");
}

/**
 * Get the resilience score queue.
 */
export function getResilienceQueue(): Queue.Queue {
  if (!resilienceQueue) {
    throw new Error("Resilience queue not initialized. Call initializeQueues() first.");
  }
  return resilienceQueue;
}

/**
 * Get the reports queue.
 */
export function getReportQueue(): Queue.Queue {
  if (!reportQueue) {
    throw new Error("Report queue not initialized. Call initializeQueues() first.");
  }
  return reportQueue;
}

/**
 * Get the alerts queue.
 */
export function getAlertQueue(): Queue.Queue {
  if (!alertQueue) {
    throw new Error("Alert queue not initialized. Call initializeQueues() first.");
  }
  return alertQueue;
}

/**
 * Get the notifications queue.
 */
export function getNotificationQueue(): Queue.Queue {
  if (!notificationQueue) {
    throw new Error("Notification queue not initialized. Call initializeQueues() first.");
  }
  return notificationQueue;
}

/**
 * Get the event ingestion queue.
 */
export function getEventIngestionQueue(): Queue.Queue {
  if (!eventIngestionQueue) {
    throw new Error("Event ingestion queue not initialized. Call initializeQueues() first.");
  }
  return eventIngestionQueue;
}

/**
 * Add a job to calculate organization resilience score.
 */
export async function scheduleOrgResilienceCalculation(
  organizationId: string,
  options?: { delay?: number }
) {
  const queue = getResilienceQueue();
  return queue.add(
    RESILIENCE_JOB_TYPES.CALCULATE_ORG_SCORE,
    { organizationId },
    { delay: options?.delay }
  );
}

/**
 * Add a job to calculate all user risk scores for an organization.
 */
export async function scheduleUserRiskCalculation(
  organizationId: string,
  options?: { delay?: number }
) {
  const queue = getResilienceQueue();
  return queue.add(
    RESILIENCE_JOB_TYPES.CALCULATE_ALL_USER_RISKS,
    { organizationId },
    { delay: options?.delay }
  );
}

/**
 * Add a job to generate a report.
 */
export async function scheduleReportGeneration(
  organizationId: string,
  reportType: string,
  format: string,
  filters?: Record<string, any>
) {
  const queue = getReportQueue();
  return queue.add(REPORT_JOB_TYPES.GENERATE_REPORT, {
    organizationId,
    reportType,
    format,
    filters,
  });
}

/**
 * Clean up queues on shutdown.
 */
export async function shutdownQueues() {
  console.log("[Jobs] Shutting down job queues...");

  const closePromises = [];

  if (resilienceQueue) closePromises.push(resilienceQueue.close());
  if (reportQueue) closePromises.push(reportQueue.close());
  if (alertQueue) closePromises.push(alertQueue.close());
  if (notificationQueue) closePromises.push(notificationQueue.close());
  if (eventIngestionQueue) closePromises.push(eventIngestionQueue.close());

  await Promise.all(closePromises);

  console.log("[Jobs] Job queues shut down successfully");
}
