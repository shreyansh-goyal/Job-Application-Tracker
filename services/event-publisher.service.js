const { getChannel, EXCHANGE_NAME } = require("../config/rabbitmq");
const logger = require("../utils/logger");

const publishEvent = (routingKey, payload) => {
  const channel = getChannel();
  const message = Buffer.from(JSON.stringify(payload));

  const published = channel.publish(EXCHANGE_NAME, routingKey, message, {
    persistent: true,
    contentType: "application/json",
  });

  if (!published) {
    logger.warn(`Failed to publish event ${routingKey} (channel buffer full)`);
  }
};

const publishJobCreated = (job) => {
  publishEvent("job.created", {
    jobId: job._id,
    userId: job.userId,
    role: job.role,
    companyName: job.companyName,
    status: job.status,
  });
};

const publishJobStatusChanged = (job, previousStatus) => {
  publishEvent("job.status.changed", {
    jobId: job._id,
    userId: job.userId,
    role: job.role,
    companyName: job.companyName,
    previousStatus,
    newStatus: job.status,
  });
};

module.exports = { publishJobCreated, publishJobStatusChanged };
