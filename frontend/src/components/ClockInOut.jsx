import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Toaster, toast } from 'sonner';

const ClockInOut = () => {
  // Load initial state from localStorage if available
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState(localStorage.getItem('clockNotes') || "");
  const { getToken } = useAuth();
  const { isSignedIn, user } = useUser();
  const [ifClockedIn, setIfClockedIn] = useState(
    localStorage.getItem('clockedIn') === 'true' || false
  );
  const [isActive, setIsActive] = useState(
    localStorage.getItem('isActive') === 'true' || false
  );
  const [seconds, setSeconds] = useState(
    parseInt(localStorage.getItem('timerSeconds')) || 0 
  );

  const imageUrl = user?.imageUrl || "https://thumbs.dreamstime.com/b/male-default-avatar-profile-icon-man-face-silhouette-person-placeholder-vector-illustration-male-default-avatar-profile-icon-man-189495143.jpg";

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('clockedIn', ifClockedIn);
    localStorage.setItem('isActive', isActive);
    localStorage.setItem('clockNotes', notes);
    localStorage.setItem('timerSeconds', seconds);
  }, [ifClockedIn, isActive, notes, seconds]);

  const handleClockIn = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "http://127.0.0.1:5000/shift/clock-in",
        { 
          name: user.fullName,
          clockInLocation: { lat: 40.7128, lng: -74.006 },
          notes,
          UserImg: imageUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIfClockedIn(true);
      setIsActive(true);
      setSeconds(0); // Reset timer on clock in
      toast.success(`You ClockedIn at ${ new Date(data.shift.clockInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`, {
        autoClose: 500,
      });
      setStatus(`Clocked in at ${new Date(data.shift.clockInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`);
    } catch (err) {
      setStatus(`Error: ${err.response?.data?.error || "Failed to clock in"}`);
      toast.error("Error: Failed to clock in");
    }
  };

  const handleClockOut = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "http://127.0.0.1:5000/shift/clock-out",
        {
          clockOutLocation: { lat: 40.7128, lng: -74.006 },
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIfClockedIn(false);
      setIsActive(false);
      toast.warning(`You ClockedOut at ${ new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`, {
        autoClose: 500,
      });
      setStatus(`Clocked out at ${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`);
    } catch (err) {
      setStatus(`Error: ${err.response?.data?.error || "Failed to clock out"}`);
      toast.warning("Error: Failed to clock out");
    }
  };

  // Timer logic
  useEffect(() => {
    let interval;
    if (ifClockedIn) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => {
          const newSeconds = prevSeconds + 1;
          localStorage.setItem('timerSeconds', newSeconds);
          return newSeconds;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [ifClockedIn]);

  // Check with backend on component mount to verify actual state
  useEffect(() => {
    const verifyShiftStatus = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get(
          "http://127.0.0.1:5000/shift/status",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (data.activeShift) {
          setIfClockedIn(true);
          setIsActive(true);
          // Calculate seconds since clock in
          const clockInTime = new Date(data.activeShift.clockInTime);
          const now = new Date();
          const secondsElapsed = Math.floor((now - clockInTime) / 1000);
          setSeconds(secondsElapsed);
          setStatus(`Clocked in at ${clockInTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`);
        } else {
          setIfClockedIn(false);
          setIsActive(false);
          setSeconds(0);
        }
      } catch (err) {
        console.error("Error verifying shift status:", err);
      }
    };

    if (isSignedIn) {
      verifyShiftStatus();
    }
  }, [isSignedIn, getToken]);

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-center h-full w-full">
        <div className="bg-gray-50 p-8 rounded-lg shadow-md">
          <h1 className="flex my-2 gap-2 items-center justify-center">
            Status: {
              isActive ? (
                <div className="flex items-center justify-center text-green-500 font-medium">
                  Active
                </div>
              ) : (
                <div className="flex items-center justify-center text-red-500 font-medium">
                  InActive
                </div>
              )
            }
          </h1>

          <div className="flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold">Timer</h1>
            <div className="text-2xl font-mono">{formatTime(seconds)}</div>
          </div>

          <div className="flex items-center justify-center">
            <img
              className="h-20 rounded-full"
              src={imageUrl} alt='/' />
          </div>
          <div className="flex items-center justify-center text-lg font-bold">
            {isSignedIn ? user.firstName : 'User'}
          </div>

          {ifClockedIn ? (
            <>
              <button
                onClick={handleClockOut}
                className="bg-red-500 my-2 flex items-center justify-center mx-auto hover:bg-red-600 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300"
              >
                Clock Out
              </button>
              <textarea
                className="w-full p-2 border rounded mb-4"
                placeholder="Optional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </>
          ) : (
            <>
              <button
                onClick={handleClockIn}
                className="bg-green-500 my-2 flex items-center justify-center mx-auto hover:bg-green-600 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300"
              >
                Clock In
              </button>
              <textarea
                className="w-full p-2 border rounded mb-4"
                placeholder="Optional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </>
          )}
          {status && <p className="mt-4 text-gray-700">{status}</p>}
          <Toaster position="top-center" expand={false} richColors />
        </div>
      </div>
    </div>
  );
};

export default ClockInOut;