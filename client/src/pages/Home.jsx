// Home page with hero banner, 4 service feature cards, village notices, and statistics
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Home component coordinates home banner, live announcements, and service shortcuts
const Home = () => {
  const [notices, setNotices] = useState([]);
  const [stats, setStats] = useState({
    schemesCount: 0,
    productsCount: 0,
    noticesCount: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch initial home page data: latest notices and counts
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        const [noticesRes, schemesRes, productsRes] = await Promise.all([
          axios.get('/api/notices'),
          axios.get('/api/schemes'),
          axios.get('/api/products')
        ]);

        setNotices(Array.isArray(noticesRes.data) ? noticesRes.data.slice(0, 4) : []);
        setStats({
          schemesCount: Array.isArray(schemesRes.data) ? schemesRes.data.length : 0,
          productsCount: Array.isArray(productsRes.data) ? productsRes.data.length : 0,
          noticesCount: Array.isArray(noticesRes.data) ? noticesRes.data.length : 0
        });
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="container py-4">
      {/* Hero Welcome Banner */}
      <div className="hero-banner p-4 p-md-5 mb-5 shadow-sm border rounded-4 text-center text-md-start bg-white">
        <div className="row align-items-center">
          <div className="col-12 col-md-8">
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-semibold mb-3">
              🌾 Digital Services Portal for Rural India
            </span>
            <h1 className="display-5 fw-bold text-dark mb-3">
              Empowering Our Village with <span className="text-primary-green">Gram Sahayak</span>
            </h1>
            <p className="lead text-secondary mb-4">
              Access government welfare schemes, report village civic issues, buy and sell fresh farm produce directly, and read official Panchayat circulars — all in one simple portal.
            </p>
            <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
              <Link to="/schemes" className="btn btn-primary px-4 py-2 rounded-pill shadow-sm">
                <i className="bi bi-journal-bookmark me-1"></i> Sarkari Yojanas
              </Link>
              <Link to="/complaints" className="btn btn-outline-danger px-4 py-2 rounded-pill shadow-sm">
                <i className="bi bi-megaphone me-1"></i> Shikayat Nivaran
              </Link>
              <Link to="/market" className="btn btn-outline-success px-4 py-2 rounded-pill shadow-sm">
                <i className="bi bi-shop me-1"></i> Krishi Bazaar
              </Link>
            </div>
          </div>
          <div className="col-12 col-md-4 mt-4 mt-md-0 text-center">
            <div className="display-1 text-primary-green opacity-75">
              🏡
            </div>
            <div className="fw-bold text-dark fs-5 mt-2">Gram Panchayat Rampur</div>
            <div className="text-muted small">Digital Citizen Assistance Center</div>
          </div>
        </div>
      </div>

      {/* 4 Core Citizen Service Cards */}
      <div className="mb-5">
        <div className="text-center mb-4">
          <h3 className="fw-bold text-dark">Primary Citizen Services (मुख्य सेवाएँ)</h3>
          <p className="text-muted small">Direct digital access to essential village and government facilities</p>
        </div>

        <div className="row g-4">
          {/* Card 1: Sarkari Yojanas */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-3 bg-white text-center">
              <div className="display-4 text-success mb-2">📋</div>
              <h5 className="fw-bold text-dark mb-2">Sarkari Yojanas</h5>
              <p className="text-muted small flex-grow-1">
                Explore farmer subsidies, housing grants, health insurance, and pension schemes.
              </p>
              <Link to="/schemes" className="btn btn-outline-success btn-sm rounded-pill mt-auto">
                Apply Now <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>

          {/* Card 2: Shikayat Nivaran */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-3 bg-white text-center">
              <div className="display-4 text-danger mb-2">📢</div>
              <h5 className="fw-bold text-dark mb-2">Shikayat Nivaran</h5>
              <p className="text-muted small flex-grow-1">
                Report broken handpumps, dark streetlights, road potholes, or drainage issues directly.
              </p>
              <Link to="/complaints" className="btn btn-outline-danger btn-sm rounded-pill mt-auto">
                File Grievance <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>

          {/* Card 3: Krishi Bazaar */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-3 bg-white text-center">
              <div className="display-4 text-warning mb-2">🌾</div>
              <h5 className="fw-bold text-dark mb-2">Krishi Bazaar</h5>
              <p className="text-muted small flex-grow-1">
                Direct farmer produce market: sell your crops or buy fresh grains, milk, and vegetables.
              </p>
              <Link to="/market" className="btn btn-outline-warning btn-sm rounded-pill mt-auto text-dark">
                View Market <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>

          {/* Card 4: Suchna Patra */}
          <div className="col-12 col-sm-6 col-lg-3">
            <div className="card h-100 border-0 shadow-sm rounded-4 p-3 bg-white text-center">
              <div className="display-4 text-info mb-2">🔔</div>
              <h5 className="fw-bold text-dark mb-2">Suchna Patra</h5>
              <p className="text-muted small flex-grow-1">
                Official village notice board: Gram Sabha dates, health camps, and water supply news.
              </p>
              <Link to="/notices" className="btn btn-outline-info btn-sm rounded-pill mt-auto">
                Read Notices <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Village Announcements */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">
                <i className="bi bi-megaphone text-danger me-2"></i> Latest Panchayat Notices
              </h5>
              <Link to="/notices" className="small text-decoration-none text-primary-green fw-semibold">
                View All <i className="bi bi-arrow-right"></i>
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-4 text-muted">Loading notices...</div>
            ) : notices.length === 0 ? (
              <div className="text-center py-4 text-muted">No notices published yet.</div>
            ) : (
              <div className="list-group list-group-flush">
                {notices.map((n) => (
                  <div key={n._id} className="list-group-item px-0 py-3 border-bottom">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="badge bg-primary-subtle text-primary text-uppercase rounded-pill small">
                        {n.type}
                      </span>
                      <small className="text-muted">
                        {new Date(n.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </small>
                    </div>
                    <h6 className="fw-bold text-dark mb-1">{n.title}</h6>
                    <p className="text-secondary small mb-0">{n.body}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Portal Summary Metrics */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
            <h5 className="fw-bold text-dark mb-4">
              <i className="bi bi-bar-chart text-success me-2"></i> Village Portal Glance
            </h5>
            <div className="d-flex flex-column gap-3">
              <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small">Welfare Schemes</div>
                  <div className="fw-bold fs-4 text-success">{stats.schemesCount} Active</div>
                </div>
                <span className="fs-2">📋</span>
              </div>

              <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small">Farm Produce Listed</div>
                  <div className="fw-bold fs-4 text-warning">{stats.productsCount} Items</div>
                </div>
                <span className="fs-2">🌾</span>
              </div>

              <div className="p-3 bg-light rounded-3 d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small">Official Announcements</div>
                  <div className="fw-bold fs-4 text-info">{stats.noticesCount} Circulars</div>
                </div>
                <span className="fs-2">🔔</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-top text-center">
              <Link to="/register" className="btn btn-outline-success btn-sm rounded-pill w-100 py-2 fw-semibold">
                Register as a Villager
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
