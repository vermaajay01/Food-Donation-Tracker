// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// import './index.css'; // You can remove this if you don't have any custom global CSS
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router> {/* All components using React Router hooks must be inside this */}
      <App />
    </Router>
  </React.StrictMode>,
);