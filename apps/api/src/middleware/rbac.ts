import { FastifyRequest, FastifyReply } from "fastify";
import { forbidden } from "../utils/errors.js";
import { prisma } from "../lib/scoped-prisma.js";

const ROLE_HIERARCHY: Record<string, number> = {
  SUPER_ADMIN: 4,
  ORG_ADMIN: 3,
  MANAGER: 2,
  LEARNER: 1,
};

/**
 * Default permissions for each role.
 * Used as fallback when database permissions are not configured.
 */
const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: ["*"], // All permissions
  ORG_ADMIN: [
    "users:read",
    "users:write",
    "users:delete",
    "groups:read",
    "groups:write",
    "groups:delete",
    "analytics:read",
    "analytics:export",
    "reports:read",
    "reports:write",
    "settings:read",
    "settings:write",
    "campaigns:read",
    "campaigns:write",
    "alerts:read",
    "alerts:write",
    "compliance:read",
    "compliance:write",
    "customization:read",
    "customization:write",
  ],
  MANAGER: [
    "users:read",
    "groups:read",
    "analytics:read",
    "reports:read",
    "campaigns:read",
    "alerts:read",
  ],
  LEARNER: [
    "profile:read",
    "profile:write",
    "game:play",
    "leaderboard:read",
  ],
};

// Cache for database permissions (TTL: 5 minutes)
let permissionCache: Map<string, { permissions: string[]; expiry: number }> =
  new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Clears the permission cache. Call this when permissions are updated.
 */
export function clearPermissionCache(): void {
  permissionCache.clear();
}

/**
 * Gets permissions for a role, checking database first, then falling back to defaults.
 */
async function getRolePermissions(role: string): Promise<string[]> {
  // Check cache
  const cached = permissionCache.get(role);
  if (cached && cached.expiry > Date.now()) {
    return cached.permissions;
  }

  try {
    // Try to fetch from database
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role: role as any },
      include: { permission: true },
    });

    if (rolePermissions.length > 0) {
      const permissions = rolePermissions.map((rp) => rp.permission.name);
      permissionCache.set(role, {
        permissions,
        expiry: Date.now() + CACHE_TTL,
      });
      return permissions;
    }
  } catch {
    // Database not available or table doesn't exist yet - use defaults
  }

  // Fall back to defaults
  const defaults = DEFAULT_ROLE_PERMISSIONS[role] || [];
  permissionCache.set(role, {
    permissions: defaults,
    expiry: Date.now() + CACHE_TTL,
  });
  return defaults;
}

/**
 * Checks if a user has a specific permission.
 */
async function hasPermission(
  role: string,
  permission: string
): Promise<boolean> {
  const permissions = await getRolePermissions(role);

  // Wildcard check
  if (permissions.includes("*")) {
    return true;
  }

  // Exact match
  if (permissions.includes(permission)) {
    return true;
  }

  // Category wildcard (e.g., "users:*" matches "users:read")
  const [category] = permission.split(":");
  if (permissions.includes(`${category}:*`)) {
    return true;
  }

  return false;
}

/**
 * Middleware factory that requires the user to have at least one of the specified roles.
 * Uses role hierarchy - higher roles automatically satisfy lower role requirements.
 */
export function requireRole(...allowedRoles: string[]) {
  return async function (
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> {
    const user = request.user;
    if (!user) {
      throw forbidden("No authenticated user");
    }
    const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
    const requiredLevel = Math.min(
      ...allowedRoles.map((r) => ROLE_HIERARCHY[r] ?? 99)
    );
    if (userLevel < requiredLevel) {
      throw forbidden("Insufficient permissions");
    }
  };
}

/**
 * Middleware factory that requires the user to have ALL of the specified permissions.
 * Permissions are checked against the user's role.
 *
 * @param permissions - Required permissions (e.g., "users:read", "analytics:export")
 *
 * @example
 * // Require single permission
 * fastify.get('/users', { preHandler: [authenticate, requirePermission('users:read')] }, handler)
 *
 * @example
 * // Require multiple permissions (ALL must be satisfied)
 * fastify.post('/reports/export', { preHandler: [authenticate, requirePermission('reports:read', 'analytics:export')] }, handler)
 */
export function requirePermission(...permissions: string[]) {
  return async function (
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> {
    const user = request.user;
    if (!user) {
      throw forbidden("No authenticated user");
    }

    // Check all required permissions
    for (const permission of permissions) {
      const has = await hasPermission(user.role, permission);
      if (!has) {
        throw forbidden(`Missing permission: ${permission}`);
      }
    }
  };
}

/**
 * Middleware factory that requires the user to have ANY of the specified permissions.
 *
 * @param permissions - Required permissions (at least one must be satisfied)
 */
export function requireAnyPermission(...permissions: string[]) {
  return async function (
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> {
    const user = request.user;
    if (!user) {
      throw forbidden("No authenticated user");
    }

    // Check if user has at least one permission
    for (const permission of permissions) {
      const has = await hasPermission(user.role, permission);
      if (has) {
        return; // At least one permission satisfied
      }
    }

    throw forbidden(
      `Missing permissions: requires one of ${permissions.join(", ")}`
    );
  };
}

/**
 * Helper to check permissions in service code (not middleware).
 */
export async function checkPermission(
  role: string,
  permission: string
): Promise<boolean> {
  return hasPermission(role, permission);
}

/**
 * Gets all permissions for a role.
 */
export async function getPermissionsForRole(role: string): Promise<string[]> {
  return getRolePermissions(role);
}

/**
 * Resource types for resource-level ACL.
 */
export const RESOURCE_TYPES = {
  GROUP: "group",
  ROOM: "room",
  REPORT: "report",
  CAMPAIGN: "campaign",
} as const;

/**
 * Resource permission levels.
 */
export const RESOURCE_PERMISSIONS = {
  READ: "read",
  WRITE: "write",
  MANAGE: "manage",
} as const;

/**
 * Checks if a user has resource-level permission.
 * Falls back to role hierarchy if no explicit permission exists.
 */
async function hasResourcePermission(
  userId: string,
  role: string,
  resourceType: string,
  resourceId: string,
  permission: string
): Promise<boolean> {
  // SUPER_ADMIN has access to everything
  if (role === "SUPER_ADMIN") {
    return true;
  }

  // Check explicit resource permission
  const resourcePerm = await prisma.resourcePermission.findFirst({
    where: {
      userId,
      resourceType,
      resourceId,
      permission,
    },
  });

  if (resourcePerm) {
    return true;
  }

  // Check if user has "manage" permission (implies read/write)
  if (permission !== RESOURCE_PERMISSIONS.MANAGE) {
    const managePerm = await prisma.resourcePermission.findFirst({
      where: {
        userId,
        resourceType,
        resourceId,
        permission: RESOURCE_PERMISSIONS.MANAGE,
      },
    });
    if (managePerm) {
      return true;
    }
  }

  // Check if user has "write" permission (implies read)
  if (permission === RESOURCE_PERMISSIONS.READ) {
    const writePerm = await prisma.resourcePermission.findFirst({
      where: {
        userId,
        resourceType,
        resourceId,
        permission: RESOURCE_PERMISSIONS.WRITE,
      },
    });
    if (writePerm) {
      return true;
    }
  }

  // Fall back to role-based permission
  // ORG_ADMIN has access to all resources in their org
  if (role === "ORG_ADMIN") {
    return true;
  }

  // MANAGER has read access to groups they manage
  if (role === "MANAGER" && resourceType === RESOURCE_TYPES.GROUP && permission === RESOURCE_PERMISSIONS.READ) {
    return true;
  }

  return false;
}

/**
 * Middleware factory for resource-level access control.
 * Checks if user has permission on a specific resource.
 *
 * @param resourceType - Type of resource (group, room, report, campaign)
 * @param permission - Required permission (read, write, manage)
 * @param getResourceId - Optional function to extract resourceId from request (defaults to params.id)
 *
 * @example
 * // Check read access to a group
 * fastify.get('/groups/:id', {
 *   preHandler: [authenticate, requireResourceAccess('group', 'read')]
 * }, handler)
 *
 * @example
 * // Check write access with custom resource ID extraction
 * fastify.put('/reports/:reportId', {
 *   preHandler: [authenticate, requireResourceAccess('report', 'write', (req) => req.params.reportId)]
 * }, handler)
 */
export function requireResourceAccess(
  resourceType: string,
  permission: string,
  getResourceId?: (request: FastifyRequest) => string
) {
  return async function (
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> {
    const user = request.user;
    if (!user) {
      throw forbidden("No authenticated user");
    }

    const resourceId = getResourceId
      ? getResourceId(request)
      : (request.params as any).id;

    if (!resourceId) {
      throw forbidden("Resource ID not provided");
    }

    const hasAccess = await hasResourcePermission(
      user.id,
      user.role,
      resourceType,
      resourceId,
      permission
    );

    if (!hasAccess) {
      throw forbidden(`No ${permission} access to ${resourceType}:${resourceId}`);
    }
  };
}

/**
 * Helper to check resource access in service code (not middleware).
 */
export async function checkResourceAccess(
  userId: string,
  role: string,
  resourceType: string,
  resourceId: string,
  permission: string
): Promise<boolean> {
  return hasResourcePermission(userId, role, resourceType, resourceId, permission);
}

/**
 * Grants a resource permission to a user.
 */
export async function grantResourcePermission(
  userId: string,
  resourceType: string,
  resourceId: string,
  permission: string,
  grantedBy?: string
): Promise<void> {
  await prisma.resourcePermission.upsert({
    where: {
      userId_resourceType_resourceId_permission: {
        userId,
        resourceType,
        resourceId,
        permission,
      },
    },
    create: {
      userId,
      resourceType,
      resourceId,
      permission,
      grantedBy,
    },
    update: {
      grantedBy,
    },
  });
}

/**
 * Revokes a resource permission from a user.
 */
export async function revokeResourcePermission(
  userId: string,
  resourceType: string,
  resourceId: string,
  permission: string
): Promise<void> {
  await prisma.resourcePermission.deleteMany({
    where: {
      userId,
      resourceType,
      resourceId,
      permission,
    },
  });
}

/**
 * Gets all resource permissions for a user.
 */
export async function getUserResourcePermissions(userId: string) {
  return prisma.resourcePermission.findMany({
    where: { userId },
    orderBy: [{ resourceType: "asc" }, { resourceId: "asc" }],
  });
}

/**
 * Gets all users with permission on a resource.
 */
export async function getResourcePermissionUsers(
  resourceType: string,
  resourceId: string
) {
  return prisma.resourcePermission.findMany({
    where: { resourceType, resourceId },
    include: {
      user: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
    },
  });
}
