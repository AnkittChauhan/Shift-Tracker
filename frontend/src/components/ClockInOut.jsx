import React, { useState } from "react";
import axios from "axios";
import { useAuth , useUser } from "@clerk/clerk-react";



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
      useIfClockedIn(false);
      useIsActive(false)
      // Update status
      setStatus(`Clocked out at ${new Date(data.shift.clockOutTime).toLocaleTimeString()}`);
    } catch (err) {
      setStatus(`Error: ${err.response?.data?.error || "Failed to clock out"}`);
    }
  };

  const imageUrl = user?.imageUrl || "https://thumbs.dreamstime.com/b/male-default-avatar-profile-icon-man-face-silhouette-person-placeholder-vector-illustration-male-default-avatar-profile-icon-man-189495143.jpg";

  return (
    <div className="p-4">

      <div className="flex items-center justify-center h-screen w-full ">

        <div className="bg-gray-50 p-8 rounded-lg shadow-md">
          <h1 className="flex my-2 gap-2 items-center justify-center ">
            Status : {
              isActive ? (
                <h1 className="flex items-center justify-center text-green-500 font-medium">
                  Active
                </h1>
              ) : (
                <h1 className="flex items-center justify-center text-red-500 font-medium">
                  InActive
                </h1>
              )
            }
          </h1>
          <div className="flex items-center justify-center">
            <img
              className="h-20 rounded-full"
              src={imageUrl} alt='/' />
          </div>
          <h1 className="flex items-center justify-center text-lg font-bold">
            Hi {user.firstName}
          </h1>


          {/* <SignedOut>
            <button
              className="bg-blue-500 my-2 flex items-center justify-center mx-auto hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300"
            >
              {<SignInButton />}
            </button>

          </SignedOut> */}

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
        </div>
      </div>

    </div>
  );
};

export default ClockInOut;