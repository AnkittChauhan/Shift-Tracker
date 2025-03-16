const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Clerk user ID
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
});

module.exports = mongoose.model("Location", locationSchema);