const connectDB = require("../config/db");
const redisClient = require("../config/redis");
const logger = require("./logger");
const gracefulShutdown = require("./graceful-shutdown.utils");
const env = require("../config/env");
const startServer = async (app, registerRoutes) => {
  try {
    await connectDB();
    await redisClient.connect();
    registerRoutes();
    const server = app.listen(env.port || 3000, () => {
      logger.info(`Server started on ${env.port}`);
    });
    gracefulShutdown(server);
  } catch (err) {
    logger.error("Error starting server:", err);
  }
};

module.exports = startServer;
