import { buildApp } from "./app.js";
import { setupWebSocket } from "./websocket/index.js";
import { config } from "./config/index.js";
import { logger } from "./utils/logger.js";
import { connectMongo, disconnectMongo } from "./lib/mongodb.js";
import { initializeQueues, shutdownQueues } from "./jobs/index.js";
import { startEventIngestionWorker, stopEventIngestionWorker } from "./jobs/event-ingestion-job.js";

async function main() {
  // Initialize MongoDB for event telemetry
  try {
    await connectMongo();
    logger.info("MongoDB connected for event telemetry");
  } catch (err) {
    logger.warn({ err }, "MongoDB connection failed - event telemetry disabled");
  }

  // Initialize job queues
  await initializeQueues();

  // Start event ingestion worker
  startEventIngestionWorker();

  const app = await buildApp();
  await app.listen({ port: config.port, host: config.host });
  const io = setupWebSocket(app.server);
  logger.info({ port: config.port, host: config.host }, "CyberEscape API server started");
  logger.info("WebSocket server attached at /ws");

  const shutdown = async () => {
    logger.info("Shutting down...");
    io.close();
    await stopEventIngestionWorker();
    await shutdownQueues();
    await disconnectMongo();
    await app.close();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => { logger.error({ err }, "Failed to start server"); process.exit(1); });
