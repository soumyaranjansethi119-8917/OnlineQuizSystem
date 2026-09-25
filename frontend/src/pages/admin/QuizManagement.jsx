import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Sidebar from '../../components/Sidebar';
import ConfirmModal from '../../components/ConfirmModal';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import { SkeletonTable } from '../../components/ui/SkeletonLoader';

const QuizManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Delete modal state
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const res = await adminService.getQuizzes();
      if (res.success && res.data) {
        setQuizzes(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleToggleStatus = async (quizId, currentStatus) => {
    const nextStatus = currentStatus === 'published' ? 'inactive' : 'published';
    try {
      await adminService.toggleQuizStatus(quizId, nextStatus);
      setSuccess(`Quiz status changed to ${nextStatus}`);
      fetchQuizzes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update quiz status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const confirmDelete = (quiz) => {
    setQuizToDelete(quiz);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!quizToDelete) return;
    try {
      await adminService.deleteQuiz(quizToDelete.id);
      setSuccess(`Quiz "${quizToDelete.title}" deleted successfully`);
      setShowDeleteModal(false);
      setQuizToDelete(null);
      fetchQuizzes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete quiz');
      setShowDeleteModal(false);
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      (q.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (q.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage);
  const paginatedQuizzes = filteredQuizzes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="admin" />
      <div className="dashboard-content">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Quiz Management</h2>
            <p className="text-muted small mb-0">Create, edit, organize questions, and control publication status</p>
          </div>
          <div className="mt-3 mt-md-0">
            <Link to="/admin/quizzes/add" className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm">
              <i className="bi bi-plus-lg me-2"></i> Add New Quiz
            </Link>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <Alert variant="success" className="mb-4" dismissible onDismiss={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert variant="danger" className="mb-4" dismissible onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Search & Filters */}
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
          <div className="row g-3">
            <div className="col-md-8">
              <SearchBar
                value={searchTerm}
                onChange={(val) => {
                  setSearchTerm(val);
                  setCurrentPage(1);
                }}
                placeholder="Search quizzes by title or category..."
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select bg-light"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                aria-label="Filter quizzes by status"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quizzes Table */}
        <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
          {loading ? (
            <SkeletonTable rows={5} cols={8} />
          ) : paginatedQuizzes.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-secondary small">
                    <tr>
                      <th>Quiz Title</th>
                      <th>Category</th>
                      <th>Difficulty</th>
                      <th>Questions</th>
                      <th>Time Limit</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedQuizzes.map((quiz) => (
                      <tr key={quiz.id}>
                        <td>
                          <div className="fw-bold text-dark">{quiz.title}</div>
                          <div className="text-muted small text-truncate" style={{ maxWidth: '240px' }}>
                            {quiz.description || 'No description'}
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-light text-dark border px-2.5 py-1">{quiz.category}</span>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              quiz.difficulty === 'easy'
                                ? 'bg-success-subtle text-success'
                                : quiz.difficulty === 'hard'
                                ? 'bg-danger-subtle text-danger'
                                : 'bg-warning-subtle text-dark'
                            } px-2.5 py-1 fw-semibold`}
                          >
                            {quiz.difficulty}
                          </span>
                        </td>
                        <td>
                          <span className="fw-semibold text-dark">{quiz.total_questions || 0}</span>
                        </td>
                        <td className="text-secondary small">{quiz.time_limit} mins</td>
                        <td>
                          <span
                            className={`badge ${
                              quiz.status === 'published'
                                ? 'bg-success'
                                : quiz.status === 'draft'
                                ? 'bg-secondary'
                                : 'bg-danger'
                            } px-2.5 py-1`}
                          >
                            {quiz.status}
                          </span>
                        </td>
                        <td className="text-muted small">{quiz.created_at}</td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <Link
                              to={`/admin/quizzes/${quiz.id}/questions`}
                              className="btn btn-outline-primary"
                              title="Manage Questions"
                            >
                              <i className="bi bi-list-check me-1"></i> Questions
                            </Link>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              title={quiz.status === 'published' ? 'Unpublish' : 'Publish'}
                              onClick={() => handleToggleStatus(quiz.id, quiz.status)}
                            >
                              <i className={`bi ${quiz.status === 'published' ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                            <Link
                              to={`/admin/quizzes/edit/${quiz.id}`}
                              className="btn btn-outline-secondary"
                              title="Edit Quiz"
                            >
                              <i className="bi bi-pencil"></i>
                            </Link>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              title="Delete Quiz"
                              onClick={() => confirmDelete(quiz)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredQuizzes.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          ) : (
            <EmptyState
              icon="bi-journal-x"
              title="No Quizzes Found"
              description={
                searchTerm || statusFilter !== 'all'
                  ? 'No quizzes match your filter criteria.'
                  : 'Get started by creating your first quiz assessment.'
              }
              action={
                searchTerm || statusFilter !== 'all' ? (
                  <button
                    className="btn btn-outline-primary rounded-pill px-4"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                    }}
                  >
                    Reset Filters
                  </button>
                ) : (
                  <Link to="/admin/quizzes/add" className="btn btn-primary rounded-pill px-4">
                    Create New Quiz
                  </Link>
                )
              }
            />
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        title="Delete Quiz Assessment"
        message={`Are you sure you want to delete "${quizToDelete?.title}"? All associated questions and student attempt records will be permanently removed.`}
        confirmText="Yes, Delete Quiz"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default QuizManagement;
