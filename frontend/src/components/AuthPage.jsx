import React from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";


const AuthPage = () => {

    const { isSignedIn, user } = useUser();

    const removeAdmin = () => {
        localStorage.setItem('isAdminLoggedIn', 'false')
    } 

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
            </div>

            {/* Main card */}
            <div className="relative bg-white/80 backdrop-blur-lg p-10 rounded-2xl shadow-2xl max-w-md w-full border border-white/20 transform transition-all duration-300 hover:scale-105">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Shift Tracker</h1>
                    <p className="text-gray-600 text-sm">Manage your shifts with ease</p>
                </div>

                {/* Welcome Message */}
                <div className="text-center mb-6">
                    {isSignedIn ? (
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Welcome back, <span className="text-indigo-600">{user.firstName}</span>! 👋
                            </h2>
                            <p className="text-gray-600">Ready to manage your shifts?</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <h2 className="text-2xl font-semibold text-gray-800">Welcome! 🔐</h2>
                            <p className="text-gray-600">Please sign in to continue</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                    <SignedOut>
                        <button
                            onClick={removeAdmin}
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            <SignInButton mode="modal" />
                        </button>
                    </SignedOut>

                    {isSignedIn && (
                        <Link to={'/User'}>
                            <button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Go to Staff Page
                            </button>
                        </Link>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                        Secure authentication powered by Clerk
                    </p>
                </div>
            </div>
        </div>
    )
}

export default AuthPage