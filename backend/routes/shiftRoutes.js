const express = require("express");
const shiftController = require("../controllers/shiftController");
const { verifyToken } = require("@clerk/backend"); // Import Clerk's token verification


const router = express.Router();

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    // Verify the token using Clerk's verifyToken function
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY, // Pass the secret key here
    });
    req.user = decoded; // Attach the decoded user data to the request object
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// Protected routes
router.post("/clock-in", authenticate , shiftController.clockIn);
router.post("/clock-out" , authenticate , shiftController.clockOut);
router.get("/history" , authenticate , shiftController.getShiftHistory);

router.get("/getStaff", shiftController.getStaffInfo);

module.exports = router;