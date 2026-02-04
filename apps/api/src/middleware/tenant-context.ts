import { FastifyRequest, FastifyReply } from "fastify";
import { forbidden, badRequest } from "../utils/errors.js";
import type { JwtPayload } from "./auth.js";

/**
 * Tenant context attached to each request after authentication
 */
export interface TenantContext {
  organizationId: string;
  userId: string;
  userRole: string;
  /**
   * For SUPER_ADMIN users, allows scoping to a specific org via X-Organization-Id header.
   * For other users, this is always their own organization.
   */
  effectiveOrgId: string;
}

declare module "fastify" {
  interface FastifyRequest {
    tenant?: TenantContext;
  }
}

/**
 * Middleware to extract and validate tenant context from authenticated request.
 * Must be used AFTER the authenticate middleware.
 *
 * For SUPER_ADMIN users:
 * - Can optionally set X-Organization-Id header to scope queries to a specific org
 * - Without the header, queries will not be org-scoped (cross-org access)
 *
 * For other users:
 * - Always scoped to their own organization
 */
export async function tenantContext(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (!request.user) {
    throw forbidden("Authentication required before tenant context");
  }

  const { userId, role, organizationId } = request.user as JwtPayload;

  let effectiveOrgId = organizationId;

  // SUPER_ADMIN can scope to any org via header
  if (role === "SUPER_ADMIN") {
    const headerOrgId = request.headers["x-organization-id"];
    if (headerOrgId) {
      if (typeof headerOrgId !== "string") {
        throw badRequest("X-Organization-Id must be a single string value");
      }
      effectiveOrgId = headerOrgId;
    }
  }

  request.tenant = {
    organizationId,
    userId,
    userRole: role,
    effectiveOrgId,
  };
}

/**
 * Gets the organization ID to use for queries.
 * Returns undefined for SUPER_ADMIN without X-Organization-Id header (cross-org access).
 */
export function getOrgScope(request: FastifyRequest): string | undefined {
  if (!request.tenant) {
    throw forbidden("Tenant context not initialized");
  }

  // SUPER_ADMIN without explicit org header gets cross-org access
  if (
    request.tenant.userRole === "SUPER_ADMIN" &&
    !request.headers["x-organization-id"]
  ) {
    return undefined;
  }

  return request.tenant.effectiveOrgId;
}

/**
 * Requires a specific organization scope (fails for cross-org requests).
 * Useful for endpoints that must always be org-scoped.
 */
export function requireOrgScope(request: FastifyRequest): string {
  const orgId = getOrgScope(request);
  if (!orgId) {
    throw badRequest(
      "This endpoint requires an organization scope. SUPER_ADMIN must provide X-Organization-Id header."
    );
  }
  return orgId;
}

/**
 * Helper to create org-scoped where clause for Prisma queries.
 * Returns empty object for cross-org access (SUPER_ADMIN without header).
 */
export function orgWhereClause(
  request: FastifyRequest,
  fieldName: string = "organizationId"
): Record<string, string> | Record<string, never> {
  const orgId = getOrgScope(request);
  if (!orgId) {
    return {};
  }
  return { [fieldName]: orgId };
}

/**
 * Validates that the user has access to the specified organization.
 * SUPER_ADMIN can access any org, others only their own.
 */
export function validateOrgAccess(
  request: FastifyRequest,
  targetOrgId: string
): void {
  if (!request.tenant) {
    throw forbidden("Tenant context not initialized");
  }

  if (request.tenant.userRole === "SUPER_ADMIN") {
    return; // SUPER_ADMIN can access any org
  }

  if (request.tenant.organizationId !== targetOrgId) {
    throw forbidden("Access denied to this organization");
  }
}
