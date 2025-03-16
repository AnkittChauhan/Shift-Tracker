const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { verifyToken } = require("@clerk/backend"); // Import Clerk's token verification
const authRoutes = require("./routes/authRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const locationRoutes = require("./routes/locationRoutes");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Clerk Authentication Middleware
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

// Apply Clerk middleware to protected routes
app.use("/shift", authenticate, shiftRoutes);
app.use("/location", authenticate, locationRoutes);

// Public routes
app.use("/auth", authRoutes);

// Database connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));