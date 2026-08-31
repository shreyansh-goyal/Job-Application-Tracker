const mongoose = require("mongoose");
const redisClient = require("../config/redis");
const logger = require("./logger");

const {
  startShutdown,
  waitForRequestsToFinish,
} = require("../middleware/request-tracker.middleware");

const gracefulShutdown = (server) => {
  const shutdown = async (signal) => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    startShutdown();

    server.close(async () => {
      logger.info("HTTP server closed");

      try {
        await waitForRequestsToFinish();

        logger.info("All active requests completed");

        if (redisClient.isOpen) {
          await redisClient.quit();
          logger.info("Redis connection closed");
        }

        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close();
          logger.info("MongoDB connection closed");
        }

        logger.info("Graceful shutdown completed");

        process.exit(0);
      } catch (err) {
        logger.error("Error during graceful shutdown:", err);
        process.exit(1);
      }
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
};

module.exports = gracefulShutdown;
