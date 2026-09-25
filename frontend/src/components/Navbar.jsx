import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isStudent, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm py-2.5">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand d-flex align-items-center fw-bold fs-4" to="/">
          <span className="brand-badge me-2 bg-primary text-white rounded-3 px-2 py-1 fs-5">
            <i className="bi bi-mortarboard-fill"></i>
          </span>
          <span className="text-white">Quiz<span className="text-primary">Master</span></span>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0 shadow-none"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
          aria-controls="navbarMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navbarMain">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            <li className="nav-nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/about">
                About
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/contact">
                Contact
              </NavLink>
            </li>

            {/* Role-Specific Portal Shortcut in Nav */}
            {isStudent && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/student/quizzes">
                    <i className="bi bi-collection-play me-1"></i> Quizzes
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/student/leaderboard">
                    <i className="bi bi-trophy me-1"></i> Leaderboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/student/chatbot">
                    <i className="bi bi-robot me-1 text-info"></i> AI Tutor
                  </NavLink>
                </li>
              </>
            )}

            {isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/admin/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i> Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/admin/quizzes">
                    <i className="bi bi-journal-check me-1"></i> Quizzes
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={({ isActive }) => `nav-link px-3 ${isActive ? 'active text-primary fw-semibold' : ''}`} to="/admin/users">
                    <i className="bi bi-people me-1"></i> Students
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {/* User Auth Section */}
          <div className="d-flex align-items-center gap-2">
            {isAuthenticated ? (
              <div className="dropdown">
                <button
                  className="btn btn-outline-light dropdown-toggle rounded-pill px-3 py-1.5 d-flex align-items-center gap-2"
                  type="button"
                  id="userDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '0.85rem' }}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="small fw-semibold">{user?.name?.split(' ')[0] || 'User'}</span>
                  <span className={`badge ${isAdmin ? 'bg-danger' : 'bg-success'} rounded-pill`} style={{ fontSize: '0.65rem' }}>
                    {isAdmin ? 'Admin' : 'Student'}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2 rounded-3" aria-labelledby="userDropdown">
                  <li>
                    <div className="dropdown-item-text py-2 border-bottom">
                      <div className="fw-bold">{user?.name}</div>
                      <div className="small text-muted">{user?.email}</div>
                    </div>
                  </li>
                  {isAdmin ? (
                    <>
                      <li>
                        <Link className="dropdown-item py-2" to="/admin/dashboard">
                          <i className="bi bi-speedometer2 me-2 text-primary"></i> Admin Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/admin/profile">
                          <i className="bi bi-person-gear me-2 text-secondary"></i> Admin Profile
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link className="dropdown-item py-2" to="/student/dashboard">
                          <i className="bi bi-grid-1x2 me-2 text-primary"></i> Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/student/history">
                          <i className="bi bi-clock-history me-2 text-info"></i> Quiz History
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item py-2" to="/student/profile">
                          <i className="bi bi-person me-2 text-secondary"></i> My Profile
                        </Link>
                      </li>
                    </>
                  )}
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button className="dropdown-item py-2 text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i> Log Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-light rounded-pill px-3 py-1.5 fw-semibold small">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-primary rounded-pill px-3 py-1.5 fw-semibold small shadow-sm">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
