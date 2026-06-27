const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/user.routes");
const jobRoutes = require("./routes/job.routes");
const authMiddleware = require("./middleware/auth.middleware");
const errorHandler = require("./middleware/error.middleware");

const app = express();
dotenv.config();
connectDB();

app.use(express.json());

app.use("/user", userRoutes);
app.use("/job", authMiddleware, jobRoutes);
app.use(errorHandler);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
