// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom'; // Use Link for internal navigation

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      {/* Changed gradient from green to blue/indigo, matching common action colors */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg shadow-xl mb-12 max-w-6xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fadeInDown">
          Nourishing Communities, Eliminating Waste
        </h1>
        <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90 animate-fadeInUp">
          Join us in our mission to achieve SDG 2: **Zero Hunger**. Connect surplus food with those in need, fostering a sustainable and compassionate community.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link
            to="/donate"
            // Changed button background/text to white with blue/indigo text for contrast
            className="bg-white text-indigo-700 font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-gray-100 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Donate Food Now
          </Link>
          <Link
            to="/view-donations"
            // Kept white border/text for secondary action button
            className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-white hover:text-indigo-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Find Food Nearby
          </Link>
        </div>
      </section>

      {/* About Us Section */}
      <section className="bg-white p-10 rounded-lg shadow-lg mb-12 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-800 mb-6 text-center">About Food Donation Tracker</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-gray-700 leading-relaxed text-lg mb-4">
              The **Food Donation Tracker** is a community-driven initiative dedicated to tackling food waste and food insecurity. Inspired by the United Nations Sustainable Development Goal 2, our platform acts as a bridge between individuals and organizations with surplus edible food and NGOs/charities serving those in need.
            </p>
            <p className="text-gray-700 leading-relaxed text-lg">
              We believe that no one should go hungry when food goes to waste. By simplifying the process of donating and receiving food, we empower donors to make a direct impact and help NGOs efficiently distribute resources where they are needed most.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            {/* Placeholder for an image or illustration */}
            <img
              // Use the direct image URL here
              src="https://static.vecteezy.com/system/resources/previews/006/916/104/non_2x/food-and-groceries-donation-illustration-free-vector.jpg"
              alt="Community Impact - Food and Groceries Donation" // Updated alt text for clarity
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-200 p-10 rounded-lg shadow-lg mb-12 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center transform hover:scale-105 transition duration-300 ease-in-out">
            <div className="text-5xl text-blue-600 mb-4">1</div> {/* Kept blue for numbering */}
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Donors List Food</h3>
            <p className="text-gray-600">Individuals or businesses with excess food easily list their donations with details like item, quantity, and pickup location.</p>
          </div>
          {/* Step 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center transform hover:scale-105 transition duration-300 ease-in-out">
            <div className="text-5xl text-indigo-600 mb-4">2</div> {/* Changed to indigo */}
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">NGOs Claim Donations</h3>
            <p className="text-gray-600">Registered NGOs browse available donations and claim items that meet their community's needs.</p>
          </div>
          {/* Step 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md text-center transform hover:scale-105 transition duration-300 ease-in-out">
            <div className="text-5xl text-purple-600 mb-4">3</div> {/* Kept purple for numbering */}
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Food is Collected & Shared</h3>
            <p className="text-gray-600">NGOs coordinate pickup with donors, ensuring food reaches beneficiaries quickly and efficiently.</p>
          </div>
        </div>
      </section>

      {/* Impact/Statistics Section */}
      {/* Kept blue/indigo gradient for impact, consistent with hero */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-10 rounded-lg shadow-lg mb-12 max-w-6xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">Our Impact So Far</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-6xl font-extrabold">120+</p>
            <p className="text-xl opacity-90">Donations Made</p>
          </div>
          <div>
            <p className="text-6xl font-extrabold">5000+</p>
            <p className="text-xl opacity-90">Meals Provided</p>
          </div>
          <div>
            <p className="text-6xl font-extrabold">30+</p>
            <p className="text-xl opacity-90">NGOs Partnered</p>
          </div>
        </div>
      </section>

      {/* Call to Action (Join Us) */}
      {/* Changed CTA background from strong green to a more neutral gray-800 matching header */}
      <section className="text-center bg-gray-800 p-10 rounded-lg shadow-lg max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-white mb-6">Make a Difference Today!</h2>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"> {/* Adjusted text color for contrast */}
          Whether you have surplus food to share or are an organization dedicated to feeding the hungry, your contribution matters.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link
            to="/auth"
            // Button with white background and accent text
            className="bg-white text-indigo-700 font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:bg-gray-100 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Register Now
          </Link>
          <Link
            to="/contact" // Assuming you'll add a contact page
            // Secondary button with border and white text
            className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-white hover:text-indigo-700 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;