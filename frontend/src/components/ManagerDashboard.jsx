import React, { useState, useEffect } from 'react';
import { Clock, User, Calendar, MapPin, Settings } from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Toaster, toast } from 'sonner';
import { useAuth } from '@clerk/clerk-react';
import StaffLoader from './StaffLoader';

const ManagerDashboard = () => {

  const { getToken } = useAuth();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPerimeterSettings, setShowPerimeterSettings] = useState(false);
  const [perimeter, setPerimeter] = useState({
    location: { lat: 51.505, lng: -0.09 }, // Default location
    radius: 2000 // Default radius in meters
  });
  const [isSaving, setIsSaving] = useState(false);

  // Get staff info and perimeter settings from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch staff data
        const staffResponse = await axios.get('https://shift-tracker-plig.onrender.com/shift/getStaff');
        setStaff(staffResponse.data.userShift);

        // Fetch perimeter settings if available
        try {
          const perimeterResponse = await axios.get('https://shift-tracker-plig.onrender.com/perimeter/get');
          if (perimeterResponse.data) {
            setPerimeter({
              location: {
                lat: perimeterResponse.data.location.latitude,
                lng: perimeterResponse.data.location.longitude
              },
              radius: perimeterResponse.data.radius
            });
          }
        } catch (perimeterError) {
          console.log('No perimeter settings found, using defaults');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const timeConverter = (time) => {
    const date = new Date(time);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
  };

  const handleSavePerimeter = async () => {
    setIsSaving(true);
    try {
      const token = await getToken();
      const response = await axios.post(
        'https://shift-tracker-plig.onrender.com/perimeter/set',
        {
          location: {
            latitude: perimeter.location.lat,
            longitude: perimeter.location.lng
          },
          radius: perimeter.radius
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setShowPerimeterSettings(false);
      toast.success('Perimeter saved successfully');
    } catch (error) {
      console.error('Detailed error:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to save perimeter';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPerimeter(prev => ({
          ...prev,
          location: e.latlng
        }));
      }
    });

    return perimeter.location ? (
      <>
        <Marker position={[perimeter.location.lat, perimeter.location.lng]} />
        <Circle
          center={[perimeter.location.lat, perimeter.location.lng]}
          radius={perimeter.radius}
          color="blue"
        />
      </>
    ) : null;
  };









  return (

    <div className="bg-gray-50 min-h-screen p-8">
      <Toaster position="top-center" expand={false} richColors />
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Manager Dashboard</h1>
          <div className="flex items-center mt-2 text-gray-600">
            <Calendar className="mr-2 h-4 w-4" />
            <span>{currentDate}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            <span className="font-medium">Staff Online: {staff.length}</span>
          </div>
          <button
            onClick={() => setShowPerimeterSettings(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-md flex items-center hover:bg-green-700 transition-colors"
          >
            <MapPin className="mr-2 h-5 w-5" />
            <span>Set Perimeter</span>
          </button>
        </div>
      </div>

      {/* Perimeter Settings Modal */}
      {showPerimeterSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Set Clock-in Perimeter
              </h2>
              <button
                onClick={() => setShowPerimeterSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Radius (meters)
              </label>
              <input
                type="number"
                value={perimeter.radius}
                onChange={(e) => setPerimeter(prev => ({
                  ...prev,
                  radius: Number(e.target.value)
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="100"
                step="100"
              />
            </div>

            <div className="h-96 w-full rounded-md overflow-hidden mb-4">
              <MapContainer
                center={[perimeter.location.lat, perimeter.location.lng]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker />
              </MapContainer>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowPerimeterSettings(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePerimeter}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              >
                {isSaving ? 'Saving...' : 'Save Perimeter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <User className="mr-2 h-5 w-5" />
            Staff Clocked In
          </h2>
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

                {/* Loader before getting Stafff */}
                
                {

                  loading ? (
                    <tr className="hover:bg-gray-50 transition-colors">
                      <StaffLoader />
                    </tr>
                  ) : (
                    staff.map((employee) => (
                      <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="text-blue-600 flex items-center justify-center font-medium">
                              <img className='h-10 w-10 rounded-full' src={employee.UserImg} alt="user" />
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-gray-800">{employee.name}</p>
                              <p className="text-xs py-1 px-3 bg-gray-100 text-gray-500">Note: {employee.notes}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-sm font-medium">
                            {timeConverter(employee.clockInTime)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="bg-red-100 text-red-800 py-1 px-3 rounded-full text-sm font-medium">
                            {employee.clockOutTime ? timeConverter(employee.clockOutTime) : "--:--"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-700 font-medium">
                          {employee.time ? employee.time : 'Active'}
                        </td>
                      </tr>
                    ))

                  )
                }
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

export default ManagerDashboard;