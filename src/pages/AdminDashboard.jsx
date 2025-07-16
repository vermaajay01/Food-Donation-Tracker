// src/pages/AdminDashboard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
// You might import ViewDonations or MyDonations here if admin needs to see them

const AdminDashboard = ({ user }) => {
  // Safeguard, though ProtectedRoute handles it
  if (!user || user.role !== 'admin') {
    return <div className="text-center text-red-600 mt-8">Access Denied. You must be an administrator to view this page.</div>;
  }

  return (
    <div className="py-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-purple-800">Admin Dashboard</h1>
      <p className="text-center text-lg text-gray-700 mb-12">
        Welcome, <span className="font-semibold">{user.name || user.email}</span>! You have full control over the platform.
      </p>

      <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold text-purple-700 mb-4">Admin Controls & Overview</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>User Management (view, edit roles, delete users) - *To be implemented*</li>
          <li>Donation Moderation (approve/decline, force status change) - *To be implemented*</li>
          <li>View System Analytics & Reports - *To be implemented*</li>
          <li>Manage Content (FAQs, policies) - *To be implemented*</li>
        </ul>
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link to="/view-donations" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105">
            View All Donations (Admin View)
          </Link>
          <Link to="/donate" className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105">
            Post a Donation (as Admin)
          </Link>
        </div>
      </div>

      {/* Example: Display some basic stats (placeholder) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-blue-100 p-6 rounded-lg shadow-sm text-center">
          <p className="text-4xl font-bold text-blue-800">123</p>
          <p className="text-gray-600">Total Donations</p>
        </div>
        <div className="bg-green-100 p-6 rounded-lg shadow-sm text-center">
          <p className="text-4xl font-bold text-green-800">87</p>
          <p className="text-gray-600">Donations Collected</p>
        </div>
        <div className="bg-yellow-100 p-6 rounded-lg shadow-sm text-center">
          <p className="text-4xl font-bold text-yellow-800">5</p>
          <p className="text-gray-600">Active NGOs</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;