const express = require("express");
const router = express.Router();
const {
  isHealthyConnection,
  isConnectionReady,
} = require("../controllers/health.controller");

router.get("/health", isHealthyConnection);

router.get("/ready", isConnectionReady);

module.exports = router;
