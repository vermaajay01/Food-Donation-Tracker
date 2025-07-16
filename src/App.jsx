// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

// Import components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Import pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DonateFood from './pages/DonateFood';
import ViewDonations from './pages/ViewDonations';
import MyDonations from './pages/MyDonations';
import DonorDashboard from './pages/DonorDashboard';
import NgoDashboard from './pages/NgoDashboard';
import AdminDashboard from './pages/AdminDashboard';
import UserProfile from './pages/UserProfile';
import Notifications from './pages/Notifications';
import UserManagement from './pages/Admin/UserManagement'; // FIXED: Added missing import for UserManagement

// Firebase imports
import { auth, db } from './firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

function App() {
  const [user, setUser] = useState(null); // Stores user object with uid, email, name, role
  const [loading, setLoading] = useState(true); // Manages initial app loading state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Effect to listen for Firebase authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // User is logged in, fetch their role and name from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              name: userData.name || currentUser.email.split('@')[0], // Fallback name
              role: userData.role,
            });
            // Redirect to appropriate dashboard after successful login/auth state change
            // Only redirect if they are on the home page or auth page
            if (window.location.pathname === '/' || window.location.pathname === '/auth') {
              switch (userData.role) {
                case 'donor':
                  navigate('/donor-dashboard');
                  break;
                case 'ngo':
                  navigate('/ngo-dashboard');
                  break;
                case 'admin':
                  navigate('/admin-dashboard');
                  break;
                default:
                  navigate('/'); // Fallback for unknown roles
              }
            }
          } else {
            console.warn("User document not found for UID:", currentUser.uid, "Attempting to create default profile...");
            try {
              // Attempt to create the user document with default 'donor' role
              await setDoc(doc(db, 'users', currentUser.uid), {
                email: currentUser.email,
                name: currentUser.email.split('@')[0], // Default name from email
                role: 'donor', // Assign default 'donor' role
                createdAt: new Date().toISOString(),
              });
              console.log("Successfully created default user document for:", currentUser.uid);
              setUser({
                uid: currentUser.uid,
                email: currentUser.email,
                name: currentUser.email.split('@')[0],
                role: 'donor',
              });
              navigate('/donor-dashboard'); // Redirect newly created user to their dashboard
            } catch (createError) {
              console.error("CRITICAL ERROR: Failed to create default user document in Firestore:", createError);
              alert("A critical error occurred: Failed to set up your user profile. Please try logging out and back in, or contact support if the issue persists.");
              setUser(null); // Clear user on critical creation error
              navigate('/auth'); // Redirect to login as profile setup failed
            }
          }
        } catch (fetchError) {
          console.error("Error fetching existing user data from Firestore:", fetchError);
          // If the initial getDoc fails, this might indicate broader Firestore connectivity/permission issues
          setUser(null); // Clear user
          navigate('/auth'); // Redirect to login/auth
        }
      } else {
        // User is logged out
        setUser(null);
        // If logged out and not on auth page or home page, redirect to auth
        if (window.location.pathname !== '/auth' && window.location.pathname !== '/') {
            navigate('/auth');
        }
      }
      setLoading(false); // Authentication state check is complete
    });

    // Cleanup function: unsubscribe from the listener when the component unmounts
    return () => unsubscribe();
  }, [navigate]); // navigate is a dependency as it's used inside useEffect

  // Function to toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Function to close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Show a loading screen while authentication state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-2xl font-bold text-gray-700">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mr-3"></div>
        Loading application...
      </div>
    );
  }

  // ProtectedRoute component to handle access control based on roles
  const ProtectedRoute = ({ children, allowedRoles }) => {
    // If user data is still loading (should be handled by App's main loading state, but a safeguard)
    if (loading) return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <p className="text-xl text-gray-600">Loading content...</p>
      </div>
    );
    // If user is not logged in, redirect to authentication page
    if (!user) {
        return <AuthPage />;
    }
    // If user is logged in but their role is not allowed for this route
    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="text-center text-red-600 mt-8 p-4 bg-red-100 rounded-lg shadow-md">
          <p className="text-2xl font-bold mb-4">Access Denied!</p>
          <p className="text-lg mb-4">You do not have permission to view this page.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105"
          >
            Go to Home
          </button>
        </div>
      );
    }
    // If user is logged in and has the allowed role, render the child component
    // Clone element to pass the 'user' prop down to the protected component
    return React.cloneElement(children, { user });
  };


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Sidebar component, controlled by isSidebarOpen state */}
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} user={user} />

      {/* Main content area, shifts to the right when sidebar is open */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header component with sidebar toggle button */}
        <Header toggleSidebar={toggleSidebar} user={user} />

        {/* Main content area for routes */}
        <main className="flex-1 container mx-auto p-4">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />

            {/* Protected Routes - Access based on roles */}
            <Route path="/donate" element={<ProtectedRoute allowedRoles={['donor', 'admin']}><DonateFood /></ProtectedRoute>} />
            <Route path="/view-donations" element={<ProtectedRoute allowedRoles={['donor', 'ngo', 'admin']}><ViewDonations /></ProtectedRoute>} />
            <Route path="/my-donations" element={<ProtectedRoute allowedRoles={['donor', 'admin']}><MyDonations /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['donor', 'ngo', 'admin']}><UserProfile /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute allowedRoles={['donor', 'ngo', 'admin']}><Notifications /></ProtectedRoute>} />

            {/* Role-Specific Dashboard Routes */}
            <Route path="/donor-dashboard" element={<ProtectedRoute allowedRoles={['donor', 'admin']}><DonorDashboard /></ProtectedRoute>} />
            <Route path="/ngo-dashboard" element={<ProtectedRoute allowedRoles={['ngo', 'admin']}><NgoDashboard /></ProtectedRoute>} />
            <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            {/* Admin Specific Routes */}
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />

            {/* Catch-all for unknown routes (404) */}
            <Route path="*" element={
              <div className="text-center py-12">
                <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
                <p className="text-xl text-gray-600">Page Not Found</p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-8 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300 ease-in-out transform hover:scale-105"
                >
                  Go to Home
                </button>
              </div>
            } />
          </Routes>
        </main>

        {/* Footer component */}
        <Footer />
      </div>
    </div>
  );
}

export default App;