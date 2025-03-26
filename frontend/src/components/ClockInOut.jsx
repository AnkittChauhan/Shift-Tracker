import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useAuth, useUser } from "@clerk/clerk-react";
import { Toaster, toast } from 'sonner';
import { MapPin, AlertCircle } from 'lucide-react';
import { useTimer } from "../contexts/TimerContext";

const ClockInOut = () => {



  const { 
    seconds, 
    setSeconds,
    isActive, 
    setIsActive,
    ifClockedIn,
    setIfClockedIn
  } = useTimer();

  // Local state
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState(localStorage.getItem('clockNotes') || "");
  const { getToken } = useAuth();
  const { isSignedIn, user } = useUser();
  const [userLocation, setUserLocation] = useState(null);
  const [isWithinPerimeter, setIsWithinPerimeter] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);

  const imageUrl = user?.imageUrl || "https://thumbs.dreamstime.com/b/male-default-avatar-profile-icon-man-face-silhouette-person-placeholder-vector-illustration-male-default-avatar-profile-icon-man-189495143.jpg";

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('clockNotes', notes);
  }, [notes]);

  // Check user's location against perimeter
  const checkLocation = async () => {
    // ... (keep your existing checkLocation implementation)
  };

  const handleClockIn = async () => {
    try {
      // 1. Get current location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000
        });
      });
  
      const clockInLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
  
      // 2. Check perimeter
      const isWithin = await checkPerimeter(clockInLocation);
      if (!isWithin) {
        toast.error('You must be within the designated perimeter to clock in');
        return;
      }
  
      // 3. Submit clock-in
      const token = await getToken();
      const { data } = await axios.post(
        "https://shift-tracker-plig.onrender.com/shift/clock-in",
        { 
          name: user.fullName,
          clockInLocation,
          notes,
          UserImg: imageUrl
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      // Update state through context
      setIfClockedIn(true);
      setIsActive(true);
      setSeconds(0);
      toast.success(`Clocked in at ${new Date(data.shift.clockInTime).toLocaleTimeString()}`);
  
    } catch (error) {
      console.error('Clock-in error:', {
        error: error.response?.data || error.message,
        location: clockInLocation
      });
      
      const errorMsg = error.response?.data?.error || 
                     error.response?.data?.details?.join(', ') || 
                     "Failed to clock in";
      toast.error(errorMsg);
    }
  };

  const handleClockOut = async () => {
    try {
      const isWithin = await checkLocation();
      if (!isWithin) {
        toast.warning("You're clocking out from outside the perimeter");
      }

      const token = await getToken();
      const { data } = await axios.post(
        "https://shift-tracker-plig.onrender.com/shift/clock-out",
        {
          clockOutLocation: userLocation,
          notes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Update state through context
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

  // Check with backend on component mount to verify actual state
  useEffect(() => {
    const verifyShiftStatus = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get(
          "https://shift-tracker-plig.onrender.com/shift/status",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (data.activeShift) {
          const clockInTime = new Date(data.activeShift.clockInTime);
          const now = new Date();
          const secondsElapsed = Math.floor((now - clockInTime) / 1000);
          
          setSeconds(secondsElapsed);
          setIfClockedIn(true);
          setIsActive(true);
        }
      } catch (err) {
        console.error("Error verifying shift status:", err);
      }
    };

    if (isSignedIn) verifyShiftStatus();
  }, [isSignedIn, getToken, setSeconds, setIfClockedIn, setIsActive]);



  // Saving to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('clockedIn', ifClockedIn);
    localStorage.setItem('isActive', isActive);
    localStorage.setItem('clockNotes', notes);
    localStorage.setItem('timerSeconds', seconds);
  }, [ifClockedIn, isActive, notes, seconds]);

  

  // Separate perimeter check function
const checkPerimeter = async (location) => {
  try {
    const token = await getToken();
    const response = await axios.post(
      "https://shift-tracker-plig.onrender.com/perimeter/check",
      {
        latitude: location.lat,
        longitude: location.lng
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    return response.data.isWithinPerimeter;
  } catch (error) {
    console.error('Perimeter check failed:', error);
    return false;
  }
};

 
  // Check with backend on component mount to verify actual state
  useEffect(() => {
    const verifyShiftStatus = async () => {
      try {
        const token = await getToken();
        const { data } = await axios.get(
          "https://shift-tracker-plig.onrender.com/shift/status",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (data.activeShift) {
          // Calculate elapsed time
          const clockInTime = new Date(data.activeShift.clockInTime);
          const now = new Date();
          const secondsElapsed = Math.floor((now - clockInTime) / 1000);
          
          setSeconds(secondsElapsed);
          setIfClockedIn(true);
          setIsActive(true);
          
          // Start timer if not already running
          if (!window.timerInterval) {
            window.timerInterval = setInterval(() => {
              setSeconds(prev => {
                const newSeconds = prev + 1;
                localStorage.setItem('timerSeconds', newSeconds);
                return newSeconds;
              });
            }, 1000);
          }
        }
      } catch (err) {
        console.error("Error verifying shift status:", err);
      }
    };

    if (isSignedIn) verifyShiftStatus();
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
        <div className="bg-gray-50 p-8 rounded-lg shadow-md w-full max-w-md">
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
            {isSignedIn ? user.fullName : 'User'}
          </div>

          {/* Location status display */}
          {!ifClockedIn && (
            <div className="my-3 p-3 rounded-md bg-blue-50 text-blue-800 flex items-start">
              <MapPin className="mr-2 h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Location Check</p>
                {isCheckingLocation ? (
                  <p className="text-sm">Checking your location...</p>
                ) : locationError ? (
                  <p className="text-sm flex items-center">
                    <AlertCircle className="mr-1 h-4 w-4" /> {locationError}
                  </p>
                ) : (
                  <p className="text-sm">
                    {isWithinPerimeter 
                      ? "You're within the allowed perimeter"
                      : "Location will be checked when you clock in"}
                  </p>
                )}
              </div>
            </div>
          )}

          {ifClockedIn ? (
            <>
              <button
                onClick={handleClockOut}
                disabled={isCheckingLocation}
                className="bg-red-500 my-2 flex items-center justify-center mx-auto hover:bg-red-600 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300 disabled:bg-red-300"
              >
                {isCheckingLocation ? "Checking Location..." : "Clock Out"}
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
                disabled={isCheckingLocation || locationError}
                className={`my-2 flex items-center justify-center mx-auto text-white font-medium py-2 px-6 rounded-md transition-colors duration-300 ${
                  isCheckingLocation 
                    ? "bg-gray-400" 
                    : locationError 
                      ? "bg-gray-400" 
                      : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {isCheckingLocation ? "Checking Location..." : "Clock In"}
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