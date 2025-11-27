import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { SignedIn, UserButton, useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminMail, setAdminMail] = useState('');
  const [adminPass, setAdminPass] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (location.pathname === "/ManagerDashboard") {
      const storedValue = localStorage.getItem("isAdminLoggedIn");
      if (storedValue !== "true") {
        setIsOpen(true);
      }
    }
  }, [location.pathname]);

  const handleAdminClose = () => {
    setIsOpen(false);
    navigate('/');
  };

  const REGadminEmail = import.meta.env.VITE_ADMIN_MAIL;
  const REGadminPassword = import.meta.env.VITE_ADMIN_PASS;

  const handleAdminSubmit = () => {
    if (adminMail === REGadminEmail && adminPass === REGadminPassword) {
      setIsOpen(false);
      localStorage.setItem('isAdminLoggedIn', 'true');
      toast.success('Welcome Admin', { autoClose: 500 });
    } else {
      toast.error('Wrong ID/PASS', { autoClose: 500 });
    }
  };

  const handleManagerClick = () => {
    navigate('/ManagerDashboard');
    const storedVal = localStorage.getItem('isAdminLoggedIn');
    if (storedVal === 'true') {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const NavLink = ({ to, children, icon }) => (
    <Link
      to={to}
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium text-sm md:text-base"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );

  return (
    <>
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Navigation Links */}
            <div className="flex items-center gap-2 md:gap-4">
              {isSignedIn ? (
                <>
                  <NavLink to="/" icon={<span>🔒</span>}>
                    Auth
                  </NavLink>
                  <NavLink to="/user" icon={<span>👤</span>}>
                    Staff
                  </NavLink>
                  <button
                    onClick={handleManagerClick}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-medium text-sm md:text-base"
                  >
                    <span>💼</span>
                    <span>Manager</span>
                  </button>
                </>
              ) : (
                <NavLink to="/" icon={<span>🔒</span>}>
                  Authentication
                </NavLink>
              )}
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-4">
              <SignedIn>
                <div className="bg-gray-100 p-1 rounded-full hover:bg-gray-200 transition-colors">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all scale-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛡️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Admin Access</h2>
              <p className="text-gray-500 mt-2">Please verify your credentials</p>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-6">
                <p className="font-semibold mb-1">Demo Credentials:</p>
                <p>ID: admin@123</p>
                <p>Pass: 12345</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    onChange={(e) => setAdminMail(e.target.value)}
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    onChange={(e) => setAdminPass(e.target.value)}
                    type="password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleAdminClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdminSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-200 transition-all"
                >
                  Verify Access
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;