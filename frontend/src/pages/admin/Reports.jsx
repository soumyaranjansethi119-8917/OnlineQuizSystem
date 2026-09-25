import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';

const Reports = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReportData = async () => {
      try {
        const res = await adminService.getStatistics();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load reports data');
      } finally {
        setLoading(false);
      }
    };
    loadReportData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-wrapper">
        <Sidebar type="admin" />
        <div className="dashboard-content">
          <Loading message="Compiling assessment reports..." />
        </div>
      </div>
    );
  }

  const { summary, recent_attempts, charts } = stats || {};

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="admin" />
      <div className="dashboard-content">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Assessment Performance Reports</h2>
            <p className="text-muted small mb-0">Aggregate performance analytics and submission audit records</p>
          </div>
          <button className="btn btn-outline-secondary rounded-pill px-4 mt-3 mt-md-0 fw-semibold" onClick={() => window.print()}>
            <i className="bi bi-printer me-2"></i> Print / Save Report
          </button>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Analytics Highlights */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h6 className="fw-bold text-dark mb-3">Overall Performance Status</h6>
              <div className="display-6 fw-bold text-success mb-2">
                {summary?.average_score >= 50 ? 'Satisfactory' : 'Needs Review'}
              </div>
              <p className="text-muted small mb-0">
                Average student grade across all recorded quiz attempts is <strong className="text-dark">{summary?.average_score || 0}%</strong>.
              </p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h6 className="fw-bold text-dark mb-3">Grade Distribution</h6>
              <div className="d-flex flex-column gap-2 small">
                <div className="d-flex justify-content-between">
                  <span className="text-success fw-medium">Excellent (≥ 80%):</span>
                  <span className="fw-bold">{charts?.performance?.excellent || 0} attempts</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-primary fw-medium">Good (60% - 79%):</span>
                  <span className="fw-bold">{charts?.performance?.good || 0} attempts</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-warning fw-medium">Average (40% - 59%):</span>
                  <span className="fw-bold">{charts?.performance?.average || 0} attempts</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-danger fw-medium">Below Average (&lt; 40%):</span>
                  <span className="fw-bold">{charts?.performance?.needs_improvement || 0} attempts</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white h-100">
              <h6 className="fw-bold text-dark mb-3">Participation Volume</h6>
              <div className="display-6 fw-bold text-primary mb-2">
                {summary?.total_attempts || 0}
              </div>
              <p className="text-muted small mb-0">
                Total completed quiz evaluations across {summary?.total_quizzes || 0} published quizzes and {summary?.total_students || 0} registered students.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Attempts Table */}
        <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
          <h5 className="fw-bold text-dark mb-3">Detailed Submission Log</h5>
          {recent_attempts?.length ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-secondary small">
                  <tr>
                    <th>Attempt ID</th>
                    <th>Student</th>
                    <th>Quiz Title</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Result</th>
                    <th>Submission Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {recent_attempts.map((att) => (
                    <tr key={att.id}>
                      <td className="text-muted fw-bold">#{att.id}</td>
                      <td>
                        <div className="fw-semibold text-dark">{att.student_name}</div>
                        <div className="text-muted small">{att.student_email}</div>
                      </td>
                      <td className="fw-medium text-dark">{att.quiz_title}</td>
                      <td>
                        {att.score} / {att.total_marks}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            parseFloat(att.percentage) >= 50
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : 'bg-danger-subtle text-danger border border-danger-subtle'
                          } px-2.5 py-1 fw-semibold`}
                        >
                          {att.percentage}%
                        </span>
                      </td>
                      <td>
                        {parseFloat(att.percentage) >= 50 ? (
                          <span className="text-success fw-semibold small">
                            <i className="bi bi-check-circle-fill me-1"></i> Passed
                          </span>
                        ) : (
                          <span className="text-danger fw-semibold small">
                            <i className="bi bi-x-circle-fill me-1"></i> Failed
                          </span>
                        )}
                      </td>
                      <td className="text-muted small">{att.attempted_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon="bi-file-earmark-bar-graph"
              title="No Submission Logs Yet"
              description="Student assessment records will appear here once quizzes are submitted."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
