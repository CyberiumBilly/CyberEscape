import { prisma } from "../lib/scoped-prisma.js";
import { ReportType } from "@prisma/client";
import { resilienceScoringService } from "./resilience-scoring.js";

/**
 * Supported export formats.
 */
export type ExportFormat = "pdf" | "csv" | "json";

/**
 * Report generation options.
 */
export interface ReportOptions {
  organizationId: string;
  reportType: ReportType;
  format: ExportFormat;
  filters?: {
    startDate?: Date;
    endDate?: Date;
    groupId?: string;
    userId?: string;
    roomId?: string;
  };
  requestedBy?: string;
}

/**
 * Generated report result.
 */
export interface GeneratedReport {
  id: string;
  title: string;
  type: ReportType;
  format: ExportFormat;
  content: string;
  metadata: Record<string, any>;
  generatedAt: Date;
}

export class ReportGeneratorService {
  /**
   * Generate a report based on type and options.
   */
  async generateReport(options: ReportOptions): Promise<GeneratedReport> {
    const { organizationId, reportType, format, filters } = options;

    // Get date range
    const startDate =
      filters?.startDate || new Date(Date.now() - 30 * 86400000);
    const endDate = filters?.endDate || new Date();

    // Gather data based on report type
    let data: any;
    let title: string;

    switch (reportType) {
      case "COMPLIANCE":
        data = await this.gatherComplianceData(organizationId, startDate, endDate);
        title = `Compliance Report - ${this.formatDateRange(startDate, endDate)}`;
        break;

      case "PERFORMANCE_SUMMARY":
        data = await this.gatherPerformanceData(
          organizationId,
          startDate,
          endDate
        );
        title = `Performance Summary - ${this.formatDateRange(startDate, endDate)}`;
        break;

      case "RISK_ASSESSMENT":
        data = await this.gatherRiskAssessmentData(organizationId);
        title = `Risk Assessment - ${new Date().toLocaleDateString()}`;
        break;

      case "EXECUTIVE_SUMMARY":
        data = await this.gatherExecutiveSummaryData(
          organizationId,
          startDate,
          endDate
        );
        title = `Executive Summary - ${this.formatDateRange(startDate, endDate)}`;
        break;

      case "ORGANIZATION":
        data = await this.gatherOrganizationData(
          organizationId,
          startDate,
          endDate
        );
        title = `Organization Overview - ${this.formatDateRange(startDate, endDate)}`;
        break;

      case "GROUP":
        if (!filters?.groupId) {
          throw new Error("Group ID required for group report");
        }
        data = await this.gatherGroupData(filters.groupId, startDate, endDate);
        title = `Group Report - ${data.groupName} - ${this.formatDateRange(startDate, endDate)}`;
        break;

      case "USER":
        if (!filters?.userId) {
          throw new Error("User ID required for user report");
        }
        data = await this.gatherUserData(filters.userId);
        title = `User Report - ${data.userName}`;
        break;

      case "ROOM":
        if (!filters?.roomId) {
          throw new Error("Room ID required for room report");
        }
        data = await this.gatherRoomData(
          organizationId,
          filters.roomId,
          startDate,
          endDate
        );
        title = `Room Analytics - ${data.roomName}`;
        break;

      default:
        throw new Error(`Unsupported report type: ${reportType}`);
    }

    // Format the report content
    const content = this.formatReport(data, format);

    // Store the report
    const report = await prisma.report.create({
      data: {
        organizationId,
        type: reportType,
        title,
        data: {
          format,
          content,
          filters: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            ...filters,
          },
          rawData: data,
          generatedAt: new Date().toISOString(),
          requestedBy: options.requestedBy,
        },
      },
    });

    return {
      id: report.id,
      title,
      type: reportType,
      format,
      content,
      metadata: {
        filters,
        generatedAt: report.generatedAt,
      },
      generatedAt: report.generatedAt,
    };
  }

  /**
   * Get a previously generated report.
   */
  async getReport(reportId: string): Promise<GeneratedReport | null> {
    const report = await prisma.report.findUnique({
      where: { id: reportId },
    });

    if (!report) return null;

    const data = report.data as any;

    return {
      id: report.id,
      title: report.title,
      type: report.type,
      format: data.format || "json",
      content: data.content || JSON.stringify(data.rawData),
      metadata: {
        filters: data.filters,
        generatedAt: report.generatedAt,
      },
      generatedAt: report.generatedAt,
    };
  }

  /**
   * List reports for an organization.
   */
  async listReports(
    organizationId: string,
    options?: {
      type?: ReportType;
      limit?: number;
      offset?: number;
    }
  ) {
    const where: any = { organizationId };
    if (options?.type) {
      where.type = options.type;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy: { generatedAt: "desc" },
        take: options?.limit ?? 20,
        skip: options?.offset ?? 0,
        select: {
          id: true,
          title: true,
          type: true,
          generatedAt: true,
        },
      }),
      prisma.report.count({ where }),
    ]);

    return { reports, total };
  }

  /**
   * Schedule a recurring report.
   */
  async scheduleReport(options: {
    organizationId: string;
    title: string;
    reportType: ReportType;
    format: ExportFormat;
    schedule: string; // cron expression
    recipients: string[];
    filters?: Record<string, any>;
  }) {
    return prisma.scheduledReport.create({
      data: {
        organizationId: options.organizationId,
        title: options.title,
        reportType: options.reportType,
        format: options.format,
        schedule: options.schedule,
        recipients: options.recipients,
        filters: options.filters || {},
        isActive: true,
      },
    });
  }

  /**
   * Get scheduled reports for an organization.
   */
  async getScheduledReports(organizationId: string) {
    return prisma.scheduledReport.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Update a scheduled report.
   */
  async updateScheduledReport(
    reportId: string,
    updates: {
      title?: string;
      schedule?: string;
      recipients?: string[];
      filters?: Record<string, any>;
      isActive?: boolean;
    }
  ) {
    return prisma.scheduledReport.update({
      where: { id: reportId },
      data: updates,
    });
  }

  /**
   * Delete a scheduled report.
   */
  async deleteScheduledReport(reportId: string) {
    return prisma.scheduledReport.delete({
      where: { id: reportId },
    });
  }

  // Data gathering methods

  private async gatherComplianceData(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ) {
    const compliance = await prisma.complianceSettings.findUnique({
      where: { organizationId },
    });

    const requiredRooms = (compliance?.requiredRooms as string[]) || [];
    const deadlineDays = compliance?.trainingDeadlineDays || 30;

    const users = await prisma.user.findMany({
      where: { organizationId, status: "ACTIVE" },
      include: {
        gameProgress: {
          where: { status: "ROOM_COMPLETE" },
          include: { room: { select: { type: true, name: true } } },
        },
      },
    });

    const userStatuses = users.map((user) => {
      const completedTypes = new Set(user.gameProgress.map((p) => p.room.type));
      const completedRequired = requiredRooms.filter((r) =>
        completedTypes.has(r)
      ).length;
      const isCompliant = completedRequired >= requiredRooms.length;
      const daysSinceJoin = Math.floor(
        (Date.now() - new Date(user.createdAt).getTime()) / 86400000
      );
      const isOverdue = daysSinceJoin > deadlineDays && !isCompliant;
      const daysRemaining = Math.max(0, deadlineDays - daysSinceJoin);

      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        department: null, // TODO: Add department to user model if needed
        completedRooms: completedRequired,
        totalRequired: requiredRooms.length,
        progress: requiredRooms.length > 0
          ? Math.round((completedRequired / requiredRooms.length) * 100)
          : 100,
        status: isCompliant ? "COMPLIANT" : isOverdue ? "OVERDUE" : "IN_PROGRESS",
        daysRemaining: isCompliant ? null : daysRemaining,
        completedAt: isCompliant
          ? user.gameProgress
              .filter((p) => requiredRooms.includes(p.room.type))
              .sort(
                (a, b) =>
                  new Date(b.completedAt!).getTime() -
                  new Date(a.completedAt!).getTime()
              )[0]?.completedAt
          : null,
      };
    });

    const summary = {
      totalUsers: users.length,
      compliantUsers: userStatuses.filter((u) => u.status === "COMPLIANT").length,
      inProgressUsers: userStatuses.filter((u) => u.status === "IN_PROGRESS").length,
      overdueUsers: userStatuses.filter((u) => u.status === "OVERDUE").length,
      complianceRate:
        users.length > 0
          ? (userStatuses.filter((u) => u.status === "COMPLIANT").length /
              users.length) *
            100
          : 0,
    };

    return {
      reportType: "COMPLIANCE",
      period: { startDate, endDate },
      settings: {
        requiredRooms,
        deadlineDays,
        minimumScore: compliance?.minimumPassScore || 70,
      },
      summary,
      users: userStatuses,
    };
  }

  private async gatherPerformanceData(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ) {
    const [overallStats, roomStats, topPerformers, recentActivity] =
      await Promise.all([
        prisma.gameProgress.aggregate({
          where: {
            user: { organizationId },
            status: "ROOM_COMPLETE",
            completedAt: { gte: startDate, lte: endDate },
          },
          _avg: { score: true, timeSpent: true },
          _count: { _all: true },
          _sum: { score: true },
        }),
        prisma.gameProgress.groupBy({
          by: ["roomId"],
          where: {
            user: { organizationId },
            completedAt: { gte: startDate, lte: endDate },
          },
          _avg: { score: true, timeSpent: true },
          _count: { _all: true },
        }),
        prisma.userStats.findMany({
          where: { user: { organizationId } },
          orderBy: { totalScore: "desc" },
          take: 20,
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        }),
        prisma.gameProgress.findMany({
          where: {
            user: { organizationId },
            completedAt: { gte: startDate, lte: endDate },
          },
          orderBy: { completedAt: "desc" },
          take: 50,
          include: {
            user: { select: { firstName: true, lastName: true } },
            room: { select: { name: true } },
          },
        }),
      ]);

    // Get room details
    const rooms = await prisma.room.findMany({
      where: { id: { in: roomStats.map((r) => r.roomId) } },
    });
    const roomMap = new Map(rooms.map((r) => [r.id, r]));

    return {
      reportType: "PERFORMANCE_SUMMARY",
      period: { startDate, endDate },
      summary: {
        totalCompletions: overallStats._count._all,
        averageScore: overallStats._avg.score ?? 0,
        averageTimeMinutes: Math.round((overallStats._avg.timeSpent ?? 0) / 60),
        totalPointsEarned: overallStats._sum.score ?? 0,
      },
      byRoom: roomStats.map((r) => ({
        roomId: r.roomId,
        roomName: roomMap.get(r.roomId)?.name || "Unknown",
        completions: r._count._all,
        averageScore: Math.round(r._avg.score ?? 0),
        averageTimeMinutes: Math.round((r._avg.timeSpent ?? 0) / 60),
      })),
      topPerformers: topPerformers.map((p, index) => ({
        rank: index + 1,
        name: `${p.user.firstName} ${p.user.lastName}`,
        email: p.user.email,
        totalScore: p.totalScore,
        roomsCompleted: p.roomsCompleted,
        accuracy: Math.round(p.accuracy * 100) / 100,
      })),
      recentActivity: recentActivity.map((a) => ({
        userName: `${a.user.firstName} ${a.user.lastName}`,
        roomName: a.room.name,
        score: a.score,
        completedAt: a.completedAt,
      })),
    };
  }

  private async gatherRiskAssessmentData(organizationId: string) {
    const [resilienceScore, riskScores, trends] = await Promise.all([
      resilienceScoringService.getOrgResilienceScore(organizationId),
      prisma.userRiskScore.findMany({
        where: { user: { organizationId } },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
        },
        orderBy: { riskScore: "desc" },
      }),
      prisma.organizationResilienceScore.findMany({
        where: {
          organizationId,
          calculatedAt: { gte: new Date(Date.now() - 90 * 86400000) },
        },
        orderBy: { calculatedAt: "asc" },
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
      generatedAt: new Date(),
      overallResilienceScore: resilienceScore?.overallScore ?? 0,
      riskBreakdown,
      highRiskUsers: riskScores
        .filter((r) => r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL")
        .map((r) => ({
          name: `${r.user.firstName} ${r.user.lastName}`,
          email: r.user.email,
          riskLevel: r.riskLevel,
          riskScore: r.riskScore,
          factors: r.riskFactors,
          trainingCompletion: r.trainingCompletion,
          phishingScore: r.phishingScore,
          daysSinceActivity: r.daysSinceActivity,
        })),
      allUsers: riskScores.map((r) => ({
        name: `${r.user.firstName} ${r.user.lastName}`,
        email: r.user.email,
        riskLevel: r.riskLevel,
        riskScore: r.riskScore,
        trainingCompletion: r.trainingCompletion,
        performanceScore: r.performanceScore,
      })),
      trends: trends.map((t) => ({
        date: t.calculatedAt,
        overallScore: t.overallScore,
        completionScore: t.completionScore,
        performanceScore: t.performanceScore,
      })),
    };
  }

  private async gatherExecutiveSummaryData(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ) {
    const [org, compliance, performance, risk] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: { name: true },
      }),
      this.gatherComplianceData(organizationId, startDate, endDate),
      this.gatherPerformanceData(organizationId, startDate, endDate),
      this.gatherRiskAssessmentData(organizationId),
    ]);

    return {
      reportType: "EXECUTIVE_SUMMARY",
      organizationName: org?.name,
      period: { startDate, endDate },
      keyMetrics: {
        resilienceScore: risk.overallResilienceScore,
        complianceRate: compliance.summary.complianceRate,
        averagePerformance: performance.summary.averageScore,
        totalCompletions: performance.summary.totalCompletions,
        highRiskUsers: risk.riskBreakdown.HIGH + risk.riskBreakdown.CRITICAL,
        overdueUsers: compliance.summary.overdueUsers,
      },
      riskBreakdown: risk.riskBreakdown,
      topPerformers: performance.topPerformers.slice(0, 5),
      criticalRiskUsers: risk.highRiskUsers.slice(0, 5),
      trends: risk.trends,
      recommendations: this.generateRecommendations(compliance, risk),
    };
  }

  private async gatherOrganizationData(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ) {
    const [org, userStats, groupStats] = await Promise.all([
      prisma.organization.findUnique({
        where: { id: organizationId },
      }),
      prisma.user.groupBy({
        by: ["status"],
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
      period: { startDate, endDate },
      userStats: userStats.map((s) => ({
        status: s.status,
        count: s._count._all,
      })),
      groups: groupStats.map((g) => ({
        id: g.id,
        name: g.name,
        memberCount: g._count.userGroups,
      })),
    };
  }

  private async gatherGroupData(
    groupId: string,
    startDate: Date,
    endDate: Date
  ) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        userGroups: {
          include: {
            user: {
              include: {
                stats: true,
                gameProgress: {
                  where: { status: "ROOM_COMPLETE" },
                  include: { room: true },
                },
                riskScore: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      throw new Error("Group not found");
    }

    const members = group.userGroups.map((ug) => ({
      id: ug.user.id,
      name: `${ug.user.firstName} ${ug.user.lastName}`,
      email: ug.user.email,
      stats: ug.user.stats,
      roomsCompleted: ug.user.gameProgress.length,
      riskLevel: ug.user.riskScore?.riskLevel || "LOW",
    }));

    return {
      reportType: "GROUP",
      groupId,
      groupName: group.name,
      period: { startDate, endDate },
      memberCount: members.length,
      members,
    };
  }

  private async gatherUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        stats: true,
        gameProgress: { include: { room: true } },
        puzzleAttempts: {
          orderBy: { createdAt: "desc" },
          take: 100,
          include: { puzzle: true },
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
      userId,
      userName: `${user.firstName} ${user.lastName}`,
      email: user.email,
      stats: user.stats,
      riskScore: user.riskScore,
      gameProgress: user.gameProgress,
      recentAttempts: user.puzzleAttempts,
      badges: user.userBadges,
    };
  }

  private async gatherRoomData(
    organizationId: string,
    roomId: string,
    startDate: Date,
    endDate: Date
  ) {
    const [room, stats, puzzleStats] = await Promise.all([
      prisma.room.findUnique({
        where: { id: roomId },
        include: { puzzles: true },
      }),
      prisma.gameProgress.aggregate({
        where: {
          roomId,
          user: { organizationId },
          completedAt: { gte: startDate, lte: endDate },
        },
        _avg: { score: true, timeSpent: true },
        _count: { _all: true },
      }),
      prisma.puzzleAttempt.groupBy({
        by: ["puzzleId"],
        where: {
          puzzle: { roomId },
          user: { organizationId },
          createdAt: { gte: startDate, lte: endDate },
        },
        _avg: { score: true },
        _count: { _all: true },
      }),
    ]);

    if (!room) {
      throw new Error("Room not found");
    }

    return {
      reportType: "ROOM",
      roomId,
      roomName: room.name,
      roomType: room.type,
      period: { startDate, endDate },
      stats: {
        completions: stats._count._all,
        averageScore: stats._avg.score ?? 0,
        averageTimeMinutes: Math.round((stats._avg.timeSpent ?? 0) / 60),
      },
      puzzleStats: puzzleStats.map((p) => {
        const puzzle = room.puzzles.find((pz) => pz.id === p.puzzleId);
        return {
          puzzleId: p.puzzleId,
          puzzleTitle: puzzle?.title || "Unknown",
          attempts: p._count._all,
          averageScore: p._avg.score ?? 0,
        };
      }),
    };
  }

  // Formatting methods

  private formatReport(data: any, format: ExportFormat): string {
    switch (format) {
      case "json":
        return JSON.stringify(data, null, 2);

      case "csv":
        return this.formatAsCsv(data);

      case "pdf":
        // Return JSON with PDF metadata - actual rendering happens elsewhere
        return JSON.stringify({
          _format: "pdf",
          _template: data.reportType,
          data,
        });

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  private formatAsCsv(data: any): string {
    // Find the main data array to export
    const dataArrayKey = ["users", "allUsers", "members", "topPerformers"].find(
      (key) => Array.isArray(data[key])
    );

    if (!dataArrayKey) {
      // Fallback: convert summary to CSV
      const rows = Object.entries(data.summary || data).map(([key, value]) =>
        `${key},${JSON.stringify(value)}`
      );
      return rows.join("\n");
    }

    const items = data[dataArrayKey];
    if (items.length === 0) return "";

    const headers = Object.keys(items[0]);
    const headerRow = headers.join(",");
    const dataRows = items.map((item: any) =>
      headers.map((h) => this.csvEscape(item[h])).join(",")
    );

    return [headerRow, ...dataRows].join("\n");
  }

  private csvEscape(value: any): string {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  private formatDateRange(start: Date, end: Date): string {
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }

  private generateRecommendations(compliance: any, risk: any): string[] {
    const recommendations: string[] = [];

    if (compliance.summary.overdueUsers > 0) {
      recommendations.push(
        `${compliance.summary.overdueUsers} users are overdue on training. Consider sending reminders or escalating to managers.`
      );
    }

    if (risk.riskBreakdown.CRITICAL > 0) {
      recommendations.push(
        `${risk.riskBreakdown.CRITICAL} users are at critical risk level. Prioritize personalized intervention for these individuals.`
      );
    }

    if (compliance.summary.complianceRate < 80) {
      recommendations.push(
        `Compliance rate is below 80%. Consider extending deadlines or providing additional support resources.`
      );
    }

    if (risk.overallResilienceScore < 60) {
      recommendations.push(
        `Overall resilience score is below target. Focus on improving both completion rates and performance scores.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Organization is performing well. Continue monitoring and maintain current initiatives."
      );
    }

    return recommendations;
  }
}

export const reportGeneratorService = new ReportGeneratorService();
