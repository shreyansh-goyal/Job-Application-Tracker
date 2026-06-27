const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {});
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error("DB connection error: ", err);
  }
};

module.exports = connectDB;
