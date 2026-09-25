import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import ConfirmModal from '../../components/ConfirmModal';
import EmptyState from '../../components/ui/EmptyState';
import Alert from '../../components/ui/Alert';

const QuestionManagement = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isNewlyCreated = searchParams.get('created');

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Delete modal state
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await adminService.getQuizQuestions(id);
      if (res.success && res.data) {
        setQuiz(res.data.quiz);
        setQuestions(res.data.questions || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [id]);

  const confirmDelete = (question) => {
    setQuestionToDelete(question);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!questionToDelete) return;
    try {
      await adminService.deleteQuestion(questionToDelete.id);
      setSuccess('Question deleted successfully');
      setShowDeleteModal(false);
      setQuestionToDelete(null);
      fetchQuestions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete question');
      setShowDeleteModal(false);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Sidebar type="admin" />
      <div className="dashboard-content">
        {/* Navigation Breadcrumb & Header */}
        <div className="d-flex align-items-center mb-4">
          <Link to="/admin/quizzes" className="btn btn-sm btn-outline-secondary rounded-circle me-3 p-2" aria-label="Back to quizzes">
            <i className="bi bi-arrow-left"></i>
          </Link>
          <div className="flex-grow-1">
            <h2 className="fw-bold text-dark mb-1">
              Questions for "{quiz?.title || `Quiz #${id}`}"
            </h2>
            <p className="text-muted small mb-0">
              Manage questions, answer options, correct answer keys, and assigned marks
            </p>
          </div>
          <Link
            to={`/admin/questions/add?quiz_id=${id}`}
            className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm"
          >
            <i className="bi bi-plus-lg me-1"></i> Add Question
          </Link>
        </div>

        {isNewlyCreated && (
          <Alert variant="info" className="mb-4">
            Quiz created successfully! Add questions below to publish and enable this quiz for students.
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4" dismissible onDismiss={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert variant="danger" className="mb-4" dismissible onDismiss={() => setError('')}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Loading message="Loading questions..." />
        ) : questions.length ? (
          <div className="d-flex flex-column gap-3">
            {questions.map((q, idx) => (
              <div key={q.id} className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span
                      className="badge bg-primary text-white rounded-circle p-2 fw-bold"
                      style={{ width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {idx + 1}
                    </span>
                    <h6 className="fw-bold text-dark mb-0 fs-5">{q.question}</h6>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-secondary-subtle text-secondary px-2.5 py-1">
                      {q.marks || 1} mark{(q.marks || 1) > 1 ? 's' : ''}
                    </span>
                    <Link
                      to={`/admin/questions/edit/${q.id}?quiz_id=${id}`}
                      className="btn btn-sm btn-outline-secondary rounded-circle p-1.5"
                      title="Edit Question"
                    >
                      <i className="bi bi-pencil"></i>
                    </Link>
                    <button
                      className="btn btn-sm btn-outline-danger rounded-circle p-1.5"
                      title="Delete Question"
                      onClick={() => confirmDelete(q)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>

                {/* Options Grid */}
                <div className="row g-2">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const optKey = `option_${opt.toLowerCase()}`;
                    const optText = q[optKey];
                    const isCorrect = q.correct_answer === opt;
                    return (
                      <div key={opt} className="col-md-6">
                        <div
                          className={`p-2.5 rounded-3 border small d-flex justify-content-between align-items-center ${
                            isCorrect ? 'bg-success-subtle border-success text-success-emphasis fw-semibold' : 'bg-light'
                          }`}
                        >
                          <div>
                            <span className="fw-bold me-2">{opt})</span>
                            {optText}
                          </div>
                          {isCorrect && (
                            <span className="badge bg-success rounded-pill px-2 py-1">
                              <i className="bi bi-check-lg me-1"></i> Correct Answer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="bi-patch-question"
            title="No Questions Added Yet"
            description="This quiz currently has no questions. Students will not be able to take it until at least one question is added."
            action={
              <Link
                to={`/admin/questions/add?quiz_id=${id}`}
                className="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm"
              >
                <i className="bi bi-plus-lg me-1"></i> Add First Question
              </Link>
            }
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        title="Delete Question"
        message="Are you sure you want to permanently delete this question?"
        confirmText="Yes, Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default QuestionManagement;
