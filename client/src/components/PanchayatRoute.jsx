// Route guard restricting administrative pages to Panchayat role only
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// PanchayatRoute verifies valid login and role === 'panchayat'
const PanchayatRoute = () => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');

  if (!token || !userJson) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userJson);
    if (user.role !== 'panchayat') {
      return <Navigate to="/" replace />;
    }
  } catch (err) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  // User is verified Panchayat admin, allow access
  return <Outlet />;
};

export default PanchayatRoute;
