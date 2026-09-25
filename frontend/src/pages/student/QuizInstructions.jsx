import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';

const QuizInstructions = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await quizService.getQuizById(id);
        if (res.success && res.data) {
          setQuiz(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load quiz details');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar type="student" />
        <div className="dashboard-content">
          <Loading message="Loading quiz instructions..." />
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar type="student" />
        <div className="dashboard-content">
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error || 'Quiz could not be found'}
          </div>
          <Link to="/student/quizzes" className="btn btn-outline-primary rounded-pill px-4">
            Back to Available Quizzes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="student" />
      <div className="dashboard-content">
        <div className="d-flex align-items-center mb-4">
          <Link to="/student/quizzes" className="btn btn-sm btn-outline-secondary rounded-circle me-3 p-2">
            <i className="bi bi-arrow-left"></i>
          </Link>
          <div>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2.5 py-1 small fw-semibold">
              {quiz.category}
            </span>
            <h2 className="fw-bold text-dark mb-0 mt-1">{quiz.title}</h2>
          </div>
        </div>

        <div className="row g-4 max-w-1000">
          {/* Main Instructions Card */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
              <h4 className="fw-bold text-dark mb-3">Quiz Overview & Examination Rules</h4>
              <p className="text-muted mb-4">
                {quiz.description || 'Test your knowledge and evaluate your conceptual understanding under timed conditions.'}
              </p>

              <h6 className="fw-bold text-dark mb-3">Mandatory Examination Rules:</h6>
              <div className="d-flex flex-column gap-3 mb-4">
                <div className="d-flex align-items-start">
                  <div className="bg-primary-subtle text-primary rounded-circle p-2 me-3" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-check-lg"></i>
                  </div>
                  <div>
                    <div className="fw-semibold text-dark">Single Choice Selection</div>
                    <div className="text-muted small">Each question offers exactly four choices (A, B, C, D) with one correct response.</div>
                  </div>
                </div>

                <div className="d-flex align-items-start">
                  <div className="bg-warning-subtle text-warning rounded-circle p-2 me-3" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-stopwatch"></i>
                  </div>
                  <div>
                    <div className="fw-semibold text-dark">Strict Countdown Timer</div>
                    <div className="text-muted small">The test will automatically submit the exact instant the countdown timer reaches 00:00.</div>
                  </div>
                </div>

                <div className="d-flex align-items-start">
                  <div className="bg-danger-subtle text-danger rounded-circle p-2 me-3" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-shield-x"></i>
                  </div>
                  <div>
                    <div className="fw-semibold text-dark">Page Refresh Caution</div>
                    <div className="text-muted small">Do not refresh or close the browser tab during an active quiz session to avoid submission loss.</div>
                  </div>
                </div>

                <div className="d-flex align-items-start">
                  <div className="bg-info-subtle text-info rounded-circle p-2 me-3" style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="bi bi-lock-fill"></i>
                  </div>
                  <div>
                    <div className="fw-semibold text-dark">Finality of Submission</div>
                    <div className="text-muted small">Once submitted, answers cannot be edited. A detailed review and explanation section will open immediately.</div>
                  </div>
                </div>
              </div>

              {/* Acknowledgement Checkbox */}
              <div className="form-check p-3 bg-light rounded-3 mb-4">
                <input
                  className="form-check-input ms-0 me-2"
                  type="checkbox"
                  id="acknowledgeCheck"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                />
                <label className="form-check-label small fw-medium text-secondary" htmlFor="acknowledgeCheck">
                  I have read and agree to follow all examination rules. I am ready to begin the timed quiz.
                </label>
              </div>

              <div className="d-flex gap-3">
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-5 py-2.5 fw-bold shadow-sm"
                  disabled={!acknowledged}
                  onClick={() => navigate(`/student/quizzes/${id}/start`)}
                >
                  <i className="bi bi-play-circle-fill me-2"></i> START QUIZ
                </button>
                <Link to="/student/quizzes" className="btn btn-outline-secondary rounded-pill px-4 py-2.5">
                  Cancel
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Details Sidebar Card */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-bold text-dark mb-3">Quiz Summary</h5>
              <div className="d-flex flex-column gap-3 small">
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Total Questions:</span>
                  <span className="fw-bold text-dark">{quiz.total_questions || 0} Questions</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Allocated Time:</span>
                  <span className="fw-bold text-dark">{quiz.time_limit} Minutes</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Total Marks:</span>
                  <span className="fw-bold text-dark">{quiz.total_marks || quiz.total_questions || 0} Marks</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted">Difficulty Level:</span>
                  <span className="fw-bold text-dark text-capitalize">{quiz.difficulty}</span>
                </div>
                <div className="d-flex justify-content-between py-2">
                  <span className="text-muted">Passing Requirement:</span>
                  <span className="fw-bold text-success">50% Score</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizInstructions;
