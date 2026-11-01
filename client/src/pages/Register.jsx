// Register page allowing villagers to create a new portal account
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AlertMessage from '../components/AlertMessage';
import FormInput from '../components/FormInput';

// Register component manages new villager registration with form validation
const Register = () => {
  const navigate = useNavigate();

  // Form input states
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  // Validation and status states
  const [errors, setErrors] = useState({});
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Update input values
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setErrorMessage('');
  };

  // Perform form validation before API dispatch
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters long';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Dispatch registration request to backend
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
      const response = await axios.post('/api/auth/register', {
        name: formData.name.trim(),
        username: formData.username.trim(),
        password: formData.password
      });

      const { token, user } = response.data;

      // Persist authentication token in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setSuccessMessage('Registration successful! Setting up your portal access...');

      // Redirect to villager dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 700);
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Failed to connect to the server. Please check your network.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <div className="card shadow-sm border-0 rounded-4 p-4 p-md-5">
            {/* Header Title */}
            <div className="text-center mb-4">
              <span className="fs-1">🌾</span>
              <h3 className="fw-bold text-dark mt-2 mb-1">Villager Registration</h3>
              <p className="text-muted small">Create your digital citizen account for village services</p>
            </div>

            {/* Error and Success Alerts */}
            <AlertMessage type="danger" message={errorMessage} onClose={() => setErrorMessage('')} />
            <AlertMessage type="success" message={successMessage} />

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className={`needs-validation ${validated ? 'was-validated' : ''}`} noValidate>
              <FormInput
                label="Full Name"
                name="name"
                type="text"
                placeholder="e.g. Ramesh Kumar Patel"
                value={formData.name}
                onChange={handleChange}
                required
                error={errors.name}
                helperText="Enter your name as per Aadhaar / Ration card"
              />

              <FormInput
                label="Username"
                name="username"
                type="text"
                placeholder="e.g. ramesh_patel"
                value={formData.username}
                onChange={handleChange}
                required
                error={errors.username}
                helperText="Choose a unique username without spaces"
              />

              <div className="row g-2">
                <div className="col-12 col-md-6">
                  <FormInput
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    error={errors.password}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <FormInput
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    error={errors.confirmPassword}
                  />
                </div>
              </div>

              <div className="form-text small text-muted mb-3">
                <i className="bi bi-shield-lock me-1"></i> Passwords are encrypted with bcrypt for privacy.
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 rounded-3 mt-2 shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-check"></i>
                    <span>Register Account</span>
                  </>
                )}
              </button>
            </form>

            {/* Link back to login */}
            <div className="text-center mt-4 small text-muted">
              Already registered?{' '}
              <Link to="/login" className="text-primary-green fw-semibold text-decoration-none">
                Log In to your Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
