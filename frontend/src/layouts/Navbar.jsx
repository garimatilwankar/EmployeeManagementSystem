import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1 className="navbar-title">Employee Management System</h1>
      </div>

      <div className="navbar-right">
        <div className="navbar-notifications">
          <button className="notification-btn" title="Notifications">
            🔔
            <span className="notification-badge">3</span>
          </button>
        </div>

        <div className="navbar-user">
          <button
            className="user-menu-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span className="user-avatar-small">
              {user?.name?.[0] || '?'}
            </span>
            <span className="user-name">{user?.name}</span>
            <span className="dropdown-arrow">▼</span>
          </button>

          {showDropdown && (
            <div className="dropdown-menu">
              <a href="/profile" className="dropdown-item">
                👤 My Profile
              </a>
              <a href="/settings" className="dropdown-item">
                ⚙️ Settings
              </a>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item logout">
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;