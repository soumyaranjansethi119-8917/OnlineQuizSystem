import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Sidebar from '../../components/Sidebar';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import { SkeletonTable } from '../../components/ui/SkeletonLoader';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminService.getUsers();
        if (res.success && res.data) {
          setUsers(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load registered student users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    return (
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="admin" />
      <div className="dashboard-content">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Student Management</h2>
            <p className="text-muted small mb-0">View registered students, activity levels, and academic performance</p>
          </div>
          <div className="text-muted small">
            Total Students: <strong className="text-dark">{users.length}</strong>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Search */}
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
          <SearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Search students by name or email address..."
          />
        </div>

        {/* Users Table */}
        <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
          {loading ? (
            <SkeletonTable rows={5} cols={6} />
          ) : paginatedUsers.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-secondary small">
                    <tr>
                      <th>Student</th>
                      <th>Email Address</th>
                      <th>Quizzes Attempted</th>
                      <th>Average Score</th>
                      <th>Highest Score</th>
                      <th>Enrolled Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle bg-primary-subtle text-primary fw-bold d-flex align-items-center justify-content-center me-3 border border-primary-subtle"
                              style={{ width: '38px', height: '38px' }}
                            >
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="fw-bold text-dark">{u.name}</div>
                          </div>
                        </td>
                        <td className="text-muted small">{u.email}</td>
                        <td>
                          <span className="badge bg-light text-dark border px-2.5 py-1 fw-semibold">
                            {u.total_attempts || 0} attempts
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              (u.avg_percentage || 0) >= 70
                                ? 'bg-success-subtle text-success border border-success-subtle'
                                : (u.avg_percentage || 0) >= 50
                                ? 'bg-warning-subtle text-dark border border-warning-subtle'
                                : 'bg-danger-subtle text-danger border border-danger-subtle'
                            } px-2.5 py-1 fw-semibold`}
                          >
                            {u.avg_percentage || 0}%
                          </span>
                        </td>
                        <td>
                          <span className="fw-semibold text-dark">{u.highest_score || 0} pts</span>
                        </td>
                        <td className="text-muted small">{u.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredUsers.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          ) : (
            <EmptyState
              icon="bi-people"
              title="No Students Found"
              description={
                searchTerm
                  ? `No student records matched "${searchTerm}". Try another query.`
                  : "No registered students found in the database."
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
