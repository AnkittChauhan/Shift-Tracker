const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  auth0Id: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["careWorker", "manager"], default: "careWorker" },
});

module.exports = mongoose.model("User", UserSchema);