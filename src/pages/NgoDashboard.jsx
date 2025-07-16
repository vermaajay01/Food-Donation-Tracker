// src/pages/NgoDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import ViewDonations from './ViewDonations'; // NGOs will primarily view available donations

const NgoDashboard = ({ user }) => {
  // Safeguard, though ProtectedRoute handles it
  if (!user || (user.role !== 'ngo' && user.role !== 'admin')) {
    return <div className="text-center text-red-600 mt-8">Access Denied. You must be an NGO or admin to view this page.</div>;
  }

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-indigo-800">NGO Dashboard</h1>
      <p className="text-center text-lg text-gray-700 mb-12">
        Welcome, <span className="font-semibold">{user.name || user.email}</span>! Here you can manage and claim available food donations for your organization.
      </p>

      {/* Quick Actions for NGOs */}
      <div className="mb-12 p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/view-donations" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105">
            Browse All Donations
          </Link>
          {/* Add other NGO actions like 'View Claimed Donations' (next step!) */}
        </div>
      </div>

      {/* Display ViewDonations component, filtered to available by default */}
      <ViewDonations user={user} />

    </div>
  );
};

export default NgoDashboard;