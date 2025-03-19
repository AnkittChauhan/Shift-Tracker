import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Toaster, toast } from 'sonner';




const ClockInOut = () => {
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const { getToken } = useAuth(); // Use Clerk's getToken to retrieve the JWT
  const { isSignedIn, user } = useUser();
  const [ifClockedIn, useIfClockedIn] = useState(false);
  const [isActive, useIsActive] = useState(false);



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
      useIfClockedIn(true);
      useIsActive(true)
      toast.success(`You ClockedIn at ${ new Date(data.shift.clockInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`, {
              autoClose: 500,
            })
      // Update status
      setStatus(`Clocked in at ${new Date(data.shift.clockInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`);
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
      useIfClockedIn(false);
      useIsActive(false)
      toast.warning(`You ClockedIn at ${ new Date(data.shift.clockInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`, {
        autoClose: 500,
      })
      // Update status
      setStatus(`Clocked out at ${ new Date(data.shift.clockInTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}`);
    } catch (err) {
      setStatus(`Error: ${err.response?.data?.error || "Failed to clock out"}`);
    }
  };

  const imageUrl = user?.imageUrl || "https://thumbs.dreamstime.com/b/male-default-avatar-profile-icon-man-face-silhouette-person-placeholder-vector-illustration-male-default-avatar-profile-icon-man-189495143.jpg";





  const [seconds, setSeconds] = useState(0);

  // useEffect to handle the timer logic
  useEffect(() => {
    let interval;

    if (ifClockedIn) {
      // Reset the timer to 0 before starting
      setSeconds(0);

      // Start the timer
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    }

    // Cleanup function to clear the interval when the component unmounts or ifClockedIn changes
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [ifClockedIn]); // Add ifClockedIn as a dependency

  // Format the time (HH:MM:SS)
  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };




  return (
    <div className="p-4">

      <div className="flex items-center justify-center h-full w-full ">

        <div className="bg-gray-50 p-8 rounded-lg shadow-md">
          <h1 className="flex my-2 gap-2 items-center justify-center ">
            Status : {
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


          {<div className="flex flex-col items-center justify-center p-4">
            <h1 className="text-2xl font-bold">Timer</h1>
            <div className="text-2xl font-mono">{formatTime(seconds)}</div>
          </div>}



          <div className="flex items-center justify-center">
            <img
              className="h-20 rounded-full"
              src={imageUrl} alt='/' />
          </div>
          <div className="flex items-center justify-center text-lg font-bold">
            {
              isSignedIn ? (user.firstName) : ('User')
            }
          </div>



          {
            ifClockedIn ? (
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
            )
          }
          {status && <p className="mt-4 text-gray-700">{status}</p>}
          <Toaster position="top-center" expand={false} richColors />
        </div>
      </div>

    </div>
  );
};

const formatTime = (timeInSeconds) => {
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = timeInSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};


export default ClockInOut;