import React from 'react';
import { Link } from 'react-router-dom';

const QuizCard = ({ quiz, isAdmin = false, onDelete, onToggleStatus }) => {
  const getDifficultyBadge = (diff) => {
    switch ((diff || '').toLowerCase()) {
      case 'easy':
        return <span className="badge bg-success-subtle text-success border border-success-subtle fw-semibold px-2.5 py-1">Easy</span>;
      case 'hard':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-semibold px-2.5 py-1">Hard</span>;
      default:
        return <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle fw-semibold px-2.5 py-1">Medium</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'published':
        return <span className="badge bg-success px-2 py-1">Published</span>;
      case 'draft':
        return <span className="badge bg-secondary px-2 py-1">Draft</span>;
      default:
        return <span className="badge bg-danger px-2 py-1">Inactive</span>;
    }
  };

  return (
    <div className="card h-100 shadow-sm border-0 quiz-card rounded-3 transition-hover">
      <div className="card-body d-flex flex-column p-4">
        {/* Top Badges */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle fw-semibold px-2.5 py-1">
            <i className="bi bi-tag-fill me-1"></i>
            {quiz.category}
          </span>
          <div className="d-flex gap-2">
            {getDifficultyBadge(quiz.difficulty)}
            {isAdmin && getStatusBadge(quiz.status)}
          </div>
        </div>

        {/* Title & Description */}
        <h5 className="card-title fw-bold text-dark mb-2">{quiz.title}</h5>
        <p className="card-text text-muted small flex-grow-1 mb-4">
          {quiz.description || 'Test your proficiency and evaluate your knowledge with this comprehensive quiz.'}
        </p>

        {/* Meta Info */}
        <div className="border-top pt-3 mt-auto">
          <div className="row g-2 text-center text-secondary small mb-3">
            <div className="col-4 border-end">
              <div className="fw-semibold text-dark">
                <i className="bi bi-patch-question text-primary me-1"></i>
                {quiz.total_questions || 0}
              </div>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>Questions</span>
            </div>
            <div className="col-4 border-end">
              <div className="fw-semibold text-dark">
                <i className="bi bi-clock text-warning me-1"></i>
                {quiz.time_limit}m
              </div>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>Duration</span>
            </div>
            <div className="col-4">
              <div className="fw-semibold text-dark">
                <i className="bi bi-award text-success me-1"></i>
                {quiz.total_marks || quiz.total_questions || 0}
              </div>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>Marks</span>
            </div>
          </div>

          {/* Actions */}
          {isAdmin ? (
            <div className="d-flex flex-wrap gap-2 justify-content-between">
              <Link to={`/admin/quizzes/${quiz.id}/questions`} className="btn btn-sm btn-outline-primary flex-fill">
                <i className="bi bi-list-check me-1"></i> Questions
              </Link>
              <Link to={`/admin/quizzes/edit/${quiz.id}`} className="btn btn-sm btn-outline-secondary">
                <i className="bi bi-pencil"></i>
              </Link>
              {onDelete && (
                <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(quiz.id)}>
                  <i className="bi bi-trash"></i>
                </button>
              )}
            </div>
          ) : (
            <Link
              to={`/student/quizzes/${quiz.id}/instructions`}
              className="btn btn-primary w-100 rounded-pill py-2 fw-semibold d-flex align-items-center justify-content-center shadow-sm"
            >
              <span>Take Quiz</span>
              <i className="bi bi-arrow-right-short ms-2 fs-5"></i>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
