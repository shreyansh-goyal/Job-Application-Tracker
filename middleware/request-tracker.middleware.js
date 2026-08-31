const { waitFor } = require("../utils/general.utils");
const requestTracker = {
  activeRequests: 0,
  isShuttingDown: false,
};

const requestTrackerMiddleware = (req, res, next) => {
  if (requestTracker.isShuttingDown) {
    res.setHeader("Connection", "close");
    return res
      .status(503)
      .json({ error: "Server is shutting down, please try again later." });
  }

  requestTracker.activeRequests++;

  res.on("finish", () => {
    requestTracker.activeRequests--;
  });

  next();
};

const startShutdown = () => {
  requestTracker.isShuttingDown = true;
};

const waitForRequestsToFinish = () => {
  return waitFor(() => requestTracker.activeRequests === 0, {
    interval: 100,
  });
};

module.exports = {
  requestTrackerMiddleware,
  startShutdown,
  waitForRequestsToFinish,
};
