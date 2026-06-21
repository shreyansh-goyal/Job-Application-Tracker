const express = require("express");
const router = express.Router();
const {
  createUser,
  signIn,
  refreshAuthToken,
} = require("../controllers/user.controller");

router.post("/signup", createUser);
router.post("/login", signIn);
router.post("/refresh", refreshAuthToken);
module.exports = router;
