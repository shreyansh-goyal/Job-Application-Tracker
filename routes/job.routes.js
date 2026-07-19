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
/**
 * @swagger
 * /job/create:
 *   post:
 *     summary: Create a new job application entry
 *     tags:
 *       - Job
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *               - companyName
 *             properties:
 *               role:
 *                 type: string
 *                 example: Software Engineer
 *               companyName:
 *                 type: string
 *                 example: Tech Corp
 *               status:
 *                 type: string
 *                 enum: [applied, interview, offer, rejected]
 *                 default: applied
 *               notes:
 *                 type: string
 *                 example: Applied via company website
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Validation error or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/create", validate(CreateJobSchema), createJob);

/**
 * @swagger
 * /job:
 *   get:
 *     summary: Get all job applications for the authenticated user
 *     tags:
 *       - Job
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [applied, interview, offer, rejected]
 *         description: Filter by application status
 *       - in: query
 *         name: companyName
 *         schema:
 *           type: string
 *         description: Filter by company name
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field (e.g. createdAt, role, companyName)
 *     responses:
 *       200:
 *         description: List of jobs with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", getJobs);

/**
 * @swagger
 * /job/{id}:
 *   get:
 *     summary: Get a single job application by ID
 *     tags:
 *       - Job
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       401:
 *         description: No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", getJobById);

/**
 * @swagger
 * /job/{id}:
 *   put:
 *     summary: Update a job application by ID
 *     tags:
 *       - Job
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               role:
 *                 type: string
 *                 example: Senior Software Engineer
 *               companyName:
 *                 type: string
 *                 example: Tech Corp
 *               status:
 *                 type: string
 *                 enum: [applied, interview, offer, rejected]
 *               notes:
 *                 type: string
 *                 example: Updated notes about the application
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Job not found or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", validate(UpdateJobSchema), updateJobById);

/**
 * @swagger
 * /job/{id}:
 *   delete:
 *     summary: Delete a job application by ID
 *     tags:
 *       - Job
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The job ID
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 acknowledged:
 *                   type: boolean
 *                   example: true
 *                 deletedCount:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No token provided or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", deleteJobById);

module.exports = router;
