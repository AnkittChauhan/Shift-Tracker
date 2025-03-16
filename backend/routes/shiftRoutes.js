const express = require("express");
const shiftController = require("../controllers/shiftController");

const router = express.Router();

// Protected routes
router.post("/clock-in", shiftController.clockIn);
router.post("/clock-out", shiftController.clockOut);
router.get("/history", shiftController.getShiftHistory);

module.exports = router;