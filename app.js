const express = require('express');
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const UserRoutes = require('./routes/user.routes');
const JobRoutes = require('./routes/job.routes');

const app = express();
dotenv.config();
connectDB();

app.use(express.json());

app.use('/user', UserRoutes);
app.use('/job', JobRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});