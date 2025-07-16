// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase-config';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // State for user's name
  const [selectedRole, setSelectedRole] = useState('donor'); // State for selected role, default to 'donor'
  const [isLogin, setIsLogin] = useState(true); // Toggles between login and signup form
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let userCredential;
      if (isLogin) {
        // Login existing user
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert('Logged in successfully!');
      } else {
        // Sign up new user
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // After successful signup, create a user document in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          name: name,
          role: selectedRole, // Use the selected role from the dropdown
          createdAt: new Date().toISOString(),
        });
        alert('Account created successfully!');
      }
      navigate('/'); // App.jsx's useEffect will handle redirection to the correct dashboard based on role
    } catch (error) {
      console.error("Authentication error:", error.message);
      let errorMessage = "Authentication failed.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "Email already in use. Please log in or use a different email.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters.";
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password.";
      }
      alert(errorMessage); // Use a custom modal/toast in production
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-160px)]"> {/* Adjusted height for header/footer */}
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800"> {/* CHANGED THIS LINE */}
          {isLogin ? 'Login' : 'Sign Up'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && ( // Show name and role fields only for signup
            <>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Name:
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required={!isLogin} // Make required only for signup
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                  Register as:
                </label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required={!isLogin}
                >
                  <option value="donor">Donor</option>
                  <option value="ngo">NGO</option>
                  {/* IMPORTANT: Do NOT add 'admin' here for security reasons. */}
                  {/* Admin roles should only be assigned by an existing admin. */}
                </select>
              </div>
            </>
          )}
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password:
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-6 text-center text-gray-600">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              // Optionally clear form fields when switching between login/signup
              setEmail('');
              setPassword('');
              setName('');
              setSelectedRole('donor'); // Reset role to default
            }}
            className="text-green-600 hover:underline font-bold"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;