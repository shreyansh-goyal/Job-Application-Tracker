const express = require("express");
const router = express.Router();
const {
  createUser,
  signIn,
  refreshAuthToken,
  logout,
} = require("../controllers/user.controller");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validation.middleware");
const {
  createUserSchema,
  loginSchema,
  refreshSchema,
} = require("../validators/user.validator");

router.post("/signup", validate(createUserSchema), createUser);
router.post("/login", validate(loginSchema), signIn);
router.post("/refresh", validate(refreshSchema), refreshAuthToken);
router.post("/logout", authMiddleware, validate(refreshSchema), logout);
module.exports = router;
