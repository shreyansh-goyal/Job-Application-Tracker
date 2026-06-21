const express = require("express");
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJobById,
  deleteJobById,
} = require("../controllers/job.controller");

router.post("/create", createJob);
router.get("/", getJobs);
router.get("/:id", getJobById);
router.put("/:id", updateJobById);
router.delete("/:id", deleteJobById);

module.exports = router;
