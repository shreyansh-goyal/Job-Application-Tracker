const express = require("express");
const router = express.Router();
const {
  createJob,
  getJobs,
  getJobById,
  updateJobById,
  deleteJobById,
} = require("../controllers/job.controller");
const validate = require("../middleware/validation.middleware");
const {
  CreateJobSchema,
  UpdateJobSchema,
} = require("../validators/job.validator");

router.post("/create", validate(CreateJobSchema), createJob);
router.get("/", getJobs);
router.get("/:id", getJobById);
router.put("/:id", validate(UpdateJobSchema), updateJobById);
router.delete("/:id", deleteJobById);

module.exports = router;
