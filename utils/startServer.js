const connectDB = require("../config/db");
const redisClient = require("../config/redis");
const logger = require("./logger");
const startServer = async (app) => {
  try {
    await connectDB();
    await redisClient.connect();
    app.listen(process.env.PORT || 3000, () => {
      console.log(`Server started on ${process.env.PORT}`);
    });
  } catch (err) {
    logger.error("Error starting server:", err);
  }
};

module.exports = startServer;
