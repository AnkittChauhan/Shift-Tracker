const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    required: [true, 'User ID is required'] 
  }, 
  clockInTime: { 
    type: Date, 
    required: [true, 'Clock-in time is required'],
    default: Date.now 
  },
  clockOutTime: { type: Date },
  clockInLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  clockOutLocation: {
    lat: Number,
    lng: Number
  },
  name: { type: String },
  UserImg: { type: String },
  notes: { type: String },
  time: { type: String },
 
});

module.exports = mongoose.model("Shift", shiftSchema);