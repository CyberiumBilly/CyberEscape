import { prisma } from "../lib/scoped-prisma.js";
import { AlertSeverity, AlertType } from "@prisma/client";

/**
 * Alert thresholds configuration.
 */
const ALERT_THRESHOLDS = {
  DEADLINE_APPROACHING_DAYS: [7, 3, 1], // Days before deadline to alert
  LOW_ENGAGEMENT_PERCENT: 30, // Alert if engagement below this %
  SCORE_DROP_THRESHOLD: 10, // Alert if score drops more than this
  COMPLETION_MILESTONES: [25, 50, 75, 90, 100], // Completion % milestones
} as const;

/**
 * Alert priority mapping.
 */
const ALERT_SEVERITY_MAP: Record<AlertType, AlertSeverity> = {
  DEADLINE_APPROACHING: "HIGH",
  LOW_ENGAGEMENT: "MEDIUM",
  HIGH_RISK_USER: "CRITICAL",
  SCORE_DROP: "MEDIUM",
  COMPLETION_MILESTONE: "LOW",
  COMPLIANCE_WARNING: "HIGH",
};

interface AlertCheckResult {
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  metadata: Record<string, any>;
}

export class AlertEngineService {
  /**
   * Run all alert checks for an organization.
   */
  async checkAlerts(organizationId: string): Promise<AlertCheckResult[]> {
    const alerts: AlertCheckResult[] = [];

    // Run all checks in parallel
    const [
      deadlineAlerts,
      engagementAlerts,
      riskAlerts,
      scoreAlerts,
      milestoneAlerts,
    ] = await Promise.all([
      this.checkDeadlineApproaching(organizationId),
      this.checkLowEngagement(organizationId),
      this.checkHighRiskUsers(organizationId),
      this.checkScoreDrop(organizationId),
      this.checkCompletionMilestones(organizationId),
    ]);

    alerts.push(
      ...deadlineAlerts,
      ...engagementAlerts,
      ...riskAlerts,
      ...scoreAlerts,
      ...milestoneAlerts
    );

    // Create alerts in database (deduplicated)
    for (const alert of alerts) {
      await this.createAlertIfNew(organizationId, alert);
    }

    return alerts;
  }

  /**
   * Check for users approaching training deadline.
   */
  async checkDeadlineApproaching(
    organizationId: string
  ): Promise<AlertCheckResult[]> {
    const alerts: AlertCheckResult[] = [];

    // Get compliance settings
    const compliance = await prisma.complianceSettings.findUnique({
      where: { organizationId },
    });

    if (!compliance) return alerts;

    const deadlineDays = compliance.trainingDeadlineDays;
    const requiredRooms = (compliance.requiredRooms as string[]) || [];

    if (requiredRooms.length === 0) return alerts;

    // Get active users
    const users = await prisma.user.findMany({
      where: { organizationId, status: "ACTIVE" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        gameProgress: {
          where: { status: "ROOM_COMPLETE" },
          select: { room: { select: { type: true } } },
        },
      },
    });

    for (const daysWarning of ALERT_THRESHOLDS.DEADLINE_APPROACHING_DAYS) {
      const usersApproachingDeadline: string[] = [];

      for (const user of users) {
        const daysSinceJoin = Math.floor(
          (Date.now() - new Date(user.createdAt).getTime()) / 86400000
        );
        const daysRemaining = deadlineDays - daysSinceJoin;

        // Check if user is approaching this deadline threshold
        if (daysRemaining > 0 && daysRemaining <= daysWarning) {
          // Check if user has completed required rooms
          const completedTypes = new Set(
            user.gameProgress.map((p) => p.room.type)
          );
          const isComplete = requiredRooms.every((r) => completedTypes.has(r));

          if (!isComplete) {
            usersApproachingDeadline.push(
              `${user.firstName} ${user.lastName}`
            );
          }
        }
      }

      if (usersApproachingDeadline.length > 0) {
        alerts.push({
          type: "DEADLINE_APPROACHING",
          severity: daysWarning <= 1 ? "CRITICAL" : "HIGH",
          title: `${usersApproachingDeadline.length} users approaching deadline`,
          message: `${usersApproachingDeadline.length} users have ${daysWarning} day(s) or less to complete required training.`,
          metadata: {
            daysRemaining: daysWarning,
            userCount: usersApproachingDeadline.length,
            users: usersApproachingDeadline.slice(0, 10),
          },
        });
      }
    }

    return alerts;
  }

  /**
   * Check for low engagement across the organization.
   */
  async checkLowEngagement(
    organizationId: string
  ): Promise<AlertCheckResult[]> {
    const alerts: AlertCheckResult[] = [];

    // Get active users and their recent activity
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);

    const [totalUsers, activeRecently, activeThisWeek] = await Promise.all([
      prisma.user.count({
        where: { organizationId, status: "ACTIVE" },
      }),
      prisma.user.count({
        where: {
          organizationId,
          status: "ACTIVE",
          lastLoginAt: { gte: thirtyDaysAgo },
        },
      }),
      prisma.user.count({
        where: {
          organizationId,
          status: "ACTIVE",
          lastLoginAt: { gte: sevenDaysAgo },
        },
      }),
    ]);

    if (totalUsers === 0) return alerts;

    const engagementRate = (activeRecently / totalUsers) * 100;
    const weeklyEngagement = (activeThisWeek / totalUsers) * 100;

    if (engagementRate < ALERT_THRESHOLDS.LOW_ENGAGEMENT_PERCENT) {
      alerts.push({
        type: "LOW_ENGAGEMENT",
        severity: engagementRate < 15 ? "HIGH" : "MEDIUM",
        title: "Low organization engagement",
        message: `Only ${engagementRate.toFixed(1)}% of users have been active in the last 30 days.`,
        metadata: {
          totalUsers,
          activeUsers: activeRecently,
          engagementRate,
          weeklyEngagement,
        },
      });
    }

    return alerts;
  }

  /**
   * Check for high-risk users.
   */
  async checkHighRiskUsers(
    organizationId: string
  ): Promise<AlertCheckResult[]> {
    const alerts: AlertCheckResult[] = [];

    // Get users with high or critical risk
    const highRiskUsers = await prisma.userRiskScore.findMany({
      where: {
        user: { organizationId },
        riskLevel: { in: ["HIGH", "CRITICAL"] },
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
      orderBy: { riskScore: "desc" },
    });

    const criticalCount = highRiskUsers.filter(
      (u) => u.riskLevel === "CRITICAL"
    ).length;
    const highCount = highRiskUsers.filter(
      (u) => u.riskLevel === "HIGH"
    ).length;

    if (criticalCount > 0) {
      const criticalUsers = highRiskUsers
        .filter((u) => u.riskLevel === "CRITICAL")
        .slice(0, 5);

      alerts.push({
        type: "HIGH_RISK_USER",
        severity: "CRITICAL",
        title: `${criticalCount} users at critical risk`,
        message: `${criticalCount} users have been identified as critical security risks and require immediate attention.`,
        metadata: {
          criticalCount,
          users: criticalUsers.map((u) => ({
            name: `${u.user.firstName} ${u.user.lastName}`,
            email: u.user.email,
            riskScore: u.riskScore,
            factors: u.riskFactors,
          })),
        },
      });
    }

    if (highCount > 0) {
      alerts.push({
        type: "HIGH_RISK_USER",
        severity: "HIGH",
        title: `${highCount} users at high risk`,
        message: `${highCount} users have been identified as high security risks.`,
        metadata: {
          highCount,
          totalHighRisk: criticalCount + highCount,
        },
      });
    }

    return alerts;
  }

  /**
   * Check for significant drops in resilience score.
   */
  async checkScoreDrop(organizationId: string): Promise<AlertCheckResult[]> {
    const alerts: AlertCheckResult[] = [];

    // Get the two most recent scores
    const recentScores = await prisma.organizationResilienceScore.findMany({
      where: { organizationId },
      orderBy: { calculatedAt: "desc" },
      take: 2,
    });

    if (recentScores.length < 2) return alerts;

    const [current, previous] = recentScores;
    const scoreDrop = previous.overallScore - current.overallScore;

    if (scoreDrop >= ALERT_THRESHOLDS.SCORE_DROP_THRESHOLD) {
      alerts.push({
        type: "SCORE_DROP",
        severity: scoreDrop >= 20 ? "HIGH" : "MEDIUM",
        title: "Resilience score decreased",
        message: `Organization resilience score dropped by ${scoreDrop.toFixed(1)} points (${current.overallScore.toFixed(1)} from ${previous.overallScore.toFixed(1)}).`,
        metadata: {
          currentScore: current.overallScore,
          previousScore: previous.overallScore,
          drop: scoreDrop,
          currentDate: current.calculatedAt,
          previousDate: previous.calculatedAt,
        },
      });
    }

    return alerts;
  }

  /**
   * Check for completion milestones.
   */
  async checkCompletionMilestones(
    organizationId: string
  ): Promise<AlertCheckResult[]> {
    const alerts: AlertCheckResult[] = [];

    // Get compliance settings for required rooms
    const compliance = await prisma.complianceSettings.findUnique({
      where: { organizationId },
    });

    const requiredRooms = (compliance?.requiredRooms as string[]) || [];
    if (requiredRooms.length === 0) return alerts;

    // Get users and their completion status
    const users = await prisma.user.findMany({
      where: { organizationId, status: "ACTIVE" },
      select: {
        gameProgress: {
          where: { status: "ROOM_COMPLETE" },
          select: { room: { select: { type: true } } },
        },
      },
    });

    const totalUsers = users.length;
    if (totalUsers === 0) return alerts;

    // Count fully compliant users
    const compliantUsers = users.filter((u) => {
      const completedTypes = new Set(u.gameProgress.map((p) => p.room.type));
      return requiredRooms.every((r) => completedTypes.has(r));
    }).length;

    const completionRate = (compliantUsers / totalUsers) * 100;

    // Check each milestone
    for (const milestone of ALERT_THRESHOLDS.COMPLETION_MILESTONES) {
      // Check if we just crossed this milestone
      if (completionRate >= milestone) {
        // Check if we already have an alert for this milestone
        const existingAlert = await prisma.alert.findFirst({
          where: {
            organizationId,
            metadata: {
              path: ["milestone"],
              equals: milestone,
            },
            createdAt: { gte: new Date(Date.now() - 24 * 3600000) },
          },
        });

        if (!existingAlert) {
          alerts.push({
            type: "COMPLETION_MILESTONE",
            severity: "LOW",
            title: `${milestone}% completion milestone reached!`,
            message: `Congratulations! ${milestone}% of your organization has completed required training.`,
            metadata: {
              milestone,
              completionRate,
              compliantUsers,
              totalUsers,
            },
          });
          break; // Only create one milestone alert at a time
        }
      }
    }

    return alerts;
  }

  /**
   * Create an alert if a similar one doesn't already exist.
   */
  private async createAlertIfNew(
    organizationId: string,
    alert: AlertCheckResult
  ) {
    // Check for duplicate alerts in the last 24 hours
    const existingAlert = await prisma.alert.findFirst({
      where: {
        organizationId,
        title: alert.title,
        isAcknowledged: false,
        createdAt: { gte: new Date(Date.now() - 24 * 3600000) },
      },
    });

    if (existingAlert) {
      // Update the existing alert with new metadata
      return prisma.alert.update({
        where: { id: existingAlert.id },
        data: { metadata: alert.metadata },
      });
    }

    // Create new alert
    return prisma.alert.create({
      data: {
        organizationId,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        metadata: {
          ...alert.metadata,
          type: alert.type,
        },
      },
    });
  }

  /**
   * Get all unacknowledged alerts for an organization.
   */
  async getActiveAlerts(organizationId: string) {
    return prisma.alert.findMany({
      where: {
        organizationId,
        isAcknowledged: false,
      },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
    });
  }

  /**
   * Acknowledge an alert.
   */
  async acknowledgeAlert(alertId: string, userId: string) {
    return prisma.alert.update({
      where: { id: alertId },
      data: {
        isAcknowledged: true,
        acknowledgedBy: userId,
        acknowledgedAt: new Date(),
      },
    });
  }

  /**
   * Get alert history for an organization.
   */
  async getAlertHistory(
    organizationId: string,
    options?: {
      limit?: number;
      includeAcknowledged?: boolean;
      severity?: AlertSeverity;
    }
  ) {
    const where: any = { organizationId };

    if (!options?.includeAcknowledged) {
      where.isAcknowledged = false;
    }

    if (options?.severity) {
      where.severity = options.severity;
    }

    return prisma.alert.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options?.limit ?? 50,
    });
  }

  /**
   * Get alert counts by severity.
   */
  async getAlertCounts(organizationId: string) {
    const alerts = await prisma.alert.groupBy({
      by: ["severity"],
      where: {
        organizationId,
        isAcknowledged: false,
      },
      _count: { _all: true },
    });

    const counts: Record<AlertSeverity, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    for (const alert of alerts) {
      counts[alert.severity] = alert._count._all;
    }

    return counts;
  }

  /**
   * Send alert notifications (email/in-app).
   */
  async sendAlertNotifications(
    organizationId: string,
    alert: AlertCheckResult
  ) {
    // Get org admins to notify
    const admins = await prisma.user.findMany({
      where: {
        organizationId,
        role: { in: ["ORG_ADMIN", "SUPER_ADMIN"] },
        status: "ACTIVE",
      },
      select: { id: true, email: true, firstName: true },
    });

    // For now, just log. In production, integrate with email service.
    console.log(
      `[AlertEngine] Would send ${alert.severity} alert to ${admins.length} admins:`,
      alert.title
    );

    // TODO: Integrate with notification queue for email sending
    // await getNotificationQueue().add('send-email', {
    //   to: admins.map(a => a.email),
    //   subject: `[${alert.severity}] ${alert.title}`,
    //   body: alert.message,
    // });

    return { notified: admins.length };
  }
}

export const alertEngineService = new AlertEngineService();
