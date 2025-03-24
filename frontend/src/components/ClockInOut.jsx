import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Toaster, toast } from 'sonner';
import { MapPin, AlertCircle } from 'lucide-react';

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
  const [userLocation, setUserLocation] = useState(null);
  const [isWithinPerimeter, setIsWithinPerimeter] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [isCheckingLocation, setIsCheckingLocation] = useState(false);

  const imageUrl = user?.imageUrl || "https://thumbs.dreamstime.com/b/male-default-avatar-profile-icon-man-face-silhouette-person-placeholder-vector-illustration-male-default-avatar-profile-icon-man-189495143.jpg";

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('clockedIn', ifClockedIn);
    localStorage.setItem('isActive', isActive);
    localStorage.setItem('clockNotes', notes);
    localStorage.setItem('timerSeconds', seconds);
  }, [ifClockedIn, isActive, notes, seconds]);

  // Check user's location against perimeter
  const checkLocation = async () => {
    setIsCheckingLocation(true);
    setLocationError(null);
    
    try {
      // Get current position
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      
      const { latitude, longitude } = position.coords;
      setUserLocation({ latitude, longitude });
      
      // Check with backend if within perimeter
      const token = await getToken();
      const response = await axios.post(
        "http://127.0.0.1:5000/perimeter/check",
        { latitude, longitude },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIsWithinPerimeter(response.data.isWithinPerimeter);
      return response.data.isWithinPerimeter;
      
    } catch (err) {
      console.error("Location error:", err);
      setLocationError(
        err.code === err.PERMISSION_DENIED 
          ? "Location access denied. Please enable location services to clock in."
          : "Could not determine your location. Please try again."
      );
      return false;
    } finally {
      setIsCheckingLocation(false);
    }
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
        "http://127.0.0.1:5000/shift/clock-in",
        { 
          name: user.fullName,
          clockInLocation, // Includes both lat and lng
          notes,
          UserImg: imageUrl
          // Don't need to send userId or clockInTime - handled by backend
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      // Update state
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

  // Separate perimeter check function
const checkPerimeter = async (location) => {
  try {
    const token = await getToken();
    const response = await axios.post(
      "http://127.0.0.1:5000/perimeter/check",
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

  const handleClockOut = async () => {
    try {
      const isWithin = await checkLocation();
      if (!isWithin) {
        toast.warning("You're clocking out from outside the perimeter");
        // Still allow clock out but with warning
      }

      const token = await getToken();
      const { data } = await axios.post(
        "http://127.0.0.1:5000/shift/clock-out",
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