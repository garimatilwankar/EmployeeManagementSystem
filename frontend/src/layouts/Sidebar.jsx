import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path) => location.pathname === path;

  // Menu items based on user role
  const getMenuItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/profile', label: 'My Profile', icon: '👤' },
    ];

    const employeeItems = [
      { path: '/leave/apply', label: 'Apply Leave', icon: '📅' },
      { path: '/leave/history', label: 'Leave History', icon: '📋' },
    ];

    const managerItems = [
      { path: '/leave/approvals', label: 'Approvals', icon: '✅' },
      { path: '/team', label: 'My Team', icon: '👥' },
    ];

    const hrItems = [
      { path: '/employees', label: 'Employees', icon: '👨‍💼' },
      { path: '/departments', label: 'Departments', icon: '🏢' },
      { path: '/skills', label: 'Skills', icon: '⭐' },
      { path: '/leave/approvals', label: 'Leave Approvals', icon: '✅' },
      { path: '/assets', label: 'Assets', icon: '🖥️' },
      { path: '/reports', label: 'Reports', icon: '📈' },
    ];

    const adminItems = [
      { path: '/employees', label: 'Employees', icon: '👨‍💼' },
      { path: '/departments', label: 'Departments', icon: '🏢' },
      { path: '/skills', label: 'Skills', icon: '⭐' },
      { path: '/leave-types', label: 'Leave Types', icon: '📅' },
      { path: '/assets', label: 'Assets', icon: '🖥️' },
      { path: '/leave/approvals', label: 'Approvals', icon: '✅' },
      { path: '/reports', label: 'Reports', icon: '📈' },
      { path: '/audit-logs', label: 'Audit Logs', icon: '🔐' },
    ];

    let items = [...baseItems];

    if (user?.role === 'employee') {
      items = [...items, ...employeeItems];
    } else if (user?.role === 'manager') {
      items = [...items, ...managerItems, ...employeeItems];
    } else if (user?.role === 'hr') {
      items = [...items, ...hrItems];
    } else if (user?.role === 'admin') {
      items = [...items, ...adminItems];
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">📊</span>
          {!isCollapsed && <span className="logo-text">EMS</span>}
        </div>
        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            title={isCollapsed ? item.label : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-label">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!isCollapsed && (
          <div className="user-info">
            <div className="user-avatar">{user?.name?.[0]}</div>
            <div className="user-details">
              <p className="user-name">{user?.name}</p>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;