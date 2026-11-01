// Footer component providing quick links and official village portal notice
import React from 'react';
import { Link } from 'react-router-dom';

// Footer renders structured responsive footer section
const Footer = () => {
  return (
    <footer className="bg-white border-top mt-auto py-4 text-secondary">
      <div className="container">
        <div className="row g-4 align-items-center">
          {/* About Section */}
          <div className="col-12 col-md-5">
            <div className="d-flex align-items-center mb-2">
              <span className="fs-3 me-2">🌾</span>
              <h5 className="text-primary-green fw-bold mb-0">Gram Sahayak</h5>
            </div>
            <p className="small text-muted mb-2">
              Digital rural services portal connecting villagers directly with Gram Panchayat for welfare scheme applications, grievance redressal, farmer market, and announcements.
            </p>
            <div className="d-flex gap-2">
              <span className="badge bg-light text-success border px-2 py-1"><i className="bi bi-shield-check me-1"></i> Mini Project</span>
              <span className="badge bg-light text-warning border px-2 py-1"><i className="bi bi-patch-check me-1"></i> Digital India</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-3">
            <h6 className="text-dark fw-bold mb-2 small text-uppercase">Citizen Services</h6>
            <ul className="list-unstyled small d-flex flex-column gap-1 mb-0">
              <li><Link to="/schemes" className="text-decoration-none text-secondary">Sarkari Yojanas</Link></li>
              <li><Link to="/complaints" className="text-decoration-none text-secondary">Shikayat Nivaran</Link></li>
              <li><Link to="/market" className="text-decoration-none text-secondary">Krishi Bazaar</Link></li>
              <li><Link to="/notices" className="text-decoration-none text-secondary">Suchna Patra</Link></li>
            </ul>
          </div>

          {/* Contact Snippet */}
          <div className="col-6 col-md-4">
            <h6 className="text-dark fw-bold mb-2 small text-uppercase">Gram Panchayat Office</h6>
            <div className="small text-muted mb-1">
              <i className="bi bi-geo-alt-fill text-danger me-1"></i> Panchayat Bhawan, Gram Rampur
            </div>
            <div className="small text-muted mb-1">
              <i className="bi bi-telephone-fill text-success me-1"></i> Helpline: 1800-180-1551 (Toll Free)
            </div>
            <div className="small text-muted">
              <i className="bi bi-clock-history me-1 text-primary"></i> Mon - Sat (10:00 AM - 05:00 PM)
            </div>
          </div>
        </div>

        <hr className="my-3" />

        {/* Bottom copyright notice */}
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center small text-muted">
          <div>
            &copy; {new Date().getFullYear()} Gram Sahayak — Rural Digital Governance Portal.
          </div>
          <div className="mt-1 mt-sm-0">
            College Mini Project &bull; Full Stack MERN
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
