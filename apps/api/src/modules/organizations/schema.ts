import { z } from "zod";

export const createOrgSchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  domain: z.string().optional(),
  maxUsers: z.number().int().min(1).optional().default(100),
});

export const updateOrgSchema = createOrgSchema.partial();

export const updateBrandingSchema = z.object({
  logoUrl: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  settings: z.record(z.unknown()).optional(),
});

// Environment settings schema
export const environmentSchema = z.object({
  themePrimaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  themeSecondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  themeMode: z.enum(["light", "dark", "auto"]).optional(),
  customCss: z.string().max(10000).optional().nullable(),
  defaultDifficulty: z.enum(["EASY", "NORMAL", "HARD", "EXPERT"]).optional(),
  allowHints: z.boolean().optional(),
  maxHintsPerPuzzle: z.number().int().min(0).max(10).optional(),
  showLeaderboard: z.boolean().optional(),
  allowRetries: z.boolean().optional(),
  maxRetriesPerPuzzle: z.number().int().min(0).max(10).optional(),
  timeLimitMultiplier: z.number().min(0.5).max(3.0).optional(),
  enableBadges: z.boolean().optional(),
  enableStreaks: z.boolean().optional(),
  enableXP: z.boolean().optional(),
  enableLeaderboards: z.boolean().optional(),
  enableTeamMode: z.boolean().optional(),
  welcomeMessage: z.string().max(1000).optional().nullable(),
  completionMessage: z.string().max(1000).optional().nullable(),
  customTerminology: z.record(z.string()).optional(),
});

// Content override schema
export const contentOverrideSchema = z.object({
  contentType: z.enum(["ROOM", "PUZZLE", "HINT"]),
  contentId: z.string(),
  field: z.string(),
  overrideValue: z.string(),
  isActive: z.boolean().optional().default(true),
});

export const contentOverrideUpdateSchema = z.object({
  overrideValue: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Feature flag schema
export const featureFlagSchema = z.object({
  enabled: z.boolean(),
  config: z.record(z.unknown()).optional().default({}),
});

// Compliance settings schema
export const complianceSettingsSchema = z.object({
  trainingDeadlineDays: z.number().int().min(1).max(365).optional(),
  requiredRooms: z.array(z.string()).optional(),
  minimumPassScore: z.number().int().min(0).max(100).optional(),
  requireAllPuzzles: z.boolean().optional(),
  recertificationEnabled: z.boolean().optional(),
  recertificationMonths: z.number().int().min(1).max(36).optional(),
  certificatesEnabled: z.boolean().optional(),
  certificateTemplate: z.string().optional().nullable(),
  certificateSignatory: z.string().max(200).optional().nullable(),
  certificateSignatoryTitle: z.string().max(200).optional().nullable(),
  reminderDays: z.array(z.number().int().min(1)).optional(),
  escalationEnabled: z.boolean().optional(),
  escalationDays: z.number().int().min(1).optional(),
  complianceOfficerEmail: z.string().email().optional().nullable(),
  weeklyReportEnabled: z.boolean().optional(),
});

// Room configuration schema
export const roomConfigSchema = z.object({
  enabled: z.boolean().optional(),
  customTimeLimit: z.number().int().min(60).max(7200).optional().nullable(),
  customDifficulty: z.enum(["EASY", "NORMAL", "HARD", "EXPERT"]).optional().nullable(),
  customOrder: z.number().int().min(0).optional().nullable(),
  unlockAfterRooms: z.array(z.string()).optional(),
  unlockDate: z.string().datetime().optional().nullable(),
  customSettings: z.record(z.unknown()).optional(),
});

// Custom puzzle schema
export const customPuzzleSchema = z.object({
  roomId: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  type: z.enum([
    "MULTIPLE_CHOICE",
    "PASSWORD_STRENGTH",
    "PHISHING_CLASSIFICATION",
    "DRAG_DROP",
    "CODE_ENTRY",
    "SEQUENCE",
    "MATCHING",
    "SIMULATION",
  ]),
  order: z.number().int().min(0).optional().default(0),
  basePoints: z.number().int().min(0).max(1000).optional().default(100),
  timeLimit: z.number().int().min(30).max(3600).optional().default(300),
  config: z.record(z.unknown()).optional().default({}),
  hints: z.array(z.object({
    text: z.string(),
    cost: z.number().int().min(0).optional(),
  })).optional().default([]),
  answer: z.unknown(),
  explanation: z.string().max(2000).optional().nullable(),
  isActive: z.boolean().optional().default(true),
});

export const customPuzzleUpdateSchema = customPuzzleSchema.partial().omit({ roomId: true });

export type CreateOrgInput = z.infer<typeof createOrgSchema>;
export type UpdateOrgInput = z.infer<typeof updateOrgSchema>;
export type UpdateBrandingInput = z.infer<typeof updateBrandingSchema>;
export type EnvironmentInput = z.infer<typeof environmentSchema>;
export type ContentOverrideInput = z.infer<typeof contentOverrideSchema>;
export type ContentOverrideUpdateInput = z.infer<typeof contentOverrideUpdateSchema>;
export type FeatureFlagInput = z.infer<typeof featureFlagSchema>;
export type ComplianceSettingsInput = z.infer<typeof complianceSettingsSchema>;
export type RoomConfigInput = z.infer<typeof roomConfigSchema>;
export type CustomPuzzleInput = z.infer<typeof customPuzzleSchema>;
export type CustomPuzzleUpdateInput = z.infer<typeof customPuzzleUpdateSchema>;
