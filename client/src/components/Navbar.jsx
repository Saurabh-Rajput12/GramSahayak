// Navigation bar component with role-based links and mobile responsive toggle
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// Navbar renders responsive header navigation according to user login role
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Read authenticated user state from localStorage
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  let user = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch (e) {
      user = null;
    }
  }

  // Handle user logout and clear session
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? 'active fw-bold text-primary-green' : 'text-dark';

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-2 shadow-sm">
      <div className="container">
        {/* Brand Logo & Name */}
        <Link className="navbar-brand d-flex align-items-center text-primary-green fw-bold fs-4 me-3" to="/">
          <span className="me-2 fs-3">🌾</span>
          <span>Gram Sahayak</span>
        </Link>

        {/* Mobile menu toggle button */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMainContent"
          aria-controls="navbarMainContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar links for 5 core modules */}
        <div className="collapse navbar-collapse" id="navbarMainContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-1">
            <li className="nav-item">
              <Link className={`nav-link px-3 ${isActive('/')}`} to="/">
                <i className="bi bi-house-door me-1"></i> Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link px-3 ${isActive('/schemes')}`} to="/schemes">
                <i className="bi bi-journal-bookmark me-1"></i> Sarkari Yojanas
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link px-3 ${isActive('/complaints')}`} to="/complaints">
                <i className="bi bi-megaphone me-1"></i> Shikayat Nivaran
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link px-3 ${isActive('/market')}`} to="/market">
                <i className="bi bi-shop me-1"></i> Krishi Market
              </Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link px-3 ${isActive('/notices')}`} to="/notices">
                <i className="bi bi-bell me-1"></i> Suchna Patra
              </Link>
            </li>
          </ul>

          {/* User Account Controls */}
          <div className="d-flex align-items-center gap-2">
            {token && user ? (
              <div className="d-flex align-items-center gap-2">
                {user.role === 'panchayat' ? (
                  <Link to="/panchayat" className="btn btn-warning btn-sm rounded-pill px-3 fw-semibold">
                    <i className="bi bi-shield-lock me-1"></i> Panchayat Panel
                  </Link>
                ) : (
                  <Link to="/dashboard" className="btn btn-outline-success btn-sm rounded-pill px-3 fw-semibold">
                    <i className="bi bi-speedometer2 me-1"></i> My Dashboard
                  </Link>
                )}

                <span className="badge bg-light text-dark border px-3 py-2 rounded-pill small d-none d-md-inline">
                  <i className="bi bi-person-circle me-1 text-primary-green"></i>
                  {user.name ? user.name.split(' ')[0] : user.username}
                </span>

                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm rounded-pill px-3"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Logout
                </button>
              </div>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-success btn-sm rounded-pill px-3">
                  <i className="bi bi-box-arrow-in-right me-1"></i> Login
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm rounded-pill px-3">
                  <i className="bi bi-person-plus me-1"></i> Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
