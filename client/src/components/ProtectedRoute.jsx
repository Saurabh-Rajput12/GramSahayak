// Route guard for authenticated pages requiring any logged-in user
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// ProtectedRoute verifies presence of JWT token in localStorage before rendering nested routes
const ProtectedRoute = () => {
  const token = localStorage.getItem('token');

  // If no token exists, redirect to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token exists, allow access to protected child routes
  return <Outlet />;
};

export default ProtectedRoute;
