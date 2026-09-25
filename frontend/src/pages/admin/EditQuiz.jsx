import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';

const EditQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'medium',
    time_limit: 10,
    status: 'published',
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await adminService.getQuizById(id);
        if (res.success && res.data) {
          setFormData({
            title: res.data.title || '',
            description: res.data.description || '',
            category: res.data.category || '',
            difficulty: res.data.difficulty || 'medium',
            time_limit: res.data.time_limit || 10,
            status: res.data.status || 'published',
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load quiz details');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

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

    setLoading(true);
    try {
      await adminService.updateQuiz(id, {
        ...formData,
        time_limit: parseInt(formData.time_limit, 10),
      });
      navigate('/admin/quizzes');
    } catch (err) {
      setError(err.message || 'Failed to update quiz');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar type="admin" />
        <div className="dashboard-content">
          <Loading message="Loading quiz details..." />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="admin" />
      <div className="dashboard-content">
        <div className="d-flex align-items-center mb-4">
          <Link to="/admin/quizzes" className="btn btn-sm btn-outline-secondary rounded-circle me-3 p-2">
            <i className="bi bi-arrow-left"></i>
          </Link>
          <div>
            <h2 className="fw-bold text-dark mb-1">Edit Quiz #{id}</h2>
            <p className="text-muted small mb-0">Update metadata, duration, or visibility status</p>
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
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Publication Status</label>
                <select
                  name="status"
                  className="form-select bg-light"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
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
                {loading ? 'Saving Changes...' : 'Save Changes'}
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

export default EditQuiz;
