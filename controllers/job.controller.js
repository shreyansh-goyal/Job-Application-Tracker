const Job = require("../db/models/job.schema");
const User = require("../db/models/user.schema");

const createJob = async (req, res) => {
  try {
    const { role, companyName, status, notes, userId } = req.body;
    const validStatuses = ["applied", "interview", "offer", "rejected"];

    if (!role || !companyName || !userId) {
      return res
        .status(400)
        .json({ error: "Role, company and userId are required" });
    }
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    console.log("Received job data: ", req.body);

    const userExists = await User.findOne({ _id: userId });
    if (!userExists) {
      return res.status(400).json({ error: "User not found" });
    }

    const job = await Job.create({ role, companyName, status, notes, userId });
    return res.status(201).json(job);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const getJobs = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const jobs = await Job.find({ userId });
    return res.status(200).json(jobs);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const getJobById = async (req, res) => {
  try {
    const { userId } = req.query;
    const { id: jobId } = req.params;
    if (!userId || !jobId) {
      return res.status(400).json({ error: "userId and jobId are required" });
    }

    console.log(jobId, "  ", userId);
    const job = await Job.findOne({ userId, _id: jobId });
    return res.status(200).json(job);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const updateJobById = async (req, res) => {
  try {
    const { userId } = req.query;
    const { id: jobId } = req.params;
    const { role, companyName, status, notes } = req.body;

    const validStatuses = ["applied", "interview", "offer", "rejected"];

    console.log("Updating job with data: ", req.body);
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Enter valid status" });
    }

    const updatedJob = await Job.findByIdAndUpdate(jobId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedJob) {
      return res.status(400).json({ error: "job not found" });
    }

    return res.status(200).json(updatedJob);
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const deleteJobById = async (req, res) => {
  const { userId } = req.query;
  const { id: jobId } = req.params;

  if (!userId || !jobId) {
    return res
      .status(400)
      .json({ error: "userId and jobId are mandatory fields" });
  }

  const deletedJob = await Job.deleteOne({ _id: jobId, userId });

  if (!deletedJob) {
    return res.status(400).json({ error: "Job not found" });
  }

  return res.status(200).json(deletedJob);
};

module.exports = {
  createJob,
  getJobs,
  getJobById,
  deleteJobById,
  updateJobById,
};
