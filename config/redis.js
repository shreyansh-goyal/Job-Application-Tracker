const { createClient } = require("redis");
const logger = require("../utils/logger");

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("connect", () => {
  logger.info("Redis Connected");
});

redisClient.on("error", (err) => {
  logger.error("Redis Error:", err);
});

module.exports = redisClient;
