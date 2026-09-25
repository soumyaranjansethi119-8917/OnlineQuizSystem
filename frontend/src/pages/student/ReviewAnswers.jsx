import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';

const ReviewAnswers = () => {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviewData = async () => {
      try {
        const res = await studentService.getAttemptDetail(attemptId);
        if (res.success && res.data) {
          setAttempt(res.data.attempt);
          setQuestions(res.data.questions || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load answer review');
      } finally {
        setLoading(false);
      }
    };
    fetchReviewData();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar type="student" />
        <div className="dashboard-content">
          <Loading message="Loading answer review..." />
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar type="student" />
        <div className="dashboard-content">
          <div className="alert alert-danger" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error || 'Review data not found'}
          </div>
          <Link to="/student/history" className="btn btn-outline-primary rounded-pill px-4">
            Back to Quiz History
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="student" />
      <div className="dashboard-content">
        {/* Header Breadcrumb */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div className="d-flex align-items-center">
            <Link to={`/student/result/${attemptId}`} className="btn btn-sm btn-outline-secondary rounded-circle me-3 p-2">
              <i className="bi bi-arrow-left"></i>
            </Link>
            <div>
              <h2 className="fw-bold text-dark mb-1">Answer Review</h2>
              <p className="text-muted small mb-0">
                {attempt.quiz_title} • Score: <strong>{attempt.score}/{attempt.total_marks} ({attempt.percentage}%)</strong>
              </p>
            </div>
          </div>

          <div className="d-flex gap-2 mt-3 mt-md-0">
            <Link to={`/student/result/${attemptId}`} className="btn btn-outline-secondary rounded-pill px-3">
              View Result Summary
            </Link>
            <Link to="/student/dashboard" className="btn btn-primary rounded-pill px-3">
              Dashboard
            </Link>
          </div>
        </div>

        {/* Questions Review List */}
        <div className="d-flex flex-column gap-4 max-w-1000">
          {questions.map((q, idx) => {
            const isCorrect = q.is_correct === 1;
            const isUnanswered = q.selected_answer === null || q.selected_answer === '';
            const correctOptKey = `option_${(q.correct_answer || '').toLowerCase()}`;
            const correctOptText = q[correctOptKey] || q.correct_answer;

            const selectedOptKey = q.selected_answer ? `option_${q.selected_answer.toLowerCase()}` : '';
            const selectedOptText = selectedOptKey ? q[selectedOptKey] : 'No answer selected';

            return (
              <div
                key={q.question_id || idx}
                className={`card border-0 shadow-sm rounded-4 p-4 bg-white ${
                  isCorrect
                    ? 'review-card-correct'
                    : isUnanswered
                    ? 'review-card-unanswered'
                    : 'review-card-wrong'
                }`}
              >
                {/* Question Header & Status Badge */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold text-muted small">Question {idx + 1}</span>
                  <div>
                    {isCorrect ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1.5 fw-semibold">
                        <i className="bi bi-check-circle-fill me-1"></i> Correct (+{q.marks || 1} mark)
                      </span>
                    ) : isUnanswered ? (
                      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-1.5 fw-semibold">
                        <i className="bi bi-dash-circle-fill me-1"></i> Unanswered (0 marks)
                      </span>
                    ) : (
                      <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-1.5 fw-semibold">
                        <i className="bi bi-x-circle-fill me-1"></i> Incorrect (0 marks)
                      </span>
                    )}
                  </div>
                </div>

                <h5 className="fw-bold text-dark mb-4">{q.question}</h5>

                {/* Options Breakdown */}
                <div className="row g-2 mb-4">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const optKey = `option_${opt.toLowerCase()}`;
                    const optText = q[optKey];
                    const isSelected = q.selected_answer === opt;
                    const isTheCorrectKey = q.correct_answer === opt;

                    let optClass = 'bg-light border text-secondary';
                    if (isTheCorrectKey) {
                      optClass = 'bg-success-subtle border-success text-success-emphasis fw-bold';
                    } else if (isSelected && !isCorrect) {
                      optClass = 'bg-danger-subtle border-danger text-danger-emphasis fw-bold';
                    }

                    return (
                      <div key={opt} className="col-md-6">
                        <div className={`p-3 rounded-3 small d-flex justify-content-between align-items-center ${optClass}`}>
                          <div>
                            <span className="fw-bold me-2">{opt})</span>
                            {optText}
                          </div>
                          <div>
                            {isTheCorrectKey && (
                              <span className="badge bg-success rounded-pill px-2 py-1 small">
                                ✓ Correct Answer
                              </span>
                            )}
                            {isSelected && !isTheCorrectKey && (
                              <span className="badge bg-danger rounded-pill px-2 py-1 small">
                                ✗ Your Choice
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Summary Comparison Box */}
                <div className="p-3 rounded-3 bg-light border small">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <span className="text-muted">Your Answer: </span>
                      <strong className={isCorrect ? 'text-success' : isUnanswered ? 'text-warning' : 'text-danger'}>
                        {q.selected_answer ? `${q.selected_answer}) ${selectedOptText}` : 'Unanswered (None)'}
                      </strong>
                    </div>
                    <div className="col-md-6">
                      <span className="text-muted">Correct Answer: </span>
                      <strong className="text-success">
                        {q.correct_answer}) {correctOptText}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewAnswers;
