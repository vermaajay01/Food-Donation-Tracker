// src/pages/MyDonations.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const MyDonations = ({ user }) => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for editing functionality
  const [editingDonationId, setEditingDonationId] = useState(null);
  const [formData, setFormData] = useState({
    foodItem: '',
    category: '', // Added category to form data
    quantity: '',
    expiryDate: '',
    pickupLocation: '',
    contactInfo: '',
    notes: '',
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("Please log in to view your donations.");
      setDonations([]); // Clear donations if no user
      return;
    }

    setLoading(true);
    setError(null);

    // Query for donations where donorId matches the logged-in user's UID
    const q = query(
      collection(db, 'donations'),
      where('donorId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    // Real-time listener for user's donations
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const donationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDonations(donationsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching my donations:", err);
      setError("Failed to load your donations. Please try again.");
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [user]); // Re-run effect if user changes

  // Handler for starting edit mode
  const handleEditClick = (donation) => {
    setEditingDonationId(donation.id);
    setFormData({
      foodItem: donation.foodItem,
      category: donation.category || '', // Initialize category for edit
      quantity: donation.quantity,
      expiryDate: donation.expiryDate,
      pickupLocation: donation.pickupLocation,
      contactInfo: donation.contactInfo,
      notes: donation.notes || '',
    });
  };

  // Handler for input changes in the edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler for saving edited donation
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLoading(true); // Indicate saving
    setError(null);

    if (!user) {
      alert("You must be logged in to edit donations.");
      setLoading(false);
      return;
    }

    try {
      const donationRef = doc(db, 'donations', editingDonationId);
      await updateDoc(donationRef, {
        foodItem: formData.foodItem,
        category: formData.category, // Include category in update
        quantity: formData.quantity,
        expiryDate: formData.expiryDate,
        pickupLocation: formData.pickupLocation,
        contactInfo: formData.contactInfo,
        notes: formData.notes,
      });
      alert('Donation updated successfully!');
      setEditingDonationId(null); // Exit edit mode
    } catch (err) {
      console.error("Error updating donation:", err);
      setError("Failed to update donation. Check permissions or network.");
      alert("Failed to update donation. Check Firebase Security Rules or network connection.");
    } finally {
      setLoading(false);
    }
  };

  // Handler for canceling edit
  const handleCancelEdit = () => {
    setEditingDonationId(null);
    setFormData({ // Reset form to initial empty state or re-fetch from original donation if desired
      foodItem: '',
      category: '',
      quantity: '',
      expiryDate: '',
      pickupLocation: '',
      contactInfo: '',
      notes: '',
    });
  };

  // Handler for deleting a donation
  const handleDeleteDonation = async (id, status) => {
    if (!user) {
      alert("You must be logged in to delete donations.");
      return;
    }
    // Only allow deletion if the donation is 'available'
    if (status !== 'available') {
      alert("Only 'available' donations can be deleted.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this donation? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const donationRef = doc(db, 'donations', id);
      await deleteDoc(donationRef);
      alert('Donation deleted successfully!');
    } catch (err) {
      console.error("Error deleting donation:", err);
      setError("Failed to delete donation. Check Firebase Security Rules.");
      alert("Failed to delete donation. Check Firebase Security Rules.");
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <div className="text-center text-lg mt-8 text-gray-700">Loading your donations...</div>;
  }

  if (error) {
    return <div className="text-center text-lg mt-8 text-red-600">{error}</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold text-center mb-6 text-green-700">My Donations</h2>

      {donations.length === 0 ? (
        <p className="text-center text-lg text-gray-600">You haven't made any donations yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((donation) => (
            <div key={donation.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              {editingDonationId === donation.id ? (
                // Edit form for the selected donation
                <form onSubmit={handleSaveEdit} className="space-y-4">
                  <div>
                    <label htmlFor="foodItem" className="block text-gray-700 text-sm font-bold mb-2">Food Item:</label>
                    <input
                      type="text"
                      id="foodItem"
                      name="foodItem"
                      value={formData.foodItem}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  {/* Food Category in Edit Form */}
                  <div className="mb-4">
                    <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">Food Category:</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      <option value="">Select a Category</option>
                      <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                      <option value="Grains & Bread">Grains & Bread</option>
                      <option value="Meat & Poultry">Meat & Poultry</option>
                      <option value="Dairy & Eggs">Dairy & Eggs</option>
                      <option value="Canned Goods">Canned Goods</option>
                      <option value="Baked Goods">Baked Goods</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Prepared Meals">Prepared Meals</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="quantity" className="block text-gray-700 text-sm font-bold mb-2">Quantity:</label>
                    <input
                      type="text"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="expiryDate" className="block text-gray-700 text-sm font-bold mb-2">Expiry Date:</label>
                    <input
                      type="date"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="pickupLocation" className="block text-gray-700 text-sm font-bold mb-2">Pickup Location:</label>
                    <input
                      type="text"
                      id="pickupLocation"
                      name="pickupLocation"
                      value={formData.pickupLocation}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="contactInfo" className="block text-gray-700 text-sm font-bold mb-2">Contact Info:</label>
                    <input
                      type="text"
                      id="contactInfo"
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={handleInputChange}
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">Notes (Optional):</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="2"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    ></textarea>
                  </div>
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
                      disabled={loading}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                // Display mode for donation
                <>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">{donation.foodItem}</h3>
                  <p className="text-gray-700 mb-1"><strong>Category:</strong> {donation.category || 'N/A'}</p> {/* Display Category */}
                  <p className="text-gray-700 mb-1"><strong>Quantity:</strong> {donation.quantity}</p>
                  <p className="text-gray-700 mb-1"><strong>Expiry:</strong> {donation.expiryDate}</p>
                  <p className="text-gray-700 mb-1"><strong>Location:</strong> {donation.pickupLocation}</p>
                  <p className="text-gray-700 mb-1"><strong>Contact:</strong> {donation.contactInfo}</p>
                  {donation.notes && <p className="text-gray-600 text-sm mb-2"><em>Notes: {donation.notes}</em></p>}
                  <p className="text-sm text-gray-500 mb-3">
                    Posted: {donation.createdAt?.toDate().toLocaleString() || 'N/A'}
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

                  {/* Action buttons for donor */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {/* Edit button: Only if status is 'available' */}
                    {donation.status === 'available' && (
                      <button
                        onClick={() => handleEditClick(donation)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm py-2 px-3 rounded-md focus:outline-none focus:shadow-outline transition duration-200"
                      >
                        Edit
                      </button>
                    )}
                    {/* Delete button: Only if status is 'available' */}
                    {donation.status === 'available' && (
                      <button
                        onClick={() => handleDeleteDonation(donation.id, donation.status)}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded-md focus:outline-none focus:shadow-outline transition duration-200"
                      >
                        Delete
                      </button>
                    )}
                    {/* Mark as Collected button: Only if status is 'claimed' */}
                    {donation.status === 'claimed' && user.uid === donation.donorId && (
                        <button
                            onClick={() => {
                                if (!window.confirm("Are you sure you want to mark this donation as collected?")) {
                                    return;
                                }
                                const donationRef = doc(db, 'donations', donation.id);
                                updateDoc(donationRef, {
                                    status: 'collected',
                                    collectedBy: user.uid,
                                    collectedByEmail: user.email,
                                    collectedByName: user.name,
                                    collectedAt: new Date().toISOString(),
                                }).then(() => {
                                    alert('Donation marked as collected!');
                                }).catch(err => {
                                    console.error("Error marking as collected from MyDonations:", err);
                                    alert("Failed to mark as collected.");
                                });
                            }}
                            className="bg-purple-500 hover:bg-purple-600 text-white text-sm py-2 px-3 rounded-md focus:outline-none focus:shadow-outline transition duration-200"
                        >
                            Mark as Collected
                        </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyDonations;