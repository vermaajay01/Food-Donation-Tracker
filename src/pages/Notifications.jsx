// src/pages/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../firebase-config';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setError("Please log in to view your notifications.");
      setNotifications([]);
      return;
    }

    setLoading(true);
    setError(null);

    // Query for notifications for the logged-in user, ordered by most recent
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notificationsData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications. Please try again.");
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [user]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (err) {
      console.error("Error marking notification as read:", err);
      alert("Failed to mark notification as read.");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!window.confirm("Are you sure you want to mark all notifications as read?")) {
      return;
    }
    const unreadNotifications = notifications.filter(notif => !notif.read);
    if (unreadNotifications.length === 0) {
      alert("No unread notifications to mark.");
      return;
    }

    try {
      // For simplicity, we'll update them one by one. For very large scale,
      // a batched write would be more efficient but also more complex client-side.
      const updatePromises = unreadNotifications.map(notif =>
        updateDoc(doc(db, 'notifications', notif.id), { read: true })
      );
      await Promise.all(updatePromises);
      alert("All unread notifications marked as read!");
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      alert("Failed to mark all notifications as read.");
    }
  };


  if (loading) {
    return <div className="text-center text-lg mt-8 text-gray-700">Loading notifications...</div>;
  }

  if (error) {
    return <div className="text-center text-lg mt-8 text-red-600">{error}</div>;
  }

  return (
    <div className="mt-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6 text-green-700">My Notifications</h2>

      {notifications.length > 0 && (
        <div className="text-right mb-4">
          <button
            onClick={handleMarkAllAsRead}
            className="bg-gray-500 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded-md transition duration-200"
          >
            Mark All as Read
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <p className="text-center text-lg text-gray-600">You have no notifications.</p>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg shadow-md border ${
                notif.read ? 'bg-gray-100 border-gray-300' : 'bg-white border-blue-300'
              } flex justify-between items-center`}
            >
              <div>
                <p className={`font-semibold ${notif.read ? 'text-gray-700' : 'text-blue-800'}`}>
                  {notif.message}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {notif.createdAt?.toDate().toLocaleString() || 'N/A'}
                </p>
              </div>
              {!notif.read && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-3 rounded-md transition duration-200"
                >
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;