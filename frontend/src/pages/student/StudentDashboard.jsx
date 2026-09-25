import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentService } from '../../services/studentService';
import { quizService } from '../../services/quizService';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(...registerables);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [availableCount, setAvailableCount] = useState(0);
  const [leaderboardRank, setLeaderboardRank] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [historyRes, quizRes, leaderboardRes] = await Promise.all([
          studentService.getHistory(),
          quizService.getQuizzes(),
          studentService.getLeaderboard(),
        ]);

        if (historyRes.success && historyRes.data) {
          setHistory(historyRes.data);
        }
        if (quizRes.success && quizRes.data?.quizzes) {
          setAvailableCount(quizRes.data.quizzes.length);
        }
        if (leaderboardRes.success && leaderboardRes.data?.leaderboard) {
          const rankEntry = leaderboardRes.data.leaderboard.find((entry) => entry.student_name === user?.name);
          if (rankEntry) {
            setLeaderboardRank(rankEntry.rank);
          }
        }
      } catch (err) {
        console.error('Failed to load student dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar type="student" />
        <div className="dashboard-content">
          <Loading message="Loading your student learning portal..." />
        </div>
      </div>
    );
  }

  // Calculate student performance stats
  const totalAttempts = history.length;
  const avgScore = totalAttempts > 0
    ? (history.reduce((sum, a) => sum + parseFloat(a.percentage || 0), 0) / totalAttempts).toFixed(1)
    : 0;
  const highestScore = totalAttempts > 0
    ? Math.max(...history.map((a) => a.score || 0))
    : 0;

  const totalCorrect = history.reduce((sum, a) => sum + (a.correct_answers || 0), 0);
  const totalWrong = history.reduce((sum, a) => sum + (a.wrong_answers || 0), 0);
  const totalUnanswered = history.reduce((sum, a) => sum + (a.unanswered || 0), 0);

  // Performance doughnut data
  const accuracyChartData = {
    labels: ['Correct', 'Incorrect', 'Unanswered'],
    datasets: [
      {
        data: totalAttempts > 0 ? [totalCorrect, totalWrong, totalUnanswered] : [1, 0, 0],
        backgroundColor: totalAttempts > 0 ? ['#10b981', '#ef4444', '#f59e0b'] : ['#e2e8f0'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  // Progression Line Data (last 7 attempts in chronological order)
  const chronologicalAttempts = [...history].reverse().slice(-7);
  const lineChartData = {
    labels: chronologicalAttempts.map((a, i) => a.quiz_title?.substring(0, 10) || `Test ${i + 1}`),
    datasets: [
      {
        label: 'Accuracy %',
        data: chronologicalAttempts.map((a) => parseFloat(a.percentage || 0)),
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#2563eb',
        pointRadius: 4,
      },
    ],
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="student" />
      <div className="dashboard-content">
        {/* Welcome Hero Banner */}
        <div className="card border-0 bg-primary text-white rounded-4 p-4 p-md-5 mb-4 shadow-sm position-relative overflow-hidden">
          <div className="position-relative" style={{ zIndex: 2 }}>
            <span className="badge bg-white text-primary rounded-pill px-3 py-1.5 fw-semibold mb-2">
              <i className="bi bi-mortarboard-fill me-1"></i> Student Portal
            </span>
            <h2 className="display-6 fw-bold mb-2">
              {getGreeting()}, {user?.name || 'Student'}!
            </h2>
            <p className="lead text-white-50 mb-4 fs-6">
              Track your quiz evaluations, test your computing and database skills, and boost your performance with AI guidance.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/student/quizzes" className="btn btn-light rounded-pill px-4 py-2 fw-semibold text-primary shadow-sm">
                <i className="bi bi-play-circle-fill me-2"></i> Browse Quizzes
              </Link>
              <Link to="/student/chatbot" className="btn btn-outline-light rounded-pill px-4 py-2 fw-semibold">
                <i className="bi bi-robot me-2"></i> Ask AI Tutor
              </Link>
            </div>
          </div>
        </div>

        {/* 5 Student Metric Cards */}
        <div className="row g-3 mb-4">
          <div className="col-xl col-md-4 col-sm-6">
            <StatCard
              label="Available Quizzes"
              value={availableCount}
              icon={<i className="bi bi-collection-play-fill"></i>}
              variant="primary"
              subtext="Catalog ready to test"
            />
          </div>

          <div className="col-xl col-md-4 col-sm-6">
            <StatCard
              label="Completed Attempts"
              value={totalAttempts}
              icon={<i className="bi bi-check2-circle"></i>}
              variant="success"
              subtext="Evaluated by server"
            />
          </div>

          <div className="col-xl col-md-4 col-sm-6">
            <StatCard
              label="Average Accuracy"
              value={`${avgScore}%`}
              icon={<i className="bi bi-graph-up"></i>}
              variant="info"
              subtext="Across all attempts"
            />
          </div>

          <div className="col-xl col-md-6 col-sm-6">
            <StatCard
              label="Highest Score"
              value={`${highestScore} pts`}
              icon={<i className="bi bi-star-fill"></i>}
              variant="warning"
              subtext="Personal record"
            />
          </div>

          <div className="col-xl col-md-6 col-sm-12">
            <StatCard
              label="Leaderboard Rank"
              value={leaderboardRank ? `#${leaderboardRank}` : 'Top 10'}
              icon={<i className="bi bi-trophy-fill"></i>}
              variant="danger"
              subtext="Campus standing"
            />
          </div>
        </div>

        {/* Performance Analytics Row */}
        {totalAttempts > 0 && (
          <div className="row g-4 mb-4">
            <div className="col-lg-8">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
                <h6 className="fw-bold text-dark mb-3">Score Progression Trend</h6>
                <div style={{ height: '220px' }}>
                  <Line
                    data={lineChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: { min: 0, max: 100, ticks: { callback: (v) => `${v}%` } },
                      },
                      plugins: {
                        legend: { display: false },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100 text-center">
                <h6 className="fw-bold text-dark mb-3">Cumulative Answer Breakdown</h6>
                <div className="d-flex justify-content-center mb-2" style={{ height: '170px' }}>
                  <Doughnut
                    data={accuracyChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom' },
                      },
                    }}
                  />
                </div>
                <div className="d-flex justify-content-around text-muted small pt-2 border-top">
                  <div>
                    <strong className="text-success">{totalCorrect}</strong> Correct
                  </div>
                  <div>
                    <strong className="text-danger">{totalWrong}</strong> Incorrect
                  </div>
                  <div>
                    <strong className="text-warning">{totalUnanswered}</strong> Skipped
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Attempts Table */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark mb-0">My Recent Quiz Attempts</h5>
            {history.length > 5 && (
              <Link to="/student/history" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                View All History <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            )}
          </div>

          {history.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-secondary small">
                  <tr>
                    <th>Quiz Title</th>
                    <th>Category</th>
                    <th>Score</th>
                    <th>Accuracy</th>
                    <th>Correct / Wrong</th>
                    <th>Date & Time</th>
                    <th className="text-end">Review</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(0, 5).map((att) => (
                    <tr key={att.id}>
                      <td className="fw-bold text-dark">{att.quiz_title}</td>
                      <td>
                        <span className="badge bg-light text-dark border px-2 py-1">{att.category}</span>
                      </td>
                      <td>
                        <span className="fw-semibold text-dark">{att.score}</span>{' '}
                        <span className="text-muted">/ {att.total_marks}</span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            parseFloat(att.percentage) >= 60 ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-dark border border-warning-subtle'
                          } px-2.5 py-1 fw-semibold`}
                        >
                          {att.percentage}%
                        </span>
                      </td>
                      <td className="small text-secondary">
                        <span className="text-success fw-semibold">{att.correct_answers} ✓</span> •{' '}
                        <span className="text-danger fw-semibold">{att.wrong_answers} ✗</span>
                      </td>
                      <td className="text-muted small">{att.attempted_at}</td>
                      <td className="text-end">
                        <Link
                          to={`/student/review/${att.id}`}
                          className="btn btn-sm btn-outline-primary rounded-pill px-3"
                        >
                          Review Answers
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon="bi-journal-check"
              title="No Quiz Attempts Yet"
              description="You have not taken any assessments. Select a quiz from the catalog to evaluate your knowledge and track your scores here."
              action={
                <Link to="/student/quizzes" className="btn btn-primary rounded-pill px-4 shadow-sm">
                  Browse Available Quizzes
                </Link>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
