import React from "react";
import { Link } from "react-router-dom";
import Unisport from "@/assets/UniSport.jpg";

const Navbar: React.FC = () => {

  
  return (
    <nav className="bg-indigo-950 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        
          <Link to="/" className="text-2xl ">
           <img 
              src={Unisport} 
              alt="UniSport Logo" 
              className="h-8 w-auto" 
           />
          
        </Link>
        
        

        {/* Menu */}
        <div className="space-x-6 hidden md:flex">

          <a href="#features" className="hover:text-orange-400">Features</a>
          <a href="#how-it-works" className="hover:text-orange-400">How it works</a>
          <a href="#sports" className="hover:text-orange-400">Sports</a>
          <a href="#events" className="hover:text-orange-400">Events</a>
          <a href="#merchandise" className="hover:text-orange-400">Merchandise</a>
          
         
          
        </div>

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