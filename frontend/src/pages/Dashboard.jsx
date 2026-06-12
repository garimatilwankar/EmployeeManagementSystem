import React, { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  CalendarClock,
  Laptop,
  UserPlus,
  ClipboardList,
  Briefcase,
  FileBarChart,
  CheckCircle2,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';
import MainLayout from '../layouts/MainLayout';
import '../styles/dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
    pendingLeaves: 0,
    totalAssets: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // In a real application, you would fetch this data from your API
        // For now, we'll use mock data
        setStats({
          totalEmployees: 150,
          totalDepartments: 8,
          pendingLeaves: 12,
          totalAssets: 340,
        });
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <MainLayout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>{getGreeting()}, {user?.name}!</h1>
          <p>Welcome back to your Employee Management System</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-icon employees">
            <Users size={34} strokeWidth={2} />
            </div>
            <div className="stat-content">
              <h3>Total Employees</h3>
              <p className="stat-value">{stats.totalEmployees}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon departments">
                <Building2 size={34} strokeWidth={2} />
            </div>
            <div className="stat-content">
              <h3>Departments</h3>
              <p className="stat-value">{stats.totalDepartments}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon leaves">
  <CalendarClock size={34} strokeWidth={2} />
</div>
            <div className="stat-content">
              <h3>Pending Leaves</h3>
              <p className="stat-value">{stats.pendingLeaves}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon assets">
  <Laptop size={34} strokeWidth={2} />
</div>
            <div className="stat-content">
              <h3>Total Assets</h3>
              <p className="stat-value">{stats.totalAssets}</p>
            </div>
          </div>
        </div>

        {user?.role !== 'employee' && (
          <div className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
  <button className="action-btn">
    <UserPlus size={18} />
    <span>Add Employee</span>
  </button>

  <button className="action-btn">
    <ClipboardList size={18} />
    <span>Leave Types</span>
  </button>

  <button className="action-btn">
    <Briefcase size={18} />
    <span>Assets</span>
  </button>

  <button className="action-btn">
    <FileBarChart size={18} />
    <span>Reports</span>
  </button>
</div>
          </div>
        )}

        {user?.role === 'employee' && (
          <div className="dashboard-section">
            <h2>My Leave Balance</h2>
            <div className="leave-balance-grid">
              <div className="leave-balance-card">
                <h4>Casual Leave</h4>
                <p className="balance-value">10 / 12</p>
                <div className="balance-bar">
                  <div className="balance-used" style={{ width: '83.33%' }}></div>
                </div>
              </div>

              <div className="leave-balance-card">
                <h4>Sick Leave</h4>
                <p className="balance-value">8 / 10</p>
                <div className="balance-bar">
                  <div className="balance-used" style={{ width: '80%' }}></div>
                </div>
              </div>

              <div className="leave-balance-card">
                <h4>Earned Leave</h4>
                <p className="balance-value">12 / 15</p>
                <div className="balance-bar">
                  <div className="balance-used" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-section">
          <h2>Recent Activities</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon success">
  <CheckCircle2 size={22} />
</div>
              <div className="activity-content">
                <p className="activity-title">Leave Approved</p>
                <p className="activity-desc">Your leave request for June 15-17 has been approved</p>
                <p className="activity-time">2 hours ago</p>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon asset">
  <Laptop size={22} />
</div>
              <div className="activity-content">
                <p className="activity-title">Asset Assigned</p>
                <p className="activity-desc">Dell Laptop has been assigned to you</p>
                <p className="activity-time">1 day ago</p>
              </div>
            </div>

            <div className="activity-item">
              <div className="activity-icon profile">
  <User size={22} />
</div>
              <div className="activity-content">
                <p className="activity-title">Profile Updated</p>
                <p className="activity-desc">Your profile information has been updated</p>
                <p className="activity-time">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;