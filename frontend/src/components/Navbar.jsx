import React from "react";
import { Link } from "react-router-dom";
import { useState , useEffect } from "react";
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'


const Navbar = () => {

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (location.pathname === "/dashboard") {  
      setIsOpen(true);
    }
  }, [location.pathname]);

  const handleAdminClose = () => {
    setIsOpen(false)
    navigate('/')
  }

  const handleAdminSubmit = () => {
    if (adminMail === REGadminEmail && adminPass === REGadminPassword) {
      setIsOpen(false)
      localStorage.setItem('isAdminLoggedIn', 'true');
      // toast.success('Welcome Admin', {
      //   autoClose: 500,
      // })
    }
    else {
      toast.error('Wrong ID/PASS', {
        autoClose: 500,
      })
    }
  }

  return (
    <nav className="bg-blue-500 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex gap-10 items-end">
          <Link to="/">
            Authentication🔒
          </Link>
          <Link to="/user" className="hover:underline">
            User👤
          </Link>
          <Link to="/dashboard" className="hover:underline">
            Manager💼
          </Link>
        </div>

      {isOpen && (
        <div className="fixed z-50 inset-0 flex items-center justify-center backdrop-blur ">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-semibold">Admin ? Prove it !</h2>
            <p className="mt-2 text-gray-600">Only admin can go futher</p>

            {/* Input Boxes */}
            <div className='mt-5'>
              <input
                onChange={(e) => {
                  setAdminMail(e.target.value)
                }}
                type="text"
                placeholder='admin Mail'
                className='text-sm p-2 border-b focus:outline-none'
              />
              <input
                onChange={(e) => {
                  setAdminPass(e.target.value)
                }}
                type="text"
                placeholder='admin Pass'
                className='text-sm p-2 border-b focus:outline-none'
              />
            </div>

            {/* Close Button */}
            <div className='space-x-2'>
              <button
                onClick={
                  handleAdminClose
                }
                className="mt-4 px-4 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
              >
                Close
              </button>
              <button
                onClick={
                  handleAdminSubmit
                }
                className="mt-4 px-4 py-1 bg-green-500 hover:bg-green-600 text-white rounded"
              >
                Submit
              </button>
              {/* <Toaster position="top-center" expand={false} richColors /> */}
            </div>
          </div>
        </div>
      )}

        <div>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>

    </nav>
  );
};

export default Navbar;