import { PrismaClient, DifficultyLevel, ContentType, PuzzleType } from "@prisma/client";
import { notFound, conflict } from "../../utils/errors.js";
import type {
  CreateOrgInput,
  UpdateOrgInput,
  UpdateBrandingInput,
  EnvironmentInput,
  ContentOverrideInput,
  ContentOverrideUpdateInput,
  FeatureFlagInput,
  ComplianceSettingsInput,
  RoomConfigInput,
  CustomPuzzleInput,
  CustomPuzzleUpdateInput,
} from "./schema.js";

const prisma = new PrismaClient();

export class OrganizationService {
  async create(data: CreateOrgInput) {
    const existing = await prisma.organization.findUnique({ where: { slug: data.slug } });
    if (existing) throw conflict("Organization slug already exists");
    return prisma.organization.create({ data });
  }

  async getById(id: string) {
    const org = await prisma.organization.findUnique({ where: { id }, include: { _count: { select: { users: true, groups: true } } } });
    if (!org) throw notFound("Organization not found");
    return org;
  }

  async update(id: string, data: UpdateOrgInput) {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) throw notFound("Organization not found");
    if (data.slug) {
      const existing = await prisma.organization.findFirst({ where: { slug: data.slug, NOT: { id } } });
      if (existing) throw conflict("Slug already taken");
    }
    return prisma.organization.update({ where: { id }, data });
  }

  async delete(id: string) {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) throw notFound("Organization not found");
    await prisma.organization.delete({ where: { id } });
    return { success: true };
  }

  async getSettings(id: string) {
    const org = await prisma.organization.findUnique({ where: { id }, select: { id: true, settings: true, primaryColor: true, logoUrl: true } });
    if (!org) throw notFound("Organization not found");
    return org;
  }

  async updateBranding(id: string, data: UpdateBrandingInput) {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) throw notFound("Organization not found");
    return prisma.organization.update({
      where: { id },
      data: { logoUrl: data.logoUrl ?? org.logoUrl, primaryColor: data.primaryColor ?? org.primaryColor, settings: data.settings ? JSON.parse(JSON.stringify(data.settings)) : undefined },
    });
  }

  // Environment settings methods
  async getEnvironment(orgId: string) {
    let env = await prisma.organizationEnvironment.findUnique({
      where: { organizationId: orgId },
    });

    if (!env) {
      // Return defaults
      return {
        organizationId: orgId,
        themePrimaryColor: "#6366f1",
        themeSecondaryColor: "#8b5cf6",
        themeMode: "light",
        customCss: null,
        defaultDifficulty: "NORMAL",
        allowHints: true,
        maxHintsPerPuzzle: 3,
        showLeaderboard: true,
        allowRetries: true,
        maxRetriesPerPuzzle: 3,
        timeLimitMultiplier: 1.0,
        enableBadges: true,
        enableStreaks: true,
        enableXP: true,
        enableLeaderboards: true,
        enableTeamMode: true,
        welcomeMessage: null,
        completionMessage: null,
        customTerminology: {},
      };
    }

    return env;
  }

  async updateEnvironment(orgId: string, data: EnvironmentInput) {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw notFound("Organization not found");

    return prisma.organizationEnvironment.upsert({
      where: { organizationId: orgId },
      update: {
        ...data,
        defaultDifficulty: data.defaultDifficulty as DifficultyLevel | undefined,
      },
      create: {
        organizationId: orgId,
        ...data,
        defaultDifficulty: (data.defaultDifficulty as DifficultyLevel) || "NORMAL",
      },
    });
  }

  // Content override methods
  async getContentOverrides(orgId: string, contentType?: ContentType) {
    const where: any = { organizationId: orgId };
    if (contentType) where.contentType = contentType;

    return prisma.contentOverride.findMany({
      where,
      orderBy: [{ contentType: "asc" }, { contentId: "asc" }],
    });
  }

  async createContentOverride(orgId: string, data: ContentOverrideInput) {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw notFound("Organization not found");

    // Check for existing override
    const existing = await prisma.contentOverride.findUnique({
      where: {
        organizationId_contentType_contentId_field: {
          organizationId: orgId,
          contentType: data.contentType as ContentType,
          contentId: data.contentId,
          field: data.field,
        },
      },
    });

    if (existing) {
      throw conflict("Content override already exists for this field");
    }

    return prisma.contentOverride.create({
      data: {
        organizationId: orgId,
        contentType: data.contentType as ContentType,
        contentId: data.contentId,
        field: data.field,
        overrideValue: data.overrideValue,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateContentOverride(overrideId: string, data: ContentOverrideUpdateInput) {
    const override = await prisma.contentOverride.findUnique({
      where: { id: overrideId },
    });
    if (!override) throw notFound("Content override not found");

    return prisma.contentOverride.update({
      where: { id: overrideId },
      data,
    });
  }

  async deleteContentOverride(overrideId: string) {
    const override = await prisma.contentOverride.findUnique({
      where: { id: overrideId },
    });
    if (!override) throw notFound("Content override not found");

    await prisma.contentOverride.delete({ where: { id: overrideId } });
    return { success: true };
  }

  // Feature flag methods
  async getFeatureFlags(orgId: string) {
    return prisma.organizationFeatureFlag.findMany({
      where: { organizationId: orgId },
      orderBy: { featureKey: "asc" },
    });
  }

  async getFeatureFlag(orgId: string, featureKey: string) {
    const flag = await prisma.organizationFeatureFlag.findUnique({
      where: { organizationId_featureKey: { organizationId: orgId, featureKey } },
    });

    if (!flag) {
      return { featureKey, enabled: false, config: {} };
    }

    return flag;
  }

  async setFeatureFlag(orgId: string, featureKey: string, data: FeatureFlagInput) {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw notFound("Organization not found");

    return prisma.organizationFeatureFlag.upsert({
      where: { organizationId_featureKey: { organizationId: orgId, featureKey } },
      update: {
        enabled: data.enabled,
        config: data.config || {},
      },
      create: {
        organizationId: orgId,
        featureKey,
        enabled: data.enabled,
        config: data.config || {},
      },
    });
  }

  // Compliance settings methods
  async getComplianceSettings(orgId: string) {
    let settings = await prisma.complianceSettings.findUnique({
      where: { organizationId: orgId },
    });

    if (!settings) {
      return {
        organizationId: orgId,
        trainingDeadlineDays: 30,
        requiredRooms: [],
        minimumPassScore: 70,
        requireAllPuzzles: true,
        recertificationEnabled: false,
        recertificationMonths: 12,
        certificatesEnabled: true,
        certificateTemplate: null,
        certificateSignatory: null,
        certificateSignatoryTitle: null,
        reminderDays: [7, 3, 1],
        escalationEnabled: false,
        escalationDays: 7,
        complianceOfficerEmail: null,
        weeklyReportEnabled: false,
      };
    }

    return settings;
  }

  async updateComplianceSettings(orgId: string, data: ComplianceSettingsInput) {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) throw notFound("Organization not found");

    return prisma.complianceSettings.upsert({
      where: { organizationId: orgId },
      update: data,
      create: {
        organizationId: orgId,
        ...data,
      },
    });
  }

  // Room configuration methods
  async getRoomConfigurations(orgId: string) {
    const configs = await prisma.roomConfiguration.findMany({
      where: { organizationId: orgId },
      include: { room: { select: { id: true, name: true, type: true } } },
      orderBy: { room: { order: "asc" } },
    });

    // Also get rooms without configs
    const configuredRoomIds = configs.map((c) => c.roomId);
    const unconfiguredRooms = await prisma.room.findMany({
      where: { id: { notIn: configuredRoomIds }, isActive: true },
      orderBy: { order: "asc" },
    });

    return {
      configured: configs,
      unconfigured: unconfiguredRooms.map((r) => ({
        roomId: r.id,
        room: { id: r.id, name: r.name, type: r.type },
        enabled: true,
        customTimeLimit: null,
        customDifficulty: null,
        customOrder: null,
        unlockAfterRooms: [],
        unlockDate: null,
        customSettings: {},
      })),
    };
  }

  async getRoomConfiguration(orgId: string, roomId: string) {
    const config = await prisma.roomConfiguration.findUnique({
      where: { organizationId_roomId: { organizationId: orgId, roomId } },
      include: { room: { select: { id: true, name: true, type: true } } },
    });

    if (!config) {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: { id: true, name: true, type: true },
      });
      if (!room) throw notFound("Room not found");

      return {
        roomId,
        room,
        enabled: true,
        customTimeLimit: null,
        customDifficulty: null,
        customOrder: null,
        unlockAfterRooms: [],
        unlockDate: null,
        customSettings: {},
      };
    }

    return config;
  }

  async updateRoomConfiguration(orgId: string, roomId: string, data: RoomConfigInput) {
    const [org, room] = await Promise.all([
      prisma.organization.findUnique({ where: { id: orgId } }),
      prisma.room.findUnique({ where: { id: roomId } }),
    ]);
    if (!org) throw notFound("Organization not found");
    if (!room) throw notFound("Room not found");

    return prisma.roomConfiguration.upsert({
      where: { organizationId_roomId: { organizationId: orgId, roomId } },
      update: {
        ...data,
        customDifficulty: data.customDifficulty as DifficultyLevel | null | undefined,
        unlockDate: data.unlockDate ? new Date(data.unlockDate) : undefined,
      },
      create: {
        organizationId: orgId,
        roomId,
        ...data,
        customDifficulty: data.customDifficulty as DifficultyLevel | null | undefined,
        unlockDate: data.unlockDate ? new Date(data.unlockDate) : null,
      },
      include: { room: { select: { id: true, name: true, type: true } } },
    });
  }

  // Custom puzzle methods
  async getCustomPuzzles(orgId: string, roomId?: string) {
    const where: any = { organizationId: orgId };
    if (roomId) where.roomId = roomId;

    return prisma.customPuzzle.findMany({
      where,
      include: {
        room: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: [{ roomId: "asc" }, { order: "asc" }],
    });
  }

  async getCustomPuzzle(puzzleId: string) {
    const puzzle = await prisma.customPuzzle.findUnique({
      where: { id: puzzleId },
      include: {
        room: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!puzzle) throw notFound("Custom puzzle not found");
    return puzzle;
  }

  async createCustomPuzzle(orgId: string, userId: string, data: CustomPuzzleInput) {
    const [org, room] = await Promise.all([
      prisma.organization.findUnique({ where: { id: orgId } }),
      prisma.room.findUnique({ where: { id: data.roomId } }),
    ]);
    if (!org) throw notFound("Organization not found");
    if (!room) throw notFound("Room not found");

    return prisma.customPuzzle.create({
      data: {
        organizationId: orgId,
        createdById: userId,
        roomId: data.roomId,
        title: data.title,
        description: data.description,
        type: data.type as PuzzleType,
        order: data.order ?? 0,
        basePoints: data.basePoints ?? 100,
        timeLimit: data.timeLimit ?? 300,
        config: data.config || {},
        hints: data.hints || [],
        answer: data.answer,
        explanation: data.explanation,
        isActive: data.isActive ?? true,
      },
      include: {
        room: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async updateCustomPuzzle(puzzleId: string, data: CustomPuzzleUpdateInput) {
    const puzzle = await prisma.customPuzzle.findUnique({
      where: { id: puzzleId },
    });
    if (!puzzle) throw notFound("Custom puzzle not found");

    return prisma.customPuzzle.update({
      where: { id: puzzleId },
      data: {
        ...data,
        type: data.type as PuzzleType | undefined,
      },
      include: {
        room: { select: { id: true, name: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async deleteCustomPuzzle(puzzleId: string) {
    const puzzle = await prisma.customPuzzle.findUnique({
      where: { id: puzzleId },
    });
    if (!puzzle) throw notFound("Custom puzzle not found");

    await prisma.customPuzzle.delete({ where: { id: puzzleId } });
    return { success: true };
  }
}
