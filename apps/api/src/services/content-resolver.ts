import { prisma } from "../lib/scoped-prisma.js";
import { ContentType, Room, Puzzle, DifficultyLevel } from "@prisma/client";

/**
 * Content resolver service for applying organization-specific overrides.
 * Resolves content (rooms, puzzles, hints) with any org customizations applied.
 */
export class ContentResolverService {
  /**
   * Get a room with organization overrides applied.
   */
  async getRoom(
    roomId: string,
    organizationId: string
  ): Promise<ResolvedRoom | null> {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { puzzles: { where: { isActive: true }, orderBy: { order: "asc" } } },
    });

    if (!room) return null;

    // Get org-specific configuration
    const [roomConfig, overrides, customPuzzles] = await Promise.all([
      prisma.roomConfiguration.findUnique({
        where: { organizationId_roomId: { organizationId, roomId } },
      }),
      prisma.contentOverride.findMany({
        where: {
          organizationId,
          contentType: "ROOM",
          contentId: roomId,
          isActive: true,
        },
      }),
      prisma.customPuzzle.findMany({
        where: { organizationId, roomId, isActive: true },
        orderBy: { order: "asc" },
      }),
    ]);

    // Check if room is enabled for this org
    if (roomConfig && !roomConfig.enabled) {
      return null;
    }

    // Apply overrides to room fields
    const resolvedRoom: ResolvedRoom = {
      ...room,
      timeLimit: roomConfig?.customTimeLimit ?? room.timeLimit,
      difficulty: roomConfig?.customDifficulty
        ? this.difficultyToNumber(roomConfig.customDifficulty)
        : room.difficulty,
      order: roomConfig?.customOrder ?? room.order,
      customSettings: roomConfig?.customSettings as Record<string, any> || {},
      unlockAfterRooms: (roomConfig?.unlockAfterRooms as string[]) || [],
      unlockDate: roomConfig?.unlockDate ?? null,
    };

    // Apply field overrides
    for (const override of overrides) {
      if (override.field in resolvedRoom) {
        (resolvedRoom as any)[override.field] = override.overrideValue;
      }
    }

    // Combine standard puzzles with custom puzzles
    const allPuzzles = [
      ...room.puzzles.map((p) => ({ ...p, isCustom: false })),
      ...customPuzzles.map((p) => ({ ...p, isCustom: true })),
    ].sort((a, b) => a.order - b.order);

    resolvedRoom.puzzles = allPuzzles;

    return resolvedRoom;
  }

  /**
   * Get a puzzle with organization overrides applied.
   */
  async getPuzzle(
    puzzleId: string,
    organizationId: string
  ): Promise<ResolvedPuzzle | null> {
    const puzzle = await prisma.puzzle.findUnique({
      where: { id: puzzleId },
      include: { room: true },
    });

    if (!puzzle) return null;

    // Get overrides for this puzzle
    const overrides = await prisma.contentOverride.findMany({
      where: {
        organizationId,
        contentType: "PUZZLE",
        contentId: puzzleId,
        isActive: true,
      },
    });

    // Get environment settings
    const environment = await prisma.organizationEnvironment.findUnique({
      where: { organizationId },
    });

    const resolvedPuzzle: ResolvedPuzzle = {
      ...puzzle,
      timeLimit: Math.round(
        puzzle.timeLimit * (environment?.timeLimitMultiplier ?? 1)
      ),
      maxHints: environment?.maxHintsPerPuzzle ?? 3,
      hintsEnabled: environment?.allowHints ?? true,
    };

    // Apply field overrides
    for (const override of overrides) {
      if (override.field in resolvedPuzzle) {
        (resolvedPuzzle as any)[override.field] = override.overrideValue;
      }
    }

    return resolvedPuzzle;
  }

  /**
   * Get hints for a puzzle with organization overrides applied.
   */
  async getHints(
    puzzleId: string,
    organizationId: string
  ): Promise<ResolvedHint[]> {
    const puzzle = await prisma.puzzle.findUnique({
      where: { id: puzzleId },
      select: { hints: true },
    });

    if (!puzzle) return [];

    const baseHints = (puzzle.hints as any[]) || [];

    // Get hint overrides
    const overrides = await prisma.contentOverride.findMany({
      where: {
        organizationId,
        contentType: "HINT",
        contentId: { startsWith: `${puzzleId}:` }, // Format: puzzleId:hintIndex
        isActive: true,
      },
    });

    // Build override map
    const overrideMap = new Map<string, string>();
    for (const override of overrides) {
      const [, hintIndex] = override.contentId.split(":");
      overrideMap.set(`${hintIndex}:${override.field}`, override.overrideValue);
    }

    // Apply overrides to hints
    return baseHints.map((hint, index) => ({
      index,
      text: overrideMap.get(`${index}:text`) ?? hint.text ?? hint,
      cost: hint.cost ?? 10,
    }));
  }

  /**
   * Get all rooms available for an organization with configs applied.
   */
  async getAvailableRooms(organizationId: string): Promise<ResolvedRoom[]> {
    // Get all active rooms
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      include: { puzzles: { where: { isActive: true }, orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    });

    // Get all room configurations for this org
    const configs = await prisma.roomConfiguration.findMany({
      where: { organizationId },
    });

    const configMap = new Map(configs.map((c) => [c.roomId, c]));

    // Get all content overrides for rooms
    const overrides = await prisma.contentOverride.findMany({
      where: {
        organizationId,
        contentType: "ROOM",
        isActive: true,
      },
    });

    // Group overrides by room
    const overridesByRoom = new Map<string, typeof overrides>();
    for (const override of overrides) {
      const existing = overridesByRoom.get(override.contentId) || [];
      existing.push(override);
      overridesByRoom.set(override.contentId, existing);
    }

    // Get all custom puzzles for this org
    const customPuzzles = await prisma.customPuzzle.findMany({
      where: { organizationId, isActive: true },
      orderBy: { order: "asc" },
    });

    const customPuzzlesByRoom = new Map<string, typeof customPuzzles>();
    for (const puzzle of customPuzzles) {
      const existing = customPuzzlesByRoom.get(puzzle.roomId) || [];
      existing.push(puzzle);
      customPuzzlesByRoom.set(puzzle.roomId, existing);
    }

    // Resolve each room
    const resolvedRooms: ResolvedRoom[] = [];

    for (const room of rooms) {
      const config = configMap.get(room.id);

      // Skip disabled rooms
      if (config && !config.enabled) continue;

      const roomOverrides = overridesByRoom.get(room.id) || [];
      const roomCustomPuzzles = customPuzzlesByRoom.get(room.id) || [];

      const resolvedRoom: ResolvedRoom = {
        ...room,
        timeLimit: config?.customTimeLimit ?? room.timeLimit,
        difficulty: config?.customDifficulty
          ? this.difficultyToNumber(config.customDifficulty)
          : room.difficulty,
        order: config?.customOrder ?? room.order,
        customSettings: (config?.customSettings as Record<string, any>) || {},
        unlockAfterRooms: (config?.unlockAfterRooms as string[]) || [],
        unlockDate: config?.unlockDate ?? null,
      };

      // Apply field overrides
      for (const override of roomOverrides) {
        if (override.field in resolvedRoom) {
          (resolvedRoom as any)[override.field] = override.overrideValue;
        }
      }

      // Combine puzzles
      resolvedRoom.puzzles = [
        ...room.puzzles.map((p) => ({ ...p, isCustom: false })),
        ...roomCustomPuzzles.map((p) => ({ ...p, isCustom: true })),
      ].sort((a, b) => a.order - b.order);

      resolvedRooms.push(resolvedRoom);
    }

    // Sort by resolved order
    return resolvedRooms.sort((a, b) => a.order - b.order);
  }

  /**
   * Check if a room is unlocked for a user.
   */
  async isRoomUnlocked(
    roomId: string,
    userId: string,
    organizationId: string
  ): Promise<{ unlocked: boolean; reason?: string }> {
    const config = await prisma.roomConfiguration.findUnique({
      where: { organizationId_roomId: { organizationId, roomId } },
    });

    // No config means unlocked
    if (!config) {
      return { unlocked: true };
    }

    // Check if disabled
    if (!config.enabled) {
      return { unlocked: false, reason: "Room is disabled for your organization" };
    }

    // Check unlock date
    if (config.unlockDate && new Date(config.unlockDate) > new Date()) {
      return {
        unlocked: false,
        reason: `Room unlocks on ${config.unlockDate.toLocaleDateString()}`,
      };
    }

    // Check prerequisite rooms
    const requiredRooms = (config.unlockAfterRooms as string[]) || [];
    if (requiredRooms.length > 0) {
      const completedRooms = await prisma.gameProgress.findMany({
        where: {
          userId,
          roomId: { in: requiredRooms },
          status: "ROOM_COMPLETE",
        },
        select: { roomId: true },
      });

      const completedSet = new Set(completedRooms.map((r) => r.roomId));
      const missing = requiredRooms.filter((r) => !completedSet.has(r));

      if (missing.length > 0) {
        const missingRooms = await prisma.room.findMany({
          where: { id: { in: missing } },
          select: { name: true },
        });

        return {
          unlocked: false,
          reason: `Complete these rooms first: ${missingRooms.map((r) => r.name).join(", ")}`,
        };
      }
    }

    return { unlocked: true };
  }

  /**
   * Get organization environment settings.
   */
  async getEnvironment(organizationId: string): Promise<OrganizationEnvironmentSettings> {
    const env = await prisma.organizationEnvironment.findUnique({
      where: { organizationId },
    });

    // Return defaults if not configured
    if (!env) {
      return {
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

    return {
      themePrimaryColor: env.themePrimaryColor,
      themeSecondaryColor: env.themeSecondaryColor,
      themeMode: env.themeMode,
      customCss: env.customCss,
      defaultDifficulty: env.defaultDifficulty,
      allowHints: env.allowHints,
      maxHintsPerPuzzle: env.maxHintsPerPuzzle,
      showLeaderboard: env.showLeaderboard,
      allowRetries: env.allowRetries,
      maxRetriesPerPuzzle: env.maxRetriesPerPuzzle,
      timeLimitMultiplier: env.timeLimitMultiplier,
      enableBadges: env.enableBadges,
      enableStreaks: env.enableStreaks,
      enableXP: env.enableXP,
      enableLeaderboards: env.enableLeaderboards,
      enableTeamMode: env.enableTeamMode,
      welcomeMessage: env.welcomeMessage,
      completionMessage: env.completionMessage,
      customTerminology: (env.customTerminology as Record<string, string>) || {},
    };
  }

  /**
   * Check if a feature is enabled for an organization.
   */
  async isFeatureEnabled(
    organizationId: string,
    featureKey: string
  ): Promise<boolean> {
    const flag = await prisma.organizationFeatureFlag.findUnique({
      where: { organizationId_featureKey: { organizationId, featureKey } },
    });

    return flag?.enabled ?? false;
  }

  /**
   * Get feature flag configuration.
   */
  async getFeatureConfig(
    organizationId: string,
    featureKey: string
  ): Promise<{ enabled: boolean; config: Record<string, any> }> {
    const flag = await prisma.organizationFeatureFlag.findUnique({
      where: { organizationId_featureKey: { organizationId, featureKey } },
    });

    return {
      enabled: flag?.enabled ?? false,
      config: (flag?.config as Record<string, any>) || {},
    };
  }

  /**
   * Convert DifficultyLevel enum to numeric value.
   */
  private difficultyToNumber(level: DifficultyLevel): number {
    const map: Record<DifficultyLevel, number> = {
      EASY: 1,
      NORMAL: 2,
      HARD: 3,
      EXPERT: 4,
    };
    return map[level];
  }
}

// Type definitions for resolved content
export interface ResolvedRoom extends Room {
  puzzles: Array<ResolvedPuzzle & { isCustom: boolean }>;
  customSettings: Record<string, any>;
  unlockAfterRooms: string[];
  unlockDate: Date | null;
}

export interface ResolvedPuzzle extends Puzzle {
  maxHints: number;
  hintsEnabled: boolean;
}

export interface ResolvedHint {
  index: number;
  text: string;
  cost: number;
}

export interface OrganizationEnvironmentSettings {
  themePrimaryColor: string;
  themeSecondaryColor: string;
  themeMode: string;
  customCss: string | null;
  defaultDifficulty: DifficultyLevel | string;
  allowHints: boolean;
  maxHintsPerPuzzle: number;
  showLeaderboard: boolean;
  allowRetries: boolean;
  maxRetriesPerPuzzle: number;
  timeLimitMultiplier: number;
  enableBadges: boolean;
  enableStreaks: boolean;
  enableXP: boolean;
  enableLeaderboards: boolean;
  enableTeamMode: boolean;
  welcomeMessage: string | null;
  completionMessage: string | null;
  customTerminology: Record<string, string>;
}

export const contentResolverService = new ContentResolverService();
