import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import Sidebar from '../../components/Sidebar';
import Alert from '../../components/ui/Alert';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonTable } from '../../components/ui/SkeletonLoader';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('all');
  const [rankingRule, setRankingRule] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const res = await studentService.getLeaderboard(selectedQuizId);
        if (res.success && res.data) {
          setLeaderboard(res.data.leaderboard || []);
          setQuizzes(res.data.quizzes || []);
          setRankingRule(res.data.ranking_rule || '');
        }
      } catch (err) {
        setError(err.message || 'Failed to load leaderboard rankings');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [selectedQuizId]);

  const top3 = leaderboard.slice(0, 3);

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return (
          <span className="badge bg-warning text-dark rounded-pill px-3 py-1.5 fw-bold shadow-xs">
            🥇 1st Place
          </span>
        );
      case 2:
        return (
          <span className="badge bg-secondary text-white rounded-pill px-3 py-1.5 fw-bold shadow-xs">
            🥈 2nd Place
          </span>
        );
      case 3:
        return (
          <span className="badge text-white rounded-pill px-3 py-1.5 fw-bold shadow-xs" style={{ backgroundColor: '#cd7f32' }}>
            🥉 3rd Place
          </span>
        );
      default:
        return <span className="fw-bold text-muted fs-6">#{rank}</span>;
    }
  };

  const formatSeconds = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="student" />
      <div className="dashboard-content">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">Competitive Leaderboard</h2>
            <p className="text-muted small mb-0">Live student rankings based on verified quiz performance and completion speed</p>
          </div>
          {/* Quiz Filter Dropdown */}
          <div className="mt-3 mt-md-0" style={{ minWidth: '240px' }}>
            <select
              className="form-select bg-white shadow-sm border rounded-pill px-3 py-2 fw-medium"
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              aria-label="Filter leaderboard by quiz"
            >
              <option value="all">🏆 Overall (All Quizzes)</option>
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ranking Rule Alert */}
        <Alert variant="info" className="mb-4">
          <div>
            <strong>Ranking Criteria: </strong>
            {rankingRule || 'Ranked by highest percentage, then total score, followed by fastest time taken.'}
          </div>
        </Alert>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Podium Highlight for Top 3 */}
        {top3.length > 0 && selectedQuizId === 'all' && (
          <div className="row g-3 mb-4 text-center">
            {top3.map((entry) => (
              <div key={entry.rank} className="col-md-4">
                <div
                  className={`card border-0 shadow-sm rounded-4 p-4 bg-white h-100 ${
                    entry.rank === 1 ? 'border-top border-4 border-warning' : ''
                  }`}
                >
                  <div className="mb-2">{getRankBadge(entry.rank)}</div>
                  <div
                    className="rounded-circle bg-primary-subtle text-primary fw-bold mx-auto mb-2 d-flex align-items-center justify-content-center"
                    style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}
                  >
                    {entry.student_name.charAt(0).toUpperCase()}
                  </div>
                  <h5 className="fw-bold text-dark mb-1">{entry.student_name}</h5>
                  <div className="text-muted small mb-2">{entry.quiz_title}</div>
                  <div className="fw-bold text-primary fs-4">{entry.percentage}%</div>
                  <div className="text-secondary small">
                    {entry.score}/{entry.total_marks} pts • {formatSeconds(entry.time_taken)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
          {loading ? (
            <SkeletonTable rows={5} cols={7} />
          ) : leaderboard.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light text-secondary small">
                  <tr>
                    <th style={{ width: '130px' }}>Rank</th>
                    <th>Student Name</th>
                    <th>Quiz Title</th>
                    <th>Score</th>
                    <th>Accuracy</th>
                    <th>Time Taken</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((row) => (
                    <tr key={`${row.rank}-${row.student_name}-${row.quiz_title}`}>
                      <td>{getRankBadge(row.rank)}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle bg-light text-dark fw-bold d-flex align-items-center justify-content-center me-2 border"
                            style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}
                          >
                            {row.student_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="fw-bold text-dark">{row.student_name}</span>
                        </div>
                      </td>
                      <td className="text-secondary fw-medium">{row.quiz_title}</td>
                      <td>
                        <span className="fw-semibold text-dark">{row.score}</span> / {row.total_marks}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            parseFloat(row.percentage) >= 80
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : parseFloat(row.percentage) >= 50
                              ? 'bg-primary-subtle text-primary border border-primary-subtle'
                              : 'bg-warning-subtle text-dark border border-warning-subtle'
                          } px-2.5 py-1 fw-semibold`}
                        >
                          {row.percentage}%
                        </span>
                      </td>
                      <td className="text-muted small">{formatSeconds(row.time_taken)}</td>
                      <td className="text-muted small">{row.attempted_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon="bi-trophy"
              title="No Leaderboard Entries"
              description="No student attempts have been logged for this quiz filter yet."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
