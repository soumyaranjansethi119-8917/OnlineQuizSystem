import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Sidebar from '../../components/Sidebar';

const AddQuestion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryQuizId = searchParams.get('quiz_id') || '';

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState(queryQuizId);
  const [formData, setFormData] = useState({
    question: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A',
    marks: 1,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        const res = await adminService.getQuizzes();
        if (res.success && res.data) {
          setQuizzes(res.data);
          if (!selectedQuizId && res.data.length > 0) {
            setSelectedQuizId(String(res.data[0].id));
          }
        }
      } catch (err) {
        console.error('Failed to load quiz list', err);
      }
    };
    loadQuizzes();
  }, [selectedQuizId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedQuizId) {
      setError('Please select a target quiz');
      return;
    }
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
      await adminService.addQuestion(selectedQuizId, {
        ...formData,
        marks: parseInt(formData.marks, 10) || 1,
      });
      // Redirect back to question list for this quiz
      navigate(`/admin/quizzes/${selectedQuizId}/questions`);
    } catch (err) {
      setError(err.message || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="admin" />
      <div className="dashboard-content">
        <div className="d-flex align-items-center mb-4">
          <Link
            to={selectedQuizId ? `/admin/quizzes/${selectedQuizId}/questions` : '/admin/quizzes'}
            className="btn btn-sm btn-outline-secondary rounded-circle me-3 p-2"
          >
            <i className="bi bi-arrow-left"></i>
          </Link>
          <div>
            <h2 className="fw-bold text-dark mb-1">Add Question</h2>
            <p className="text-muted small mb-0">Compose a question, provide 4 choices, and specify the correct answer</p>
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
            {/* Select Quiz */}
            <div className="mb-4">
              <label className="form-label fw-semibold text-secondary small">Target Quiz *</label>
              <select
                className="form-select bg-light"
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                required
              >
                <option value="">-- Choose Quiz --</option>
                {quizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title} ({q.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Question Text */}
            <div className="mb-4">
              <label className="form-label fw-semibold text-secondary small">Question Prompt *</label>
              <textarea
                name="question"
                className="form-control bg-light"
                rows="3"
                placeholder="Type the question clearly..."
                value={formData.question}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {/* Options A-D */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label fw-semibold text-secondary small">Option A *</label>
                <input
                  type="text"
                  name="option_a"
                  className="form-control bg-light"
                  placeholder="First option choice"
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
                  placeholder="Second option choice"
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
                  placeholder="Third option choice"
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
                  placeholder="Fourth option choice"
                  value={formData.option_d}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Correct Option and Marks */}
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
                <div className="form-text small text-muted">This correct key is encrypted and never sent to students before quiz submission.</div>
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
                {loading ? 'Adding Question...' : 'Save Question'}
              </button>
              <Link
                to={selectedQuizId ? `/admin/quizzes/${selectedQuizId}/questions` : '/admin/quizzes'}
                className="btn btn-outline-secondary rounded-pill px-4 py-2.5"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddQuestion;
