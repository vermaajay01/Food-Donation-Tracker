// src/pages/DonorDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import MyDonations from './MyDonations'; // Import the MyDonations component

const DonorDashboard = ({ user }) => {
  // The ProtectedRoute in App.jsx already handles access denial,
  // but this is a safeguard and makes the component self-contained.
  if (!user || (user.role !== 'donor' && user.role !== 'admin')) {
    return <div className="text-center text-red-600 mt-8">Access Denied. You must be a donor or admin to view this page.</div>;
  }

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-green-800">Donor Dashboard</h1>
      <p className="text-center text-lg text-gray-700 mb-12">
        Welcome, <span className="font-semibold">{user.name || user.email}</span>! Here you can manage your food donations and contribute to Zero Hunger.
      </p>

      {/* Quick Actions for Donors */}
      <div className="mb-12 p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-green-700 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/donate" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105">
            Make a New Donation
          </Link>
          <Link to="/view-donations" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105">
            View All Donations
          </Link>
          {/* Add other donor actions like 'Edit Profile' etc. */}
        </div>
      </div>

      {/* Display MyDonations component */}
      <MyDonations user={user} />

    </div>
  );
};

export default DonorDashboard;