const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const { verifyToken } = require("@clerk/backend");
const { body, validationResult } = require("express-validator");
const authRoutes = require("./routes/authRoutes");
const shiftRoutes = require("./routes/shiftRoutes");
const locationRoutes = require("./routes/locationRoutes");
const Perimeter = require('./models/Perimeter');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Clerk Authentication Middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decoded = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Extract organization ID from Clerk token
    req.user = {
      userId: decoded.sub,
      organizationId: decoded.organization_id || 
                    decoded.publicMetadata?.organizationId || 
                    'default-org' // Fallback for testing
    };

    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};

// ===== Location Perimeter Routes ===== //

// Save perimeter settings (Admin)
app.post('/perimeter/set', authenticate, [
  body('location.latitude').isFloat({ min: -90, max: 90 }),
  body('location.longitude').isFloat({ min: -180, max: 180 }),
  body('radius').isInt({ min: 100 })
], async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { location, radius } = req.body;
    const { organizationId } = req.user;

    if (!organizationId) {
      return res.status(400).json({ error: "Organization ID is required" });
    }

    let perimeter = await Perimeter.findOne({ organizationId });
    
    if (perimeter) {
      perimeter.location = location;
      perimeter.radius = radius;
    } else {
      perimeter = new Perimeter({ location, radius, organizationId });
    }
    
    await perimeter.save();
    res.status(200).json(perimeter);
  } catch (error) {
    console.error('Error saving perimeter:', error);
    res.status(500).json({ 
      error: 'Failed to save perimeter',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get perimeter settings
// Get perimeter settings
app.get('/perimeter/get', authenticate, async (req, res) => {
  try {
    const { organizationId } = req.user;
    
    if (!organizationId) {
      return res.status(400).json({ 
        error: 'Organization ID missing',
        details: 'User is not associated with an organization' 
      });
    }

    const perimeter = await Perimeter.findOne({ organizationId });
    
    if (!perimeter) {
      return res.status(404).json({ 
        error: 'Perimeter not configured',
        details: `No perimeter found for organization ${organizationId}`
      });
    }

    res.status(200).json(perimeter);
  } catch (error) {
    console.error('Fetch perimeter error:', {
      error: error.message,
      user: req.user
    });
    
    res.status(500).json({ 
      error: 'Failed to fetch perimeter',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Check if location is within perimeter
app.post('/perimeter/check', 
  authenticate, // Add authentication middleware first
  [
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180')
  ], 
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    try {
      const { latitude, longitude } = req.body;
      const { organizationId } = req.user;

      if (!organizationId) {
        return res.status(400).json({
          error: 'Organization ID missing',
          isWithinPerimeter: false
        });
      }

      // Find perimeter with error handling
      const perimeter = await Perimeter.findOne({ organizationId })
        .maxTimeMS(2000) // Add query timeout
        .lean(); // Return plain JS object

      if (!perimeter || !perimeter.location) {
        return res.status(404).json({ 
          error: 'Perimeter not configured for this organization',
          isWithinPerimeter: false 
        });
      }

      // Calculate distance with validation
      const distance = getDistance(
        Number(latitude),
        Number(longitude),
        Number(perimeter.location.latitude),
        Number(perimeter.location.longitude)
      );

      const isWithin = distance <= perimeter.radius;
      
      // Log the check for debugging
      console.log(`Perimeter check: ${distance.toFixed(2)}m / ${perimeter.radius}m - ${isWithin ? 'INSIDE' : 'OUTSIDE'}`);

      res.json({
        isWithinPerimeter: isWithin,
        distance: parseFloat(distance.toFixed(2)), // Round to 2 decimals
        perimeterRadius: perimeter.radius,
        centerLocation: perimeter.location // Return center point for reference
      });

    } catch (error) {
      console.error('Perimeter check error:', {
        error: error.message,
        stack: error.stack,
        requestBody: req.body,
        user: req.user
      });

      res.status(500).json({ 
        error: 'Error processing perimeter check',
        isWithinPerimeter: false, // Default to false for safety
        details: process.env.NODE_ENV === 'development' 
          ? error.message 
          : undefined
      });
    }
});

// Helper function to calculate distance (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Apply authentication middleware to protected routes
app.use("/shift", shiftRoutes);
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