const { createClient } = require("redis");
const logger = require("../utils/logger");
const env = require("./env");

const redisClient = createClient({
  url: env.redisUrl,
});

redisClient.on("connect", () => {
  logger.info("Redis Connected");
});

redisClient.on("error", (err) => {
  logger.error("Redis Error:", err);
});

module.exports = redisClient;
