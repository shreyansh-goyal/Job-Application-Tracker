const express = require("express");
const dotenv = require("dotenv");
const startServer = require("./utils/startServer");
const authMiddleware = require("./middleware/auth.middleware");
const errorHandler = require("./middleware/error.middleware");
const morgan = require("morgan");
const logger = require("./utils/logger");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const helmet = require("helmet");
const {
  requestTrackerMiddleware,
} = require("./middleware/request-tracker.middleware");
const healthRoutes = require("./routes/health.routes");

const app = express();
dotenv.config();

app.use(helmet());
app.use(express.json());

const stream = {
  write: (message) => logger.info(message.trim()),
};
app.use(morgan("combined", { stream }));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(requestTrackerMiddleware);

app.use(healthRoutes);
startServer(app, () => {
  const userRoutes = require("./routes/user.routes");
  const jobRoutes = require("./routes/job.routes");
  const { jobRateLimiter } = require("./middleware/rate-limiter.middleware");

  app.use("/user", userRoutes);
  app.use("/job", authMiddleware, jobRateLimiter, jobRoutes);

  app.use(errorHandler);
});
