import { Worker, Job } from "bullmq";
import { config } from "../config/index.js";
import { prisma } from "../lib/scoped-prisma.js";
import { QUEUE_NAMES, REPORT_JOB_TYPES } from "./index.js";
import { ReportType } from "@prisma/client";

/**
 * Redis connection configuration.
 */
const redisConnection = {
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
};

/**
 * Job data types.
 */
interface GenerateReportJobData {
  organizationId: string;
  reportType: string;
  format: "pdf" | "csv" | "json";
  filters?: Record<string, any>;
  requestedBy?: string;
}

interface ScheduledReportJobData {
  scheduledReportId: string;
}

type JobData = GenerateReportJobData | ScheduledReportJobData;

/**
 * Report worker instance.
 */
let worker: Worker | null = null;

/**
 * Process report jobs.
 */
async function processJob(job: Job<JobData>): Promise<any> {
  console.log(`[ReportJob] Processing job ${job.id}: ${job.name}`);

  try {
    switch (job.name) {
      case REPORT_JOB_TYPES.GENERATE_REPORT:
        return await processGenerateReport(job as Job<GenerateReportJobData>);

      case REPORT_JOB_TYPES.SCHEDULED_REPORT:
        return await processScheduledReport(job as Job<ScheduledReportJobData>);

      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  } catch (error) {
    console.error(`[ReportJob] Job ${job.id} failed:`, error);
    throw error;
  }
}

/**
 * Generate a report on demand.
 */
async function processGenerateReport(
  job: Job<GenerateReportJobData>
): Promise<any> {
  const { organizationId, reportType, format, filters } = job.data;

  console.log(
    `[ReportJob] Generating ${reportType} report in ${format} for org ${organizationId}`
  );

  await job.updateProgress(10);

  // Gather report data based on type
  const reportData = await gatherReportData(
    organizationId,
    reportType,
    filters
  );

  await job.updateProgress(50);

  // Format the report
  const formattedReport = await formatReport(reportData, format);

  await job.updateProgress(80);

  // Store the report
  const report = await prisma.report.create({
    data: {
      organizationId,
      type: reportType as ReportType,
      title: `${reportType} Report - ${new Date().toLocaleDateString()}`,
      data: {
        format,
        content: formattedReport,
        filters,
        generatedAt: new Date().toISOString(),
      },
    },
  });

  await job.updateProgress(100);

  console.log(`[ReportJob] Report ${report.id} generated successfully`);

  return {
    reportId: report.id,
    type: reportType,
    format,
  };
}

/**
 * Process a scheduled report.
 */
async function processScheduledReport(
  job: Job<ScheduledReportJobData>
): Promise<any> {
  const { scheduledReportId } = job.data;

  console.log(`[ReportJob] Processing scheduled report ${scheduledReportId}`);

  const scheduledReport = await prisma.scheduledReport.findUnique({
    where: { id: scheduledReportId },
  });

  if (!scheduledReport) {
    throw new Error(`Scheduled report ${scheduledReportId} not found`);
  }

  if (!scheduledReport.isActive) {
    console.log(`[ReportJob] Scheduled report ${scheduledReportId} is inactive`);
    return { skipped: true };
  }

  // Generate the report
  const reportData = await gatherReportData(
    scheduledReport.organizationId,
    scheduledReport.reportType,
    scheduledReport.filters as Record<string, any>
  );

  const formattedReport = await formatReport(
    reportData,
    scheduledReport.format as "pdf" | "csv" | "json"
  );

  // Store the report
  const report = await prisma.report.create({
    data: {
      organizationId: scheduledReport.organizationId,
      type: scheduledReport.reportType,
      title: `${scheduledReport.title} - ${new Date().toLocaleDateString()}`,
      data: {
        format: scheduledReport.format,
        content: formattedReport,
        filters: scheduledReport.filters,
        scheduledReportId,
        generatedAt: new Date().toISOString(),
      },
    },
  });

  // Update last run time
  await prisma.scheduledReport.update({
    where: { id: scheduledReportId },
    data: {
      lastRunAt: new Date(),
    },
  });

  // Send to recipients if configured
  const recipients = scheduledReport.recipients as string[];
  if (recipients.length > 0) {
    // TODO: Integrate with notification service to send emails
    console.log(
      `[ReportJob] Would send report to ${recipients.length} recipients`
    );
  }

  console.log(`[ReportJob] Scheduled report processed, created ${report.id}`);

  return {
    reportId: report.id,
    scheduledReportId,
    recipientCount: recipients.length,
  };
}

/**
 * Gather data for a report based on type.
 */
async function gatherReportData(
  organizationId: string,
  reportType: string,
  filters?: Record<string, any>
): Promise<any> {
  const dateRange = getDateRange(filters);

  switch (reportType) {
    case "COMPLIANCE":
      return await gatherComplianceData(organizationId, dateRange);

    case "PERFORMANCE_SUMMARY":
      return await gatherPerformanceData(organizationId, dateRange);

    case "RISK_ASSESSMENT":
      return await gatherRiskData(organizationId);

    case "EXECUTIVE_SUMMARY":
      return await gatherExecutiveSummary(organizationId, dateRange);

    case "ORGANIZATION":
      return await gatherOrgOverview(organizationId, dateRange);

    case "GROUP":
      return await gatherGroupData(organizationId, filters?.groupId, dateRange);

    case "USER":
      return await gatherUserData(filters?.userId);

    case "ROOM":
      return await gatherRoomData(organizationId, filters?.roomId, dateRange);

    default:
      throw new Error(`Unknown report type: ${reportType}`);
  }
}

/**
 * Get date range from filters or default to last 30 days.
 */
function getDateRange(filters?: Record<string, any>) {
  const now = new Date();
  return {
    start: filters?.startDate
      ? new Date(filters.startDate)
      : new Date(now.getTime() - 30 * 86400000),
    end: filters?.endDate ? new Date(filters.endDate) : now,
  };
}

/**
 * Gather compliance report data.
 */
async function gatherComplianceData(
  organizationId: string,
  dateRange: { start: Date; end: Date }
) {
  const [users, completions, compliance] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId, status: "ACTIVE" },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        gameProgress: {
          where: { status: "ROOM_COMPLETE" },
          include: { room: { select: { name: true, type: true } } },
        },
      },
    }),
    prisma.gameProgress.count({
      where: {
        user: { organizationId },
        status: "ROOM_COMPLETE",
        completedAt: { gte: dateRange.start, lte: dateRange.end },
      },
    }),
    prisma.complianceSettings.findUnique({
      where: { organizationId },
    }),
  ]);

  const requiredRooms = (compliance?.requiredRooms as string[]) || [];
  const deadline = compliance?.trainingDeadlineDays || 30;

  // Calculate compliance status for each user
  const userCompliance = users.map((user) => {
    const completedTypes = new Set(user.gameProgress.map((p) => p.room.type));
    const completedRequired = requiredRooms.filter((r) =>
      completedTypes.has(r)
    ).length;
    const isCompliant = completedRequired >= requiredRooms.length;

    const daysSinceJoin = Math.floor(
      (Date.now() - new Date(user.createdAt).getTime()) / 86400000
    );
    const isOverdue = daysSinceJoin > deadline && !isCompliant;

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      completedRooms: completedRequired,
      requiredRooms: requiredRooms.length,
      isCompliant,
      isOverdue,
      daysSinceJoin,
    };
  });

  return {
    reportType: "COMPLIANCE",
    organizationId,
    period: dateRange,
    summary: {
      totalUsers: users.length,
      compliantUsers: userCompliance.filter((u) => u.isCompliant).length,
      overdueUsers: userCompliance.filter((u) => u.isOverdue).length,
      complianceRate:
        users.length > 0
          ? (userCompliance.filter((u) => u.isCompliant).length / users.length) *
            100
          : 0,
      totalCompletions: completions,
    },
    users: userCompliance,
    settings: {
      requiredRooms,
      deadlineDays: deadline,
    },
  };
}

/**
 * Gather performance summary data.
 */
async function gatherPerformanceData(
  organizationId: string,
  dateRange: { start: Date; end: Date }
) {
  const [stats, roomStats, topPerformers] = await Promise.all([
    prisma.gameProgress.aggregate({
      where: {
        user: { organizationId },
        status: "ROOM_COMPLETE",
        completedAt: { gte: dateRange.start, lte: dateRange.end },
      },
      _avg: { score: true, timeSpent: true },
      _count: { _all: true },
    }),
    prisma.gameProgress.groupBy({
      by: ["roomId"],
      where: {
        user: { organizationId },
        status: "ROOM_COMPLETE",
        completedAt: { gte: dateRange.start, lte: dateRange.end },
      },
      _avg: { score: true },
      _count: { _all: true },
    }),
    prisma.userStats.findMany({
      where: { user: { organizationId } },
      orderBy: { totalScore: "desc" },
      take: 10,
      include: { user: { select: { firstName: true, lastName: true } } },
    }),
  ]);

  // Get room names
  const rooms = await prisma.room.findMany({
    where: { id: { in: roomStats.map((r) => r.roomId) } },
    select: { id: true, name: true, type: true },
  });

  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  return {
    reportType: "PERFORMANCE_SUMMARY",
    organizationId,
    period: dateRange,
    summary: {
      totalCompletions: stats._count._all,
      averageScore: stats._avg.score ?? 0,
      averageTimeSpent: stats._avg.timeSpent ?? 0,
    },
    byRoom: roomStats.map((r) => ({
      roomId: r.roomId,
      roomName: roomMap.get(r.roomId)?.name || "Unknown",
      roomType: roomMap.get(r.roomId)?.type || "Unknown",
      completions: r._count._all,
      averageScore: r._avg.score ?? 0,
    })),
    topPerformers: topPerformers.map((u) => ({
      name: `${u.user.firstName} ${u.user.lastName}`,
      totalScore: u.totalScore,
      roomsCompleted: u.roomsCompleted,
      accuracy: u.accuracy,
    })),
  };
}

/**
 * Gather risk assessment data.
 */
async function gatherRiskData(organizationId: string) {
  const [users, riskScores, latestOrgScore] = await Promise.all([
    prisma.user.count({ where: { organizationId, status: "ACTIVE" } }),
    prisma.userRiskScore.findMany({
      where: { user: { organizationId } },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { riskScore: "desc" },
    }),
    prisma.organizationResilienceScore.findFirst({
      where: { organizationId },
      orderBy: { calculatedAt: "desc" },
    }),
  ]);

  const riskBreakdown = {
    LOW: riskScores.filter((r) => r.riskLevel === "LOW").length,
    MEDIUM: riskScores.filter((r) => r.riskLevel === "MEDIUM").length,
    HIGH: riskScores.filter((r) => r.riskLevel === "HIGH").length,
    CRITICAL: riskScores.filter((r) => r.riskLevel === "CRITICAL").length,
  };

  return {
    reportType: "RISK_ASSESSMENT",
    organizationId,
    generatedAt: new Date().toISOString(),
    summary: {
      totalUsers: users,
      resilienceScore: latestOrgScore?.overallScore ?? 0,
      ...riskBreakdown,
      highRiskPercentage:
        users > 0
          ? ((riskBreakdown.HIGH + riskBreakdown.CRITICAL) / users) * 100
          : 0,
    },
    highRiskUsers: riskScores
      .filter((r) => r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL")
      .map((r) => ({
        name: `${r.user.firstName} ${r.user.lastName}`,
        email: r.user.email,
        riskLevel: r.riskLevel,
        riskScore: r.riskScore,
        factors: r.riskFactors,
      })),
    allUsers: riskScores.map((r) => ({
      name: `${r.user.firstName} ${r.user.lastName}`,
      email: r.user.email,
      riskLevel: r.riskLevel,
      riskScore: r.riskScore,
      trainingCompletion: r.trainingCompletion,
      performanceScore: r.performanceScore,
      daysSinceActivity: r.daysSinceActivity,
    })),
  };
}

/**
 * Gather executive summary data.
 */
async function gatherExecutiveSummary(
  organizationId: string,
  dateRange: { start: Date; end: Date }
) {
  const [compliance, performance, risk, trends] = await Promise.all([
    gatherComplianceData(organizationId, dateRange),
    gatherPerformanceData(organizationId, dateRange),
    gatherRiskData(organizationId),
    prisma.organizationResilienceScore.findMany({
      where: {
        organizationId,
        calculatedAt: { gte: dateRange.start },
      },
      orderBy: { calculatedAt: "asc" },
      take: 30,
    }),
  ]);

  // Calculate trend
  const scoreTrend =
    trends.length >= 2
      ? trends[trends.length - 1].overallScore - trends[0].overallScore
      : 0;

  return {
    reportType: "EXECUTIVE_SUMMARY",
    organizationId,
    period: dateRange,
    keyMetrics: {
      resilienceScore: risk.summary.resilienceScore,
      scoreTrend,
      complianceRate: compliance.summary.complianceRate,
      averagePerformance: performance.summary.averageScore,
      totalCompletions: performance.summary.totalCompletions,
      highRiskUsers: risk.summary.HIGH + risk.summary.CRITICAL,
    },
    highlights: {
      topPerformers: performance.topPerformers.slice(0, 3),
      criticalRiskUsers: risk.highRiskUsers.slice(0, 5),
      overdueUsers: compliance.users.filter((u) => u.isOverdue).length,
    },
    trends: trends.map((t) => ({
      date: t.calculatedAt,
      score: t.overallScore,
      completion: t.completionScore,
      performance: t.performanceScore,
    })),
  };
}

/**
 * Gather organization overview data.
 */
async function gatherOrgOverview(
  organizationId: string,
  dateRange: { start: Date; end: Date }
) {
  const [org, stats, groups] = await Promise.all([
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { name: true, slug: true, maxUsers: true, createdAt: true },
    }),
    prisma.user.aggregate({
      where: { organizationId },
      _count: { _all: true },
    }),
    prisma.group.findMany({
      where: { organizationId },
      include: { _count: { select: { userGroups: true } } },
    }),
  ]);

  return {
    reportType: "ORGANIZATION",
    organization: org,
    period: dateRange,
    users: {
      total: stats._count._all,
    },
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      memberCount: g._count.userGroups,
    })),
  };
}

/**
 * Gather group-specific data.
 */
async function gatherGroupData(
  organizationId: string,
  groupId: string | undefined,
  dateRange: { start: Date; end: Date }
) {
  if (!groupId) {
    throw new Error("Group ID required for group report");
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      userGroups: {
        include: {
          user: {
            include: {
              stats: true,
              gameProgress: { include: { room: true } },
            },
          },
        },
      },
    },
  });

  if (!group) {
    throw new Error("Group not found");
  }

  return {
    reportType: "GROUP",
    group: { id: group.id, name: group.name },
    period: dateRange,
    members: group.userGroups.map((ug) => ({
      id: ug.user.id,
      name: `${ug.user.firstName} ${ug.user.lastName}`,
      stats: ug.user.stats,
      completedRooms: ug.user.gameProgress.filter(
        (p) => p.status === "ROOM_COMPLETE"
      ).length,
    })),
  };
}

/**
 * Gather user-specific data.
 */
async function gatherUserData(userId: string | undefined) {
  if (!userId) {
    throw new Error("User ID required for user report");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      stats: true,
      gameProgress: { include: { room: true } },
      puzzleAttempts: {
        include: { puzzle: true },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      userBadges: { include: { badge: true } },
      riskScore: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return {
    reportType: "USER",
    user: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    },
    stats: user.stats,
    riskScore: user.riskScore,
    progress: user.gameProgress,
    recentAttempts: user.puzzleAttempts,
    badges: user.userBadges,
  };
}

/**
 * Gather room-specific data.
 */
async function gatherRoomData(
  organizationId: string,
  roomId: string | undefined,
  dateRange: { start: Date; end: Date }
) {
  if (!roomId) {
    throw new Error("Room ID required for room report");
  }

  const [room, stats, puzzleStats] = await Promise.all([
    prisma.room.findUnique({
      where: { id: roomId },
      include: { puzzles: true },
    }),
    prisma.gameProgress.aggregate({
      where: {
        roomId,
        user: { organizationId },
        completedAt: { gte: dateRange.start, lte: dateRange.end },
      },
      _avg: { score: true, timeSpent: true },
      _count: { _all: true },
    }),
    prisma.puzzleAttempt.groupBy({
      by: ["puzzleId"],
      where: {
        puzzle: { roomId },
        user: { organizationId },
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
      _avg: { score: true },
      _count: { _all: true },
    }),
  ]);

  return {
    reportType: "ROOM",
    room,
    period: dateRange,
    stats: {
      completions: stats._count._all,
      averageScore: stats._avg.score ?? 0,
      averageTime: stats._avg.timeSpent ?? 0,
    },
    puzzleStats,
  };
}

/**
 * Format report data into the requested format.
 */
async function formatReport(
  data: any,
  format: "pdf" | "csv" | "json"
): Promise<string> {
  switch (format) {
    case "json":
      return JSON.stringify(data, null, 2);

    case "csv":
      return formatAsCsv(data);

    case "pdf":
      // For PDF, we return the data as JSON - actual PDF generation
      // would be handled by a separate service (e.g., Puppeteer)
      return JSON.stringify({
        _format: "pdf",
        _note: "PDF generation requires Puppeteer service",
        data,
      });

    default:
      throw new Error(`Unsupported format: ${format}`);
  }
}

/**
 * Format data as CSV (simplified implementation).
 */
function formatAsCsv(data: any): string {
  // Handle different report types
  if (data.users && Array.isArray(data.users)) {
    const headers = Object.keys(data.users[0] || {});
    const rows = data.users.map((u: any) =>
      headers.map((h) => JSON.stringify(u[h] ?? "")).join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  }

  if (data.allUsers && Array.isArray(data.allUsers)) {
    const headers = Object.keys(data.allUsers[0] || {});
    const rows = data.allUsers.map((u: any) =>
      headers.map((h) => JSON.stringify(u[h] ?? "")).join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  }

  // Fallback: convert to simple key-value pairs
  const rows = Object.entries(data).map(
    ([key, value]) => `${key},${JSON.stringify(value)}`
  );
  return rows.join("\n");
}

/**
 * Start the report worker.
 */
export function startReportWorker() {
  if (worker) {
    console.warn("[ReportJob] Worker already running");
    return worker;
  }

  console.log("[ReportJob] Starting worker...");

  worker = new Worker(QUEUE_NAMES.REPORTS, processJob, {
    connection: redisConnection,
    concurrency: 3, // Process up to 3 reports concurrently
    limiter: {
      max: 10,
      duration: 60000,
    },
  });

  worker.on("completed", (job) => {
    console.log(`[ReportJob] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[ReportJob] Job ${job?.id} failed:`, err.message);
  });

  worker.on("error", (err) => {
    console.error("[ReportJob] Worker error:", err);
  });

  console.log("[ReportJob] Worker started");
  return worker;
}

/**
 * Stop the report worker.
 */
export async function stopReportWorker() {
  if (worker) {
    console.log("[ReportJob] Stopping worker...");
    await worker.close();
    worker = null;
    console.log("[ReportJob] Worker stopped");
  }
}
