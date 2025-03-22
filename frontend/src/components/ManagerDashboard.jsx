import React, { useState } from 'react';
import { Clock, User, Calendar } from 'lucide-react';
import axios from 'axios';
import { useEffect } from "react";

const ManagerDashboard = () => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null)


  // Getting staff info from backend 

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:5000/shift/getStaff');
        console.log('Backend Response:', response.data.userShift);
        setStaff(response.data.userShift);
      } catch (err) {
        console.error('Error fetching staff:', err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);


  // const [staff, setStaff] = useState([]);

  // useEffect(() => {
  //   const fetchStaff = async () => {
  //     try {
  //       const res = await axios.get('/api/staff');
  //       console.log(res.data); // inspect it
  //       setStaff(res.data.staff); // update according to actual structure
  //     } catch (err) {
  //       console.error(err);
  //     }
  //   };

  //   fetchStaff();
  // }, []);



  // const staff = [
  //   { id: 1, name: "John Doe", clockIn: "09:00 AM", clockOut: "05:00 PM", status: "active" },
  //   { id: 2, name: "Jane Smith", clockIn: "08:30 AM", clockOut: "04:30 PM", status: "active" },
  //   { id: 3, name: "Robert Johnson", clockIn: "10:00 AM", clockOut: "--:--", status: "active" },
  // ];

  const timeConverter = (time) => {

    const isoTimestamp = time

    // Step 1: Parse the ISO timestamp
    const date = new Date(isoTimestamp);

    // Step 2: Extract time components
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Step 3: Format the time
    const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;

    return formattedTime;

  }


  return (
    <div className="bg-gray-50 min-h-screen p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manager Dashboard</h1>
          <div className="flex items-center mt-2 text-gray-600">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{currentDate}</span>
          </div>
        </div>
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          <span className="font-medium">Staff Online: {staff.length
            }</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <User className="mr-2 h-5 w-5" />
            Staff Clocked In
          </h2>
          {/*  */}
        </div>

        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-left text-gray-600 text-sm uppercase tracking-wider">
                  <th className="px-4 py-3 rounded-tl-lg font-semibold">Employee</th>
                  <th className="px-4 py-3 font-semibold">Clock In</th>
                  <th className="px-4 py-3 font-semibold">Clock Out</th>
                  <th className="px-4 py-3 rounded-tr-lg font-semibold">Hours Today</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staff.map((employee) => {
                  // Calculate hours (for display purposes)
                  const hours = employee.clockOut !== "--:--" ? "8.0" : "In progress";

                  return (
                    <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className=" text-blue-600 flex items-center justify-center font-medium">
                            {
                              <img className='h-10 w-10 rounded-full' src={employee.UserImg} alt="userImg" />
                            }
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-800">{employee.name}</p>
                            <p className="text-xs  py-1 px-3 bg-gray-100 text-gray-500">Note: {employee.notes}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-sm font-medium">
                          {timeConverter(employee.clockInTime)}
                        </span>
                      </td>
                      <td className="px-4 py-4 ">
                        <span className="bg-red-100 text-red-800 py-1 px-3 rounded-full text-sm font-medium">
                        { 
                          employee.clockOutTime ? (
                            timeConverter(employee.clockInTime)
                          ):(
                            "--:--"
                          ) 
                        }
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-700 font-medium">{ 
                        employee.time ? ( employee.time ):( 'Active' )
                        }</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6 text-sm text-gray-500">
            <p>Showing {staff.length} employees</p>
            <button className="text-blue-600 font-medium hover:text-blue-800">
              View All Staff →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


// employee.clockOutTime === "--:--" ? (
//   <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium">
//     Active
//   </span>
// ) : (
//   <span className="bg-gray-100 text-gray-800 py-1 px-3 rounded-full text-sm font-medium">
//     {
//      employee.clockOutTime ? ( 
//       timeConverter(employee.clockOutTime)
//      ):(
//       employee.clockOutTime=='--:--'
//      )
    
//     }
//   </span>
// )

export default ManagerDashboard;