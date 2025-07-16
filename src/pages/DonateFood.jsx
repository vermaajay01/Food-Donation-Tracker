// src/pages/DonateFood.jsx
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase-config';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore'; // Import serverTimestamp
import { useNavigate } from 'react-router-dom';

const DonateFood = ({ user }) => {
  const navigate = useNavigate();

  const [foodItem, setFoodItem] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill contactInfo and pickupLocation if user is available and has them
  useEffect(() => {
    if (user && user.uid) {
      const fetchUserData = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setContactInfo(userData.contactInfo || '');
            // Assuming 'pickupLocation' might be stored in user profile if it's a common one
            // For now, let's leave pickupLocation to be manually entered, or fetch from user profile if you add it there.
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          // Don't block the user, just log the error
        }
      };
      fetchUserData();
    }
  }, [user]); // Re-run if user changes

  const handleAddDonation = async (e) => {
    e.preventDefault();
    setError('');
    if (!user) {
      setError('You must be logged in to donate food.');
      return;
    }
    if (!foodItem || !category || !quantity || !expiryDate || !pickupLocation || !contactInfo) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      // Fetch current user's name and email for the donation record
      // This is important for security rules that check donorId against request.auth.uid
      // and also for display purposes without needing to fetch user details later.
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const donorName = userData?.name || 'Anonymous Donor';
      const donorEmail = userData?.email || user.email;

      const donationData = {
        donorId: user.uid,
        donorName: donorName,       // Added for rules validation and display
        donorEmail: donorEmail,     // Added for rules validation and display
        foodItem,
        category,
        quantity,
        expiryDate, // Stored as string YYYY-MM-DD
        pickupLocation,
        contactInfo,
        notes,
        status: 'available', // Initial status
        createdAt: serverTimestamp(), // Use serverTimestamp()
        // No claimedBy, collectedBy fields initially
      };

      console.log("Donation data being sent:", donationData); // For debugging

      await addDoc(collection(db, 'donations'), donationData);
      alert('Donation added successfully!');
      setFoodItem('');
      setCategory('');
      setQuantity('');
      setExpiryDate('');
      setPickupLocation(''); // Might keep if it's a fixed location for the donor
      setNotes('');
      // contactInfo is often pulled from user profile, so might not reset it
      setLoading(false);
      navigate('/my-donations'); // Redirect to my donations page
    } catch (err) {
      console.error("Error adding donation:", err);
      setError(`Error adding donation: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-8">Donate Food</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <form onSubmit={handleAddDonation} className="space-y-6">
          <div>
            <label htmlFor="foodItem" className="block text-gray-700 text-sm font-bold mb-2">
              Food Item <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="foodItem"
              value={foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-green-500"
              placeholder="e.g., Cooked Rice, Apples, Canned Goods"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-green-500"
              required
            >
              <option value="">Select a category</option>
              <option value="cooked">Cooked Food</option>
              <option value="raw_produce">Raw Produce (Fruits/Vegetables)</option>
              <option value="packaged">Packaged/Canned Goods</option>
              <option value="baked">Baked Goods</option>
              <option value="dairy">Dairy & Eggs</option>
              <option value="meat">Meat & Poultry</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-gray-700 text-sm font-bold mb-2">
              Quantity <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-green-500"
              placeholder="e.g., 5 kg, 20 servings, 3 boxes"
              required
            />
          </div>

          <div>
            <label htmlFor="expiryDate" className="block text-gray-700 text-sm font-bold mb-2">
              Expiry/Best Before Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="pickupLocation" className="block text-gray-700 text-sm font-bold mb-2">
              Pickup Location <span className="text-red-500">*</span>
            </label>
            <textarea
              id="pickupLocation"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              rows="3"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-green-500"
              placeholder="Full address for pickup"
              required
            ></textarea>
          </div>

          <div>
            <label htmlFor="contactInfo" className="block text-gray-700 text-sm font-bold mb-2">
              Contact Info for Pickup <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-green-500"
              placeholder="Phone number or email"
              required
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-green-500"
              placeholder="e.g., Dietary restrictions, packaging details, preferred pickup times"
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg w-full transition duration-200 focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Adding Donation...' : 'Add Donation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonateFood;