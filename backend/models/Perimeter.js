const mongoose = require('mongoose');

const perimeterSchema = new mongoose.Schema({
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  radius: { type: Number, required: true }, // in meters
  organizationId: { type: String, required: false }
});

module.exports = mongoose.model('Perimeter', perimeterSchema);