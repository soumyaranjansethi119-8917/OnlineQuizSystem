import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';

const EditQuestion = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const quizIdParam = searchParams.get('quiz_id');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    marks: 1,
    quiz_id: null,
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await adminService.getQuestionById(id);
        if (res.success && res.data) {
          setFormData({
            question: res.data.question || '',
            option_a: res.data.option_a || '',
            option_b: res.data.option_b || '',
            option_c: res.data.option_c || '',
            option_d: res.data.option_d || '',
            correct_answer: res.data.correct_answer || 'A',
            marks: res.data.marks || 1,
            quiz_id: res.data.quiz_id,
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load question details');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchQuestion();
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

    if (!formData.question.trim()) {
      setError('Question text is required');
      return;
    }
    if (!formData.option_a.trim() || !formData.option_b.trim() || !formData.option_c.trim() || !formData.option_d.trim()) {
      setError('All 4 options (A, B, C, and D) are required');
      return;
    }

    setLoading(true);
    try {
      await adminService.updateQuestion(id, {
        ...formData,
        marks: parseInt(formData.marks, 10) || 1,
      });
      const targetQuizId = formData.quiz_id || quizIdParam;
      if (targetQuizId) {
        navigate(`/admin/quizzes/${targetQuizId}/questions`);
      } else {
        navigate('/admin/quizzes');
      }
    } catch (err) {
      setError(err.message || 'Failed to update question');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar type="admin" />
        <div className="dashboard-content">
          <Loading message="Loading question details..." />
        </div>
      </div>
    );
  }

  const backUrl = (formData.quiz_id || quizIdParam)
    ? `/admin/quizzes/${formData.quiz_id || quizIdParam}/questions`
    : '/admin/quizzes';

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="admin" />
      <div className="dashboard-content">
        <div className="d-flex align-items-center mb-4">
          <Link to={backUrl} className="btn btn-sm btn-outline-secondary rounded-circle me-3 p-2">
            <i className="bi bi-arrow-left"></i>
          </Link>
          <div>
            <h2 className="fw-bold text-dark mb-1">Edit Question #{id}</h2>
            <p className="text-muted small mb-0">Modify question prompt, answer choices, or the correct answer key</p>
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
            <div className="mb-4">
              <label className="form-label fw-semibold text-secondary small">Question Prompt *</label>
              <textarea
                name="question"
                className="form-control bg-light"
                rows="3"
                value={formData.question}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Option A *</label>
                <input
                  type="text"
                  name="option_a"
                  className="form-control bg-light"
                  value={formData.option_a}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Option B *</label>
                <input
                  type="text"
                  name="option_b"
                  className="form-control bg-light"
                  value={formData.option_b}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Option C *</label>
                <input
                  type="text"
                  name="option_c"
                  className="form-control bg-light"
                  value={formData.option_c}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Option D *</label>
                <input
                  type="text"
                  name="option_d"
                  className="form-control bg-light"
                  value={formData.option_d}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Correct Answer Key *</label>
                <select
                  name="correct_answer"
                  className="form-select bg-light text-success fw-bold"
                  value={formData.correct_answer}
                  onChange={handleChange}
                  required
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Marks Awarded</label>
                <input
                  type="number"
                  name="marks"
                  className="form-control bg-light"
                  min="1"
                  max="10"
                  value={formData.marks}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4 py-2.5 fw-semibold shadow-sm"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Question Changes'}
              </button>
              <Link to={backUrl} className="btn btn-outline-secondary rounded-pill px-4 py-2.5">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditQuestion;
