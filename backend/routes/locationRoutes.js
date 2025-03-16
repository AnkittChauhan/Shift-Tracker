const express = require("express");
const locationController = require("../controllers/locationController");

const router = express.Router();

// Protected routes
router.get("/current", locationController.getCurrentLocation);
router.post("/update", locationController.updateLocation);

module.exports = router;