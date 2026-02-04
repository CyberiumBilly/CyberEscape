import { FastifyInstance } from "fastify";
import { OrganizationService } from "./service.js";
import {
  createOrgSchema,
  updateOrgSchema,
  updateBrandingSchema,
  environmentSchema,
  contentOverrideSchema,
  contentOverrideUpdateSchema,
  featureFlagSchema,
  complianceSettingsSchema,
  roomConfigSchema,
  customPuzzleSchema,
  customPuzzleUpdateSchema,
} from "./schema.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRole, requirePermission } from "../../middleware/rbac.js";
import { validateBody } from "../../middleware/validate.js";
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

const orgService = new OrganizationService();

export async function organizationRoutes(app: FastifyInstance) {
  // Basic CRUD
  app.post<{ Body: CreateOrgInput }>("/api/v1/organizations", {
    preHandler: [authenticate, requireRole("SUPER_ADMIN"), validateBody(createOrgSchema)],
    handler: async (request, reply) => reply.status(201).send(await orgService.create(request.body)),
  });

  app.get<{ Params: { id: string } }>("/api/v1/organizations/:id", {
    preHandler: [authenticate, requireRole("ORG_ADMIN")],
    handler: async (request, reply) => reply.send(await orgService.getById((request.params as any).id)),
  });

  app.patch<{ Params: { id: string }; Body: UpdateOrgInput }>("/api/v1/organizations/:id", {
    preHandler: [authenticate, requireRole("ORG_ADMIN"), validateBody(updateOrgSchema)],
    handler: async (request, reply) => reply.send(await orgService.update((request.params as any).id, request.body)),
  });

  app.delete<{ Params: { id: string } }>("/api/v1/organizations/:id", {
    preHandler: [authenticate, requireRole("SUPER_ADMIN")],
    handler: async (request, reply) => reply.send(await orgService.delete((request.params as any).id)),
  });

  app.get<{ Params: { id: string } }>("/api/v1/organizations/:id/settings", {
    preHandler: [authenticate, requireRole("ORG_ADMIN")],
    handler: async (request, reply) => reply.send(await orgService.getSettings((request.params as any).id)),
  });

  app.patch<{ Params: { id: string }; Body: UpdateBrandingInput }>("/api/v1/organizations/:id/branding", {
    preHandler: [authenticate, requireRole("ORG_ADMIN"), validateBody(updateBrandingSchema)],
    handler: async (request, reply) => reply.send(await orgService.updateBranding((request.params as any).id, request.body)),
  });

  // Environment settings
  app.get<{ Params: { id: string } }>("/api/v1/organizations/:id/environment", {
    preHandler: [authenticate, requirePermission("customization:read")],
    handler: async (request, reply) => {
      const orgId = (request.params as any).id;
      reply.send(await orgService.getEnvironment(orgId));
    },
  });

  app.put<{ Params: { id: string }; Body: EnvironmentInput }>("/api/v1/organizations/:id/environment", {
    preHandler: [authenticate, requirePermission("customization:write"), validateBody(environmentSchema)],
    handler: async (request, reply) => {
      const orgId = (request.params as any).id;
      reply.send(await orgService.updateEnvironment(orgId, request.body));
    },
  });

  // Content overrides
  app.get<{ Params: { id: string }; Querystring: { type?: string } }>("/api/v1/organizations/:id/content-overrides", {
    preHandler: [authenticate, requirePermission("customization:read")],
    handler: async (request, reply) => {
      const orgId = (request.params as any).id;
      const contentType = (request.query as any).type;
      reply.send(await orgService.getContentOverrides(orgId, contentType));
    },
  });

  app.post<{ Params: { id: string }; Body: ContentOverrideInput }>("/api/v1/organizations/:id/content-overrides", {
    preHandler: [authenticate, requirePermission("customization:write"), validateBody(contentOverrideSchema)],
    handler: async (request, reply) => {
      const orgId = (request.params as any).id;
      reply.status(201).send(await orgService.createContentOverride(orgId, request.body));
    },
  });

  app.patch<{ Params: { id: string; overrideId: string }; Body: ContentOverrideUpdateInput }>(
    "/api/v1/organizations/:id/content-overrides/:overrideId",
    {
      preHandler: [authenticate, requirePermission("customization:write"), validateBody(contentOverrideUpdateSchema)],
      handler: async (request, reply) => {
        const overrideId = (request.params as any).overrideId;
        reply.send(await orgService.updateContentOverride(overrideId, request.body));
      },
    }
  );

  app.delete<{ Params: { id: string; overrideId: string } }>("/api/v1/organizations/:id/content-overrides/:overrideId", {
    preHandler: [authenticate, requirePermission("customization:write")],
    handler: async (request, reply) => {
      const overrideId = (request.params as any).overrideId;
      reply.send(await orgService.deleteContentOverride(overrideId));
    },
  });

  // Feature flags
  app.get<{ Params: { id: string } }>("/api/v1/organizations/:id/feature-flags", {
    preHandler: [authenticate, requirePermission("settings:read")],
    handler: async (request, reply) => {
      const orgId = (request.params as any).id;
      reply.send(await orgService.getFeatureFlags(orgId));
    },
  });

  app.get<{ Params: { id: string; feature: string } }>("/api/v1/organizations/:id/feature-flags/:feature", {
    preHandler: [authenticate, requirePermission("settings:read")],
    handler: async (request, reply) => {
      const orgId = (request.params as any).id;
      const feature = (request.params as any).feature;
      reply.send(await orgService.getFeatureFlag(orgId, feature));
    },
  });

  app.put<{ Params: { id: string; feature: string }; Body: FeatureFlagInput }>(
    "/api/v1/organizations/:id/feature-flags/:feature",
    {
      preHandler: [authenticate, requirePermission("settings:write"), validateBody(featureFlagSchema)],
      handler: async (request, reply) => {
        const orgId = (request.params as any).id;
        const feature = (request.params as any).feature;
        reply.send(await orgService.setFeatureFlag(orgId, feature, request.body));
      },
    }
  );

  // Compliance settings
  app.get<{ Params: { id: string } }>("/api/v1/organizations/:id/compliance", {
    preHandler: [authenticate, requirePermission("compliance:read")],
    handler: async (request, reply) => {
      const orgId = (request.params as any).id;
      reply.send(await orgService.getComplianceSettings(orgId));
    },
  });

  app.put<{ Params: { id: string }; Body: ComplianceSettingsInput }>("/api/v1/organizations/:id/compliance", {
    preHandler: [authenticate, requirePermission("compliance:write"), validateBody(complianceSettingsSchema)],
    handler: async (request, reply) => {
      const orgId = (request.params as any).id;
      reply.send(await orgService.updateComplianceSettings(orgId, request.body));
    },
  });

  // Room configurations
  app.get<{ Params: { id: string } }>("/api/v1/organizations/:id/rooms", {
    preHandler: [authenticate, requirePermission("customization:read")],
    handler: async (request, reply) => {
      const orgId = (request.params as any).id;
      reply.send(await orgService.getRoomConfigurations(orgId));
    },
  });

  app.get<{ Params: { id: string; roomId: string } }>("/api/v1/organizations/:id/rooms/:roomId/config", {
    preHandler: [authenticate, requirePermission("customization:read")],
    handler: async (request, reply) => {
      const orgId = (request.params as any).id;
      const roomId = (request.params as any).roomId;
      reply.send(await orgService.getRoomConfiguration(orgId, roomId));
    },
  });

  app.put<{ Params: { id: string; roomId: string }; Body: RoomConfigInput }>(
    "/api/v1/organizations/:id/rooms/:roomId/config",
    {
      preHandler: [authenticate, requirePermission("customization:write"), validateBody(roomConfigSchema)],
      handler: async (request, reply) => {
        const orgId = (request.params as any).id;
        const roomId = (request.params as any).roomId;
        reply.send(await orgService.updateRoomConfiguration(orgId, roomId, request.body));
      },
    }
  );

  // Custom puzzles
  app.get<{ Params: { id: string }; Querystring: { roomId?: string } }>("/api/v1/organizations/:id/custom-puzzles", {
    preHandler: [authenticate, requirePermission("customization:read")],
    handler: async (request, reply) => {
      const orgId = (request.params as any).id;
      const roomId = (request.query as any).roomId;
      reply.send(await orgService.getCustomPuzzles(orgId, roomId));
    },
  });

  app.get<{ Params: { id: string; puzzleId: string } }>("/api/v1/organizations/:id/custom-puzzles/:puzzleId", {
    preHandler: [authenticate, requirePermission("customization:read")],
    handler: async (request, reply) => {
      const puzzleId = (request.params as any).puzzleId;
      reply.send(await orgService.getCustomPuzzle(puzzleId));
    },
  });

  app.post<{ Params: { id: string }; Body: CustomPuzzleInput }>("/api/v1/organizations/:id/custom-puzzles", {
    preHandler: [authenticate, requirePermission("customization:write"), validateBody(customPuzzleSchema)],
    handler: async (request, reply) => {
      const orgId = (request.params as any).id;
      const userId = request.user!.userId;
      reply.status(201).send(await orgService.createCustomPuzzle(orgId, userId, request.body));
    },
  });

  app.patch<{ Params: { id: string; puzzleId: string }; Body: CustomPuzzleUpdateInput }>(
    "/api/v1/organizations/:id/custom-puzzles/:puzzleId",
    {
      preHandler: [authenticate, requirePermission("customization:write"), validateBody(customPuzzleUpdateSchema)],
      handler: async (request, reply) => {
        const puzzleId = (request.params as any).puzzleId;
        reply.send(await orgService.updateCustomPuzzle(puzzleId, request.body));
      },
    }
  );

  app.delete<{ Params: { id: string; puzzleId: string } }>("/api/v1/organizations/:id/custom-puzzles/:puzzleId", {
    preHandler: [authenticate, requirePermission("customization:write")],
    handler: async (request, reply) => {
      const puzzleId = (request.params as any).puzzleId;
      reply.send(await orgService.deleteCustomPuzzle(puzzleId));
    },
  });
}
