import { PrismaClient } from "@prisma/client";
import { resilienceScoringService } from "../../services/resilience-scoring.js";
import { alertEngineService } from "../../services/alert-engine.js";
import { reportGeneratorService, ExportFormat } from "../../services/report-generator.js";
import { ReportType } from "@prisma/client";

const prisma = new PrismaClient();

export class AnalyticsService {
  async getOrgOverview(orgId: string) {
    const [totalUsers, activeUsers, totalCompletions, avgScore, resilienceScore] = await Promise.all([
      prisma.user.count({ where: { organizationId: orgId } }),
      prisma.user.count({ where: { organizationId: orgId, status: "ACTIVE", lastLoginAt: { gte: new Date(Date.now() - 30 * 86400000) } } }),
      prisma.gameProgress.count({ where: { user: { organizationId: orgId }, status: "ROOM_COMPLETE" } }),
      prisma.gameProgress.aggregate({ where: { user: { organizationId: orgId }, status: "ROOM_COMPLETE" }, _avg: { score: true } }),
      resilienceScoringService.getOrgResilienceScore(orgId),
    ]);
    const roomStats = await prisma.gameProgress.groupBy({ by: ["roomId"], where: { user: { organizationId: orgId } }, _count: { _all: true }, _avg: { score: true, timeSpent: true } });

    // Get risk counts
    const riskCounts = await prisma.userRiskScore.groupBy({
      by: ["riskLevel"],
      where: { user: { organizationId: orgId } },
      _count: { _all: true },
    });

    const riskBreakdown = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };
    for (const r of riskCounts) {
      riskBreakdown[r.riskLevel] = r._count._all;
    }

    return {
      totalUsers,
      activeUsers,
      totalCompletions,
      avgScore: avgScore._avg.score ?? 0,
      roomStats,
      resilienceScore: resilienceScore?.overallScore ?? null,
      riskBreakdown,
      atRiskUsers: riskBreakdown.HIGH + riskBreakdown.CRITICAL,
    };
  }

  async getByGroup(orgId: string, groupId: string) {
    const userIds = (await prisma.userGroup.findMany({ where: { groupId }, select: { userId: true } })).map((m) => m.userId);
    const [completions, avgScore, userProgress, groupScore] = await Promise.all([
      prisma.gameProgress.count({ where: { userId: { in: userIds }, status: "ROOM_COMPLETE" } }),
      prisma.gameProgress.aggregate({ where: { userId: { in: userIds }, status: "ROOM_COMPLETE" }, _avg: { score: true } }),
      prisma.userStats.findMany({ where: { userId: { in: userIds } }, include: { user: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { totalScore: "desc" } }),
      prisma.groupResilienceScore.findFirst({ where: { groupId }, orderBy: { calculatedAt: "desc" } }),
    ]);
    return {
      groupId,
      memberCount: userIds.length,
      completions,
      avgScore: avgScore._avg.score ?? 0,
      userProgress,
      resilienceScore: groupScore?.overallScore ?? null,
    };
  }

  async getByRoom(orgId: string, roomId: string) {
    const [completions, attempts, avgScore, avgTime, puzzleStats] = await Promise.all([
      prisma.gameProgress.count({ where: { roomId, user: { organizationId: orgId }, status: "ROOM_COMPLETE" } }),
      prisma.gameProgress.count({ where: { roomId, user: { organizationId: orgId } } }),
      prisma.gameProgress.aggregate({ where: { roomId, user: { organizationId: orgId }, status: "ROOM_COMPLETE" }, _avg: { score: true } }),
      prisma.gameProgress.aggregate({ where: { roomId, user: { organizationId: orgId }, status: "ROOM_COMPLETE" }, _avg: { timeSpent: true } }),
      prisma.puzzleAttempt.groupBy({ by: ["puzzleId"], where: { puzzle: { roomId }, user: { organizationId: orgId } }, _count: { _all: true }, _avg: { score: true } }),
    ]);
    return { roomId, completions, attempts, completionRate: attempts > 0 ? (completions / attempts) * 100 : 0, avgScore: avgScore._avg.score ?? 0, avgTime: avgTime._avg.timeSpent ?? 0, puzzleStats };
  }

  async getByUser(userId: string) {
    const [stats, progress, recentAttempts, badges, riskScore] = await Promise.all([
      prisma.userStats.findUnique({ where: { userId } }),
      prisma.gameProgress.findMany({ where: { userId }, include: { room: { select: { name: true, slug: true } } } }),
      prisma.puzzleAttempt.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20, include: { puzzle: { select: { title: true, type: true } } } }),
      prisma.userBadge.findMany({ where: { userId }, include: { badge: true } }),
      prisma.userRiskScore.findUnique({ where: { userId } }),
    ]);
    return { stats, progress, recentAttempts, badges, riskScore };
  }

  async getRiskUsers(orgId: string) {
    return prisma.user.findMany({
      where: { organizationId: orgId, status: "ACTIVE", OR: [{ lastLoginAt: { lt: new Date(Date.now() - 14 * 86400000) } }, { lastLoginAt: null }, { stats: { totalScore: { lt: 100 }, roomsCompleted: { lt: 1 } } }] },
      select: { id: true, email: true, firstName: true, lastName: true, lastLoginAt: true, stats: { select: { totalScore: true, roomsCompleted: true } } },
      orderBy: { lastLoginAt: "asc" }, take: 50,
    });
  }

  // Resilience score endpoints
  async getResilienceScore(orgId: string) {
    const score = await resilienceScoringService.getOrgResilienceScore(orgId);
    if (!score) {
      return {
        overallScore: null,
        completionScore: null,
        performanceScore: null,
        message: "No resilience score calculated yet. Scores are calculated daily.",
      };
    }
    return score;
  }

  async getResilienceHistory(orgId: string, days: number = 30) {
    return resilienceScoringService.getOrgResilienceHistory(orgId, days);
  }

  async getResilienceBreakdown(orgId: string) {
    const [score, groups] = await Promise.all([
      resilienceScoringService.getOrgResilienceScore(orgId),
      prisma.group.findMany({
        where: { organizationId: orgId },
        include: {
          resilienceScores: {
            orderBy: { calculatedAt: "desc" },
            take: 1,
          },
          _count: { select: { userGroups: true } },
        },
      }),
    ]);

    return {
      organization: score,
      groups: groups.map((g) => ({
        id: g.id,
        name: g.name,
        memberCount: g._count.userGroups,
        score: g.resilienceScores[0] || null,
      })),
    };
  }

  async getGroupResilience(groupId: string) {
    return prisma.groupResilienceScore.findFirst({
      where: { groupId },
      orderBy: { calculatedAt: "desc" },
    });
  }

  async getRiskMatrix(orgId: string) {
    return resilienceScoringService.getRiskMatrix(orgId);
  }

  async getKnowledgeGaps(orgId: string) {
    return resilienceScoringService.getKnowledgeGaps(orgId);
  }

  // Trigger resilience calculation
  async calculateResilienceScore(orgId: string) {
    // Calculate user risk scores first
    await resilienceScoringService.calculateAllUserRiskScores(orgId);
    // Then calculate org score
    const score = await resilienceScoringService.calculateOrgResilienceScore(orgId);
    return score;
  }

  // Alerts
  async getAlerts(orgId: string) {
    return alertEngineService.getActiveAlerts(orgId);
  }

  async getAlertCounts(orgId: string) {
    return alertEngineService.getAlertCounts(orgId);
  }

  async acknowledgeAlert(alertId: string, userId: string) {
    return alertEngineService.acknowledgeAlert(alertId, userId);
  }

  async checkAlerts(orgId: string) {
    return alertEngineService.checkAlerts(orgId);
  }

  // Reports
  async generateReport(
    orgId: string,
    reportType: ReportType,
    format: ExportFormat,
    filters?: { startDate?: Date; endDate?: Date; groupId?: string; userId?: string; roomId?: string },
    requestedBy?: string
  ) {
    return reportGeneratorService.generateReport({
      organizationId: orgId,
      reportType,
      format,
      filters,
      requestedBy,
    });
  }

  async getReport(reportId: string) {
    return reportGeneratorService.getReport(reportId);
  }

  async listReports(orgId: string, type?: ReportType, limit?: number, offset?: number) {
    return reportGeneratorService.listReports(orgId, { type, limit, offset });
  }

  async getScheduledReports(orgId: string) {
    return reportGeneratorService.getScheduledReports(orgId);
  }

  async scheduleReport(options: {
    organizationId: string;
    title: string;
    reportType: ReportType;
    format: ExportFormat;
    schedule: string;
    recipients: string[];
    filters?: Record<string, any>;
  }) {
    return reportGeneratorService.scheduleReport(options);
  }

  async updateScheduledReport(reportId: string, updates: any) {
    return reportGeneratorService.updateScheduledReport(reportId, updates);
  }

  async deleteScheduledReport(reportId: string) {
    return reportGeneratorService.deleteScheduledReport(reportId);
  }
}
