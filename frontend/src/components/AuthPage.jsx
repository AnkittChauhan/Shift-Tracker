import React, { useState } from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, MapPin, Clock, Users, Shield } from 'lucide-react';

const AboutSection = () => (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 space-y-6 h-full">
        <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">About Shift Tracker</h3>
            <p className="text-gray-600 leading-relaxed">
                A location-based employee attendance system that allows staff to clock in/out only within a designated work perimeter.
            </p>
        </div>

        <div className="space-y-5">
            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">Key Features</h4>
            
            <div className="flex gap-4 items-start">
                <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 shrink-0">
                    <Users className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-semibold text-gray-800">Staff Portal</p>
                    <p className="text-sm text-gray-500 mt-0.5">Sign in → Navigate to Staff page → Clock In/Out with automatic time tracking.</p>
                </div>
            </div>

            <div className="flex gap-4 items-start">
                <div className="p-2.5 bg-green-50 rounded-xl text-green-600 shrink-0">
                    <MapPin className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-semibold text-gray-800">Geofencing</p>
                    <p className="text-sm text-gray-500 mt-0.5">Clock-in is only enabled when you're within the manager-defined work zone.</p>
                </div>
            </div>

            <div className="flex gap-4 items-start">
                <div className="p-2.5 bg-purple-50 rounded-xl text-purple-600 shrink-0">
                    <Shield className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-semibold text-gray-800">Manager Dashboard</p>
                    <p className="text-sm text-gray-500 mt-0.5">Admin access to view all shifts, set work perimeter on map, and track attendance.</p>
                </div>
            </div>

            <div className="flex gap-4 items-start">
                <div className="p-2.5 bg-orange-50 rounded-xl text-orange-600 shrink-0">
                    <Clock className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-semibold text-gray-800">Real-time Tracking</p>
                    <p className="text-sm text-gray-500 mt-0.5">Live session timer and shift duration logged automatically.</p>
                </div>
            </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
            <div className="bg-blue-50 p-4 rounded-xl flex gap-3 items-center">
                <span className="text-xl">💡</span>
                <p className="text-sm text-blue-800 font-medium">
                    First time? Sign in, then head to the Staff page to clock in!
                </p>
            </div>
        </div>
    </div>
);

const AuthPage = () => {

    const { isSignedIn, user } = useUser();
    const [showAbout, setShowAbout] = useState(false);

    const removeAdmin = () => {
        localStorage.setItem('isAdminLoggedIn', 'false')
    } 

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
            <div className="flex flex-col md:flex-row gap-8 max-w-5xl w-full items-stretch justify-center">
                
                {/* Left Side: Auth Card */}
                <div className="w-full max-w-md space-y-4 flex flex-col">
                    {/* Main card */}
                    <div className="bg-white p-10 rounded-2xl shadow-2xl transform transition-all duration-300 hover:scale-[1.02] h-full flex flex-col justify-center">
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

                    {/* Mobile Only: About Section Toggle */}
                    <div className="md:hidden space-y-4">
                        <button
                            onClick={() => setShowAbout(!showAbout)}
                            className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <span className="text-sm font-medium text-gray-700">How does this work?</span>
                            {showAbout ? (
                                <ChevronUp className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                        </button>

                        {showAbout && <AboutSection />}
                    </div>
                </div>

                {/* Desktop Only: Right Side About Section */}
                <div className="hidden md:block w-full max-w-md">
                    <AboutSection />
                </div>
            </div>
        </div>
    )
}

export default AuthPage