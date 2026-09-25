import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import Sidebar from '../../components/Sidebar';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';
import { SkeletonTable } from '../../components/ui/SkeletonLoader';

const QuizHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await studentService.getHistory();
        if (res.success && res.data) {
          setHistory(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load attempt history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((h) => {
    return (
      (h.quiz_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (h.category || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = filteredHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="student" />
      <div className="dashboard-content">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <h2 className="fw-bold text-dark mb-1">My Quiz History</h2>
            <p className="text-muted small mb-0">Review all your previous evaluations, test scores, and answer breakdowns</p>
          </div>
          <div className="mt-3 mt-md-0">
            <Link to="/student/quizzes" className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm">
              <i className="bi bi-play-circle-fill me-1"></i> Take a Quiz
            </Link>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Search */}
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
          <SearchBar
            value={searchTerm}
            onChange={(val) => {
              setSearchTerm(val);
              setCurrentPage(1);
            }}
            placeholder="Search history by quiz title or category..."
          />
        </div>

        {/* History Table */}
        <div className="card border-0 shadow-sm rounded-4 bg-white p-4">
          {loading ? (
            <SkeletonTable rows={6} cols={7} />
          ) : paginatedHistory.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-secondary small">
                    <tr>
                      <th>Attempt</th>
                      <th>Quiz Title</th>
                      <th>Category</th>
                      <th>Score</th>
                      <th>Accuracy</th>
                      <th>Breakdown</th>
                      <th>Date Taken</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistory.map((att) => (
                      <tr key={att.id}>
                        <td className="text-muted fw-bold">#{att.id}</td>
                        <td className="fw-bold text-dark">{att.quiz_title}</td>
                        <td>
                          <span className="badge bg-light text-dark border px-2 py-1">{att.category}</span>
                        </td>
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
                        <td className="small text-secondary">
                          <span className="text-success fw-bold">{att.correct_answers}✓</span> •{' '}
                          <span className="text-danger fw-bold">{att.wrong_answers}✗</span> •{' '}
                          <span className="text-muted">{att.unanswered}⊘</span>
                        </td>
                        <td className="text-muted small">{att.attempted_at}</td>
                        <td className="text-end">
                          <div className="d-flex justify-content-end gap-1.5">
                            <Link
                              to={`/student/result/${att.id}`}
                              className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                            >
                              Result
                            </Link>
                            <Link
                              to={`/student/review/${att.id}`}
                              className="btn btn-sm btn-outline-primary rounded-pill px-3"
                            >
                              Review
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredHistory.length}
                itemsPerPage={itemsPerPage}
              />
            </>
          ) : (
            <EmptyState
              icon="bi-clock-history"
              title="No Attempt Records Found"
              description={
                searchTerm
                  ? `No quizzes matched "${searchTerm}". Try another keyword or clear the search.`
                  : "You haven't completed any assessments yet. Choose a topic and start your first quiz!"
              }
              action={
                searchTerm ? (
                  <button className="btn btn-outline-primary rounded-pill px-4" onClick={() => setSearchTerm('')}>
                    Clear Search
                  </button>
                ) : (
                  <Link to="/student/quizzes" className="btn btn-primary rounded-pill px-4">
                    Browse Quizzes
                  </Link>
                )
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizHistory;
