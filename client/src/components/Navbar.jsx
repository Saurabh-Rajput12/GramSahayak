// Navigation bar component with role-based links, search box, and mobile collapse
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Navbar renders responsive header navigation according to user login role
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

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

  // Handle global navbar search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/schemes?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  // Handle user logout and clear localStorage session
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Fetch cart item count for villagers when location changes
  useEffect(() => {
    if (token && user && user.role === 'villager') {
      axios.get('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (res.data && Array.isArray(res.data.items)) {
          const totalQty = res.data.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
          setCartCount(totalQty);
        }
      })
      .catch(() => {
        setCartCount(0);
      });
    }
  }, [location, token, user?.role]);

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

        {/* Navbar links and global search */}
        <div className="collapse navbar-collapse" id="navbarMainContent">
          {/* Global Search Bar */}
          <form className="d-flex my-2 my-lg-0 me-lg-auto" role="search" onSubmit={handleSearchSubmit}>
            <div className="input-group input-group-sm" style={{ maxWidth: '280px' }}>
              <input
                type="text"
                className="form-control rounded-start-pill border-end-0 ps-3 bg-light"
                placeholder="Search schemes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="btn btn-outline-secondary rounded-end-pill border-start-0 bg-light pe-3 text-secondary" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </div>
          </form>

          {/* Navigation Links based on User Role */}
          <ul className="navbar-nav ms-auto align-items-lg-center gap-1 mb-2 mb-lg-0">
            {/* Common Home Link */}
            <li className="nav-item">
              <Link className={`nav-link ${location.pathname === '/' ? 'active text-primary-green' : ''}`} to="/">
                <i className="bi bi-house-door me-1"></i> Home
              </Link>
            </li>

            {/* Public Links (when NOT logged in) */}
            {!token && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/schemes' ? 'active text-primary-green' : ''}`} to="/schemes">
                    <i className="bi bi-journal-bookmark me-1"></i> Schemes
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/mandi' ? 'active text-primary-green' : ''}`} to="/mandi">
                    <i className="bi bi-graph-up-arrow me-1"></i> Mandi
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/notices' ? 'active text-primary-green' : ''}`} to="/notices">
                    <i className="bi bi-megaphone me-1"></i> Notices
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/helpline' ? 'active text-primary-green' : ''}`} to="/helpline">
                    <i className="bi bi-telephone me-1"></i> Helpline
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/members' ? 'active text-primary-green' : ''}`} to="/members">
                    <i className="bi bi-people me-1"></i> Our Panchayat
                  </Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <Link className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i> Login
                  </Link>
                </li>
                <li className="nav-item ms-1">
                  <Link className="btn btn-primary btn-sm rounded-pill px-3 py-1" to="/register">
                    <i className="bi bi-person-plus me-1"></i> Register
                  </Link>
                </li>
              </>
            )}

            {/* Villager Links */}
            {token && user && user.role === 'villager' && (
              <>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/schemes' ? 'active text-primary-green' : ''}`} to="/schemes">
                    <i className="bi bi-journal-bookmark me-1"></i> Schemes
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/mandi' ? 'active text-primary-green' : ''}`} to="/mandi">
                    <i className="bi bi-graph-up-arrow me-1"></i> Mandi
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/market' ? 'active text-primary-green' : ''}`} to="/market">
                    <i className="bi bi-shop me-1"></i> Market
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/events' ? 'active text-primary-green' : ''}`} to="/events">
                    <i className="bi bi-calendar-event me-1"></i> Events
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/notices' ? 'active text-primary-green' : ''}`} to="/notices">
                    <i className="bi bi-megaphone me-1"></i> Notices
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/helpline' ? 'active text-primary-green' : ''}`} to="/helpline">
                    <i className="bi bi-telephone me-1"></i> Helpline
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/complaints' ? 'active text-primary-green' : ''}`} to="/complaints">
                    <i className="bi bi-chat-left-dots me-1"></i> Complaints
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link position-relative px-2" to="/cart">
                    <i className="bi bi-cart3 fs-5"></i>
                    {cartCount > 0 && (
                      <span className="position-absolute top-1 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </li>
                <li className="nav-item ms-lg-2">
                  <Link className="btn btn-outline-primary btn-sm rounded-pill px-3 py-1" to="/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                  </Link>
                </li>
                <li className="nav-item ms-1">
                  <button className="btn btn-light btn-sm rounded-pill px-3 py-1 text-danger border" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                  </button>
                </li>
              </>
            )}

            {/* Panchayat Administrator Links */}
            {token && user && user.role === 'panchayat' && (
              <>
                {/* Panchayat Management Dropdown */}
                <li className="nav-item dropdown">
                  <a
                    className="nav-link dropdown-toggle text-primary-green fw-bold"
                    href="#"
                    id="panchayatDropdown"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="bi bi-gear-fill me-1"></i> Panchayat Panel
                  </a>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 rounded-4 p-2" aria-labelledby="panchayatDropdown">
                    <li><h6 className="dropdown-header text-uppercase text-muted small fw-bold">Administration</h6></li>
                    <li><Link className="dropdown-item rounded-3 py-1" to="/panchayat/users"><i className="bi bi-people me-2 text-primary"></i> User Management</Link></li>
                    <li><Link className="dropdown-item rounded-3 py-1" to="/panchayat/schemes"><i className="bi bi-journal-text me-2 text-success"></i> Schemes Management</Link></li>
                    <li><Link className="dropdown-item rounded-3 py-1" to="/panchayat/applications"><i className="bi bi-file-earmark-check me-2 text-info"></i> Applications Review</Link></li>
                    <li><Link className="dropdown-item rounded-3 py-1" to="/panchayat/complaints"><i className="bi bi-exclamation-octagon me-2 text-warning"></i> Complaints Redressal</Link></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><h6 className="dropdown-header text-uppercase text-muted small fw-bold">Village Info & Public</h6></li>
                    <li><Link className="dropdown-item rounded-3 py-1" to="/panchayat/prices"><i className="bi bi-cash-stack me-2 text-success"></i> Mandi Crop Rates</Link></li>
                    <li><Link className="dropdown-item rounded-3 py-1" to="/panchayat/notices"><i className="bi bi-megaphone me-2 text-primary"></i> Public Notices</Link></li>
                    <li><Link className="dropdown-item rounded-3 py-1" to="/panchayat/events"><i className="bi bi-calendar3 me-2 text-danger"></i> Events & Camps</Link></li>
                    <li><Link className="dropdown-item rounded-3 py-1" to="/panchayat/helplines"><i className="bi bi-telephone-plus me-2 text-secondary"></i> Helplines Directory</Link></li>
                    <li><Link className="dropdown-item rounded-3 py-1" to="/panchayat/feedback"><i className="bi bi-chat-square-quote me-2 text-info"></i> Citizen Feedback</Link></li>
                    <li><Link className="dropdown-item rounded-3 py-1" to="/panchayat/members"><i className="bi bi-person-badge me-2 text-dark"></i> Panchayat Members</Link></li>
                  </ul>
                </li>

                <li className="nav-item">
                  <Link className={`nav-link ${location.pathname === '/reports' ? 'active text-primary-green' : ''}`} to="/reports">
                    <i className="bi bi-bar-chart-fill me-1"></i> Reports & Summary
                  </Link>
                </li>

                <li className="nav-item ms-lg-2">
                  <button className="btn btn-light btn-sm rounded-pill px-3 py-1 text-danger border" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-1"></i> Logout
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
