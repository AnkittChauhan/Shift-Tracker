import React from 'react'
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";


const AuthPage = () => {

    const { isSignedIn, user } = useUser();


    return (
        <div className="flex items-center justify-center h-screen w-full ">
            <div className="bg-gray-50 p-8 rounded-lg shadow-md">
                <div className='items-center justify-center'>{isSignedIn ? `Hey ${user.firstName} , Go to Dashboard` : "Hey, You are not Authorized!"}</div>
                <SignedOut>
                    <button
                        className="bg-blue-500 my-2 flex items-center justify-center mx-auto hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300"
                    >
                        {<SignInButton />}
                    </button>

                </SignedOut>
               <Link to={'/User'}>
               {
                isSignedIn && (
                    <button
                    className="bg-blue-500 my-2 flex items-center justify-center mx-auto hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md transition-colors duration-300"
                >
                    User Page
                </button>
                )
               }
               </Link>
            </div>
        </div>
    )
}

export default AuthPage