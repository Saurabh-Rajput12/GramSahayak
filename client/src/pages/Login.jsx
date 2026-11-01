// Login page allowing registered villagers and Panchayat administrators to authenticate
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AlertMessage from '../components/AlertMessage';
import FormInput from '../components/FormInput';

// Login component handles user authentication with client-side and server-side validation
const Login = () => {
  const navigate = useNavigate();

  // Form input states
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // Validation and status states
  const [errors, setErrors] = useState({});
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Update form inputs on change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setErrorMessage('');
  };

  // Perform client-side validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Please enter your username';
    }
    if (!formData.password) {
      newErrors.password = 'Please enter your password';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission and authentication request
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidated(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', {
        username: formData.username.trim(),
        password: formData.password
      });

      const { token, user } = response.data;

      // Save token and user details to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setSuccessMessage('Login successful! Redirecting to dashboard...');

      // Redirect based on user role
      setTimeout(() => {
        if (user.role === 'panchayat') {
          navigate('/reports');
        } else {
          navigate('/dashboard');
        }
      }, 700);
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Unable to connect to the server. Please check your network.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5">
            {/* Header Title */}
            <div className="text-center mb-4">
              <span className="fs-1">🌾</span>
              <h3 className="fw-bold text-dark mt-2 mb-1">Welcome Back</h3>
              <p className="text-muted small">Sign in to your Gram Sahayak account</p>
            </div>

            {/* Error and Success Alerts */}
            <AlertMessage type="danger" message={errorMessage} onClose={() => setErrorMessage('')} />
            <AlertMessage type="success" message={successMessage} />

            {/* Login Form */}
            <form onSubmit={handleSubmit} className={`needs-validation ${validated ? 'was-validated' : ''}`} noValidate>
              <FormInput
                label="Username"
                name="username"
                type="text"
                placeholder="e.g. ramesh_kumar"
                value={formData.username}
                onChange={handleChange}
                required
                error={errors.username}
                helperText="Enter your registered username"
              />

              <FormInput
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your account password"
                value={formData.password}
                onChange={handleChange}
                required
                error={errors.password}
              />

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 rounded-3 mt-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Logging in...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right"></i>
                    <span>Log In</span>
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials Box */}
            <div className="bg-light p-3 rounded-3 mt-4 small border">
              <div className="fw-semibold text-muted mb-1"><i className="bi bi-info-circle me-1"></i> Demo Test Accounts:</div>
              <div className="text-secondary"><strong>Villager:</strong> <code>ramesh_kumar</code> / <code>password123</code></div>
              <div className="text-secondary"><strong>Panchayat:</strong> <code>panchayat_admin</code> / <code>password123</code></div>
            </div>

            {/* Footer link to register */}
            <div className="text-center mt-4 small text-muted">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-primary-green fw-semibold text-decoration-none">
                Register as a Villager
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
