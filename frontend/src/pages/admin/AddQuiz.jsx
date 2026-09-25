import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Sidebar from '../../components/Sidebar';

const AddQuiz = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'medium',
    time_limit: 10,
    status: 'published',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Quiz title is required');
      return;
    }
    if (!formData.category.trim()) {
      setError('Quiz category is required');
      return;
    }
    if (formData.time_limit <= 0) {
      setError('Time limit must be at least 1 minute');
      return;
    }

    setLoading(true);
    try {
      const res = await adminService.createQuiz({
        ...formData,
        time_limit: parseInt(formData.time_limit, 10),
      });

      if (res.success && res.data?.id) {
        // Redirect to adding questions for the newly created quiz
        navigate(`/admin/quizzes/${res.data.id}/questions?created=1`);
      } else {
        navigate('/admin/quizzes');
      }
    } catch (err) {
      setError(err.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="admin" />
      <div className="dashboard-content">
        <div className="d-flex align-items-center mb-4">
          <Link to="/admin/quizzes" className="btn btn-sm btn-outline-secondary rounded-circle me-3 p-2">
            <i className="bi bi-arrow-left"></i>
          </Link>
          <div>
            <h2 className="fw-bold text-dark mb-1">Create New Quiz</h2>
            <p className="text-muted small mb-0">Set up quiz details, duration, category, and publication status</p>
          </div>
        </div>

        <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white max-w-800">
          {error && (
            <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Quiz Title *</label>
              <input
                type="text"
                name="title"
                className="form-control bg-light"
                placeholder="e.g. Python Object-Oriented Programming"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold text-secondary small">Description</label>
              <textarea
                name="description"
                className="form-control bg-light"
                rows="3"
                placeholder="Brief summary of what concepts this quiz tests..."
                value={formData.description}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Category *</label>
                <input
                  type="text"
                  name="category"
                  className="form-control bg-light"
                  placeholder="e.g. Python, DBMS, Web Development, Algorithms"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Difficulty</label>
                <select
                  name="difficulty"
                  className="form-select bg-light"
                  value={formData.difficulty}
                  onChange={handleChange}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Time Limit (Minutes) *</label>
                <input
                  type="number"
                  name="time_limit"
                  className="form-control bg-light"
                  min="1"
                  max="180"
                  value={formData.time_limit}
                  onChange={handleChange}
                  required
                />
                <div className="form-text small text-muted">Auto-submits when this duration elapses.</div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Publication Status</label>
                <select
                  name="status"
                  className="form-select bg-light"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="published">Published (Visible to Students)</option>
                  <option value="draft">Draft (Hidden from Students)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4 py-2.5 fw-semibold shadow-sm"
                disabled={loading}
              >
                {loading ? 'Creating Quiz...' : 'Create Quiz & Add Questions'}
              </button>
              <Link to="/admin/quizzes" className="btn btn-outline-secondary rounded-pill px-4 py-2.5">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddQuiz;
