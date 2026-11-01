// Footer component providing quick links, contact info, and official village portal notice
import React from 'react';
import { Link } from 'react-router-dom';

// Footer renders structured responsive footer section
const Footer = () => {
  return (
    <footer className="bg-white border-top mt-auto py-5 text-secondary">
      <div className="container">
        <div className="row g-4">
          {/* About Section */}
          <div className="col-12 col-md-4">
            <div className="d-flex align-items-center mb-3">
              <span className="fs-3 me-2">🌾</span>
              <h5 className="text-primary-green fw-bold mb-0">Gram Sahayak</h5>
            </div>
            <p className="small text-muted mb-3">
              Gram Sahayak is a digital rural governance and e-services portal empowering villagers with instant scheme access, agricultural mandi rates, grievance redressal, and direct rural commerce.
            </p>
            <div className="d-flex gap-2">
              <span className="badge bg-light text-success border px-2 py-1"><i className="bi bi-shield-check me-1"></i> Official Portal</span>
              <span className="badge bg-light text-warning border px-2 py-1"><i className="bi bi-patch-check me-1"></i> Digital India</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-2">
            <h6 className="text-dark fw-bold mb-3 small text-uppercase">Public Services</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li><Link to="/schemes" className="text-decoration-none text-secondary">Welfare Schemes</Link></li>
              <li><Link to="/mandi" className="text-decoration-none text-secondary">Mandi Prices</Link></li>
              <li><Link to="/market" className="text-decoration-none text-secondary">Village Market</Link></li>
              <li><Link to="/events" className="text-decoration-none text-secondary">Camps & Events</Link></li>
              <li><Link to="/notices" className="text-decoration-none text-secondary">Public Notices</Link></li>
            </ul>
          </div>

          {/* Village Support */}
          <div className="col-6 col-md-2">
            <h6 className="text-dark fw-bold mb-3 small text-uppercase">Village Support</h6>
            <ul className="list-unstyled small d-flex flex-column gap-2 mb-0">
              <li><Link to="/helpline" className="text-decoration-none text-secondary">Helpline Directory</Link></li>
              <li><Link to="/members" className="text-decoration-none text-secondary">Panchayat Members</Link></li>
              <li><Link to="/complaints" className="text-decoration-none text-secondary">File Grievance</Link></li>
              <li><Link to="/login" className="text-decoration-none text-secondary">Resident Login</Link></li>
              <li><Link to="/register" className="text-decoration-none text-secondary">New Registration</Link></li>
            </ul>
          </div>

          {/* Contact & Emergency Snippet */}
          <div className="col-12 col-md-4">
            <h6 className="text-dark fw-bold mb-3 small text-uppercase">Gram Panchayat Office</h6>
            <div className="small text-muted mb-2">
              <i className="bi bi-geo-alt-fill text-danger me-2"></i>
              Gram Panchayat Bhawan, Main Road, Tehsil Block, PIN - 466001
            </div>
            <div className="small text-muted mb-2">
              <i className="bi bi-envelope-fill text-primary me-2"></i>
              grampanchayat.sahayak@gov.in
            </div>
            <div className="small text-muted mb-3">
              <i className="bi bi-telephone-fill text-success me-2"></i>
              Emergency Helpline: <strong>112 / 108</strong> (24x7)
            </div>
            <div className="p-2 bg-light rounded-3 small border">
              <i className="bi bi-clock-history me-1 text-primary"></i> <strong>Office Timings:</strong> Mon - Sat (10:00 AM - 05:00 PM)
            </div>
          </div>
        </div>

        <hr className="my-4" />

        {/* Bottom copyright notice */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center small text-muted">
          <div>
            &copy; {new Date().getFullYear()} Gram Sahayak Portal. Built for Rural Welfare.
          </div>
          <div className="mt-2 mt-sm-0">
            A Lab Project for College Curriculum. Plain MERN Stack.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
