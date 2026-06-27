const Joi = require("joi");

const CreateJobSchema = Joi.object({
  role: Joi.string().required(),
  companyName: Joi.string().required(),
  status: Joi.string().valid("applied", "interview", "offer", "rejected"),
  notes: Joi.string().optional(),
});

const UpdateJobSchema = Joi.object({
  role: Joi.string().trim(),
  companyName: Joi.string().trim(),
  status: Joi.string().valid("applied", "interview", "offer", "rejected"),
  notes: Joi.string().trim(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

module.exports = {
  CreateJobSchema,
  UpdateJobSchema,
};
