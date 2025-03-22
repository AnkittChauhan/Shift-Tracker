const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Ensure this field is required
  clockInTime: { type: Date, required: true },
  clockOutTime: { type: Date },
  clockInLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  clockOutLocation: {
    lat: { type: Number },
    lng: { type: Number },
  },
  name: { type: String },
  UserImg: { type: String },
  notes: { type: String },
  time: { type: String },
 
});

module.exports = mongoose.model("Shift", shiftSchema);