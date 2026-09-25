import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(...registerables);

const QuizResult = () => {
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await studentService.getAttemptDetail(attemptId);
        if (res.success && res.data) {
          setAttempt(res.data.attempt);
        }
      } catch (err) {
        setError(err.message || 'Failed to load attempt result');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar type="student" />
        <div className="dashboard-content">
          <Loading message="Evaluating submission and generating result report..." />
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
            <i className="bi bi-exclamation-triangle-fill me-2"></i> {error || 'Attempt result not found'}
          </div>
          <Link to="/student/dashboard" className="btn btn-outline-primary rounded-pill px-4">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const passed = attempt.percentage >= 50.0;
  const timeMin = Math.floor((attempt.time_taken || 0) / 60);
  const timeSec = (attempt.time_taken || 0) % 60;
  const timeFormatted = `${timeMin}m ${timeSec.toString().padStart(2, '0')}s`;

  // Chart Data: Correct vs Wrong vs Unanswered
  const chartData = {
    labels: ['Correct', 'Wrong', 'Unanswered'],
    datasets: [
      {
        data: [attempt.correct_answers, attempt.wrong_answers, attempt.unanswered],
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="student" />
      <div className="dashboard-content">
        <div className="text-center max-w-800 mx-auto">
          {/* Result Card */}
          <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-4">
            <div
              className={`rounded-circle d-inline-flex align-items-center justify-content-center p-3 mb-3 ${
                passed ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'
              }`}
              style={{ width: '80px', height: '80px' }}
            >
              <i className={`bi ${passed ? 'bi-trophy-fill' : 'bi-x-circle-fill'} fs-1`}></i>
            </div>

            <h2 className="fw-bold text-dark mb-1">
              {passed ? 'Quiz Passed! Excellent Work!' : 'Quiz Completed - Keep Practicing!'}
            </h2>
            <p className="text-muted small mb-4">
              Results for: <strong className="text-dark">{attempt.quiz_title}</strong> ({attempt.category})
            </p>

            {/* Big Score Stats Banner */}
            <div className="p-4 rounded-4 bg-light mb-4">
              <div className="row g-3 text-center align-items-center">
                <div className="col-md-4 border-end">
                  <div className="text-muted small">Score Achieved</div>
                  <div className="display-6 fw-bold text-primary">
                    {attempt.score} <span className="fs-5 text-muted">/ {attempt.total_marks}</span>
                  </div>
                </div>
                <div className="col-md-4 border-end">
                  <div className="text-muted small">Percentage</div>
                  <div className={`display-6 fw-bold ${passed ? 'text-success' : 'text-danger'}`}>
                    {attempt.percentage}%
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="text-muted small">Time Taken</div>
                  <div className="display-6 fw-bold text-dark">{timeFormatted}</div>
                </div>
              </div>
            </div>

            {/* Chart and Detail Row */}
            <div className="row g-4 align-items-center mb-4 text-start">
              <div className="col-md-6 d-flex justify-content-center">
                <div style={{ width: '220px', height: '220px' }}>
                  <Doughnut
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <div className="d-flex flex-column gap-3">
                  <div className="p-3 rounded-3 bg-success-subtle text-success-emphasis border border-success-subtle d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-check-circle-fill me-2"></i> Correct Answers
                    </div>
                    <span className="fw-bold fs-5">{attempt.correct_answers}</span>
                  </div>

                  <div className="p-3 rounded-3 bg-danger-subtle text-danger-emphasis border border-danger-subtle d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-x-circle-fill me-2"></i> Incorrect Answers
                    </div>
                    <span className="fw-bold fs-5">{attempt.wrong_answers}</span>
                  </div>

                  <div className="p-3 rounded-3 bg-warning-subtle text-warning-emphasis border border-warning-subtle d-flex justify-content-between align-items-center">
                    <div>
                      <i className="bi bi-dash-circle-fill me-2"></i> Unanswered
                    </div>
                    <span className="fw-bold fs-5">{attempt.unanswered}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="d-flex flex-wrap justify-content-center gap-3 pt-3 border-top">
              <Link
                to={`/student/review/${attemptId}`}
                className="btn btn-primary rounded-pill px-4 py-2.5 fw-semibold shadow-sm"
              >
                <i className="bi bi-card-checklist me-2"></i> Review Questions & Answers
              </Link>

              <Link
                to={`/student/quizzes/${attempt.quiz_id}/instructions`}
                className="btn btn-outline-secondary rounded-pill px-4 py-2.5"
              >
                <i className="bi bi-arrow-repeat me-2"></i> Retake Quiz
              </Link>

              <Link to="/student/dashboard" className="btn btn-outline-primary rounded-pill px-4 py-2.5">
                <i className="bi bi-house me-2"></i> Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResult;
