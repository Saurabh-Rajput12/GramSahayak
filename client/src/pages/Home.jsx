// Home page with hero banner, latest notices carousel, feature grid, and village statistics
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Home component coordinates home banner, live announcements carousel, and quick feature shortcuts
const Home = () => {
  const [notices, setNotices] = useState([]);
  const [glanceStats, setGlanceStats] = useState({
    schemesCount: 0,
    eventsCount: 0,
    productsCount: 0,
    helplinesCount: 0
  });
  const [loading, setLoading] = useState(true);

  // Fetch initial home page data: latest notices and village count metrics
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);

        // Fetch notices and public counts concurrently
        const [noticesRes, schemesRes, eventsRes, productsRes, helplinesRes] = await Promise.all([
          axios.get('/api/notices'),
          axios.get('/api/schemes'),
          axios.get('/api/events'),
          axios.get('/api/products'),
          axios.get('/api/helplines')
        ]);

        // Keep top 5 latest notices for the carousel
        setNotices(Array.isArray(noticesRes.data) ? noticesRes.data.slice(0, 5) : []);

        setGlanceStats({
          schemesCount: Array.isArray(schemesRes.data) ? schemesRes.data.length : 0,
          eventsCount: Array.isArray(eventsRes.data) ? eventsRes.data.length : 0,
          productsCount: Array.isArray(productsRes.data) ? productsRes.data.length : 0,
          helplinesCount: Array.isArray(helplinesRes.data) ? helplinesRes.data.length : 0
        });
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Format notice date for carousel display
  const formatNoticeDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="container py-4">
      {/* Hero Welcome Banner */}
      <div className="hero-banner p-4 p-md-5 mb-5 shadow-sm border text-center text-md-start">
        <div className="row align-items-center">
          <div className="col-12 col-md-8">
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-semibold mb-3">
              🌾 Digital Services Portal for Rural India
            </span>
            <h1 className="display-5 fw-bold text-dark mb-3">
              Empowering Our Village with <span className="text-primary-green">Gram Sahayak</span>
            </h1>
            <p className="lead text-secondary mb-4">
              Access government welfare schemes, check daily mandi prices, report village maintenance issues, buy and sell farm produce, and participate in community events — all in one place.
            </p>
            <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-md-start">
              <Link to="/schemes" className="btn btn-primary px-4 py-2 rounded-pill shadow-sm">
                <i className="bi bi-journal-bookmark me-1"></i> Browse Schemes
              </Link>
              <Link to="/mandi" className="btn btn-outline-primary px-4 py-2 rounded-pill shadow-sm">
                <i className="bi bi-graph-up-arrow me-1"></i> Mandi Rates
              </Link>
              <Link to="/register" className="btn btn-outline-secondary px-4 py-2 rounded-pill">
                <i className="bi bi-person-plus me-1"></i> Register as Villager
              </Link>
            </div>
          </div>
          <div className="col-12 col-md-4 text-center mt-4 mt-md-0">
            <div className="p-4 bg-white rounded-4 shadow-sm border d-inline-block">
              <span style={{ fontSize: '5rem' }}>🏡</span>
              <h5 className="fw-bold mt-2 text-dark">Gram Panchayat</h5>
              <p className="small text-muted mb-0">Transparent & Accountable Governance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Village at a Glance Row */}
      <div className="row g-3 mb-5">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-white">
            <div className="fs-3 text-success mb-1">📜</div>
            <h3 className="fw-bold text-dark mb-0">{loading ? '...' : glanceStats.schemesCount}</h3>
            <p className="small text-muted mb-0">Welfare Schemes</p>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-white">
            <div className="fs-3 text-danger mb-1">📅</div>
            <h3 className="fw-bold text-dark mb-0">{loading ? '...' : glanceStats.eventsCount}</h3>
            <p className="small text-muted mb-0">Active Events & Camps</p>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-white">
            <div className="fs-3 text-primary mb-1">🏪</div>
            <h3 className="fw-bold text-dark mb-0">{loading ? '...' : glanceStats.productsCount}</h3>
            <p className="small text-muted mb-0">Market Produce Items</p>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 text-center bg-white">
            <div className="fs-3 text-warning mb-1">📞</div>
            <h3 className="fw-bold text-dark mb-0">{loading ? '...' : glanceStats.helplinesCount}</h3>
            <p className="small text-muted mb-0">Emergency Helplines</p>
          </div>
        </div>
      </div>

      {/* Latest Notices Carousel Section */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <span className="fs-4 me-2">📢</span>
            <h4 className="fw-bold text-dark mb-0">Latest Village Notices & Announcements</h4>
          </div>
          <Link to="/notices" className="btn btn-outline-primary btn-sm rounded-pill">
            View All Notices <i className="bi bi-arrow-right"></i>
          </Link>
        </div>

        {loading ? (
          <div className="p-5 text-center bg-white rounded-4 shadow-sm border">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading notices...</span>
            </div>
            <p className="small text-muted mt-2 mb-0">Loading recent announcements...</p>
          </div>
        ) : notices.length === 0 ? (
          <div className="p-4 text-center bg-white rounded-4 shadow-sm border text-muted">
            No public notices posted at the moment.
          </div>
        ) : (
          <div id="homeNoticeCarousel" className="carousel slide shadow-sm rounded-4 overflow-hidden" data-bs-ride="carousel">
            <div className="carousel-indicators">
              {notices.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  data-bs-target="#homeNoticeCarousel"
                  data-bs-slide-to={index}
                  className={index === 0 ? 'active' : ''}
                  aria-current={index === 0 ? 'true' : 'false'}
                  aria-label={`Slide ${index + 1}`}
                ></button>
              ))}
            </div>

            <div className="carousel-inner bg-white border">
              {notices.map((notice, index) => (
                <div key={notice._id} className={`carousel-item p-4 p-md-5 ${index === 0 ? 'active' : ''}`} style={{ minHeight: '220px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1 text-capitalize">
                      <i className="bi bi-megaphone me-1"></i> {notice.type}
                    </span>
                    <span className="small text-muted">
                      <i className="bi bi-calendar3 me-1"></i> {formatNoticeDate(notice.date)}
                    </span>
                  </div>
                  <h4 className="fw-bold text-dark mt-2 mb-2">{notice.title}</h4>
                  <p className="text-secondary small mb-4 line-clamp-3" style={{ maxWidth: '850px' }}>
                    {notice.body}
                  </p>
                  <Link to="/notices" className="btn btn-sm btn-outline-secondary rounded-pill">
                    Read Details
                  </Link>
                </div>
              ))}
            </div>

            <button className="carousel-control-prev" type="button" data-bs-target="#homeNoticeCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon bg-dark rounded-circle p-2" aria-hidden="true" style={{ opacity: 0.6 }}></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#homeNoticeCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon bg-dark rounded-circle p-2" aria-hidden="true" style={{ opacity: 0.6 }}></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        )}
      </div>

      {/* Feature Cards Navigation Grid */}
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-4">Explore Digital Services</h4>
        <div className="row g-4">
          <div className="col-12 col-sm-6 col-md-4">
            <div className="card h-100 p-4 border-0 shadow-sm rounded-4 text-center">
              <div className="fs-1 text-success mb-2">📜</div>
              <h5 className="fw-bold text-dark">Welfare Schemes</h5>
              <p className="text-muted small">Apply online for PM-KISAN, Ayushman Bharat, PMAY Housing, and pension benefits.</p>
              <Link to="/schemes" className="btn btn-outline-primary btn-sm rounded-pill mt-auto">
                Explore Schemes <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4">
            <div className="card h-100 p-4 border-0 shadow-sm rounded-4 text-center">
              <div className="fs-1 text-success mb-2">📈</div>
              <h5 className="fw-bold text-dark">Mandi Rates</h5>
              <p className="text-muted small">Live daily market prices for wheat, mustard, paddy, soybean, and cash crops across APMC mandis.</p>
              <Link to="/mandi" className="btn btn-outline-primary btn-sm rounded-pill mt-auto">
                View Crop Rates <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4">
            <div className="card h-100 p-4 border-0 shadow-sm rounded-4 text-center">
              <div className="fs-1 text-success mb-2">🏪</div>
              <h5 className="fw-bold text-dark">Rural Market</h5>
              <p className="text-muted small">Direct farmer-to-consumer marketplace for fresh vegetables, milk, honey, and handmade crafts.</p>
              <Link to="/market" className="btn btn-outline-primary btn-sm rounded-pill mt-auto">
                Visit Market <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4">
            <div className="card h-100 p-4 border-0 shadow-sm rounded-4 text-center">
              <div className="fs-1 text-warning mb-2">🛠️</div>
              <h5 className="fw-bold text-dark">Grievance Complaints</h5>
              <p className="text-muted small">File and track civic complaints for water leaks, broken street lights, and road repairs.</p>
              <Link to="/complaints" className="btn btn-outline-primary btn-sm rounded-pill mt-auto">
                File a Grievance <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4">
            <div className="card h-100 p-4 border-0 shadow-sm rounded-4 text-center">
              <div className="fs-1 text-danger mb-2">📅</div>
              <h5 className="fw-bold text-dark">Events & Health Camps</h5>
              <p className="text-muted small">Book seats for free health checkup camps, livestock vaccination drives, and farmer workshops.</p>
              <Link to="/events" className="btn btn-outline-primary btn-sm rounded-pill mt-auto">
                View Events <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-md-4">
            <div className="card h-100 p-4 border-0 shadow-sm rounded-4 text-center">
              <div className="fs-1 text-danger mb-2">📞</div>
              <h5 className="fw-bold text-dark">Emergency Helpline</h5>
              <p className="text-muted small">One-click directory for ambulance, hospital, police chowki, patwari, and electricity faults.</p>
              <Link to="/helpline" className="btn btn-outline-primary btn-sm rounded-pill mt-auto">
                View Contacts <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
