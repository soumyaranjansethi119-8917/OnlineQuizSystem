import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(...registerables);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminService.getStatistics();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load administrator dashboard analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar type="admin" />
        <div className="dashboard-content">
          <Loading message="Loading system metrics and analytics..." />
        </div>
      </div>
    );
  }

  const { summary, charts, recent_attempts, recent_quizzes } = stats || {};

  // Chart 1: Quiz Popularity
  const popularityData = {
    labels: (charts?.popularity || []).map((p) => (p.title.length > 15 ? p.title.slice(0, 15) + '...' : p.title)),
    datasets: [
      {
        label: 'Attempts',
        data: (charts?.popularity || []).map((p) => p.count),
        backgroundColor: '#2563eb',
        borderRadius: 6,
      },
    ],
  };

  // Chart 2: Student Performance Distribution
  const performanceData = {
    labels: ['Excellent (≥80%)', 'Good (60-79%)', 'Average (40-59%)', 'Needs Imp. (<40%)'],
    datasets: [
      {
        data: [
          charts?.performance?.excellent || 0,
          charts?.performance?.good || 0,
          charts?.performance?.average || 0,
          charts?.performance?.needs_improvement || 0,
        ],
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="admin" />
      <div className="dashboard-content">
        {/* Header Title */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Administrator Dashboard</h2>
            <p className="text-muted small mb-0">Overview of platform metrics, quiz attempts, and student engagement</p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <Link to="/admin/quizzes/add" className="btn btn-primary rounded-pill px-3 py-2 fw-semibold shadow-sm">
              <i className="bi bi-plus-lg me-1"></i> Create New Quiz
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* 5 Summary Metric Cards */}
        <div className="row g-3 mb-4">
          <div className="col-xl col-md-4 col-sm-6">
            <StatCard
              label="Enrolled Students"
              value={summary?.total_students || 0}
              icon={<i className="bi bi-people-fill"></i>}
              variant="primary"
              subtext="Registered users"
            />
          </div>

          <div className="col-xl col-md-4 col-sm-6">
            <StatCard
              label="Total Quizzes"
              value={summary?.total_quizzes || 0}
              icon={<i className="bi bi-journal-check"></i>}
              variant="success"
              subtext="Platform assessments"
            />
          </div>

          <div className="col-xl col-md-4 col-sm-6">
            <StatCard
              label="Question Bank"
              value={summary?.total_questions || 0}
              icon={<i className="bi bi-patch-question-fill"></i>}
              variant="info"
              subtext="Verified items"
            />
          </div>

          <div className="col-xl col-md-6 col-sm-6">
            <StatCard
              label="Total Attempts"
              value={summary?.total_attempts || 0}
              icon={<i className="bi bi-send-check-fill"></i>}
              variant="warning"
              subtext="Student submissions"
            />
          </div>

          <div className="col-xl col-md-6 col-sm-12">
            <StatCard
              label="Platform Avg Score"
              value={`${summary?.average_score || 0}%`}
              icon={<i className="bi bi-graph-up-arrow"></i>}
              variant="danger"
              subtext="Overall accuracy"
            />
          </div>
        </div>

        {/* Analytics Charts Row */}
        <div className="row g-4 mb-4">
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Quiz Popularity</h5>
                <span className="badge bg-light text-muted border">Attempts</span>
              </div>
              <div style={{ minHeight: '260px' }}>
                {charts?.popularity?.length ? (
                  <Bar
                    data={popularityData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                    }}
                  />
                ) : (
                  <div className="text-center py-5 text-muted">No quiz attempt data available yet</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Performance Distribution</h5>
                <span className="badge bg-light text-muted border">Percentages</span>
              </div>
              <div style={{ minHeight: '260px' }} className="d-flex align-items-center justify-content-center">
                {summary?.total_attempts > 0 ? (
                  <div style={{ width: '240px', height: '240px' }}>
                    <Doughnut
                      data={performanceData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'bottom' } },
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">No attempt data available yet</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Submissions & Recent Quizzes */}
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Recent Quiz Submissions</h5>
                <Link to="/admin/reports" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                  Full Report
                </Link>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-secondary small">
                    <tr>
                      <th>Student</th>
                      <th>Quiz</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent_attempts?.length ? (
                      recent_attempts.map((att) => (
                        <tr key={att.id}>
                          <td>
                            <div className="fw-semibold text-dark">{att.student_name}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{att.student_email}</div>
                          </td>
                          <td className="text-dark fw-medium">{att.quiz_title}</td>
                          <td>
                            <span className="fw-semibold">{att.score}</span> / {att.total_marks}
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                parseFloat(att.percentage) >= 60
                                  ? 'bg-success-subtle text-success border border-success-subtle'
                                  : 'bg-warning-subtle text-dark border border-warning-subtle'
                              } px-2.5 py-1 fw-semibold`}
                            >
                              {att.percentage}%
                            </span>
                          </td>
                          <td className="text-muted small">{att.attempted_at}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">No recent quiz attempts found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">Active Quizzes</h5>
                <Link to="/admin/quizzes" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                  Manage
                </Link>
              </div>
              <div className="d-flex flex-column gap-3">
                {recent_quizzes?.length ? (
                  recent_quizzes.map((q) => (
                    <div key={q.id} className="p-3 rounded-3 bg-light border d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '170px' }}>{q.title}</div>
                        <div className="text-muted small">{q.category} • {q.total_questions || 0} Questions</div>
                      </div>
                      <Link to={`/admin/quizzes/${q.id}/questions`} className="btn btn-sm btn-outline-primary rounded-circle p-2" title="Manage Questions">
                        <i className="bi bi-chevron-right"></i>
                      </Link>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    icon="bi-journal-x"
                    title="No Quizzes Created"
                    description="Get started by creating your first quiz."
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
