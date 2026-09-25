import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ type = 'student' }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/admin/quizzes', icon: 'bi-journal-check', label: 'Quizzes' },
    { to: '/admin/users', icon: 'bi-people', label: 'Students' },
    { to: '/admin/reports', icon: 'bi-bar-chart-line', label: 'Reports' },
    { to: '/admin/profile', icon: 'bi-person-gear', label: 'Profile' },
  ];

  const studentLinks = [
    { to: '/student/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
    { to: '/student/quizzes', icon: 'bi-collection-play', label: 'Quizzes' },
    { to: '/student/history', icon: 'bi-clock-history', label: 'History' },
    { to: '/student/leaderboard', icon: 'bi-trophy', label: 'Leaderboard' },
    { to: '/student/chatbot', icon: 'bi-robot', label: 'AI Study Assistant' },
    { to: '/student/profile', icon: 'bi-person', label: 'My Profile' },
  ];

  const links = type === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="sidebar bg-white border-end py-4 px-3 d-flex flex-column h-100 min-vh-100 shadow-sm" style={{ width: '260px' }}>
      {/* Sidebar Header Badge */}
      <div className="px-3 mb-4">
        <div className="text-uppercase fw-bold text-muted" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>
          {type === 'admin' ? 'Administrator Portal' : 'Student Portal'}
        </div>
        <div className="fw-bold text-dark fs-5 text-truncate">{user?.name || 'Portal User'}</div>
      </div>

      {/* Navigation Links */}
      <nav className="nav flex-column gap-1 flex-grow-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center rounded-3 px-3 py-2.5 fw-medium transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-secondary hover-bg-light'
              }`
            }
          >
            <i className={`bi ${link.icon} me-3 fs-5`}></i>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="border-top pt-3 mt-auto px-1">
        <button
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center rounded-pill py-2"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          <span className="fw-semibold">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
