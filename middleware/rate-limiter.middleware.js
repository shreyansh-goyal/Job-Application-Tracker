const expressRateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const redisClient = require("../config/redis");

const authRateLimit = expressRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 50 requests per windowMs,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: "rl:auth",
  }),
  message: {
    error: {
      message: "Too many requests from this IP, please try again later.",
    },
  },
});

const jobRateLimiter = expressRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  standardHeaders: "draft-8",
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
    prefix: "rl:job",
  }),
  message: {
    error: "Too many requests. Please try again later.",
  },
  keyGenerator: (req) => {
    return req.user.userId;
  },
});

module.exports = {
  authRateLimit,
  jobRateLimiter,
};
