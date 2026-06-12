import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const ForgotPassword = () => {
  const { forgotPassword, error, clearError } = useAuth();
  const [step, setStep] = useState('email'); // email, otp, reset
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!email) {
      setFormError('Please enter your email');
      return;
    }

    try {
      setIsLoading(true);
      await forgotPassword(email);
      setStep('reset');
      setSuccessMessage('Password reset link has been sent to your email');
    } catch (err) {
      setFormError(
        err.response?.data?.message || 'Failed to send reset email'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters');
      return;
    }

    try {
      setIsLoading(true);
      // In production, call resetPassword API
      setStep('success');
      setSuccessMessage('Password reset successfully. You can now login.');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="success-icon">✓</div>
            <h1>Password Reset Successful</h1>
            <p>Your password has been reset successfully</p>
          </div>

          <div className="success-message">
            <p>You can now login with your new password</p>
          </div>

          <Link to="/login" className="button-primary" style={{ display: 'block', textAlign: 'center', padding: '0.875rem' }}>
            Back to Login
          </Link>
        </div>

        <div className="auth-info">
          <h2>EMS Dashboard</h2>
          <p>Manage your employees, leaves, and assets efficiently</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Enter your email to reset your password</p>
        </div>

        {step === 'email' && (
          <form onSubmit={handleRequestReset} className="auth-form">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                disabled={isLoading}
                required
              />
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
                  Sending...
                </span>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="auth-form">
            {(formError || error) && (
              <div className="alert alert-danger">
                {formError || error}
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success">
                {successMessage}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={isLoading}
                required
              />
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
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
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

export default ForgotPassword;