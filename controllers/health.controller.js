const mongoose = require("mongoose");
const redisClient = require("../config/redis");

const isHealthyConnection = (req, res) => {
  res.status(200).json({ status: "OK" });
};

const isConnectionReady = (req, res) => {
  const mongodbReady = mongoose.connection.readyState === 1;
  const redisReady = redisClient.isReady;

  if (!mongodbReady || !redisReady) {
    return res.status(503).json({
      status: "not_ready",
      dependencies: {
        mongodb: mongodbReady,
        redis: redisReady,
      },
    });
  }

  res.status(200).json({
    status: "ready",
    dependencies: {
      mongodb: true,
      redis: true,
    },
  });
};

module.exports = {
  isHealthyConnection,
  isConnectionReady,
};
