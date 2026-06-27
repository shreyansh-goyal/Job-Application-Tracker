const redisClient = require("../config/redis");

const invalidateUserJobsCache = async (key) => {
  let cursor = 0;

  do {
    const reply = await redisClient.scan(cursor, {
      MATCH: key,
      COUNT: 100,
    });

    cursor = reply.cursor;

    if (reply.keys.length > 0) {
      await redisClient.unlink(reply.keys);
    }
  } while (cursor !== 0);
};

module.exports = {
  invalidateUserJobsCache,
};
