// src/pages/Admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase-config';
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth'; // For deleting Firebase Authentication user

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = auth.currentUser; // Get the currently logged-in user

  // Function to fetch all users from Firestore
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const usersCollectionRef = collection(db, 'users');
      const q = query(usersCollectionRef);
      const querySnapshot = await getDocs(q);
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please check your permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(); // Fetch users on component mount
  }, []);

  // Function to handle changing a user's role
  const handleChangeRole = async (userId, currentRole) => {
    // Prevent admin from changing their own role, or changing super admin role (if you implement one)
    if (userId === currentUser.uid) {
      alert("You cannot change your own role.");
      return;
    }
    // You might want to add more sophisticated logic here, e.g., preventing changing another admin's role
    // unless you are a "super admin"

    const newRole = prompt(`Enter new role for user ${userId} (current: ${currentRole}). Options: donor, ngo, admin`);

    if (newRole && ['donor', 'ngo', 'admin'].includes(newRole.toLowerCase())) {
      try {
        const userDocRef = doc(db, 'users', userId);
        await updateDoc(userDocRef, { role: newRole.toLowerCase() });
        alert(`User role updated to ${newRole.toLowerCase()} successfully!`);
        fetchUsers(); // Re-fetch users to update the UI
      } catch (err) {
        console.error("Error updating user role:", err);
        setError("Failed to update user role. Check Firebase Security Rules.");
      }
    } else if (newRole !== null) { // User entered something but not a valid role
      alert("Invalid role. Please enter 'donor', 'ngo', or 'admin'.");
    }
  };

  // Function to handle deleting a user
  const handleDeleteUser = async (userId, userEmail, userFirebaseUID) => {
    // IMPORTANT: Firebase Security Rules for 'users' collection must allow delete for admins.
    // Also, deleting the Firebase Auth user requires admin SDK (server-side) or client-side permissions.
    // For a simple client-side approach, you can delete the Firestore document,
    // but the Firebase Authentication user will remain unless deleted via Firebase Admin SDK.
    // THIS CLIENT-SIDE `deleteUser` CAN ONLY BE CALLED ON THE CURRENTLY AUTHENTICATED USER.
    // If you want an admin to delete *any* user, you MUST use a Firebase Cloud Function.
    // For now, this client-side code will only delete the Firestore document for other users.
    // If an admin wants to delete THEMSELVES, `auth.currentUser.delete()` would work but is dangerous.

    if (userId === currentUser.uid) {
      alert("You cannot delete your own account from this panel. Please use your profile settings if you wish to delete your account.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete user: ${userEmail}? This will delete their Firestore profile.`)) {
      return;
    }

    try {
      // Delete the Firestore user document
      const userDocRef = doc(db, 'users', userId);
      await deleteDoc(userDocRef);

      // Note: Deleting the Firebase Authentication user (userFirebaseUID)
      // from the client-side for *another* user is not possible directly with `deleteUser(userFirebaseUID)`.
      // `deleteUser` only works for the currently signed-in user.
      // To fully delete a user's Auth account, you'd need a Firebase Cloud Function triggered by an admin.
      // For this project, we're just deleting the Firestore profile.
      alert(`User ${userEmail}'s Firestore profile deleted successfully!`);
      fetchUsers(); // Re-fetch users to update the UI
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user. Check Firebase Security Rules.");
    }
  };


  if (loading) {
    return <div className="text-center mt-8 text-lg text-gray-700">Loading users...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-lg text-red-600">{error}</div>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold text-center mb-6 text-indigo-700">User Management</h2>

      {users.length === 0 ? (
        <p className="text-center text-lg text-gray-600">No users found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((userItem) => (
                <tr key={userItem.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{userItem.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{userItem.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{userItem.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleChangeRole(userItem.id, userItem.role)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      disabled={userItem.id === currentUser.uid} // Disable for current user
                    >
                      Change Role
                    </button>
                    <button
                      onClick={() => handleDeleteUser(userItem.id, userItem.email, userItem.authUid)} // Assuming you store authUid if different from doc.id
                      className="text-red-600 hover:text-red-900"
                      disabled={userItem.id === currentUser.uid} // Disable for current user
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement;