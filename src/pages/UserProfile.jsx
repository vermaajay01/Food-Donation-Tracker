// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase-config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ user }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '', // Email might not be directly editable via Firestore for Auth users
    contactInfo: '',
    organizationName: '', // Specific for NGOs
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("No user logged in. Please log in to view your profile.");
      navigate('/auth'); // Redirect to auth if no user
      return;
    }

    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          const fetchedData = docSnap.data();
          setUserData(fetchedData);
          setFormData({
            name: fetchedData.name || '',
            email: fetchedData.email || '', // Display email, not necessarily editable
            contactInfo: fetchedData.contactInfo || '',
            organizationName: fetchedData.organizationName || '',
          });
        } else {
          setError("User profile not found in database.");
          // Optionally, create a basic profile here if it truly doesn't exist
          // This should ideally be handled in App.jsx during initial login
        }
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, navigate]); // Depend on user and navigate

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true); // Indicate saving process
    setError(null);

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const updateData = {
        name: formData.name,
        contactInfo: formData.contactInfo,
      };

      // Only add organizationName if user is an NGO
      if (user.role === 'ngo') {
        updateData.organizationName = formData.organizationName;
      }

      await updateDoc(userDocRef, updateData);
      setUserData(prev => ({ ...prev, ...updateData })); // Update local state
      setIsEditing(false); // Exit editing mode
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating user profile:", err);
      setError("Failed to update profile. Please check your permissions.");
      alert("Failed to update profile. Please check your permissions."); // User friendly alert
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-8 text-lg text-gray-700">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-lg text-red-600">{error}</div>;
  }

  if (!userData) {
      return <div className="text-center mt-8 text-lg text-gray-600">No profile data available.</div>;
  }

  return (
    <div className="mt-8 max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-3xl font-bold text-center mb-6 text-green-700">My Profile</h2>

      {!isEditing ? (
        <div className="space-y-4">
          <p className="text-lg"><strong>Name:</strong> {userData.name}</p>
          <p className="text-lg"><strong>Email:</strong> {userData.email}</p>
          <p className="text-lg"><strong>Role:</strong> <span className="capitalize">{userData.role}</span></p>
          <p className="text-lg"><strong>Contact Info:</strong> {userData.contactInfo || 'Not provided'}</p>
          {user.role === 'ngo' && (
            <p className="text-lg"><strong>Organization:</strong> {userData.organizationName || 'Not provided'}</p>
          )}
          <button
            onClick={() => setIsEditing(true)}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              readOnly // Email is from Firebase Auth, typically not editable via Firestore directly
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 leading-tight focus:outline-none focus:shadow-outline cursor-not-allowed"
            />
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed here. It's tied to your authentication.</p>
          </div>
          <div>
            <label htmlFor="contactInfo" className="block text-gray-700 text-sm font-bold mb-2">Contact Information (Phone, Address, etc.):</label>
            <textarea
              id="contactInfo"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleInputChange}
              rows="3"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>
          {user.role === 'ngo' && (
            <div>
              <label htmlFor="organizationName" className="block text-gray-700 text-sm font-bold mb-2">Organization Name:</label>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          )}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                // Reset form data to current userData if canceling
                setFormData({
                    name: userData.name || '',
                    email: userData.email || '',
                    contactInfo: userData.contactInfo || '',
                    organizationName: userData.organizationName || '',
                });
              }}
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
      )}
    </div>
  );
};

export default UserProfile;