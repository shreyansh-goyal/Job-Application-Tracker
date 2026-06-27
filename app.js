const express = require("express");
const dotenv = require("dotenv");
const startServer = require("./utils/startServer");
const userRoutes = require("./routes/user.routes");
const jobRoutes = require("./routes/job.routes");
const authMiddleware = require("./middleware/auth.middleware");
const errorHandler = require("./middleware/error.middleware");
const morgan = require("morgan");
const logger = require("./utils/logger");

const app = express();
dotenv.config();

app.use(express.json());

const stream = {
  write: (message) => logger.info(message.trim()),
};
app.use(morgan("combined", { stream }));

app.use("/user", userRoutes);
app.use("/job", authMiddleware, jobRoutes);
app.use(errorHandler);
startServer(app);
