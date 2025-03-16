const Location = require("../models/Location");

// Get current location
const getCurrentLocation = async (req, res) => {
  try {
    const user = req.user; // Authenticated user data from Clerk

    // Find the user's current location
    const location = await Location.findOne({ userId: user.id });

    if (!location) {
      return res.status(404).json({ error: "Location not found" });
    }

    res.status(200).json({ location });
  } catch (err) {
    console.error("Error fetching location:", err);
    res.status(500).json({ error: "Failed to fetch location" });
  }
};

// Update location
const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const user = req.user; // Authenticated user data from Clerk

    // Update or create the user's location
    const location = await Location.findOneAndUpdate(
      { userId: user.id },
      { lat, lng },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Location updated successfully",
      location,
    });
  } catch (err) {
    console.error("Error updating location:", err);
    res.status(500).json({ error: "Failed to update location" });
  }
};

module.exports = {
  getCurrentLocation,
  updateLocation,
};