import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {

  
  return (
    <nav className="bg-indigo-950 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-orange-500">
          UniSports
        </Link>

        {/* Auth Buttons */}
        <div className="space-x-4">
          <Link
            to="/auth/login"
            className="px-4 py-2 border border-orange-400 rounded hover:bg-orange-500 hover:text-indigo-950 transition"
          >
            Login
          </Link>

          <Link
            to="/auth/register"
            className="px-4 py-2 bg-orange-400 text-indigo-950 rounded hover:bg-orange-500 transition"
          >
            Register
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;