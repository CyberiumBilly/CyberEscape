import { PrismaClient, Prisma } from "@prisma/client";

/**
 * Singleton PrismaClient instance for the application.
 * Use this instead of creating new instances in each service.
 */
export const prisma = new PrismaClient();

/**
 * Models that support organization-scoped queries.
 * Each model must have an organizationId field.
 */
const ORG_SCOPED_MODELS = [
  "user",
  "group",
  "userGroup",
  "gameProgress",
  "puzzleAttempt",
  "campaign",
  "alert",
  "report",
  "auditLog",
  "ssoConfig",
  "webhookConfig",
  "scormPackage",
  "organizationEnvironment",
  "contentOverride",
  "organizationFeatureFlag",
  "complianceSettings",
  "roomConfiguration",
  "customPuzzle",
  "organizationResilienceScore",
  "scheduledReport",
] as const;

type OrgScopedModel = (typeof ORG_SCOPED_MODELS)[number];

/**
 * Creates a scoped Prisma client that automatically filters by organizationId.
 * Uses Prisma's $extends to add middleware-like behavior.
 *
 * @param organizationId - The organization ID to scope all queries to
 * @returns Extended PrismaClient with automatic org filtering
 */
export function createScopedPrisma(organizationId: string) {
  return prisma.$extends({
    name: "tenantScope",
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (isOrgScopedModel(model)) {
            args.where = {
              ...args.where,
              organizationId,
            };
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (isOrgScopedModel(model)) {
            args.where = {
              ...args.where,
              organizationId,
            };
          }
          return query(args);
        },
        async findUnique({ model, args, query }) {
          // findUnique doesn't support adding to where clause directly
          // We validate after fetch instead
          const result = await query(args);
          if (
            result &&
            isOrgScopedModel(model) &&
            "organizationId" in result &&
            result.organizationId !== organizationId
          ) {
            return null; // Return null if org doesn't match
          }
          return result;
        },
        async count({ model, args, query }) {
          if (isOrgScopedModel(model)) {
            args.where = {
              ...args.where,
              organizationId,
            };
          }
          return query(args);
        },
        async aggregate({ model, args, query }) {
          if (isOrgScopedModel(model)) {
            args.where = {
              ...args.where,
              organizationId,
            };
          }
          return query(args);
        },
        async groupBy({ model, args, query }) {
          if (isOrgScopedModel(model)) {
            (args as any).where = {
              ...(args as any).where,
              organizationId,
            };
          }
          return query(args);
        },
        async create({ model, args, query }) {
          if (isOrgScopedModel(model)) {
            (args.data as any).organizationId = organizationId;
          }
          return query(args);
        },
        async createMany({ model, args, query }) {
          if (isOrgScopedModel(model)) {
            if (Array.isArray(args.data)) {
              args.data = args.data.map((item: any) => ({
                ...item,
                organizationId,
              }));
            } else {
              (args.data as any).organizationId = organizationId;
            }
          }
          return query(args);
        },
        async update({ model, args, query }) {
          if (isOrgScopedModel(model)) {
            // Add org filter to where clause
            args.where = {
              ...args.where,
              organizationId,
            } as any;
          }
          return query(args);
        },
        async updateMany({ model, args, query }) {
          if (isOrgScopedModel(model)) {
            args.where = {
              ...args.where,
              organizationId,
            };
          }
          return query(args);
        },
        async delete({ model, args, query }) {
          if (isOrgScopedModel(model)) {
            args.where = {
              ...args.where,
              organizationId,
            } as any;
          }
          return query(args);
        },
        async deleteMany({ model, args, query }) {
          if (isOrgScopedModel(model)) {
            args.where = {
              ...args.where,
              organizationId,
            };
          }
          return query(args);
        },
        async upsert({ model, args, query }) {
          if (isOrgScopedModel(model)) {
            args.where = {
              ...args.where,
              organizationId,
            } as any;
            (args.create as any).organizationId = organizationId;
          }
          return query(args);
        },
      },
    },
  });
}

function isOrgScopedModel(model: string): model is OrgScopedModel {
  return ORG_SCOPED_MODELS.includes(model.toLowerCase() as OrgScopedModel);
}

/**
 * Type for the scoped Prisma client
 */
export type ScopedPrismaClient = ReturnType<typeof createScopedPrisma>;

/**
 * Helper to get org-scoped where clause for manual queries
 */
export function orgWhere(
  organizationId: string | undefined,
  additionalWhere: Record<string, any> = {}
): Record<string, any> {
  if (!organizationId) {
    return additionalWhere;
  }
  return {
    organizationId,
    ...additionalWhere,
  };
}

/**
 * Models that require indirect org-scoping through relations.
 * These don't have organizationId directly but relate to org-scoped models.
 */
export const RELATION_SCOPED_MODELS = {
  // UserGroup: scoped via user.organizationId
  userGroup: { through: "user", field: "organizationId" },
  // GameProgress: scoped via user.organizationId
  gameProgress: { through: "user", field: "organizationId" },
  // PuzzleAttempt: scoped via user.organizationId
  puzzleAttempt: { through: "user", field: "organizationId" },
  // GroupResilienceScore: scoped via group.organizationId
  groupResilienceScore: { through: "group", field: "organizationId" },
  // UserRiskScore: scoped via user.organizationId
  userRiskScore: { through: "user", field: "organizationId" },
} as const;

/**
 * Helper to build nested where for relation-scoped queries
 */
export function relationOrgWhere(
  organizationId: string | undefined,
  model: keyof typeof RELATION_SCOPED_MODELS
): Record<string, any> {
  if (!organizationId) {
    return {};
  }
  const config = RELATION_SCOPED_MODELS[model];
  return {
    [config.through]: {
      [config.field]: organizationId,
    },
  };
}
