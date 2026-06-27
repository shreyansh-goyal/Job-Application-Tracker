const Job = require("../db/models/job.schema");
const User = require("../db/models/user.schema");
const AppError = require("../utils/app.error");

const createJob = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { role, companyName, status, notes } = req.body;
    const validStatuses = ["applied", "interview", "offer", "rejected"];
    const userExists = await User.findOne({ _id: userId });

    if (!userExists) {
      throw new AppError("User not found", 400);
    }

    const job = await Job.create({ role, status, notes, userId });
    return res.status(201).json(job);
  } catch (err) {
    next(err);
  }
};

const getJobs = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const jobs = await Job.find({ userId });

    return res.status(200).json(jobs);
  } catch (err) {
    next(err);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id: jobId } = req.params;
    const job = await Job.findOne({ userId, _id: jobId });
    return res.status(200).json(job);
  } catch (err) {
    next(err);
  }
};

const updateJobById = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id: jobId } = req.params;
    const { role, companyName, status, notes } = req.body;

    const validStatuses = ["applied", "interview", "offer", "rejected"];

    const updatedJob = await Job.findOneAndUpdate(
      { _id: jobId, userId },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedJob) {
      throw new AppError("Job not found", 400);
    }

    return res.status(200).json(updatedJob);
  } catch (error) {
    next(err);
  }
};

const deleteJobById = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id: jobId } = req.params;
    const deletedJob = await Job.deleteOne({ _id: jobId, userId });
    console.log("deletedJob : ", deletedJob);
    if (!deletedJob.deletedCount) {
      throw new AppError("Job not found", 400);
    }

    return res.status(200).json(deletedJob);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  deleteJobById,
  updateJobById,
};
