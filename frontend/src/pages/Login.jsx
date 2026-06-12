import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      await login(formData.email, formData.password);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      navigate('/dashboard');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Check for remembered email
  React.useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
      }));
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Login to your Employee Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {(formError || error) && (
            <div className="alert alert-danger">
              {formError || error}
            </div>
          )}

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
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-options">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
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
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="signup-link">
              Sign up here
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

export default Login;