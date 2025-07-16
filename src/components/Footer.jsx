// src/components/Footer.jsx
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white p-4 text-center text-sm shadow-inner mt-auto">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} Food Donation Tracker. All rights reserved.</p>
        <p className="mt-1">Supporting SDG 2: Zero Hunger - End hunger, achieve food security and improved nutrition and promote sustainable agriculture.</p>
      </div>
    </footer>
  );
};

export default Footer;