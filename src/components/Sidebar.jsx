// src/components/Sidebar.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../firebase-config';
import { signOut } from 'firebase/auth';

// Import icons
import {
  FaHome,
  FaPlusCircle,
  FaListAlt,
  FaUserCircle,
  FaBoxes,
  FaHandshake,
  FaUserCog,
  FaUsers,
  FaBell // Added FaBell icon for Notifications
} from 'react-icons/fa'; // Ensure you have react-icons installed (npm install react-icons)

const Sidebar = ({ isOpen, closeSidebar, user }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      closeSidebar(); // Close sidebar on logout
      navigate('/auth'); // Redirect to auth page after logout
    } catch (error) {
      console.error("Error logging out:", error.message);
      alert("Failed to log out. Please try again."); // Use a custom modal in production
    }
  };

  const handleLinkClick = () => {
    closeSidebar(); // Close sidebar when a link is clicked
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 w-64 bg-gray-800 text-white transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out z-40 shadow-lg`}
    >
      <div className="p-4 flex flex-col h-full">
        {/* Header with User Info and Close Button */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            {user ? (
              <>
                <p className="text-lg font-bold">Welcome,</p>
                <p className="text-md text-gray-300 truncate">{user.name || 'User'}</p>
                <p className="text-sm text-gray-400 capitalize">Role: {user.role}</p>
              </>
            ) : (
              <p className="text-lg font-bold">Guest User</p>
            )}
          </div>
          {/* Close Sidebar Button (X icon) */}
          <button
            onClick={closeSidebar}
            className="text-gray-400 hover:text-white focus:outline-none p-2 rounded-md hover:bg-gray-700 transition duration-200"
            aria-label="Close sidebar"
          >
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
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto">
          <ul className="space-y-3">
            <li>
              {/* Home Link */}
              <NavLink
                to="/"
                onClick={handleLinkClick}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 ${isActive ? 'bg-gray-700 text-white' : ''}`
                }
              >
                <FaHome className="mr-3" /> Home
              </NavLink>
            </li>
            {user ? (
              <>
                {/* General Links for all logged-in users */}
                <div className="text-gray-400 text-sm font-semibold uppercase mt-4 mb-2 px-4">General</div>
                <li>
                  <NavLink
                    to="/profile" // My Profile Link
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 ${isActive ? 'bg-gray-700 text-white' : ''}`
                    }
                  >
                    <FaUserCircle className="mr-3" /> My Profile
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/notifications" // NEW: Notifications Link
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 ${isActive ? 'bg-gray-700 text-white' : ''}`
                    }
                  >
                    <FaBell className="mr-3" /> Notifications
                    {/* Placeholder for unread count badge (will be implemented later) */}
                    {/* <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">3</span> */}
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/donate"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 ${isActive ? 'bg-gray-700 text-white' : ''}`
                    }
                  >
                    <FaPlusCircle className="mr-3" /> Donate Food
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/view-donations"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 ${isActive ? 'bg-gray-700 text-white' : ''}`
                    }
                  >
                    <FaListAlt className="mr-3" /> View All Donations
                  </NavLink>
                </li>
                 <li>
                  <NavLink
                    to="/my-donations"
                    onClick={handleLinkClick}
                    className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 ${isActive ? 'bg-gray-700 text-white' : ''}`
                    }
                  >
                    <FaBoxes className="mr-3" /> My Donations
                  </NavLink>
                </li>

                {/* Role-Specific Dashboard Links */}
                <div className="text-gray-400 text-sm font-semibold uppercase mt-4 mb-2 px-4">Dashboards</div>
                {user.role === 'donor' && (
                  <li>
                    <NavLink
                      to="/donor-dashboard"
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 ${isActive ? 'bg-gray-700 text-white' : ''}`
                      }
                    >
                      <FaUserCircle className="mr-3" /> Donor Dashboard
                    </NavLink>
                  </li>
                )}
                {user.role === 'ngo' && (
                  <li>
                    <NavLink
                      to="/ngo-dashboard"
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 ${isActive ? 'bg-gray-700 text-white' : ''}`
                      }
                    >
                      <FaHandshake className="mr-3" /> NGO Dashboard
                    </NavLink>
                  </li>
                )}
                {user.role === 'admin' && (
                  <li>
                    <NavLink
                      to="/admin-dashboard"
                      onClick={handleLinkClick}
                      className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 ${isActive ? 'bg-gray-700 text-white' : ''}`
                      }
                    >
                      <FaUserCog className="mr-3" /> Admin Dashboard
                    </NavLink>
                  </li>
                )}

                {/* Admin Specific Tools */}
                {user.role === 'admin' && (
                  <>
                    <div className="text-gray-400 text-sm font-semibold uppercase mt-4 mb-2 px-4">Admin Tools</div>
                    <li>
                      <NavLink
                        to="/admin/users" // Admin User Management Link
                        onClick={handleLinkClick}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 ${isActive ? 'bg-gray-700 text-white' : ''}`
                        }
                      >
                        <FaUsers className="mr-3" /> User Management
                      </NavLink>
                    </li>
                  </>
                )}
              </>
            ) : (
              <li>
                <NavLink
                  to="/auth"
                  onClick={handleLinkClick}
                  className={({ isActive }) =>
                      `flex items-center px-4 py-2 rounded-md hover:bg-gray-700 transition duration-200 ${isActive ? 'bg-gray-700 text-white' : ''}`
                  }
                >
                  <FaUserCircle className="mr-3" /> Login / Sign Up
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        {/* Logout Button at the bottom */}
        {user && (
          <div className="mt-auto pt-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;