import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-blue-500 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/User" className="text-xl font-bold">
          Shift Tracker
        </Link>
        <div>
          <Link to="/dashboard" className="mx-2 hover:underline">
            Manager Panel
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;