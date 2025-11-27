import React from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";


const AuthPage = () => {

    const { isSignedIn, user } = useUser();

    const removeAdmin = () => {
        localStorage.setItem('isAdminLoggedIn', 'false')
    } 

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
            {/* Main card */}
            <div className="bg-white p-10 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 hover:scale-[1.02]">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6 shadow-sm">
                        <span className="text-4xl">⏰</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Shift Tracker</h1>
                    <p className="text-gray-500 text-sm">Manage your shifts efficiently</p>
                </div>

                {/* Welcome Message */}
                <div className="text-center mb-8">
                    {isSignedIn ? (
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Welcome back, <span className="text-blue-600">{user.firstName}</span>!
                            </h2>
                            <p className="text-gray-500">Ready to start your day?</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-gray-800">Welcome Back</h2>
                            <p className="text-gray-500">Please sign in to access your dashboard</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <SignedOut>
                        <button
                            onClick={removeAdmin}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            <SignInButton mode="modal" />
                        </button>
                    </SignedOut>

                    {isSignedIn && (
                        <Link to={'/User'}>
                            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg shadow-blue-200 transition-all duration-300 flex items-center justify-center gap-2 group">
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                                Go to Staff Page
                            </button>
                        </Link>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400">
                        Secure authentication powered by Clerk
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AuthPage