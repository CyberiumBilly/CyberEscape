import { FastifyInstance } from "fastify";
import { AnalyticsService } from "./service.js";
import { authenticate } from "../../middleware/auth.js";
import { requireRole, requirePermission } from "../../middleware/rbac.js";
import { ReportType } from "@prisma/client";
import { ExportFormat } from "../../services/report-generator.js";
import { z } from "zod";
import { validateBody } from "../../middleware/validate.js";

const svc = new AnalyticsService();

// Schemas for validation
const generateReportSchema = z.object({
  reportType: z.enum(["COMPLIANCE", "PERFORMANCE_SUMMARY", "RISK_ASSESSMENT", "EXECUTIVE_SUMMARY", "ORGANIZATION", "GROUP", "USER", "ROOM"]),
  format: z.enum(["pdf", "csv", "json"]).default("pdf"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupId: z.string().optional(),
  userId: z.string().optional(),
  roomId: z.string().optional(),
});

const scheduleReportSchema = z.object({
  title: z.string().min(1).max(200),
  reportType: z.enum(["COMPLIANCE", "PERFORMANCE_SUMMARY", "RISK_ASSESSMENT", "EXECUTIVE_SUMMARY", "ORGANIZATION", "GROUP", "USER", "ROOM"]),
  format: z.enum(["pdf", "csv", "json"]).default("pdf"),
  schedule: z.string(), // cron expression
  recipients: z.array(z.string().email()),
  filters: z.record(z.unknown()).optional(),
});

export async function analyticsRoutes(app: FastifyInstance) {
  // Existing endpoints
  app.get("/api/v1/analytics/overview", {
    preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")],
    handler: async (req, rep) => rep.send(await svc.getOrgOverview(req.user!.organizationId)),
  });

  app.get<{ Params: { groupId: string } }>("/api/v1/analytics/groups/:groupId", {
    preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")],
    handler: async (req, rep) => rep.send(await svc.getByGroup(req.user!.organizationId, (req.params as any).groupId)),
  });

  app.get<{ Params: { roomId: string } }>("/api/v1/analytics/rooms/:roomId", {
    preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")],
    handler: async (req, rep) => rep.send(await svc.getByRoom(req.user!.organizationId, (req.params as any).roomId)),
  });

  app.get<{ Params: { userId: string } }>("/api/v1/analytics/users/:userId", {
    preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")],
    handler: async (req, rep) => rep.send(await svc.getByUser((req.params as any).userId)),
  });

  app.get("/api/v1/analytics/risk-users", {
    preHandler: [authenticate, requireRole("ORG_ADMIN", "MANAGER")],
    handler: async (req, rep) => rep.send(await svc.getRiskUsers(req.user!.organizationId)),
  });

  // Resilience score endpoints
  app.get("/api/v1/analytics/resilience-score", {
    preHandler: [authenticate, requirePermission("analytics:read")],
    handler: async (req, rep) => {
      rep.send(await svc.getResilienceScore(req.user!.organizationId));
    },
  });

  app.get<{ Querystring: { days?: string } }>("/api/v1/analytics/resilience-score/history", {
    preHandler: [authenticate, requirePermission("analytics:read")],
    handler: async (req, rep) => {
      const days = parseInt((req.query as any).days || "30", 10);
      rep.send(await svc.getResilienceHistory(req.user!.organizationId, days));
    },
  });

  app.get("/api/v1/analytics/resilience-score/breakdown", {
    preHandler: [authenticate, requirePermission("analytics:read")],
    handler: async (req, rep) => {
      rep.send(await svc.getResilienceBreakdown(req.user!.organizationId));
    },
  });

  app.get<{ Params: { groupId: string } }>("/api/v1/analytics/groups/:groupId/resilience", {
    preHandler: [authenticate, requirePermission("analytics:read")],
    handler: async (req, rep) => {
      rep.send(await svc.getGroupResilience((req.params as any).groupId));
    },
  });

  app.post("/api/v1/analytics/resilience-score/calculate", {
    preHandler: [authenticate, requireRole("ORG_ADMIN")],
    handler: async (req, rep) => {
      rep.send(await svc.calculateResilienceScore(req.user!.organizationId));
    },
  });

  // Risk matrix endpoint
  app.get("/api/v1/analytics/risk-matrix", {
    preHandler: [authenticate, requirePermission("analytics:read")],
    handler: async (req, rep) => {
      rep.send(await svc.getRiskMatrix(req.user!.organizationId));
    },
  });

  // Knowledge gaps heatmap
  app.get("/api/v1/analytics/knowledge-gaps", {
    preHandler: [authenticate, requirePermission("analytics:read")],
    handler: async (req, rep) => {
      rep.send(await svc.getKnowledgeGaps(req.user!.organizationId));
    },
  });

  // Alerts endpoints
  app.get("/api/v1/analytics/alerts", {
    preHandler: [authenticate, requirePermission("alerts:read")],
    handler: async (req, rep) => {
      rep.send(await svc.getAlerts(req.user!.organizationId));
    },
  });

  app.get("/api/v1/analytics/alerts/counts", {
    preHandler: [authenticate, requirePermission("alerts:read")],
    handler: async (req, rep) => {
      rep.send(await svc.getAlertCounts(req.user!.organizationId));
    },
  });

  app.post<{ Params: { alertId: string } }>("/api/v1/analytics/alerts/:alertId/acknowledge", {
    preHandler: [authenticate, requirePermission("alerts:write")],
    handler: async (req, rep) => {
      rep.send(await svc.acknowledgeAlert((req.params as any).alertId, req.user!.userId));
    },
  });

  app.post("/api/v1/analytics/alerts/check", {
    preHandler: [authenticate, requireRole("ORG_ADMIN")],
    handler: async (req, rep) => {
      rep.send(await svc.checkAlerts(req.user!.organizationId));
    },
  });

  // Reports endpoints
  app.post("/api/v1/analytics/reports/generate", {
    preHandler: [authenticate, requirePermission("reports:write"), validateBody(generateReportSchema)],
    handler: async (req, rep) => {
      const body = req.body as z.infer<typeof generateReportSchema>;
      const filters = {
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        groupId: body.groupId,
        userId: body.userId,
        roomId: body.roomId,
      };
      rep.send(await svc.generateReport(
        req.user!.organizationId,
        body.reportType as ReportType,
        body.format as ExportFormat,
        filters,
        req.user!.userId
      ));
    },
  });

  app.get<{ Params: { reportId: string } }>("/api/v1/analytics/reports/:reportId", {
    preHandler: [authenticate, requirePermission("reports:read")],
    handler: async (req, rep) => {
      rep.send(await svc.getReport((req.params as any).reportId));
    },
  });

  app.get<{ Querystring: { type?: string; limit?: string; offset?: string } }>("/api/v1/analytics/reports", {
    preHandler: [authenticate, requirePermission("reports:read")],
    handler: async (req, rep) => {
      const query = req.query as any;
      rep.send(await svc.listReports(
        req.user!.organizationId,
        query.type as ReportType | undefined,
        query.limit ? parseInt(query.limit, 10) : undefined,
        query.offset ? parseInt(query.offset, 10) : undefined
      ));
    },
  });

  // Scheduled reports
  app.get("/api/v1/analytics/reports/scheduled", {
    preHandler: [authenticate, requirePermission("reports:read")],
    handler: async (req, rep) => {
      rep.send(await svc.getScheduledReports(req.user!.organizationId));
    },
  });

  app.post("/api/v1/analytics/reports/scheduled", {
    preHandler: [authenticate, requirePermission("reports:write"), validateBody(scheduleReportSchema)],
    handler: async (req, rep) => {
      const body = req.body as z.infer<typeof scheduleReportSchema>;
      rep.status(201).send(await svc.scheduleReport({
        organizationId: req.user!.organizationId,
        title: body.title,
        reportType: body.reportType as ReportType,
        format: body.format as ExportFormat,
        schedule: body.schedule,
        recipients: body.recipients,
        filters: body.filters,
      }));
    },
  });

  app.patch<{ Params: { reportId: string } }>("/api/v1/analytics/reports/scheduled/:reportId", {
    preHandler: [authenticate, requirePermission("reports:write")],
    handler: async (req, rep) => {
      rep.send(await svc.updateScheduledReport((req.params as any).reportId, req.body));
    },
  });

  app.delete<{ Params: { reportId: string } }>("/api/v1/analytics/reports/scheduled/:reportId", {
    preHandler: [authenticate, requirePermission("reports:write")],
    handler: async (req, rep) => {
      rep.send(await svc.deleteScheduledReport((req.params as any).reportId));
    },
  });
}
