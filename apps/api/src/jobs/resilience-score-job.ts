import Queue from "bull";
import { config } from "../config/index.js";
import { resilienceScoringService } from "../services/resilience-scoring.js";
import { prisma } from "../lib/scoped-prisma.js";
import { QUEUE_NAMES, RESILIENCE_JOB_TYPES } from "./index.js";

/**
 * Redis connection configuration.
 */
const redisConfig = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
};

/**
 * Job data types.
 */
interface OrgScoreJobData {
  organizationId: string;
  periodStart?: string;
  periodEnd?: string;
}

interface GroupScoreJobData {
  groupId: string;
  periodStart?: string;
  periodEnd?: string;
}

interface UserRiskJobData {
  userId: string;
}

interface AllUserRisksJobData {
  organizationId: string;
}

interface DailyCalculationJobData {
  type: "daily";
}

/**
 * Resilience score worker instance.
 */
let resilienceQueue: Queue.Queue | null = null;

/**
 * Process resilience score jobs.
 */
async function processJob(job: Queue.Job): Promise<any> {
  console.log(`[ResilienceJob] Processing job ${job.id}: ${job.name}`);

  try {
    switch (job.name) {
      case RESILIENCE_JOB_TYPES.CALCULATE_ORG_SCORE:
        return await processOrgScore(job);

      case RESILIENCE_JOB_TYPES.CALCULATE_GROUP_SCORE:
        return await processGroupScore(job);

      case RESILIENCE_JOB_TYPES.CALCULATE_USER_RISK:
        return await processUserRisk(job);

      case RESILIENCE_JOB_TYPES.CALCULATE_ALL_USER_RISKS:
        return await processAllUserRisks(job);

      case RESILIENCE_JOB_TYPES.DAILY_CALCULATION:
        return await processDailyCalculation(job);

      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  } catch (error) {
    console.error(`[ResilienceJob] Job ${job.id} failed:`, error);
    throw error;
  }
}

/**
 * Calculate organization resilience score.
 */
async function processOrgScore(job: Queue.Job<OrgScoreJobData>): Promise<any> {
  const { organizationId, periodStart, periodEnd } = job.data;

  console.log(`[ResilienceJob] Calculating org score for ${organizationId}`);

  const start = periodStart ? new Date(periodStart) : undefined;
  const end = periodEnd ? new Date(periodEnd) : undefined;

  const result = await resilienceScoringService.calculateOrgResilienceScore(
    organizationId,
    start,
    end
  );

  console.log(
    `[ResilienceJob] Org ${organizationId} score: ${result.overallScore.toFixed(1)}`
  );

  return {
    organizationId,
    overallScore: result.overallScore,
    completionScore: result.completionScore,
    performanceScore: result.performanceScore,
  };
}

/**
 * Calculate group resilience score.
 */
async function processGroupScore(job: Queue.Job<GroupScoreJobData>): Promise<any> {
  const { groupId, periodStart, periodEnd } = job.data;

  console.log(`[ResilienceJob] Calculating group score for ${groupId}`);

  const start = periodStart ? new Date(periodStart) : undefined;
  const end = periodEnd ? new Date(periodEnd) : undefined;

  const result = await resilienceScoringService.calculateGroupResilienceScore(
    groupId,
    start,
    end
  );

  if (!result) {
    console.log(`[ResilienceJob] Group ${groupId} has no members`);
    return { groupId, skipped: true };
  }

  console.log(
    `[ResilienceJob] Group ${groupId} score: ${result.overallScore.toFixed(1)}`
  );

  return {
    groupId,
    overallScore: result.overallScore,
    completionScore: result.completionScore,
    performanceScore: result.performanceScore,
  };
}

/**
 * Calculate individual user risk score.
 */
async function processUserRisk(job: Queue.Job<UserRiskJobData>): Promise<any> {
  const { userId } = job.data;

  console.log(`[ResilienceJob] Calculating risk score for user ${userId}`);

  const result = await resilienceScoringService.calculateUserRiskScore(userId);

  console.log(
    `[ResilienceJob] User ${userId} risk: ${result.riskLevel} (${result.riskScore})`
  );

  return {
    userId,
    riskLevel: result.riskLevel,
    riskScore: result.riskScore,
  };
}

/**
 * Calculate risk scores for all users in an organization.
 */
async function processAllUserRisks(job: Queue.Job<AllUserRisksJobData>): Promise<any> {
  const { organizationId } = job.data;

  console.log(
    `[ResilienceJob] Calculating all user risk scores for org ${organizationId}`
  );

  const users = await prisma.user.findMany({
    where: { organizationId, status: "ACTIVE" },
    select: { id: true },
  });

  const total = users.length;
  let processed = 0;
  const results = {
    total,
    success: 0,
    failed: 0,
    riskBreakdown: {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    },
  };

  for (const user of users) {
    try {
      const result = await resilienceScoringService.calculateUserRiskScore(
        user.id
      );
      results.success++;
      results.riskBreakdown[result.riskLevel]++;
    } catch (error) {
      console.error(`[ResilienceJob] Failed for user ${user.id}:`, error);
      results.failed++;
    }

    processed++;
    await job.progress(Math.round((processed / total) * 100));
  }

  console.log(
    `[ResilienceJob] Completed: ${results.success}/${total} users processed`
  );

  return results;
}

/**
 * Daily calculation job - runs for all organizations.
 */
async function processDailyCalculation(
  job: Queue.Job<DailyCalculationJobData>
): Promise<any> {
  console.log("[ResilienceJob] Starting daily calculation for all organizations");

  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true },
  });

  const results = {
    total: organizations.length,
    success: 0,
    failed: 0,
    scores: [] as Array<{ orgId: string; orgName: string; score: number }>,
  };

  for (const org of organizations) {
    try {
      // Calculate user risk scores first
      await resilienceScoringService.calculateAllUserRiskScores(org.id);

      // Then calculate org score
      const score = await resilienceScoringService.calculateOrgResilienceScore(
        org.id
      );

      results.success++;
      results.scores.push({
        orgId: org.id,
        orgName: org.name,
        score: score.overallScore,
      });

      // Also calculate group scores
      const groups = await prisma.group.findMany({
        where: { organizationId: org.id },
        select: { id: true },
      });

      for (const group of groups) {
        await resilienceScoringService.calculateGroupResilienceScore(group.id);
      }
    } catch (error) {
      console.error(`[ResilienceJob] Failed for org ${org.id}:`, error);
      results.failed++;
    }

    await job.progress(
      Math.round(((results.success + results.failed) / results.total) * 100)
    );
  }

  console.log(
    `[ResilienceJob] Daily calculation complete: ${results.success}/${results.total} orgs`
  );

  return results;
}

/**
 * Start the resilience score worker.
 */
export function startResilienceWorker() {
  if (resilienceQueue) {
    console.warn("[ResilienceJob] Worker already running");
    return resilienceQueue;
  }

  console.log("[ResilienceJob] Starting worker...");

  resilienceQueue = new Queue(QUEUE_NAMES.RESILIENCE_SCORE, {
    redis: redisConfig,
  });

  // Process all job types
  resilienceQueue.process(RESILIENCE_JOB_TYPES.CALCULATE_ORG_SCORE, processJob);
  resilienceQueue.process(RESILIENCE_JOB_TYPES.CALCULATE_GROUP_SCORE, processJob);
  resilienceQueue.process(RESILIENCE_JOB_TYPES.CALCULATE_USER_RISK, processJob);
  resilienceQueue.process(RESILIENCE_JOB_TYPES.CALCULATE_ALL_USER_RISKS, processJob);
  resilienceQueue.process(RESILIENCE_JOB_TYPES.DAILY_CALCULATION, processJob);

  resilienceQueue.on("completed", (job) => {
    console.log(`[ResilienceJob] Job ${job.id} completed`);
  });

  resilienceQueue.on("failed", (job, err) => {
    console.error(`[ResilienceJob] Job ${job?.id} failed:`, err.message);
  });

  resilienceQueue.on("error", (err) => {
    console.error("[ResilienceJob] Worker error:", err);
  });

  console.log("[ResilienceJob] Worker started");
  return resilienceQueue;
}

/**
 * Stop the resilience score worker.
 */
export async function stopResilienceWorker() {
  if (resilienceQueue) {
    console.log("[ResilienceJob] Stopping worker...");
    await resilienceQueue.close();
    resilienceQueue = null;
    console.log("[ResilienceJob] Worker stopped");
  }
}
