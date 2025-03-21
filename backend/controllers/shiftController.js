const Shift = require("../models/Shift");

// Clock in
const clockIn = async (req, res) => {
  try {
    const { clockInLocation, notes , UserImg , name } = req.body;
    const user = req.user; // Authenticated user data from Clerk

    // Extract the user ID from the token payload
    const userId = user.sub; // Use the `sub` field as the user ID

    // Create a new shift
    const newShift = new Shift({
      userId, // Use the extracted user ID
      clockInTime: new Date(),
      clockInLocation,
      notes,
      UserImg,
      name
    });

    // Save the shift to the database
    await newShift.save();

    res.status(201).json({
      message: "Clocked in successfully",
      shift: newShift,
    });
  } catch (err) {
    console.error("Error clocking in:", err);
    res.status(500).json({ error: "Failed to clock in" });
  }
};

// Clock out
const clockOut = async (req, res) => {
  try {
    const { clockOutLocation, notes } = req.body;
    const user = req.user; // Authenticated user data from Clerk

    // Extract the user ID from the token payload
    const userId = user.sub; // Use the `sub` field as the user ID

    // Find the latest shift for the user that hasn't been clocked out
    const latestShift = await Shift.findOne({
      userId,
      clockOutTime: { $exists: false },
    }).sort({ clockInTime: -1 });

    if (!latestShift) {
      return res.status(404).json({ error: "No active shift found" });
    }

    // Update the shift with clock-out details
    latestShift.clockOutTime = new Date();
    latestShift.clockOutLocation = clockOutLocation;
    latestShift.notes = notes;

    // Calculate the time difference in milliseconds
    const timeDifferenceMs = latestShift.clockOutTime - latestShift.clockInTime;

    // Convert milliseconds to hours and minutes
    const timeDifferenceSeconds = timeDifferenceMs / 1000;
    const hours = Math.floor(timeDifferenceSeconds / 3600);
    const minutes = Math.floor((timeDifferenceSeconds % 3600) / 60);

    // Store the time difference in the database
    latestShift.time = `${hours} hours and ${minutes} minutes`;

    // Save the updated shift
    await latestShift.save();

    res.status(200).json({
      message: "Clocked out successfully",
      shift: latestShift,
    });
  } catch (err) {
    console.error("Error clocking out:", err);
    res.status(500).json({ error: "Failed to clock out" });
  }
};


const getStaffInfo = async ( req , res ) => {
try{ 
 
  const userShift = await Shift.find();
  res.status(200).json({userShift})

} catch ( err ){
  console.error("Error fetching Staff :", err);
  res.status(500).json({ error: "Failed to fetch Staff" });
}


}

// Get shift history
const getShiftHistory = async (req, res) => {
  try {
    const user = req.user; // Authenticated user data from Clerk

    // Extract the user ID from the token payload
    const userId = user.sub; // Use the `sub` field as the user ID

    // Find all shifts for the user
    const shifts = await Shift.find({ userId }).sort({ clockInTime: -1 });

    res.status(200).json({ shifts });
  } catch (err) {
    console.error("Error fetching shift history:", err);
    res.status(500).json({ error: "Failed to fetch shift history" });
  }
};

module.exports = {
  clockIn,
  clockOut,
  getShiftHistory,
  getStaffInfo,
};