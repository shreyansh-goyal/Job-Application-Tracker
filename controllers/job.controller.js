const Job = require("../db/models/job.schema");
const User = require("../db/models/user.schema");
const AppError = require("../utils/app.error");
const redisClient = require("../config/redis");
const logger = require("../utils/logger");

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

    await invalidateUserJobsCache(`jobs:${userId}:*`);
    return res.status(201).json(job);
  } catch (err) {
    next(err);
  }
};

const getJobs = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || undefined;
    const companyName = req.query.companyName || undefined;
    const sort = req.query.sort || "createdAt";
    const skip = (page - 1) * limit;

    const query = { userId };
    if (status) {
      query.status = status;
    }
    if (companyName) {
      query.companyName = companyName;
    }

    const cacheKey = `jobs:${userId}:page:${page}:limit:${limit}:status:${status || "all"}:companyName:${companyName || "all"}:sort:${sort}`;
    const cachedJobs = await redisClient.get(cacheKey);

    if (cachedJobs) {
      logger.info("Returning cached jobs");
      return res.status(200).json(JSON.parse(cachedJobs));
    }
    const totalJobs = await Job.countDocuments(query);
    const jobs = await Job.find(query).sort(sort).skip(skip).limit(limit);
    const response = {
      jobs,
      pagination: {
        totalJobs,
        page,
        limit,
        totalPages: Math.ceil(totalJobs / limit),
        hasNextPage: page * limit < totalJobs,
        hasPreviousPage: page > 1,
      },
    };
    await redisClient.set(cacheKey, JSON.stringify(response), { EX: 300 });
    return res.status(200).json(response);
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

    await invalidateUserJobsCache(`jobs:${userId}:*`);
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
    if (!deletedJob.deletedCount) {
      throw new AppError("Job not found", 400);
    }
    await invalidateUserJobsCache(`jobs:${userId}:*`);

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
