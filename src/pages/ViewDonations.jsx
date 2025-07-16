// src/pages/ViewDonations.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, orderBy, startAt, endAt } from 'firebase/firestore';

const ViewDonations = ({ user }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for search, filter, and sort
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'available', 'claimed', 'collected'
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' or specific category
  const [sortBy, setSortBy] = useState('createdAt_desc'); // 'createdAt_desc', 'createdAt_asc', 'expiryDate_asc', 'expiryDate_desc'

  useEffect(() => {
    setLoading(true);
    setError(null);

    if (!user) {
      setLoading(false);
      setError("Please log in to view donations.");
      setDonations([]);
      return;
    }

    let donationsQuery = collection(db, 'donations');

    // Apply filters
    if (filterStatus !== 'all') {
      donationsQuery = query(donationsQuery, where('status', '==', filterStatus));
    }
    if (filterCategory !== 'all') {
      donationsQuery = query(donationsQuery, where('category', '==', filterCategory));
    }

    // Apply sorting
    switch (sortBy) {
      case 'createdAt_asc':
        donationsQuery = query(donationsQuery, orderBy('createdAt', 'asc'));
        break;
      case 'expiryDate_asc':
        donationsQuery = query(donationsQuery, orderBy('expiryDate', 'asc')); // Assuming expiryDate is a string in YYYY-MM-DD format for direct sorting
        break;
      case 'expiryDate_desc':
        donationsQuery = query(donationsQuery, orderBy('expiryDate', 'desc'));
        break;
      case 'createdAt_desc': // Default
      default:
        donationsQuery = query(donationsQuery, orderBy('createdAt', 'desc'));
        break;
    }

    // Real-time listener for donations
    const unsubscribe = onSnapshot(donationsQuery, async (snapshot) => {
      let donationsData = [];
      for (const d of snapshot.docs) {
        const donation = { id: d.id, ...d.data() };
        donationsData.push(donation);
      }

      // Client-side search (Firestore doesn't support complex text search directly on multiple fields)
      if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        donationsData = donationsData.filter(donation =>
          (donation.foodItem && donation.foodItem.toLowerCase().includes(lowerCaseSearchTerm)) ||
          (donation.notes && donation.notes.toLowerCase().includes(lowerCaseSearchTerm))
        );
      }

      setDonations(donationsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching donations:", err);
      setError("Failed to load donations. Please check your network connection.");
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up the listener
  }, [user, filterStatus, filterCategory, sortBy, searchTerm]); // Re-run effect if any filter/sort/search term changes

  const handleClaimDonation = async (donationId, donorId, donorName) => {
    if (!user) {
      alert("You must be logged in to claim a donation.");
      return;
    }
    if (user.role !== 'ngo' && user.role !== 'admin') {
      alert("Only NGOs or Admins can claim donations.");
      return;
    }
    if (user.uid === donorId) {
      alert("You cannot claim your own donation.");
      return;
    }
    if (!window.confirm("Are you sure you want to claim this donation?")) {
      return;
    }

    try {
      const donationRef = doc(db, 'donations', donationId);
      await updateDoc(donationRef, {
        status: 'claimed',
        claimedBy: user.uid,
        claimedByEmail: user.email,
        claimedByName: user.name, // Storing NGO name for display
        claimedAt: new Date().toISOString(),
      });
      alert('Donation claimed successfully!');
    } catch (err) {
      console.error("Error claiming donation:", err);
      setError("Failed to claim donation. Check Firebase Security Rules or network.");
    }
  };

  const handleMarkCollected = async (donationId) => { // Removed claimedByUserId as it's derivable
    if (!user) {
      alert("You must be logged in.");
      return;
    }
    // Ensure only donor or admin can mark as collected
    const donationToUpdate = donations.find(d => d.id === donationId);
    if (!donationToUpdate || (user.uid !== donationToUpdate.donorId && user.role !== 'admin')) {
        alert("Only the donor or an admin can mark this donation as collected.");
        return;
    }
    if (!window.confirm("Are you sure you want to mark this donation as collected?")) {
      return;
    }

    try {
      const donationRef = doc(db, 'donations', donationId);
      await updateDoc(donationRef, {
        status: 'collected',
        collectedBy: user.uid, // User who marked as collected
        collectedByEmail: user.email,
        collectedByName: user.name,
        collectedAt: new Date().toISOString(),
      });
      alert('Donation marked as collected!');
    } catch (err) {
      console.error("Error marking donation as collected:", err);
      setError("Failed to mark as collected. Check Firebase Security Rules or network.");
    }
  };


  if (loading) {
    return <div className="text-center text-lg mt-8 text-gray-700">Loading donations...</div>;
  }

  if (error) {
    return <div className="text-center text-lg mt-8 text-red-600">{error}</div>;
  }

  const categoryOptions = [
    "Fruits & Vegetables", "Grains & Bread", "Meat & Poultry",
    "Dairy & Eggs", "Canned Goods", "Baked Goods", "Beverages",
    "Prepared Meals", "Other"
  ];

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold text-center mb-6 text-green-700">All Donations</h2>

      {/* Search, Filter, Sort Controls */}
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Search Bar */}
          <div>
            <label htmlFor="search" className="block text-gray-700 text-sm font-bold mb-2">Search Food Item/Notes:</label>
            <input
              type="text"
              id="search"
              placeholder="e.g., apples, urgent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Filter by Status */}
          <div>
            <label htmlFor="filterStatus" className="block text-gray-700 text-sm font-bold mb-2">Filter by Status:</label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="claimed">Claimed</option>
              <option value="collected">Collected</option>
            </select>
          </div>

          {/* Filter by Category */}
          <div>
            <label htmlFor="filterCategory" className="block text-gray-700 text-sm font-bold mb-2">Filter by Category:</label>
            <select
              id="filterCategory"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Sort By */}
        <div className="mb-4">
          <label htmlFor="sortBy" className="block text-gray-700 text-sm font-bold mb-2">Sort By:</label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="createdAt_desc">Most Recent</option>
            <option value="createdAt_asc">Oldest</option>
            <option value="expiryDate_asc">Expiry Date (Soonest First)</option>
            <option value="expiryDate_desc">Expiry Date (Latest First)</option>
          </select>
        </div>
      </div>

      {donations.length === 0 ? (
        <p className="text-center text-lg text-gray-600">No donations found matching your criteria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <div key={donation.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold text-green-800 mb-2">{donation.foodItem}</h3>
              <p className="text-gray-700 mb-1"><strong>Category:</strong> {donation.category || 'N/A'}</p>
              <p className="text-gray-700 mb-1"><strong>Quantity:</strong> {donation.quantity}</p>
              <p className="text-gray-700 mb-1"><strong>Expiry:</strong> {donation.expiryDate}</p>
              <p className="text-gray-700 mb-1"><strong>Location:</strong> {donation.pickupLocation}</p>
              <p className="text-gray-700 mb-1"><strong>Contact Donor:</strong> {donation.contactInfo}</p>
              {donation.notes && <p className="text-gray-600 text-sm mb-2"><em>Notes: {donation.notes}</em></p>}
              <p className="text-sm text-gray-500 mb-3">
                Posted by {donation.donorName} on {donation.createdAt?.toDate().toLocaleString() || 'N/A'}
              </p>

              <div className="mt-4">
                <p className={`font-bold ${
                  donation.status === 'available' ? 'text-green-600' :
                  donation.status === 'claimed' ? 'text-blue-600' :
                  'text-gray-600'
                }`}>
                  Status: {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                </p>
                {donation.status === 'claimed' && donation.claimedByName && (
                  <p className="text-sm text-blue-500">Claimed by: {donation.claimedByName} on {new Date(donation.claimedAt).toLocaleString()}</p>
                )}
                {donation.status === 'collected' && donation.collectedByName && (
                  <p className="text-sm text-gray-500">Collected by: {donation.collectedByName} on {new Date(donation.collectedAt).toLocaleString()}</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="mt-4">
                {user && user.role === 'ngo' && donation.status === 'available' && (
                  <button
                    onClick={() => handleClaimDonation(donation.id, donation.donorId, donation.donorName)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-200"
                  >
                    Claim Donation
                  </button>
                )}
                {user && (user.uid === donation.donorId || user.role === 'admin') && donation.status === 'claimed' && (
                  <button
                    onClick={() => handleMarkCollected(donation.id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline transition duration-200"
                  >
                    Mark as Collected
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewDonations;