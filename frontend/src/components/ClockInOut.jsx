import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react"; // Import Clerk's useAuth hook

const ClockInOut = () => {
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const { getToken } = useAuth(); // Use Clerk's getToken to retrieve the JWT

  const handleClockIn = async () => {
    try {
      // Get the JWT from Clerk
      const token = await getToken();

      // Make the API request to clock in
      const { data } = await axios.post(
        "http://127.0.0.1:5000/shift/clock-in",
        {
          clockInLocation: { lat: 40.7128, lng: -74.006 }, // Replace with actual location
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Use the token from Clerk
          },
        }
      );

      // Update status
      setStatus(`Clocked in at ${new Date(data.shift.clockInTime).toLocaleTimeString()}`);
    } catch (err) {
      setStatus(`Error: ${err.response?.data?.error || "Failed to clock in"}`);
    }
  };

  const handleClockOut = async () => {
    try {
      // Get the JWT from Clerk
      const token = await getToken();

      // Make the API request to clock out
      const { data } = await axios.post(
        "http://127.0.0.1:5000/shift/clock-out",
        {
          clockOutLocation: { lat: 40.7128, lng: -74.006 }, // Replace with actual location
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Use the token from Clerk
          },
        }
      );

      // Update status
      setStatus(`Clocked out at ${new Date(data.shift.clockOutTime).toLocaleTimeString()}`);
    } catch (err) {
      setStatus(`Error: ${err.response?.data?.error || "Failed to clock out"}`);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Clock In/Out</h1>
      <textarea
        className="w-full p-2 border rounded mb-4"
        placeholder="Optional notes..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="flex gap-4">
        <button
          onClick={handleClockIn}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Clock In
        </button>
        <button
          onClick={handleClockOut}
          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Clock Out
        </button>
      </div>
      {status && <p className="mt-4 text-gray-700">{status}</p>}
    </div>
  );
};

export default ClockInOut;