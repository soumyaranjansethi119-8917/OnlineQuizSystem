import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import Sidebar from '../../components/Sidebar';

const StudentProfile = () => {
  const { user, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [profileStats, setProfileStats] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  });
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const fetchFreshProfile = async () => {
      try {
        const res = await authService.getMe();
        if (res.success && res.data) {
          setName(res.data.name);
          setProfileStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load profile data', err);
      }
    };
    fetchFreshProfile();
  }, []);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!name.trim()) {
      setProfileError('Name cannot be empty');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await authService.updateProfile({ name: name.trim() });
      if (res.success && res.data) {
        updateUserProfile(res.data);
        setProfileSuccess('Profile updated successfully');
      }
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const { current_password, new_password, confirm_new_password } = passwordData;

    if (!current_password || !new_password) {
      setPasswordError('All password fields are required');
      return;
    }
    if (new_password.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    if (new_password !== confirm_new_password) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);
    try {
      await authService.changePassword(passwordData);
      setPasswordSuccess('Password changed successfully');
      setPasswordData({ current_password: '', new_password: '', confirm_new_password: '' });
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="student" />
      <div className="dashboard-content">
        <div className="mb-4">
          <h2 className="fw-bold text-dark mb-1">Student Profile</h2>
          <p className="text-muted small mb-0">Manage your student details, password credentials, and review academic statistics</p>
        </div>

        <div className="row g-4 max-w-1000">
          {/* Summary Card */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white text-center">
              <div
                className="rounded-circle bg-primary text-white fs-1 fw-bold mx-auto mb-3 d-flex align-items-center justify-content-center"
                style={{ width: '80px', height: '80px' }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <h5 className="fw-bold text-dark mb-1">{user?.name}</h5>
              <p className="text-muted small mb-3">{user?.email}</p>
              <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1.5 fw-semibold mb-4">
                <i className="bi bi-mortarboard me-1"></i> Verified Student
              </span>

              <div className="border-top pt-3 text-start small">
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Quizzes Completed</span>
                  <span className="fw-bold text-dark">{profileStats?.total_attempts || 0}</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Average Percentage</span>
                  <span className="fw-bold text-primary">{profileStats?.average_score || 0}%</span>
                </div>
                <div className="d-flex justify-content-between py-2">
                  <span className="text-muted">Highest Score</span>
                  <span className="fw-bold text-success">{profileStats?.highest_score || 0} pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Column */}
          <div className="col-lg-7">
            {/* Update Name */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
              <h5 className="fw-bold text-dark mb-3">Update Personal Details</h5>

              {profileSuccess && (
                <div className="alert alert-success d-flex align-items-center mb-3" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i> {profileSuccess}
                </div>
              )}
              {profileError && (
                <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> {profileError}
                </div>
              )}

              <form onSubmit={handleUpdateName}>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small">Full Name</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small">Email Address</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={user?.email || ''}
                    disabled
                  />
                  <div className="form-text small text-muted">Email address is permanently associated with your assessments.</div>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm"
                  disabled={profileLoading}
                >
                  {profileLoading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>

            {/* Change Password */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3">Change Security Password</h5>

              {passwordSuccess && (
                <div className="alert alert-success d-flex align-items-center mb-3" role="alert">
                  <i className="bi bi-check-circle-fill me-2"></i> {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> {passwordError}
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label fw-semibold text-secondary small">Current Password</label>
                  <input
                    type="password"
                    className="form-control bg-light"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary small">New Password</label>
                    <input
                      type="password"
                      className="form-control bg-light"
                      placeholder="Min 6 chars"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold text-secondary small">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control bg-light"
                      placeholder="Repeat new password"
                      value={passwordData.confirm_new_password}
                      onChange={(e) => setPasswordData({ ...passwordData, confirm_new_password: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-outline-danger rounded-pill px-4 py-2 fw-semibold"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
