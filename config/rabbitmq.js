const amqp = require("amqplib");
const logger = require("../utils/logger");
const env = require("./env");

const EXCHANGE_NAME = "job-events";

let connection = null;
let channel = null;

const connectRabbitMQ = async () => {
  connection = await amqp.connect(env.rabbitmqUrl);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: true });

  connection.on("error", (err) => {
    logger.error("RabbitMQ connection error:", err);
  });
  connection.on("close", () => {
    logger.warn("RabbitMQ connection closed");
  });

  logger.info("RabbitMQ Connected");
  return channel;
};

const getChannel = () => {
  if (!channel) {
    throw new Error(
      "RabbitMQ channel not initialized. Call connectRabbitMQ first.",
    );
  }
  return channel;
};

const closeRabbitMQ = async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
};

module.exports = {
  connectRabbitMQ,
  getChannel,
  closeRabbitMQ,
  EXCHANGE_NAME,
};
