import { prisma } from "../lib/scoped-prisma.js";
import { RiskLevel, RoomType } from "@prisma/client";

/**
 * Risk factor weights for calculating user risk scores.
 * Higher values = more risk contribution.
 */
const RISK_FACTORS = {
  INCOMPLETE_TRAINING: 30, // Has not completed required training
  LOW_PHISHING_SCORE: 25, // Poor performance on phishing room
  INACTIVE: 20, // No activity in 14+ days
  LOW_PERFORMANCE: 15, // Average score below 60%
  MULTIPLE_FAILURES: 10, // Failed puzzles multiple times
} as const;

/**
 * Risk level thresholds based on total risk score (0-100).
 */
const RISK_THRESHOLDS = {
  CRITICAL: 70,
  HIGH: 50,
  MEDIUM: 30,
  LOW: 0,
} as const;

/**
 * Number of days of inactivity to flag a user.
 */
const INACTIVITY_DAYS = 14;

/**
 * Required rooms for compliance (can be overridden per org).
 */
const DEFAULT_REQUIRED_ROOMS: RoomType[] = [
  "PASSWORD_AUTH",
  "PHISHING",
  "DATA_PROTECTION",
];

interface RiskFactor {
  factor: keyof typeof RISK_FACTORS;
  weight: number;
  description: string;
}

interface UserMetrics {
  userId: string;
  trainingCompletion: number;
  phishingScore: number;
  engagementScore: number;
  performanceScore: number;
  daysSinceActivity: number;
  failedAttempts: number;
}

export class ResilienceScoringService {
  /**
   * Calculate and store organization-wide resilience score.
   * Formula: 50% completion rate + 50% performance score
   */
  async calculateOrgResilienceScore(
    organizationId: string,
    periodStart?: Date,
    periodEnd?: Date
  ) {
    const now = new Date();
    const start = periodStart || new Date(now.getTime() - 30 * 86400000); // Default: last 30 days
    const end = periodEnd || now;

    // Get all active users in the organization
    const users = await prisma.user.findMany({
      where: {
        organizationId,
        status: "ACTIVE",
      },
      select: { id: true },
    });

    const totalUsers = users.length;
    if (totalUsers === 0) {
      return this.storeOrgScore(organizationId, {
        overallScore: 0,
        completionScore: 0,
        performanceScore: 0,
        totalUsers: 0,
        activeUsers: 0,
        completedUsers: 0,
        averageAccuracy: 0,
        averageTimeSpent: 0,
        lowRiskCount: 0,
        mediumRiskCount: 0,
        highRiskCount: 0,
        criticalRiskCount: 0,
        periodStart: start,
        periodEnd: end,
      });
    }

    const userIds = users.map((u) => u.id);

    // Get completion data
    const completedProgress = await prisma.gameProgress.findMany({
      where: {
        userId: { in: userIds },
        status: "ROOM_COMPLETE",
        completedAt: { gte: start, lte: end },
      },
      select: { userId: true },
    });

    // Get all required rooms
    const requiredRooms = await this.getRequiredRooms(organizationId);
    const completedUserSet = new Set(completedProgress.map((p) => p.userId));
    const completedUsers = completedUserSet.size;

    // Calculate completion rate
    const completionScore =
      totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0;

    // Get performance data
    const performanceStats = await prisma.gameProgress.aggregate({
      where: {
        userId: { in: userIds },
        status: "ROOM_COMPLETE",
        completedAt: { gte: start, lte: end },
      },
      _avg: {
        score: true,
        timeSpent: true,
      },
    });

    // Get puzzle accuracy
    const puzzleStats = await prisma.puzzleAttempt.aggregate({
      where: {
        userId: { in: userIds },
        createdAt: { gte: start, lte: end },
      },
      _avg: { score: true },
    });

    const averageAccuracy = puzzleStats._avg.score ?? 0;
    const averageTimeSpent = performanceStats._avg.timeSpent ?? 0;

    // Performance score normalized to 0-100
    const performanceScore = Math.min(100, averageAccuracy);

    // Overall score: 50/50 formula
    const overallScore = completionScore * 0.5 + performanceScore * 0.5;

    // Get active users (logged in within period)
    const activeUsers = await prisma.user.count({
      where: {
        organizationId,
        status: "ACTIVE",
        lastLoginAt: { gte: start },
      },
    });

    // Calculate risk breakdown
    const riskBreakdown = await this.calculateOrgRiskBreakdown(
      organizationId,
      userIds
    );

    return this.storeOrgScore(organizationId, {
      overallScore,
      completionScore,
      performanceScore,
      totalUsers,
      activeUsers,
      completedUsers,
      averageAccuracy,
      averageTimeSpent: Math.round(averageTimeSpent),
      ...riskBreakdown,
      periodStart: start,
      periodEnd: end,
    });
  }

  /**
   * Calculate and store group-level resilience score.
   */
  async calculateGroupResilienceScore(
    groupId: string,
    periodStart?: Date,
    periodEnd?: Date
  ) {
    const now = new Date();
    const start = periodStart || new Date(now.getTime() - 30 * 86400000);
    const end = periodEnd || now;

    // Get all users in the group
    const groupMembers = await prisma.userGroup.findMany({
      where: { groupId },
      select: {
        user: {
          select: { id: true, organizationId: true },
        },
      },
    });

    if (groupMembers.length === 0) {
      return null;
    }

    const userIds = groupMembers.map((m) => m.user.id);
    const totalUsers = userIds.length;

    // Get completion data
    const completedProgress = await prisma.gameProgress.findMany({
      where: {
        userId: { in: userIds },
        status: "ROOM_COMPLETE",
        completedAt: { gte: start, lte: end },
      },
      select: { userId: true },
    });

    const completedUserSet = new Set(completedProgress.map((p) => p.userId));
    const completedUsers = completedUserSet.size;
    const completionScore =
      totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0;

    // Get performance data
    const puzzleStats = await prisma.puzzleAttempt.aggregate({
      where: {
        userId: { in: userIds },
        createdAt: { gte: start, lte: end },
      },
      _avg: { score: true },
    });

    const averageAccuracy = puzzleStats._avg.score ?? 0;
    const performanceScore = Math.min(100, averageAccuracy);
    const overallScore = completionScore * 0.5 + performanceScore * 0.5;

    // Calculate risk breakdown for group
    const riskBreakdown = await this.calculateGroupRiskBreakdown(userIds);

    return prisma.groupResilienceScore.create({
      data: {
        groupId,
        overallScore,
        completionScore,
        performanceScore,
        totalUsers,
        completedUsers,
        averageAccuracy,
        ...riskBreakdown,
        periodStart: start,
        periodEnd: end,
      },
    });
  }

  /**
   * Calculate and store individual user risk score.
   */
  async calculateUserRiskScore(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        organization: {
          include: {
            complianceSettings: true,
          },
        },
        stats: true,
        gameProgress: {
          include: { room: true },
        },
        puzzleAttempts: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const metrics = await this.calculateUserMetrics(user);
    const riskFactors = this.evaluateRiskFactors(metrics);
    const riskScore = riskFactors.reduce((sum, f) => sum + f.weight, 0);
    const riskLevel = this.getRiskLevel(riskScore);

    return prisma.userRiskScore.upsert({
      where: { userId },
      update: {
        riskLevel,
        riskScore: Math.min(100, riskScore),
        riskFactors: riskFactors.map((f) => ({
          factor: f.factor,
          weight: f.weight,
          description: f.description,
        })),
        trainingCompletion: metrics.trainingCompletion,
        phishingScore: metrics.phishingScore,
        engagementScore: metrics.engagementScore,
        performanceScore: metrics.performanceScore,
        lastActivityAt: user.lastLoginAt,
        daysSinceActivity: metrics.daysSinceActivity,
        calculatedAt: new Date(),
      },
      create: {
        userId,
        riskLevel,
        riskScore: Math.min(100, riskScore),
        riskFactors: riskFactors.map((f) => ({
          factor: f.factor,
          weight: f.weight,
          description: f.description,
        })),
        trainingCompletion: metrics.trainingCompletion,
        phishingScore: metrics.phishingScore,
        engagementScore: metrics.engagementScore,
        performanceScore: metrics.performanceScore,
        lastActivityAt: user.lastLoginAt,
        daysSinceActivity: metrics.daysSinceActivity,
      },
    });
  }

  /**
   * Bulk calculate risk scores for all users in an organization.
   */
  async calculateAllUserRiskScores(organizationId: string) {
    const users = await prisma.user.findMany({
      where: { organizationId, status: "ACTIVE" },
      select: { id: true },
    });

    const results = [];
    for (const user of users) {
      try {
        const result = await this.calculateUserRiskScore(user.id);
        results.push(result);
      } catch (error) {
        console.error(`Failed to calculate risk for user ${user.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Get the current resilience score for an organization.
   */
  async getOrgResilienceScore(organizationId: string) {
    return prisma.organizationResilienceScore.findFirst({
      where: { organizationId },
      orderBy: { calculatedAt: "desc" },
    });
  }

  /**
   * Get historical resilience scores for trending.
   */
  async getOrgResilienceHistory(
    organizationId: string,
    days: number = 30
  ) {
    const since = new Date(Date.now() - days * 86400000);
    return prisma.organizationResilienceScore.findMany({
      where: {
        organizationId,
        calculatedAt: { gte: since },
      },
      orderBy: { calculatedAt: "asc" },
    });
  }

  /**
   * Get risk matrix data for visualization.
   * Returns users grouped by risk level with key metrics.
   */
  async getRiskMatrix(organizationId: string) {
    const users = await prisma.user.findMany({
      where: { organizationId, status: "ACTIVE" },
      include: {
        riskScore: true,
        stats: true,
      },
    });

    const matrix: Record<
      RiskLevel,
      Array<{
        id: string;
        name: string;
        email: string;
        riskScore: number;
        trainingCompletion: number;
        performanceScore: number;
        daysSinceActivity: number;
        riskFactors: any[];
      }>
    > = {
      LOW: [],
      MEDIUM: [],
      HIGH: [],
      CRITICAL: [],
    };

    for (const user of users) {
      const level = user.riskScore?.riskLevel || "LOW";
      matrix[level].push({
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        riskScore: user.riskScore?.riskScore || 0,
        trainingCompletion: user.riskScore?.trainingCompletion || 0,
        performanceScore: user.riskScore?.performanceScore || 0,
        daysSinceActivity: user.riskScore?.daysSinceActivity || 0,
        riskFactors: (user.riskScore?.riskFactors as any[]) || [],
      });
    }

    // Sort each level by risk score descending
    for (const level of Object.keys(matrix) as RiskLevel[]) {
      matrix[level].sort((a, b) => b.riskScore - a.riskScore);
    }

    return matrix;
  }

  /**
   * Get knowledge gaps analysis (topic × group heatmap).
   */
  async getKnowledgeGaps(organizationId: string) {
    // Get all groups in the organization
    const groups = await prisma.group.findMany({
      where: { organizationId },
      select: { id: true, name: true },
    });

    // Get all rooms (topics)
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      select: { id: true, name: true, type: true },
      orderBy: { order: "asc" },
    });

    // Build heatmap data
    const heatmap: Array<{
      groupId: string;
      groupName: string;
      topics: Array<{
        roomId: string;
        roomName: string;
        roomType: string;
        completionRate: number;
        avgScore: number;
        totalAttempts: number;
      }>;
    }> = [];

    for (const group of groups) {
      // Get user IDs in this group
      const members = await prisma.userGroup.findMany({
        where: { groupId: group.id },
        select: { userId: true },
      });
      const userIds = members.map((m) => m.userId);

      if (userIds.length === 0) {
        continue;
      }

      const topics = [];
      for (const room of rooms) {
        const [completed, total] = await Promise.all([
          prisma.gameProgress.count({
            where: {
              userId: { in: userIds },
              roomId: room.id,
              status: "ROOM_COMPLETE",
            },
          }),
          prisma.gameProgress.count({
            where: {
              userId: { in: userIds },
              roomId: room.id,
            },
          }),
        ]);

        const avgScore = await prisma.gameProgress.aggregate({
          where: {
            userId: { in: userIds },
            roomId: room.id,
            status: "ROOM_COMPLETE",
          },
          _avg: { score: true },
        });

        topics.push({
          roomId: room.id,
          roomName: room.name,
          roomType: room.type,
          completionRate: total > 0 ? (completed / total) * 100 : 0,
          avgScore: avgScore._avg.score ?? 0,
          totalAttempts: total,
        });
      }

      heatmap.push({
        groupId: group.id,
        groupName: group.name,
        topics,
      });
    }

    return { rooms, heatmap };
  }

  // Private helper methods

  private async storeOrgScore(
    organizationId: string,
    data: {
      overallScore: number;
      completionScore: number;
      performanceScore: number;
      totalUsers: number;
      activeUsers: number;
      completedUsers: number;
      averageAccuracy: number;
      averageTimeSpent: number;
      lowRiskCount: number;
      mediumRiskCount: number;
      highRiskCount: number;
      criticalRiskCount: number;
      periodStart: Date;
      periodEnd: Date;
    }
  ) {
    return prisma.organizationResilienceScore.create({
      data: {
        organizationId,
        ...data,
      },
    });
  }

  private async getRequiredRooms(organizationId: string): Promise<RoomType[]> {
    const compliance = await prisma.complianceSettings.findUnique({
      where: { organizationId },
    });

    if (compliance?.requiredRooms) {
      return compliance.requiredRooms as RoomType[];
    }

    return DEFAULT_REQUIRED_ROOMS;
  }

  private async calculateOrgRiskBreakdown(
    organizationId: string,
    userIds: string[]
  ) {
    const riskScores = await prisma.userRiskScore.findMany({
      where: { userId: { in: userIds } },
      select: { riskLevel: true },
    });

    return {
      lowRiskCount: riskScores.filter((r) => r.riskLevel === "LOW").length,
      mediumRiskCount: riskScores.filter((r) => r.riskLevel === "MEDIUM").length,
      highRiskCount: riskScores.filter((r) => r.riskLevel === "HIGH").length,
      criticalRiskCount: riskScores.filter((r) => r.riskLevel === "CRITICAL")
        .length,
    };
  }

  private async calculateGroupRiskBreakdown(userIds: string[]) {
    const riskScores = await prisma.userRiskScore.findMany({
      where: { userId: { in: userIds } },
      select: { riskLevel: true },
    });

    return {
      lowRiskCount: riskScores.filter((r) => r.riskLevel === "LOW").length,
      mediumRiskCount: riskScores.filter((r) => r.riskLevel === "MEDIUM").length,
      highRiskCount: riskScores.filter((r) => r.riskLevel === "HIGH").length,
      criticalRiskCount: riskScores.filter((r) => r.riskLevel === "CRITICAL")
        .length,
    };
  }

  private async calculateUserMetrics(user: any): Promise<UserMetrics> {
    const now = new Date();

    // Calculate days since last activity
    const lastActivity = user.lastLoginAt || user.createdAt;
    const daysSinceActivity = Math.floor(
      (now.getTime() - new Date(lastActivity).getTime()) / 86400000
    );

    // Get required rooms
    const requiredRooms = await this.getRequiredRooms(user.organizationId);

    // Calculate training completion
    const completedRoomTypes = new Set(
      user.gameProgress
        .filter((p: any) => p.status === "ROOM_COMPLETE")
        .map((p: any) => p.room.type)
    );
    const completedRequired = requiredRooms.filter((r) =>
      completedRoomTypes.has(r)
    ).length;
    const trainingCompletion =
      requiredRooms.length > 0
        ? (completedRequired / requiredRooms.length) * 100
        : 100;

    // Calculate phishing score (specific to PHISHING room)
    const phishingProgress = user.gameProgress.find(
      (p: any) => p.room.type === "PHISHING" && p.status === "ROOM_COMPLETE"
    );
    const phishingScore = phishingProgress?.score ?? 0;

    // Calculate engagement score (based on activity and consistency)
    const recentAttempts = user.puzzleAttempts.filter(
      (a: any) =>
        new Date(a.createdAt).getTime() > now.getTime() - 30 * 86400000
    );
    const engagementScore = Math.min(
      100,
      recentAttempts.length * 5 + (daysSinceActivity < 7 ? 50 : 0)
    );

    // Calculate performance score (average across all attempts)
    const totalScore = user.puzzleAttempts.reduce(
      (sum: number, a: any) => sum + a.score,
      0
    );
    const performanceScore =
      user.puzzleAttempts.length > 0
        ? totalScore / user.puzzleAttempts.length
        : 0;

    // Count failed attempts
    const failedAttempts = user.puzzleAttempts.filter(
      (a: any) => !a.isCorrect
    ).length;

    return {
      userId: user.id,
      trainingCompletion,
      phishingScore,
      engagementScore,
      performanceScore,
      daysSinceActivity,
      failedAttempts,
    };
  }

  private evaluateRiskFactors(metrics: UserMetrics): RiskFactor[] {
    const factors: RiskFactor[] = [];

    // Check incomplete training
    if (metrics.trainingCompletion < 100) {
      factors.push({
        factor: "INCOMPLETE_TRAINING",
        weight: RISK_FACTORS.INCOMPLETE_TRAINING,
        description: `Training ${metrics.trainingCompletion.toFixed(0)}% complete`,
      });
    }

    // Check low phishing score
    if (metrics.phishingScore < 70) {
      factors.push({
        factor: "LOW_PHISHING_SCORE",
        weight: RISK_FACTORS.LOW_PHISHING_SCORE,
        description: `Phishing awareness score: ${metrics.phishingScore.toFixed(0)}%`,
      });
    }

    // Check inactivity
    if (metrics.daysSinceActivity > INACTIVITY_DAYS) {
      factors.push({
        factor: "INACTIVE",
        weight: RISK_FACTORS.INACTIVE,
        description: `${metrics.daysSinceActivity} days since last activity`,
      });
    }

    // Check low performance
    if (metrics.performanceScore < 60) {
      factors.push({
        factor: "LOW_PERFORMANCE",
        weight: RISK_FACTORS.LOW_PERFORMANCE,
        description: `Average performance: ${metrics.performanceScore.toFixed(0)}%`,
      });
    }

    // Check multiple failures
    if (metrics.failedAttempts > 10) {
      factors.push({
        factor: "MULTIPLE_FAILURES",
        weight: RISK_FACTORS.MULTIPLE_FAILURES,
        description: `${metrics.failedAttempts} failed puzzle attempts`,
      });
    }

    return factors;
  }

  private getRiskLevel(score: number): RiskLevel {
    if (score >= RISK_THRESHOLDS.CRITICAL) return "CRITICAL";
    if (score >= RISK_THRESHOLDS.HIGH) return "HIGH";
    if (score >= RISK_THRESHOLDS.MEDIUM) return "MEDIUM";
    return "LOW";
  }
}

export const resilienceScoringService = new ResilienceScoringService();
