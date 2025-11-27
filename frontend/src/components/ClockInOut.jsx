import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useAuth, useUser } from "@clerk/clerk-react";
import { Toaster, toast } from 'sonner';
import { MapPin, AlertCircle, FileText, LogOut, LogIn } from 'lucide-react';
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
  const [ isLoading , setIsLoading ] = useState(false);

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

    setIsLoading(true);
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

      if( data.status ){
        setIsLoading(false);
      }
  
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
  // useEffect(() => {
  //   const verifyShiftStatus = async () => {
  //     try {
  //       const token = await getToken();
  //       const { data } = await axios.get(
  //         "https://shift-tracker-plig.onrender.com/shift/status",
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );
        
  //       if (data.activeShift) {
  //         // Calculate elapsed time
  //         const clockInTime = new Date(data.activeShift.clockInTime);
  //         const now = new Date();
  //         const secondsElapsed = Math.floor((now - clockInTime) / 1000);
          
  //         setSeconds(secondsElapsed);
  //         setIfClockedIn(true);
  //         setIsActive(true);
          
  //         // Start timer if not already running
  //         if (!window.timerInterval) {
  //           window.timerInterval = setInterval(() => {
  //             setSeconds(prev => {
  //               const newSeconds = prev + 1;
  //               localStorage.setItem('timerSeconds', newSeconds);
  //               return newSeconds;
  //             });
  //           }, 1000);
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Error verifying shift status:", err);
  //     }
  //   };

  //   if (isSignedIn) verifyShiftStatus();
  // }, [isSignedIn, getToken]);

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md transform transition-all duration-300 hover:shadow-2xl border border-gray-100">
        
        {/* Header / User Info */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <img
                className="w-full h-full rounded-full object-cover border-4 border-white"
                src={imageUrl} 
                alt={user?.fullName} 
              />
            </div>
            <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-white ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{isSignedIn ? user.fullName : 'Guest User'}</h2>
          <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
            <span className={`inline-block w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
            {isActive ? 'Currently Working' : 'Off Duty'}
          </p>
        </div>

        {/* Timer Section */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-center border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
          <p className="text-gray-500 text-sm font-medium mb-2 uppercase tracking-wider">Session Duration</p>
          <div className="text-5xl font-mono font-bold text-gray-800 tracking-tight">
            {formatTime(seconds)}
          </div>
        </div>

        {/* Location Status */}
        {!ifClockedIn && (
          <div className={`mb-6 p-4 rounded-xl border ${
            locationError ? 'bg-red-50 border-red-100 text-red-700' : 
            isWithinPerimeter ? 'bg-green-50 border-green-100 text-green-700' : 
            'bg-blue-50 border-blue-100 text-blue-700'
          } flex items-start gap-3 transition-all duration-300`}>
            <div className={`p-2 rounded-full ${
              locationError ? 'bg-red-100' : 
              isWithinPerimeter ? 'bg-green-100' : 
              'bg-blue-100'
            }`}>
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-sm">Location Status</p>
              <p className="text-xs mt-1 opacity-90">
                {isCheckingLocation ? "Verifying your location..." : 
                 locationError ? locationError : 
                 isWithinPerimeter ? "You are within the allowed zone" : 
                 "Location verification required to clock in"}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <textarea
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none text-sm"
              placeholder="Add notes for this shift (optional)..."
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {ifClockedIn ? (
            <button
              onClick={handleClockOut}
              disabled={isCheckingLocation}
              className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-red-200 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isCheckingLocation ? (
                <span className="animate-pulse">Verifying...</span>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  Clock Out
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleClockIn}
              disabled={isCheckingLocation || locationError || isLoading}
              className={`w-full font-bold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${
                isCheckingLocation || locationError 
                  ? "bg-gray-400 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200"
              }`}
            >
              {isCheckingLocation ? (
                <span className="animate-pulse">Verifying Location...</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Clock In
                </>
              )}
            </button>
          )}
        </div>

        {status && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400 bg-gray-50 py-2 px-4 rounded-full inline-block">
              {status}
            </p>
          </div>
        )}
        
        <Toaster position="top-center" expand={false} richColors />
      </div>
    </div>
  );
};

export default ClockInOut;