import React, { useState, useEffect } from 'react';
import { Clock, User, Calendar, MapPin, Settings } from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'sonner';
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
  

  // logic to show how many are staff members are Active now !!
  const checkedIn = staff.filter(emp => emp.clockInTime).length;
  const checkedOut = staff.filter(emp => emp.clockOutTime).length;
  const activeStaff = checkedIn - checkedOut;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
              Manager Dashboard
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Admin View</span>
            </h1>
            <div className="flex items-center mt-2 text-gray-500 text-sm">
              <Calendar className="mr-2 h-4 w-4 text-blue-500" />
              <span>{currentDate}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100 flex items-center gap-2 shadow-sm">
              <div className="p-1 bg-blue-100 rounded-full">
                <Clock className="h-4 w-4" />
              </div>
              <span className="font-semibold">Staff Online: {activeStaff}</span>
            </div>
            
            <button
              onClick={() => setShowPerimeterSettings(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl shadow-lg shadow-gray-200 flex items-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              <MapPin className="h-4 w-4" />
              <span>Set Perimeter</span>
            </button>
          </div>
        </div>

        {/* Perimeter Settings Modal */}
        {showPerimeterSettings && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <Settings className="h-5 w-5" />
                  </div>
                  Geofence Settings
                </h2>
                <button
                  onClick={() => setShowPerimeterSettings(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Perimeter Radius (meters)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={perimeter.radius}
                      onChange={(e) => setPerimeter(prev => ({
                        ...prev,
                        radius: Number(e.target.value)
                      }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50"
                      min="100"
                      step="100"
                    />
                    <span className="absolute right-4 top-3.5 text-gray-400 text-sm">meters</span>
                  </div>
                </div>

                <div className="h-80 w-full rounded-xl overflow-hidden border-2 border-gray-100 shadow-inner relative group">
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
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-medium shadow-sm z-[400]">
                    Click map to update center
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                <button
                  onClick={() => setShowPerimeterSettings(false)}
                  className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-white hover:border-gray-300 font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePerimeter}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-blue-400 font-medium shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <span className="animate-spin">⏳</span> Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              Shift Activity
            </h2>
            <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
              Today's Logs
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Clock In</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Clock Out</th>
                  <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <StaffLoader />
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-8 py-12 text-center text-gray-500">
                      No shift activity recorded today
                    </td>
                  </tr>
                ) : (
                  staff.map((employee) => (
                    <tr key={employee.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-8 py-4">
                        <div className="flex items-center">
                          <div className="h-14 w-14 rounded-full bg-gray-100 p-0.5 border-2 border-white shadow-sm overflow-hidden">
                            <img 
                              className="h-full w-full rounded-full" 
                              src={employee.UserImg} 
                              alt={employee.name} 
                            />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-semibold text-gray-900">{employee.name}</p>
                            {employee.notes && (
                              <p className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate" title={employee.notes}>
                                📝 {employee.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          !employee.clockOutTime 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {!employee.clockOutTime ? (
                            <>
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                              Active
                            </>
                          ) : 'Completed'}
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <div className="text-sm text-gray-900 font-medium">
                          {timeConverter(employee.clockInTime)}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className={`text-sm font-medium ${employee.clockOutTime ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                          {employee.clockOutTime ? timeConverter(employee.clockOutTime) : "Working..."}
                        </div>
                      </td>
                      <td className="px-8 py-4">
                        <div className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded inline-block border border-gray-100">
                          {employee.time || '00:00:00'}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-8 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-900">{staff.length}</span> records
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 text-sm border border-gray-200 rounded-lg hover:bg-white disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;