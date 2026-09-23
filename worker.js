const dotenv = require("dotenv");
dotenv.config();

const {
  connectRabbitMQ,
  closeRabbitMQ,
  EXCHANGE_NAME,
} = require("./config/rabbitmq");
const logger = require("./utils/logger");

const QUEUE_NAME = "job-notifications";
const ROUTING_PATTERN = "job.#";

const handleEvent = (routingKey, payload) => {
  switch (routingKey) {
    case "job.created":
      logger.info(
        `[notification] New application: ${payload.role} at ${payload.companyName} (user ${payload.userId})`,
      );
      break;
    case "job.status.changed":
      logger.info(
        `[notification] ${payload.role} at ${payload.companyName}: ${payload.previousStatus} -> ${payload.newStatus} (user ${payload.userId})`,
      );
      break;
    default:
      logger.warn(`[notification] Unhandled event: ${routingKey}`);
  }
};

const start = async () => {
  const channel = await connectRabbitMQ();
  await channel.assertQueue(QUEUE_NAME, { durable: true });
  await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_PATTERN);
  channel.prefetch(1);

  logger.info(`Worker listening on queue "${QUEUE_NAME}"`);

  channel.consume(QUEUE_NAME, (msg) => {
    if (!msg) return;
    try {
      const payload = JSON.parse(msg.content.toString());
      handleEvent(msg.fields.routingKey, payload);
      channel.ack(msg);
    } catch (err) {
      logger.error("Failed to process message:", err);
      channel.nack(msg, false, false);
    }
  });
};

const shutdown = async (signal) => {
  logger.info(`${signal} received. Shutting down worker...`);
  try {
    await closeRabbitMQ();
    logger.info("Worker shutdown complete");
    process.exit(0);
  } catch (err) {
    logger.error("Error during worker shutdown:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start().catch((err) => {
  logger.error("Failed to start worker:", err);
  process.exit(1);
});
