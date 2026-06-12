import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.length < 3) {
      errors.name = 'Name must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!formData.email.includes('@')) {
      errors.email = 'Email must be valid';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Phone must be 10 digits';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      setIsLoading(true);
      await signup(
        formData.name,
        formData.email,
        formData.phone,
        formData.password,
        formData.confirmPassword
      );
      navigate('/dashboard');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-large">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Register as an employee</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {(formError || error) && (
            <div className="alert alert-danger">
              {formError || error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
              {fieldErrors.name && (
                <span className="error">{fieldErrors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {fieldErrors.email && (
                <span className="error">{fieldErrors.email}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              disabled={isLoading}
              maxLength="10"
            />
            {fieldErrors.phone && (
              <span className="error">{fieldErrors.phone}</span>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                disabled={isLoading}
              />
              {fieldErrors.password && (
                <span className="error">{fieldErrors.password}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
              {fieldErrors.confirmPassword && (
                <span className="error">{fieldErrors.confirmPassword}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="button-primary"
            disabled={isLoading}
            style={{ width: '100%', padding: '0.875rem' }}
          >
            {isLoading ? (
              <span className="button-loading">
                <span className="spinner-small"></span>
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="login-link">
              Login here
            </Link>
          </p>
        </div>
      </div>

      <div className="auth-info">
        <h2>EMS Dashboard</h2>
        <p>Manage your employees, leaves, and assets efficiently</p>
      </div>
    </div>
  );
};

export default Signup;