import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { studentService } from '../../services/studentService';
import Loading from '../../components/Loading';
import ConfirmModal from '../../components/ConfirmModal';
import Alert from '../../components/ui/Alert';

const TakeQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(600); // in seconds
  const [totalSeconds, setTotalSeconds] = useState(600);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState('');
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [tabSwitchAlert, setTabSwitchAlert] = useState(false);

  const timerRef = useRef(null);
  const hasAutoSubmitted = useRef(false);
  const sessionKey = `quiz_session_${id}`;

  // Clean up session storage
  const clearStoredSession = useCallback(() => {
    try {
      localStorage.removeItem(sessionKey);
    } catch {
      // Ignore localStorage errors
    }
  }, [sessionKey]);

  // Submit quiz function
  const handleSubmitQuiz = useCallback(async () => {
    if (submitting || hasAutoSubmitted.current) return;
    hasAutoSubmitted.current = true;
    setSubmitting(true);
    setShowConfirmModal(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const timeTaken = Math.max(1, totalSeconds - timeLeft);

    try {
      const res = await studentService.submitQuiz({
        quiz_id: parseInt(id, 10),
        time_taken: timeTaken,
        answers: answers,
      });

      clearStoredSession();

      if (res.success && res.data?.attempt_id) {
        navigate(`/student/result/${res.data.attempt_id}`);
      } else {
        setError('Submission was evaluated but no result ID was returned.');
      }
    } catch (err) {
      setError(err.message || 'Error occurred while submitting answers');
      hasAutoSubmitted.current = false;
      setSubmitting(false);
    }
  }, [id, answers, totalSeconds, timeLeft, submitting, navigate, clearStoredSession]);

  // Load Quiz Questions & restore existing session if available
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await quizService.getQuizQuestions(id);
        if (res.success && res.data) {
          const qList = res.data.questions || [];
          if (qList.length === 0) {
            setError('This quiz has no questions available.');
            setLoading(false);
            return;
          }
          setQuiz(res.data.quiz);
          setQuestions(qList);

          const defaultDuration = (res.data.quiz?.time_limit || 10) * 60;
          setTotalSeconds(defaultDuration);

          // Check if session exists in localStorage
          let restoredTime = defaultDuration;
          try {
            const savedSessionStr = localStorage.getItem(sessionKey);
            if (savedSessionStr) {
              const saved = JSON.parse(savedSessionStr);
              if (saved && saved.quizId === id) {
                // Calculate elapsed time since start
                const now = Math.floor(Date.now() / 1000);
                const elapsed = now - (saved.startedAt || now);
                const remaining = Math.max(0, defaultDuration - elapsed);

                if (remaining > 0) {
                  restoredTime = remaining;
                  if (saved.answers) setAnswers(saved.answers);
                  if (saved.flagged) setFlaggedQuestions(new Set(saved.flagged));
                  if (typeof saved.currentIndex === 'number' && saved.currentIndex < qList.length) {
                    setCurrentIndex(saved.currentIndex);
                  }
                } else {
                  // Time already expired while away!
                  restoredTime = 0;
                }
              }
            } else {
              // Store initial start timestamp
              localStorage.setItem(
                sessionKey,
                JSON.stringify({
                  quizId: id,
                  startedAt: Math.floor(Date.now() / 1000),
                  answers: {},
                  flagged: [],
                  currentIndex: 0,
                })
              );
            }
          } catch {
            // Fallback to default
          }

          setTimeLeft(restoredTime);
        }
      } catch (err) {
        setError(err.message || 'Failed to initialize quiz session');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [id, sessionKey]);

  // Persist answers & index changes to localStorage
  useEffect(() => {
    if (loading || submitting || questions.length === 0) return;
    try {
      const existing = localStorage.getItem(sessionKey);
      const parsed = existing ? JSON.parse(existing) : { quizId: id, startedAt: Math.floor(Date.now() / 1000) };
      parsed.answers = answers;
      parsed.flagged = Array.from(flaggedQuestions);
      parsed.currentIndex = currentIndex;
      localStorage.setItem(sessionKey, JSON.stringify(parsed));
    } catch {
      // Ignore storage errors
    }
  }, [answers, flaggedQuestions, currentIndex, id, sessionKey, loading, submitting, questions.length]);

  // Timer Countdown Effect
  useEffect(() => {
    if (loading || submitting || questions.length === 0) return;

    if (timeLeft <= 0) {
      handleSubmitQuiz();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, submitting, questions.length, timeLeft, handleSubmitQuiz]);

  // Anti-Cheat: Tab Switch Detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !submitting && questions.length > 0) {
        setTabSwitchCount((prev) => {
          const nextCount = prev + 1;
          setTabSwitchAlert(true);
          return nextCount;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [submitting, questions.length]);

  // Warn user before leaving or refreshing page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submitting && questions.length > 0) {
        e.preventDefault();
        e.returnValue = 'You have an active quiz session. Are you sure you want to leave?';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [submitting, questions.length]);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <Loading message="Preparing your secure quiz session..." />
      </div>
    );
  }

  if (error && questions.length === 0) {
    return (
      <div className="container py-5">
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
        <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => navigate('/student/quizzes')}>
          Return to Quizzes
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  // Time format MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isTimeCritical = timeLeft <= 120; // Under 2 minutes

  const selectOption = (opt) => {
    if (!currentQuestion) return;
    setAnswers({
      ...answers,
      [currentQuestion.id]: opt,
    });
  };

  const clearSelection = () => {
    if (!currentQuestion) return;
    const updated = { ...answers };
    delete updated[currentQuestion.id];
    setAnswers(updated);
  };

  const toggleFlagQuestion = () => {
    if (!currentQuestion) return;
    const nextSet = new Set(flaggedQuestions);
    if (nextSet.has(currentQuestion.id)) {
      nextSet.delete(currentQuestion.id);
    } else {
      nextSet.add(currentQuestion.id);
    }
    setFlaggedQuestions(nextSet);
  };

  return (
    <div className="take-quiz-page bg-light min-vh-100 py-4">
      <div className="container">
        {/* Anti-Cheat Warning Toast Banner */}
        {tabSwitchAlert && (
          <Alert
            variant="warning"
            dismissible
            onDismiss={() => setTabSwitchAlert(false)}
            className="mb-3"
            icon={<i className="bi bi-shield-exclamation text-warning fs-4 me-2"></i>}
          >
            <strong>Proctoring Notice:</strong> Window / Tab switch detected ({tabSwitchCount} time{tabSwitchCount > 1 ? 's' : ''}). Please stay focused on the assessment.
          </Alert>
        )}

        {/* Sticky Header Bar */}
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4 sticky-top" style={{ top: '15px', zIndex: 10 }}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 mb-1">
                {quiz?.category || 'Assessment'}
              </span>
              <h5 className="fw-bold text-dark mb-0 text-truncate" style={{ maxWidth: '400px' }}>
                {quiz?.title}
              </h5>
            </div>

            {/* Timer Display & Submit Button */}
            <div className="d-flex align-items-center gap-3">
              <div
                className={`d-flex align-items-center px-3 py-1.5 rounded-pill border fw-bold ${
                  isTimeCritical
                    ? 'bg-danger-subtle text-danger border-danger timer-pulse'
                    : 'bg-light text-dark border-secondary-subtle'
                }`}
              >
                <i className={`bi ${isTimeCritical ? 'bi-exclamation-triangle-fill' : 'bi-stopwatch'} me-2 fs-5`}></i>
                <span className="timer-badge">{formatTime(timeLeft)}</span>
              </div>

              <button
                type="button"
                className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm"
                onClick={() => setShowConfirmModal(true)}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress mt-3" style={{ height: '6px' }}>
            <div
              className="progress-bar bg-primary"
              role="progressbar"
              style={{ width: `${progressPercent}%` }}
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Quiz Engine Workspace */}
        <div className="row g-4">
          {/* Main Question Display Column */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
              {/* Question Header */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-primary fw-bold">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  {flaggedQuestions.has(currentQuestion?.id) && (
                    <span className="badge bg-warning-subtle text-dark border border-warning-subtle px-2 py-0.5 small">
                      <i className="bi bi-flag-fill text-warning me-1"></i> Flagged
                    </span>
                  )}
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className={`btn btn-sm ${flaggedQuestions.has(currentQuestion?.id) ? 'btn-warning text-dark' : 'btn-outline-secondary'} rounded-pill px-3`}
                    onClick={toggleFlagQuestion}
                  >
                    <i className={`bi ${flaggedQuestions.has(currentQuestion?.id) ? 'bi-flag-fill' : 'bi-flag'} me-1`}></i>
                    {flaggedQuestions.has(currentQuestion?.id) ? 'Flagged' : 'Flag for Review'}
                  </button>
                  <span className="badge bg-light text-muted border">
                    {currentQuestion?.marks || 1} Mark{(currentQuestion?.marks || 1) > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Question Prompt */}
              <h4 className="fw-bold text-dark mb-4 lh-base">{currentQuestion?.question}</h4>

              {/* Options Selection */}
              <div className="d-flex flex-column gap-3 mb-4">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const optKey = `option_${opt.toLowerCase()}`;
                  const optText = currentQuestion?.[optKey];
                  const isSelected = answers[currentQuestion?.id] === opt;

                  return (
                    <div
                      key={opt}
                      className={`option-card d-flex align-items-center ${isSelected ? 'selected' : ''}`}
                      onClick={() => selectOption(opt)}
                    >
                      <div
                        className={`rounded-circle border d-flex align-items-center justify-content-center me-3 fw-bold ${
                          isSelected ? 'bg-primary text-white border-primary' : 'bg-light text-dark'
                        }`}
                        style={{ width: '36px', height: '36px', minWidth: '36px' }}
                      >
                        {opt}
                      </div>
                      <span className="text-dark fw-medium fs-6">{optText}</span>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Controls */}
              <div className="d-flex flex-wrap justify-content-between align-items-center pt-3 border-top gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                >
                  <i className="bi bi-chevron-left me-1"></i> Previous
                </button>

                {answers[currentQuestion?.id] && (
                  <button type="button" className="btn btn-sm btn-link text-muted text-decoration-none" onClick={clearSelection}>
                    <i className="bi bi-eraser me-1"></i> Clear Choice
                  </button>
                )}

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    className="btn btn-primary rounded-pill px-4"
                    onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  >
                    Next <i className="bi bi-chevron-right ms-1"></i>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-success rounded-pill px-4 fw-semibold"
                    onClick={() => setShowConfirmModal(true)}
                  >
                    Finish & Submit <i className="bi bi-check-lg ms-1"></i>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Palette Sidebar */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white sticky-top" style={{ top: '100px' }}>
              <h6 className="fw-bold text-dark mb-3">Question Palette</h6>

              <div className="d-flex justify-content-between text-muted small mb-3">
                <span>
                  Answered: <strong className="text-primary">{answeredCount}</strong>
                </span>
                <span>
                  Remaining: <strong className="text-secondary">{questions.length - answeredCount}</strong>
                </span>
              </div>

              {/* Palette Grid */}
              <div className="d-flex flex-wrap gap-2 mb-4">
                {questions.map((q, idx) => {
                  const isAnswered = Boolean(answers[q.id]);
                  const isCurrent = idx === currentIndex;
                  const isFlagged = flaggedQuestions.has(q.id);

                  return (
                    <button
                      key={q.id}
                      type="button"
                      className={`palette-btn ${
                        isFlagged
                          ? 'flagged'
                          : isAnswered
                          ? 'answered'
                          : 'unanswered'
                      } ${isCurrent ? 'current' : ''}`}
                      onClick={() => setCurrentIndex(idx)}
                      title={`Question ${idx + 1}${isFlagged ? ' (Flagged)' : ''}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Palette Legend */}
              <div className="border-top pt-3 small text-muted d-flex flex-column gap-1.5">
                <div className="d-flex align-items-center">
                  <div className="palette-btn answered me-2" style={{ width: '16px', height: '16px' }}></div>
                  <span>Answered</span>
                </div>
                <div className="d-flex align-items-center">
                  <div className="palette-btn unanswered me-2" style={{ width: '16px', height: '16px' }}></div>
                  <span>Unanswered</span>
                </div>
                <div className="d-flex align-items-center">
                  <div className="palette-btn flagged me-2" style={{ width: '16px', height: '16px' }}></div>
                  <span>Flagged for Review</span>
                </div>
                <div className="d-flex align-items-center">
                  <div className="palette-btn unanswered current me-2" style={{ width: '16px', height: '16px' }}></div>
                  <span>Current Question</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        show={showConfirmModal}
        title="Submit Quiz Assessment"
        message={`You have answered ${answeredCount} of ${questions.length} questions.${
          flaggedQuestions.size > 0 ? ` (${flaggedQuestions.size} question(s) marked for review)` : ''
        } Are you sure you want to submit your quiz for evaluation?`}
        confirmText="Confirm & Submit"
        confirmVariant="primary"
        onConfirm={handleSubmitQuiz}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};

export default TakeQuiz;
