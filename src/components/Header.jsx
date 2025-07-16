// src/components/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase-config'; // Import auth
import { signOut } from 'firebase/auth'; // Import signOut function

const Header = ({ toggleSidebar, user }) => {
  const [showLogoutDropdown, setShowLogoutDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLogoutDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutDropdown(false); // Close dropdown
      navigate('/auth'); // Redirect to login page
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <header className="bg-gray-800 p-4 shadow-md flex items-center justify-between z-30">
      <div className="flex items-center">
        {/* Hamburger Icon */}
        <button
          onClick={toggleSidebar}
          className="text-white focus:outline-none mr-4 p-2 rounded-md hover:bg-gray-700 transition duration-200"
          aria-label="Toggle sidebar"
        >
          {/* Simple Hamburger SVG Icon */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>

        {/* Brand/App Title */}
        <Link to="/" className="text-white text-2xl font-bold">
          Zero Hunger Tracker
        </Link>
      </div>

      {/* User Info and Logout/Login */}
      <div className="relative" ref={dropdownRef}>
        {user ? (
          <>
            {/* Profile Icon with Dropdown */}
            <button
              onClick={() => setShowLogoutDropdown(!showLogoutDropdown)}
              className="flex items-center text-white text-sm focus:outline-none p-2 rounded-md hover:bg-gray-700 transition duration-200"
              aria-label="User profile menu"
            >
              {/* User Icon (e.g., from heroicons) - You might need to install @heroicons/react if you prefer */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:block font-semibold">{user.name || 'User'}</span>
            </button>

            {showLogoutDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40">
                <div className="block px-4 py-2 text-sm text-gray-700">
                  Logged in as: <span className="font-semibold">{user.email}</span>
                </div>
                <div className="block px-4 py-2 text-sm text-gray-700">
                  Role: <span className="font-semibold">{user.role}</span>
                </div>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </>
        ) : (
          <Link
            to="/auth"
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm transition duration-200"
          >
            Login / Sign Up
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;