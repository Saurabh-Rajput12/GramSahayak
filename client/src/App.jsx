// Main application component defining client-side routing and page layouts for Mini Project
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import PanchayatRoute from './components/PanchayatRoute';

// 5 Core Module Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Schemes from './pages/Schemes';
import Complaints from './pages/Complaints';
import Market from './pages/Market';
import Notices from './pages/Notices';

// Protected Dashboards
import Dashboard from './pages/Dashboard';
import PanchayatDashboard from './pages/PanchayatDashboard';

// App component orchestrates router configuration and structural view layout
function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100 bg-page">
        <Navbar />
        <main className="flex-grow-1">
          <Routes>
            {/* Publicly accessible routes for the 5 core modules */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="/complaints" element={<Complaints />} />
            <Route path="/market" element={<Market />} />
            <Route path="/notices" element={<Notices />} />

            {/* Authenticated route for villagers */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>

            {/* Authenticated route for Panchayat administrative panel */}
            <Route element={<PanchayatRoute />}>
              <Route path="/panchayat" element={<PanchayatDashboard />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
