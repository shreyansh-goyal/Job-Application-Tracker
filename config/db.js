const mongoose = require("mongoose");
const logger = require("../utils/logger");
const env = require("./env");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri, {});
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error("DB connection error: ", err);
    throw err;
  }
};

module.exports = connectDB;
